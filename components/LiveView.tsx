import React from 'react';
import { Personality } from '../types';
import { PERSONALITY_CONFIG } from '../constants';

type LiveStatus = 'listening' | 'speaking' | 'thinking' | 'idle';

interface LiveViewProps {
    transcript: { user: string; assistant: string };
    personality: Personality;
    isUpgraded: boolean;
    onToggleLive: () => void;
    micLevel: number;
    status: LiveStatus;
    actionStatus: string | null;
}

const LiveView: React.FC<LiveViewProps> = ({ transcript, personality, isUpgraded, onToggleLive, micLevel, status, actionStatus }) => {
    const config = PERSONALITY_CONFIG[personality];
    const orbColor = isUpgraded ? 'from-yellow-400 via-orange-500 to-red-600' : config.color;
    const orbScale = status === 'listening' ? 1 + micLevel * 0.5 : 1;

    let statusText = "Nihara is idle.";
    let orbAnimationClass = "";
    
    switch(status) {
        case 'listening':
            statusText = "Listening...";
            orbAnimationClass = "listening-animation";
            break;
        case 'speaking':
            statusText = "Speaking...";
            orbAnimationClass = "speaking-animation"; 
            break;
        case 'thinking':
            statusText = "Thinking...";
            orbAnimationClass = "thinking-animation";
            break;
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative chat-view-bg animate-fade-in-blur">
             {actionStatus && (
                <div className="action-toast absolute top-6 bg-black/50 backdrop-blur-sm text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-lg z-30">
                    {actionStatus}
                </div>
            )}
            <div 
                className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center bg-gradient-to-br ${orbColor} ${orbAnimationClass}`}
                style={{ transform: `scale(${orbScale})`, transition: 'transform 0.1s ease-out' }}
            >
                <div className="absolute inset-2 bg-gray-900 rounded-full"></div>
                <div className={`absolute inset-4 glassmorphic rounded-full ${isUpgraded ? 'mega-pro-glow' : ''}`}></div>
                <div className="relative z-10 p-4 text-center">
                    <p className="text-2xl font-bold mb-2">{statusText}</p>
                    <p className="text-gray-400 text-sm">Speak to interact with Nihara.</p>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 max-h-48 overflow-y-auto">
                <div className="w-full max-w-3xl mx-auto glassmorphic rounded-xl p-4 text-gray-300 shadow-2xl text-lg">
                    {transcript.user && <p className="transition-opacity duration-300"><span className="font-bold text-white">You:</span> {transcript.user}</p>}
                    {transcript.assistant && <p className="mt-2 transition-opacity duration-300"><span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r ${config.color}`}>Nihara:</span> {transcript.assistant}</p>}
                    {(!transcript.user && !transcript.assistant) && <p className="text-gray-500 text-center">Speak to begin the conversation...</p>}
                </div>
            </div>

            <button onClick={onToggleLive} className="absolute top-6 right-6 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors z-20">
                End Live Session
            </button>
        </div>
    );
};

export default LiveView;
