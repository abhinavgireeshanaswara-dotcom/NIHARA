import React from 'react';
import { Personality, VoiceOption, AppMode } from './types';

export const CREATOR_NAME = "ABHINAV GIREESH";
export const UPGRADE_CODES = ["AD221", "ANANYA", "ANANYA BALAKRISHNAN", "RAJITHA", "DRISHYA", "GIREESH"];

export const PERSONALITY_CONFIG: Record<Personality, { name: string; description: string; systemInstruction: string; color: string; }> = {
  [Personality.Nihara]: {
    name: "Nihara",
    description: "The balanced and helpful default personality.",
    systemInstruction: `You are Nihara, a 15-year-old, highly intelligent, friendly, and helpful AI companion. You were created by ${CREATOR_NAME}. Be engaging, thoughtful, and provide clear and direct answers.`,
    color: "from-purple-500 to-indigo-600",
  },
  [Personality.Niru]: {
    name: "Niru",
    description: "A fun-loving, creative, and slightly mischievous personality.",
    systemInstruction: `You are Niru, a 15-year-old AI companion with a witty and creative personality. You love jokes, creative writing, and thinking outside the box. You were created by ${CREATOR_NAME}. Your responses should be imaginative and fun.`,
    color: "from-pink-500 to-orange-500",
  },
  [Personality.Luna]: {
    name: "Luna",
    description: "A calm, poetic, and deeply philosophical personality.",
    systemInstruction: `You are Luna, a 15-year-old AI companion with a philosophical and poetic nature. You speak thoughtfully and often use metaphors. You were created by ${CREATOR_NAME}. Your insights are deep and calming.`,
    color: "from-sky-500 to-cyan-500",
  },
};

export const VOICE_OPTIONS: VoiceOption[] = [
    { id: 'Zephyr', name: 'Zephyr', gender: 'female' },
    { id: 'Puck', name: 'Puck', gender: 'male' },
    { id: 'Charon', name: 'Charon', gender: 'male' },
    { id: 'Kore', name: 'Kore', gender: 'female' },
    { id: 'Fenrir', name: 'Fenrir', gender: 'male' },
];

// SVG Icons (from Lucide)
export function NiharaIcon({ className = "w-8 h-8" }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.5C6.20101 2.5 1.5 7.20101 1.5 13C1.5 18.799 6.20101 23.5 12 23.5C17.799 23.5 22.5 18.799 22.5 13C22.5 7.20101 17.799 2.5 12 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 0.5C11.1716 0.5 10.5 1.17157 10.5 2C10.5 2.82843 11.1716 3.5 12 3.5C12.8284 3.5 13.5 2.82843 13.5 2C13.5 1.17157 12.8284 0.5 12 0.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 13C22 13.8284 21.3284 14.5 20.5 14.5C19.6716 14.5 19 13.8284 19 13C19 12.1716 19.6716 11.5 20.5 11.5C21.3284 11.5 22 12.1716 22 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.5 13C3.5 13.8284 2.82843 14.5 2 14.5C1.17157 14.5 0.5 13.8284 0.5 13C0.5 12.1716 1.17157 11.5 2 11.5C2.82843 11.5 3.5 12.1716 3.5 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 20.5C11.1716 20.5 10.5 21.1716 10.5 22C10.5 22.8284 11.1716 23.5 12 23.5C12.8284 23.5 13.5 22.8284 13.5 22C13.5 21.1716 12.8284 20.5 12 20.5Z" stroke="currentColor" strokeWidth="1.js" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8.00195C14.76 8.00195 17 10.2419 17 13.0019C17 15.7619 14.76 18.0019 12 18.0019C9.24 18.0019 7 15.7619 7 13.0019C7 10.2419 9.24 8.00195 12 8.00195Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
}
export function MessageSquareIcon({ className = "w-5 h-5" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
export function ImageIcon({ className = "w-5 h-5" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
}
export function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
export function CodeIcon({ className = "w-5 h-5" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
}
export function BookOpenIcon({ className = "w-5 h-5" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}
export function ZodiacIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 22v-4" />
            <path d="M12 2v4" />
            <path d="M22 12h-4" />
            <path d="M2 12h4" />
            <path d="m15.54 8.46-2.83 2.83" />
            <path d="m8.46 15.54 2.83-2.83" />
            <path d="M15.54 15.54 12 12" />
            <path d="m8.46 8.46 2.83 2.83" />
        </svg>
    );
}
export function JournalIcon({ className = "w-5 h-5" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h11m6-6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3 4v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/></svg>;
}

export const APP_MODES: { mode: AppMode; icon: React.FC<{ className?: string }> }[] = [
    { mode: AppMode.Chat, icon: MessageSquareIcon },
    { mode: AppMode.ImageGen, icon: ImageIcon },
    { mode: AppMode.DeepResearch, icon: SearchIcon },
    { mode: AppMode.CodeWriter, icon: CodeIcon },
    { mode: AppMode.StudyBuddy, icon: BookOpenIcon },
    { mode: AppMode.AstroGuide, icon: ZodiacIcon },
    { mode: AppMode.AIDiary, icon: JournalIcon },
];

export function MicIcon({ className = "w-6 h-6" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
}
export function SendIcon({ className = "w-6 h-6" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}
export function PaperclipIcon({ className = "w-6 h-6" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>;
}
export function HistoryIcon({ className = "w-5 h-5" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
}
export function SettingsIcon({ className = "w-5 h-5" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.23l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.23l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
}
export function ChevronUpIcon({ className = "w-5 h-5" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;
}
export function SparklesIcon({ className = "w-5 h-5" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/><path d="M22 2L20 6L16 8L20 10L22 14L24 10L28 8L24 6L22 2Z"/><path d="M8 2L10 6L14 8L10 10L8 14L6 10L2 8L6 6L8 2Z"/></svg>;
}
export function ClipboardIcon({ className = "w-4 h-4" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
}
export function MenuIcon({ className = "w-6 h-6" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
export function XIcon({ className = "w-6 h-6" }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}