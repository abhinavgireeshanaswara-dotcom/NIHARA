import React, { useState } from 'react';
import { ChatMessage, MessageSender, Personality } from '../types';
import { PERSONALITY_CONFIG, ClipboardIcon, SearchIcon } from '../constants';

interface MessageProps {
  message: ChatMessage;
  isUpgraded: boolean;
  personality: Personality;
  userName:string;
}

const TypingIndicator = () => (
    <div className="flex items-end space-x-1 p-2 h-6">
        <div className="w-1.5 h-full bg-gray-300 rounded-full animate-typing-bars" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1.5 h-full bg-gray-300 rounded-full animate-typing-bars" style={{ animationDelay: '0.3s' }}></div>
        <div className="w-1.5 h-full bg-gray-300 rounded-full animate-typing-bars" style={{ animationDelay: '0.5s' }}></div>
    </div>
);

const UserAvatar: React.FC<{ userName: string }> = ({ userName }) => (
  <div className="w-10 h-10 rounded-full shadow-md flex-shrink-0 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center font-bold text-white">
    {userName ? userName.charAt(0).toUpperCase() : 'U'}
  </div>
);

const AssistantAvatar: React.FC<{ personality: Personality }> = ({ personality }) => {
    const config = PERSONALITY_CONFIG[personality];
    return (
        <div className={`w-10 h-10 rounded-full shadow-md flex-shrink-0 bg-gradient-to-br ${config.color} flex items-center justify-center font-bold text-white text-xl`}>
            {config.name[0]}
        </div>
    );
};

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="code-block">
            <div className="code-block-header">
                <button onClick={handleCopy} className="code-copy-button">
                    <ClipboardIcon className="w-4 h-4" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
            </div>
            <pre><code>{code}</code></pre>
        </div>
    );
};

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
    // Split message by code blocks
    const parts = text.split(/(```[\s\S]*?```)/g);

    return (
        <div className="whitespace-pre-wrap">
            {parts.map((part, index) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const code = part.slice(3, -3).trim(); // Remove backticks
                    return <CodeBlock key={index} code={code} />;
                }
                return <span key={index}>{part}</span>;
            })}
        </div>
    );
};

const Message: React.FC<MessageProps> = ({ message, isUpgraded, personality, userName }) => {
  const isUser = message.sender === MessageSender.User;

  const containerClasses = isUser ? 'flex-row-reverse' : 'flex-row';
  const animationClass = isUser ? 'animate-message-in-right' : 'animate-message-in-left';
  const bubbleClasses = isUser
    ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-br-none'
    : 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-200 rounded-bl-none';
  
  const megaProBubbleWrapper = !isUser && isUpgraded ? 'mega-pro-glow p-0.5 rounded-2xl' : '';

  return (
    <div className={`flex items-start gap-3 my-4 ${containerClasses} ${animationClass} group`}>
      {isUser ? <UserAvatar userName={userName} /> : <AssistantAvatar personality={personality} />}
      <div className={`max-w-xl shadow-lg rounded-2xl ${megaProBubbleWrapper} relative`}>
        <div className={`p-4 rounded-[14px] ${bubbleClasses}`}>
          {message.isTyping ? <TypingIndicator /> : <MessageContent text={message.text} />}
          {message.image && (
              <div className="mt-3">
                  <img src={message.image} alt="Generated content" className="rounded-lg max-w-sm" />
              </div>
          )}
           {message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/20">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2"><SearchIcon className="w-4 h-4" /> Sources</h4>
                    <div className="space-y-1">
                        {message.sources.map((source, index) => (
                            <a 
                                key={index} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="block text-xs text-purple-300 hover:underline truncate"
                            >
                                {index + 1}. {source.title}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
      <div className="self-center text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default Message;