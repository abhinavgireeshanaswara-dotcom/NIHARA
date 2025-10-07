import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LiveServerMessage, Modality, Blob, FunctionDeclaration, Type, FunctionResponsePart } from '@google/genai';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import InputBar from './components/InputBar';
import DiaryView from './components/DiaryView';
import ImageGenView from './components/ImageGenView';
import LiveView from './components/LiveView';
import { OnboardingModal, UpgradeModal, SettingsModal } from './components/Modals';
import { Personality, MessageSender, ChatMessage, AppMode, ChatHistory, DiaryEntry, GeneratedImage, Reminder } from './types';
import { startChat, sendMessageStream, generateImage, editImage, getSystemInstruction, sendMessageWithSearch, getAiClient, analyzeSentiment, extractMemory, summarizeChat, sendMessage, sendMessageWithParts } from './services/geminiService';
import { SparklesIcon, MenuIcon } from './constants';

// Audio Encoding/Decoding utilities
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


function createBlobFromAudio(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

// Function Declarations for Gemini Tools
const setReminderDeclaration: FunctionDeclaration = {
  name: 'setReminder',
  description: "Sets a reminder for the user. Use this when the user asks to be reminded of something at a specific date and time.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      reminderText: { type: Type.STRING, description: 'The content of the reminder. What the user wants to be reminded about.' },
      dateTime: { type: Type.STRING, description: 'The exact date and time for the reminder in strict ISO 8601 format (e.g., "2024-08-15T17:00:00").' },
    },
    required: ['reminderText', 'dateTime'],
  },
};

const reminderTools = [{ functionDeclarations: [setReminderDeclaration] }];

// Function Declarations for Live Mode Voice Commands
const changePersonalityDeclaration: FunctionDeclaration = { name: 'changePersonality', description: "Changes the AI's personality.", parameters: { type: Type.OBJECT, properties: { personality: { type: Type.STRING, description: 'The personality to switch to.', enum: Object.values(Personality) } }, required: ['personality'] } };
const changeModeDeclaration: FunctionDeclaration = { name: 'changeMode', description: "Changes the AI's operational mode.", parameters: { type: Type.OBJECT, properties: { mode: { type: Type.STRING, description: 'The mode to switch to.', enum: Object.values(AppMode).filter(m => m !== AppMode.AIDiary) } }, required: ['mode'] } };


const App: React.FC = () => {
    const [userName, setUserName] = useState<string>('');
    const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
    const [isUpgraded, setIsUpgraded] = useState<boolean>(false);
    const [currentPersonality, setCurrentPersonality] = useState<Personality>(Personality.Nihara);
    const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.Chat);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
    
    // Responsive State
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    
    // History State
    const [history, setHistory] = useState<ChatHistory[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isSessionInitialized, setIsSessionInitialized] = useState(false);

    // Reminders & Notifications
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);


    // Live Mode State
    const [isLive, setIsLive] = useState<boolean>(false);
    const [liveStatus, setLiveStatus] = useState<'listening' | 'speaking' | 'thinking' | 'idle'>('idle');
    const [liveActionStatus, setLiveActionStatus] = useState<string | null>(null);
    const liveSessionPromiseRef = useRef<Promise<any> | null>(null);
    const [liveTranscript, setLiveTranscript] = useState({ user: '', assistant: '' });
    const liveTranscriptRef = useRef({ user: '', assistant: '' });
    const [voiceId, setVoiceId] = useState<string>('Zephyr');
    const [language, setLanguage] = useState<string>('English');
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);
    const [micLevel, setMicLevel] = useState(0);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // New Features State
    const [bondLevel, setBondLevel] = useState<number>(0);
    const [mood, setMood] = useState<string>('Neutral');
    const [memories, setMemories] = useState<string[]>([]);
    const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
    const [diaryPin, setDiaryPin] = useState<string | null>(null);
    const [isDiaryLocked, setIsDiaryLocked] = useState<boolean>(true);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

     // Load from localStorage on mount
    useEffect(() => {
        try {
            const storedName = localStorage.getItem('nihara-username');
            if (storedName) setUserName(storedName); else setShowOnboarding(true);
        } catch (e) {
            console.error("Failed to load username:", e);
            setShowOnboarding(true);
        }

        let allHistory: ChatHistory[] = [];
        try {
            const storedHistory = localStorage.getItem('nihara-history');
            if (storedHistory) allHistory = JSON.parse(storedHistory);
            setHistory(allHistory);
        } catch (e) {
            console.error("Failed to parse history from localStorage:", e);
        }

        try {
            const storedReminders = localStorage.getItem('nihara-reminders');
            if (storedReminders) setReminders(JSON.parse(storedReminders));
        } catch (e) {
            console.error("Failed to parse reminders from localStorage:", e);
        }

        try {
            const storedBond = localStorage.getItem('nihara-bond');
            if (storedBond) setBondLevel(JSON.parse(storedBond));
        } catch (e) {
            console.error("Failed to parse bond level from localStorage:", e);
        }

        try {
            const storedMemories = localStorage.getItem('nihara-memories');
            if (storedMemories) setMemories(JSON.parse(storedMemories));
        } catch (e) {
            console.error("Failed to parse memories from localStorage:", e);
        }
        
        try {
            const storedDiaryEntries = localStorage.getItem('nihara-diary-entries');
            if (storedDiaryEntries) setDiaryEntries(JSON.parse(storedDiaryEntries));
        } catch (e) {
            console.error("Failed to parse diary entries from localStorage:", e);
        }
        
        try {
            const storedPin = localStorage.getItem('nihara-diary-pin');
            if (storedPin) setDiaryPin(storedPin);
        } catch (e) {
            console.error("Failed to load diary pin:", e);
        }
        
        try {
            const lastChatId = localStorage.getItem('nihara-lastChatId');
            if (lastChatId && allHistory.length > 0) {
                const chatToLoad = allHistory.find((h: ChatHistory) => h.id === lastChatId);
                if (chatToLoad) {
                    setTimeout(() => handleLoadChat(lastChatId, allHistory), 0);
                } else {
                    setCurrentChatId(Date.now().toString());
                }
            } else {
                setCurrentChatId(Date.now().toString());
            }
        } catch (e) {
            console.error("Failed to load last chat:", e);
            setCurrentChatId(Date.now().toString());
        }
    }, []);
    
    // Save to localStorage on change
    useEffect(() => { localStorage.setItem('nihara-history', JSON.stringify(history)); }, [history]);
    useEffect(() => { localStorage.setItem('nihara-reminders', JSON.stringify(reminders)); }, [reminders]);
    useEffect(() => { localStorage.setItem('nihara-bond', JSON.stringify(bondLevel)); }, [bondLevel]);
    useEffect(() => { localStorage.setItem('nihara-memories', JSON.stringify(memories)); }, [memories]);
    useEffect(() => { localStorage.setItem('nihara-diary-entries', JSON.stringify(diaryEntries)); }, [diaryEntries]);
    useEffect(() => { if(diaryPin) localStorage.setItem('nihara-diary-pin', diaryPin); }, [diaryPin]);
    
    // Reminder checker
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const dueReminders = reminders.filter(r => now >= r.dueTime);
            if (dueReminders.length > 0) {
                const reminder = dueReminders[0];
                setToast({ message: `Reminder: ${reminder.text}`, type: 'info' });
                // Remove the reminder after showing it
                setReminders(reminders.filter(r => r.id !== reminder.id));
            }
        }, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [reminders]);

    // Toast manager
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Derive mood from bondLevel
    useEffect(() => {
        if (bondLevel > 5) setMood('Joyful');
        else if (bondLevel > 0) setMood('Content');
        else if (bondLevel < -5) setMood('Concerned');
        else if (bondLevel < 0) setMood('Pensive');
        else setMood('Neutral');
    }, [bondLevel]);
    
    useEffect(() => { if (currentMode !== AppMode.ImageGen) { setGeneratedImages([]); } }, [currentMode]);
    
    // Invalidate current chat session when context changes
    useEffect(() => {
        setIsSessionInitialized(false);
    }, [currentPersonality, currentMode, isUpgraded, userName, bondLevel, memories, mood]);

    const handleNameSave = (name: string) => {
        setUserName(name);
        localStorage.setItem('nihara-username', name);
        setShowOnboarding(false);
    };
    
    const startNewChat = useCallback((tools: any[] = []) => {
        if (userName) {
            const randomMemories = [...memories].sort(() => 0.5 - Math.random()).slice(0, 3);
            startChat(currentPersonality, currentMode, isUpgraded, userName, bondLevel, randomMemories, mood, tools);
            setIsSessionInitialized(true);
        }
    }, [currentPersonality, currentMode, isUpgraded, userName, bondLevel, memories, mood]);

    const updateCurrentChatSummary = async () => {
        if (!currentChatId || messages.length < 2) return;
        const chatToUpdate = history.find(h => h.id === currentChatId);
        // Only update if summary is default (ends with ...) or is empty
        if (!chatToUpdate || (chatToUpdate.summary.endsWith('...') || !chatToUpdate.summary)) {
            const newSummary = await summarizeChat(messages);
            setHistory(prev => prev.map(h => h.id === currentChatId ? {...h, summary: newSummary} : h));
        }
    };
    
    const saveCurrentChat = useCallback(() => {
        if (messages.length > 0 && currentChatId) {
            const existingChat = history.find(h => h.id === currentChatId);
            const summary = existingChat?.summary && !existingChat.summary.endsWith('...') 
                ? existingChat.summary
                : messages.find(m => m.sender === MessageSender.User)?.text.substring(0, 40) + '...' || 'New Chat';
                
            const newHistoryItem: ChatHistory = {
                id: currentChatId,
                messages,
                timestamp: Date.now(),
                summary,
                personality: currentPersonality,
                mode: currentMode,
            };
            setHistory(prev => {
                const existingIndex = prev.findIndex(h => h.id === newHistoryItem.id);
                if (existingIndex > -1) {
                    const updatedHistory = [...prev];
                    updatedHistory[existingIndex] = newHistoryItem;
                    return updatedHistory;
                }
                return [...prev, newHistoryItem];
            });
             localStorage.setItem('nihara-lastChatId', currentChatId);
        }
    }, [messages, currentChatId, currentPersonality, currentMode, history]);
    
    useEffect(() => {
        saveCurrentChat();
    }, [messages, saveCurrentChat]);


    const handleLoadChat = async (id: string, allHistory: ChatHistory[] | null = null) => {
        await updateCurrentChatSummary();
        const chatToLoad = (allHistory || history).find(h => h.id === id);
        if (chatToLoad) {
            setMessages(chatToLoad.messages);
            setCurrentPersonality(chatToLoad.personality);
            setCurrentMode(chatToLoad.mode);
            setCurrentChatId(id);
            localStorage.setItem('nihara-lastChatId', id);
            setIsSessionInitialized(false);
        }
    };

    const handleNewChat = async () => {
        await updateCurrentChatSummary();
        setMessages([]);
        const newId = Date.now().toString();
        setCurrentChatId(newId);
        localStorage.setItem('nihara-lastChatId', newId);
        setIsSessionInitialized(false);
    };

    const processAiInteraction = async (userText: string, assistantText: string) => {
        const sentiment = await analyzeSentiment(userText);
        if (sentiment === 'positive') setBondLevel(b => b + 1);
        if (sentiment === 'negative') setBondLevel(b => Math.max(0, b - 1));

        const memory = await extractMemory(userText, assistantText);
        if (memory) {
            setMemories(m => [...m, memory].slice(-20)); // Keep last 20 memories
        }
    };

    const addReminder = (text: string, dueTime: number) => {
        const newReminder: Reminder = { id: Date.now().toString(), text, dueTime };
        setReminders(prev => [...prev, newReminder]);
        setToast({ message: 'Reminder set!', type: 'success' });
    };

    const handleSendMessage = async (text: string, file?: File) => {
        setIsLoading(true);
        const userMessage: ChatMessage = { id: Date.now().toString(), sender: MessageSender.User, text, timestamp: Date.now() };
        setMessages((prev) => [...prev, userMessage]);
        
        const assistantMessageId = (Date.now() + 1).toString();
        const assistantTypingMessage: ChatMessage = { id: assistantMessageId, sender: MessageSender.Assistant, text: '', isTyping: true, timestamp: Date.now() };
        setMessages((prev) => [...prev, assistantTypingMessage]);

        try {
            // Heuristic check for reminder keywords to enable function calling
            const hasReminderKeyword = /remind|reminder/i.test(text);

            if (!isSessionInitialized || hasReminderKeyword) {
                startNewChat(hasReminderKeyword ? reminderTools : []);
            }
            
            let assistantResponseText = '';

            if (currentMode === AppMode.DeepResearch) {
                const randomMemories = [...memories].sort(() => 0.5 - Math.random()).slice(0, 3);
                const systemInstruction = getSystemInstruction(currentPersonality, currentMode, isUpgraded, userName, bondLevel, randomMemories, mood);
                const { text: responseText, sources } = await sendMessageWithSearch(text, systemInstruction);
                assistantResponseText = responseText;
                setMessages((prev) => prev.map(m => m.id === assistantMessageId ? { ...m, text: responseText, sources: sources, isTyping: false } : m));
            } else if (hasReminderKeyword) {
                // Non-streaming path for function calling
                const response = await sendMessage(text);
                const functionCalls = response.functionCalls;

                if (functionCalls && functionCalls.length > 0) {
                    const functionResponses: FunctionResponsePart[] = [];
                    for (const call of functionCalls) {
                        if (call.name === 'setReminder') {
                            const { reminderText, dateTime } = call.args;
                            try {
                                const dueTime = new Date(dateTime).getTime();
                                addReminder(reminderText, dueTime);
                                functionResponses.push({ functionResponse: { name: 'setReminder', response: { result: 'OK, reminder is set.' } } });
                            } catch (e) {
                                console.error("Invalid date for reminder:", e);
                                functionResponses.push({ functionResponse: { name: 'setReminder', response: { result: 'Failed to parse date.' } } });
                            }
                        }
                    }
                    const finalResponse = await sendMessageWithParts(functionResponses);
                    assistantResponseText = finalResponse.text;
                } else {
                    assistantResponseText = response.text;
                }
                setMessages((prev) => prev.map(m => m.id === assistantMessageId ? { ...m, text: assistantResponseText, isTyping: false } : m));
            } else {
                 // Streaming path for normal chat
                 assistantResponseText = await sendMessageStream(text, (chunk) => {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? { ...msg, text: msg.text + chunk, isTyping: false }
                                : msg
                        )
                    );
                });
            }

            if (assistantResponseText) {
                processAiInteraction(text, assistantResponseText);
            }
        } catch(e) {
             const errorMessage = e instanceof Error ? e.message : "Sorry, I encountered an error.";
             setMessages((prev) => prev.map(m => m.id === assistantMessageId ? { ...m, text: errorMessage, isTyping: false } : m));
             console.error(e);
        } finally {
             setIsLoading(false);
        }
    };

    const handleGenerateImage = async (prompt: string, aspectRatio: string) => {
        setIsLoading(true);
        try {
            const imageUrl = await generateImage(prompt, aspectRatio);
            const newImage: GeneratedImage = { id: Date.now().toString(), src: imageUrl, prompt, aspectRatio, };
            setGeneratedImages(prev => [...prev, newImage]);
        } catch (e) { console.error("Image generation failed:", e); } 
        finally { setIsLoading(false); }
    };
    
    const handleToggleLiveMode = async () => {
        if (isLive) {
            if (liveSessionPromiseRef.current) {
                liveSessionPromiseRef.current.then(session => session.close());
                liveSessionPromiseRef.current = null;
            }
            setIsLive(false);
            setLiveStatus('idle');
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            return;
        }

        setIsLive(true);
        setLiveStatus('listening');

        if (!outputAudioContextRef.current) {
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const systemInstruction = getSystemInstruction(currentPersonality, AppMode.Chat, isUpgraded, userName, bondLevel, memories, mood);

        const sessionPromise = getAiClient().live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: async () => {
                    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    
                    analyserRef.current = inputAudioContext.createAnalyser();
                    analyserRef.current.fftSize = 256;
                    const bufferLength = analyserRef.current.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);

                    const draw = () => {
                        animationFrameRef.current = requestAnimationFrame(draw);
                        if (!analyserRef.current) return;
                        analyserRef.current.getByteFrequencyData(dataArray);
                        const avg = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
                        setMicLevel(avg / 128);
                    };
                    draw();

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlobFromAudio(inputData);
                        liveSessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(analyserRef.current);
                    analyserRef.current.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.interrupted) {
                        setLiveStatus('listening');
                        audioSourcesRef.current.forEach(source => source.stop());
                        audioSourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }

                    if (message.toolCall) {
                        const session = await liveSessionPromiseRef.current;
                        for (const fc of message.toolCall.functionCalls) {
                            let result = "ok", actionMessage = "";
                            if (fc.name === 'changePersonality') {
                                const newP = fc.args.personality as Personality;
                                if (Object.values(Personality).includes(newP)) {
                                    setCurrentPersonality(newP);
                                    actionMessage = `Personality set to ${newP}.`;
                                }
                            } else if (fc.name === 'changeMode') {
                                const newM = fc.args.mode as AppMode;
                                if (Object.values(AppMode).includes(newM)) {
                                    setCurrentMode(newM);
                                    actionMessage = `Mode changed to ${newM}.`;
                                }
                            }
                            if(actionMessage) {
                                setLiveActionStatus(actionMessage);
                                setTimeout(() => setLiveActionStatus(null), 3000);
                            }
                            session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result } } });
                        }
                    }

                    const outputTranscription = message.serverContent?.outputTranscription?.text;
                    const inputTranscription = message.serverContent?.inputTranscription?.text;
                    if (outputTranscription) liveTranscriptRef.current.assistant += outputTranscription;
                    if (inputTranscription) liveTranscriptRef.current.user += inputTranscription;

                    if (message.serverContent?.turnComplete) {
                        setLiveTranscript(prev => ({...prev, user: liveTranscriptRef.current.user, assistant: liveTranscriptRef.current.assistant}));
                        liveTranscriptRef.current = { user: '', assistant: '' };
                        if (audioSourcesRef.current.size === 0) setLiveStatus('listening');
                    } else {
                         setLiveTranscript({ ...liveTranscriptRef.current });
                    }

                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (audioData && outputAudioContextRef.current) {
                        setLiveStatus('speaking');
                        const ctx = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(ctx.destination);
                        source.addEventListener('ended', () => {
                            audioSourcesRef.current.delete(source);
                            if (audioSourcesRef.current.size === 0) {
                                setLiveStatus('listening');
                            }
                        });
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioSourcesRef.current.add(source);
                    }
                },
                onerror: (e: ErrorEvent) => { console.error('Live session error:', e); setLiveStatus('idle'); },
                onclose: (e: CloseEvent) => { setLiveStatus('idle'); },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceId } } },
                systemInstruction,
                outputAudioTranscription: {},
                inputAudioTranscription: {},
                tools: [{ functionDeclarations: [changePersonalityDeclaration, changeModeDeclaration] }],
            },
        });
        liveSessionPromiseRef.current = sessionPromise;
    };


    // --- DIARY HANDLERS ---
    const handleAddDiaryEntry = (content: string) => { const newEntry: DiaryEntry = { id: Date.now().toString(), timestamp: Date.now(), content }; setDiaryEntries(prev => [...prev, newEntry]); };
    const handleSetDiaryPin = (pin: string) => { setDiaryPin(pin); setIsDiaryLocked(false); };
    const handleUnlockDiary = (pin: string): boolean => { if (pin === diaryPin) { setIsDiaryLocked(false); return true; } return false; };

    const Toast = () => {
        if (!toast) return null;
        const successClasses = 'from-green-500 to-emerald-600';
        const infoClasses = 'from-sky-500 to-indigo-600';
        return (
            <div className="toast-notification fixed bottom-6 right-6 z-50">
                <div className={`flex items-center gap-4 text-white font-semibold px-6 py-4 rounded-xl shadow-2xl bg-gradient-to-br ${toast.type === 'success' ? successClasses : infoClasses}`}>
                    <span>{toast.message}</span>
                </div>
            </div>
        )
    };

    const renderMainView = () => {
        if (isLive) {
            return <LiveView transcript={liveTranscript} personality={currentPersonality} isUpgraded={isUpgraded} onToggleLive={handleToggleLiveMode} micLevel={micLevel} status={liveStatus} actionStatus={liveActionStatus} />;
        }
        switch(currentMode) {
            case AppMode.AIDiary:
// FIX: Use correct state variables `isDiaryLocked` and `setIsDiaryLocked`.
                return <DiaryView entries={diaryEntries} onAddEntry={handleAddDiaryEntry} onSetPin={handleSetDiaryPin} onUnlock={handleUnlockDiary} isLocked={isDiaryLocked} setIsLocked={setIsDiaryLocked} pinIsSet={!!diaryPin} />;
            case AppMode.ImageGen:
                return <ImageGenView onGenerate={handleGenerateImage} isLoading={isLoading} images={generatedImages} />;
            default:
                return (
                    <>
                        <ChatView messages={messages} personality={currentPersonality} userName={userName} mode={currentMode} isUpgraded={isUpgraded} onSendMessage={(text) => handleSendMessage(text)} />
                        <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} isLive={isLive} onToggleLive={handleToggleLiveMode} />
                    </>
                );
        }
    }

    return (
        <div id="root" className={`h-screen w-screen text-white font-sans overflow-hidden flex ${isUpgraded ? 'mega-pro' : ''}`}>
            <Sidebar
                currentPersonality={currentPersonality}
                onPersonalityChange={setCurrentPersonality}
                currentMode={currentMode}
                onModeChange={(mode) => { updateCurrentChatSummary().then(() => setCurrentMode(mode)); }}
                onSettingsClick={() => setShowSettingsModal(true)}
                isUpgraded={isUpgraded}
                history={history}
                onLoadChat={handleLoadChat}
                onNewChat={handleNewChat}
                currentChatId={currentChatId}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                bondLevel={bondLevel}
            />
            <main className="flex-1 flex flex-col relative">
                 <div className="flex-shrink-0 h-20 flex items-center justify-between px-6 md:justify-center">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-gray-300 hover:text-white">
                        <MenuIcon />
                    </button>
                    <div className="flex items-center">
                        {!isUpgraded && (
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="text-gray-400 font-medium text-xs py-1.5 px-3 rounded-full hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                                <SparklesIcon className="text-yellow-400 w-4 h-4" />
                                <span>Upgrade to Mega Pro</span>
                            </button>
                        )}
                    </div>
                    <div className="w-6 md:hidden" /> {/* Spacer for mobile to center the upgrade button */}
                </div>
                {renderMainView()}
            </main>
            <OnboardingModal show={showOnboarding} onSave={handleNameSave} />
            <UpgradeModal 
                show={showUpgradeModal} 
                onClose={() => setShowUpgradeModal(false)}
                onUpgrade={() => { setIsUpgraded(true); }}
            />
            <SettingsModal
                show={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                onSave={(v, l) => {setVoiceId(v); setLanguage(l);}}
                currentVoice={voiceId}
                currentLanguage={language}
            />
            <Toast />
        </div>
    );
};

export default App;