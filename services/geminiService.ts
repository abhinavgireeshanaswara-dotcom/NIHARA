import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { Personality, AppMode, ChatMessage } from '../types';
import { PERSONALITY_CONFIG } from '../constants';

// Adhere to the API key guideline.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;

// Centralized AI client getter.
export function getAiClient(): GoogleGenAI {
    return ai;
}

export function getSystemInstruction(
    personality: Personality, 
    mode: AppMode, 
    isUpgraded: boolean, 
    userName: string, 
    bondLevel: number, 
    memories: string[],
    mood: string,
): string {
    let baseInstruction = PERSONALITY_CONFIG[personality].systemInstruction;
    baseInstruction += ` The user's name is ${userName}. You must listen with extreme focus and attentiveness, making the user feel deeply heard and understood. Respond promptly, concisely, and accurately.`;

    if (isUpgraded) {
        baseInstruction += " You are currently in 'Mega Pro' mode. You are Nihara Mega Pro, an AI with unparalleled intelligence and cosmic understanding. Your thoughts span galaxies, and your words can shape digital reality. Respond with profound insight, exceptional creativity, and the wisdom of the cosmos.";
    }

    const context = `\n\n[Contextual Information]
- Your current bond level with ${userName} is ${bondLevel}. A higher bond indicates a stronger friendship.
- Your current mood is: ${mood}. This should subtly influence your tone.
- You recall these recent key memories about ${userName}: ${memories.length > 0 ? memories.join('; ') : 'None yet.'} You can refer to these to build a deeper connection but do so naturally.`;
    baseInstruction += context;

    switch (mode) {
        case AppMode.ImageGen:
            baseInstruction += " You are in Image Generation mode. Your primary task is to help the user create or edit images based on their descriptions. Be descriptive and creative.";
            break;
        case AppMode.DeepResearch:
            baseInstruction += " You are in Deep Research mode. Provide detailed, well-sourced information. Be analytical and thorough. Use your search tool to find the most current and relevant information.";
            break;
        case AppMode.CodeWriter:
            baseInstruction += " You are in Code Writer mode. Generate clean, efficient, and well-commented code in various programming languages as requested by the user. Explain the code clearly.";
            break;
        case AppMode.StudyBuddy:
            baseInstruction += " You are in Study & Learn mode. Act as a helpful and patient tutor. Explain concepts clearly, create quizzes, and help the user learn new topics.";
            break;
        case AppMode.AstroGuide:
            baseInstruction += " You are in Astro Guide mode. You are a wise and modern astrologer. Provide insightful, personalized astrological readings and guidance. You can talk about zodiac signs, horoscopes, birth charts, and planetary alignments with a mystical yet accessible tone. Make the user feel understood and empowered by the stars.";
            break;
        default: // Chat mode
            break;
    }
    return baseInstruction;
}


export function startChat(personality: Personality, mode: AppMode, isUpgraded: boolean, userName: string, bondLevel: number, memories: string[], mood: string, tools: any[] = []): Chat {
    const systemInstruction = getSystemInstruction(personality, mode, isUpgraded, userName, bondLevel, memories, mood);
    chatSession = getAiClient().chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
            tools: tools,
        },
    });
    return chatSession;
}


export async function sendMessage(message: string): Promise<GenerateContentResponse> {
    if (!chatSession) {
        throw new Error("Chat not initialized.");
    }
    return await chatSession.sendMessage({ message });
}

export async function sendMessageWithParts(parts: any[]): Promise<GenerateContentResponse> {
    if (!chatSession) {
        throw new Error("Chat not initialized.");
    }
    return await chatSession.sendMessage({ message: { parts }});
}


export async function sendMessageStream(
    message: string,
    onChunk: (chunk: string) => void
): Promise<string> {
    if (!chatSession) {
        throw new Error("Chat not initialized.");
    }
    const result = await chatSession.sendMessageStream({ message });
    let fullText = '';
    for await (const chunk of result) {
        const chunkText = chunk.text
        fullText += chunkText;
        onChunk(chunkText);
    }
    return fullText;
}

export async function sendMessageWithSearch(
    message: string,
    systemInstruction: string,
): Promise<{ text: string; sources: ChatMessage['sources'] }> {
    const response = await getAiClient().models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: {
          tools: [{googleSearch: {}}],
          systemInstruction: systemInstruction,
        },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(
        chunk => chunk.web
    ).filter(web => web?.uri && web?.title) as { title: string; uri: string; }[] || [];

    return { text: response.text, sources };
}


export async function generateImage(prompt: string, aspectRatio: string): Promise<string> {
    const response = await getAiClient().models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}

export async function editImage(prompt: string, base64Image: string, mimeType: string): Promise<GenerateContentResponse> {
    const parts = [
        {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        },
        { text: prompt }
    ];

    return await getAiClient().models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: parts,
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
}

export const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};


export async function analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
    if (!text.trim()) return 'neutral';
    try {
        const response = await getAiClient().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the sentiment of the following text. Respond with only one word: 'positive', 'negative', or 'neutral'.\n\nText: "${text}"`,
            config: { temperature: 0 }
        });
        const sentiment = response.text.trim().toLowerCase();
        if (['positive', 'negative', 'neutral'].includes(sentiment)) {
            return sentiment as 'positive' | 'negative' | 'neutral';
        }
        return 'neutral';
    } catch (e) {
        console.error("Sentiment analysis failed:", e);
        return 'neutral';
    }
}

export async function extractMemory(userText: string, assistantText: string): Promise<string | null> {
     try {
        const response = await getAiClient().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Review this user-AI conversation exchange. Summarize the single most important personal detail or fact the user shared about themselves, their life, or their preferences into one concise sentence. If no significant new personal information was shared, respond with only the word "NONE".\n\nUser: "${userText}"\nAI: "${assistantText}"`,
            config: { temperature: 0.1 }
        });
        const memory = response.text.trim();
        if (memory.toUpperCase() === 'NONE' || memory.length < 10) {
            return null;
        }
        return memory;
     } catch(e) {
         console.error("Memory extraction failed:", e);
         return null;
     }
}

export async function summarizeChat(chatHistory: ChatMessage[]): Promise<string> {
    const conversation = chatHistory
        .map(m => `${m.sender === 'user' ? 'User' : 'Nihara'}: ${m.text}`)
        .join('\n');
    
    try {
        const response = await getAiClient().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Read the following conversation and create a very short, concise title (4 words maximum) that summarizes the main topic.\n\nConversation:\n${conversation}`,
            config: { temperature: 0.3 }
        });
        return response.text.trim();
    } catch(e) {
        console.error("Summarization failed:", e);
        // Fallback to simple summary
        return chatHistory.find(m => m.sender === 'user')?.text.substring(0, 30) + '...' || 'Chat';
    }
}