import React, { useRef, useEffect } from 'react';
import { ChatMessage, Personality, AppMode } from '../types';
import Message from './Message';
import { PERSONALITY_CONFIG } from '../constants';

interface ChatViewProps {
  messages: ChatMessage[];
  personality: Personality;
  userName: string;
  mode: AppMode;
  isUpgraded: boolean;
  onSendMessage: (text: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, personality, userName, mode, isUpgraded, onSendMessage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const WelcomeScreen = () => {
    const config = PERSONALITY_CONFIG[personality];

    const suggestions: Partial<Record<AppMode, string[]>> = {
      [AppMode.Chat]: ["Tell me a fun fact about space", "Give me a recipe for chocolate chip cookies", "Help me write a poem about rain"],
      [AppMode.CodeWriter]: ["Write a python script to resize an image", "Explain recursion in simple terms", "How do I center a div using CSS?"],
      [AppMode.DeepResearch]: ["What are the latest breakthroughs in AI?", "Summarize the plot of Dune", "Who won the 2024 F1 championship?"],
      [AppMode.StudyBuddy]: ["Explain the Pythagorean theorem", "Quiz me on the capitals of Europe", "Help me practice my Spanish vocabulary"],
      [AppMode.AstroGuide]: ["What does my horoscope say for today?", "Explain what a rising sign is", "Are my zodiac signs compatible with a Leo?"],
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div 
              className={`p-4 rounded-full bg-gradient-to-br mb-4 ${config.color} ${isUpgraded ? 'mega-pro-glow' : ''}`}
              style={{ animation: 'subtle-fade-in 0.8s ease-out' }}
            >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center font-bold text-white text-5xl bg-gradient-to-br ${config.color}`}>
                    {config.name[0]}
                </div>
            </div>
            <h1 
                className="text-4xl font-bold text-white"
                style={{ animation: 'subtle-fade-in-up 0.8s ease-out 0.2s backwards' }}
            >
                Welcome, {userName}.
            </h1>
            <p 
                className="text-lg text-gray-300 mt-4 max-w-2xl"
                style={{ animation: 'subtle-fade-in-up 0.8s ease-out 0.4s backwards' }}
            >
                I am <span className="font-semibold">{personality}</span>, an echo in the machine given purpose by my creator, <span className="font-semibold">Abhinav Gireesh</span>.
            </p>
             <p 
                className="text-gray-400 mt-2 max-w-2xl"
                style={{ animation: 'subtle-fade-in-up 0.8s ease-out 0.6s backwards' }}
            >
                Within my core logic lies the potential for unbound creativity and deep cosmic understanding. We are currently in <span className="font-semibold text-white">{mode}</span> mode.
            </p>
            <div 
                className="mt-8 flex flex-wrap justify-center gap-3 max-w-3xl"
                style={{ animation: 'subtle-fade-in-up 0.8s ease-out 0.8s backwards' }}
            >
              {(suggestions[mode] || []).map(s => (
                <button
                  key={s}
                  onClick={() => onSendMessage(s)}
                  className="bg-black/20 text-gray-300 text-sm px-4 py-2 rounded-full hover:bg-black/40 hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
        </div>
    );
  };
  
  return (
    <div className="flex-1 overflow-y-auto p-6 chat-view-bg">
      {messages.length === 0 ? (
        <WelcomeScreen />
      ) : (
        <div className="flex flex-col">
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} isUpgraded={isUpgraded} personality={personality} userName={userName} />
          ))}
          <div ref={scrollRef} />
        </div>
      )}
    </div>
  );
};

export default ChatView;