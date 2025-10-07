import React, { useState } from 'react';
import { Personality, AppMode, ChatHistory } from '../types';
import {
  PERSONALITY_CONFIG,
  CREATOR_NAME,
  NiharaIcon,
  APP_MODES,
  HistoryIcon,
  SettingsIcon,
  ChevronUpIcon,
  XIcon,
} from '../constants';

interface SidebarProps {
  currentPersonality: Personality;
  onPersonalityChange: (p: Personality) => void;
  currentMode: AppMode;
  onModeChange: (m: AppMode) => void;
  onSettingsClick: () => void;
  isUpgraded: boolean;
  history: ChatHistory[];
  onLoadChat: (id: string) => void;
  onNewChat: () => void;
  currentChatId: string | null;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  bondLevel: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPersonality,
  onPersonalityChange,
  currentMode,
  onModeChange,
  onSettingsClick,
  isUpgraded,
  history,
  onLoadChat,
  onNewChat,
  currentChatId,
  isSidebarOpen,
  setIsSidebarOpen,
  bondLevel,
}) => {
  const [personalityOpen, setPersonalityOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const currentConfig = PERSONALITY_CONFIG[currentPersonality];

  const handleModeChange = (m: AppMode) => {
    onModeChange(m);
    setIsSidebarOpen(false); // Close on selection for mobile
  };

  const handleLoadChat = (id: string) => {
    onLoadChat(id);
    setIsSidebarOpen(false); // Close on selection for mobile
  };

  const bondLvl = Math.floor(bondLevel / 10);
  const bondProgress = (bondLevel % 10) * 10;

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-10 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`
        fixed inset-y-0 left-0 z-20 w-72 transform transition-transform duration-300 ease-in-out 
        md:relative md:inset-auto md:z-auto md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="w-full h-full glassmorphic text-white flex flex-col p-4 md:h-[calc(100vh-2rem)] md:m-4 md:rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center gap-3`}>
              <div className={`p-2 rounded-lg bg-black/20 ${isUpgraded ? 'mega-pro-glow' : ''}`}>
                <NiharaIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Nihara</h1>
                {isUpgraded && <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">MEGA PRO</span>}
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white p-2 -mr-2">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Personality Selector */}
          <div className="mb-4">
            <button onClick={() => setPersonalityOpen(!personalityOpen)} className="w-full bg-black/20 rounded-lg p-3 flex items-center justify-between transition hover:bg-black/30">
              <div className="flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xl bg-gradient-to-br ${currentConfig.color}`}>
                    {currentConfig.name[0]}
                </div>
                <div>
                  <p className="font-semibold">{currentConfig.name}</p>
                  <p className="text-xs text-gray-400">Current Personality</p>
                </div>
              </div>
              <ChevronUpIcon className={`w-5 h-5 transition-transform ${personalityOpen ? '' : 'rotate-180'}`} />
            </button>
            <div className={`collapsible-content ${personalityOpen ? 'open' : ''}`}>
              <div className="space-y-2 bg-black/20 p-2 rounded-lg">
                {Object.values(Personality).map((p) => {
                    const config = PERSONALITY_CONFIG[p];
                    return (
                        <button 
                            key={p} 
                            onClick={() => { onPersonalityChange(p); setPersonalityOpen(false); }} 
                            className={`w-full flex items-center gap-3 p-2 rounded-md transition ${currentPersonality === p ? `bg-gradient-to-r ${config.color} text-white shadow-md` : 'hover:bg-gray-700/50'}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-base bg-gradient-to-br ${config.color}`}>
                                {config.name[0]}
                            </div>
                            <div>
                            <p className="font-semibold text-sm">{config.name}</p>
                            </div>
                        </button>
                    )
                })}
              </div>
            </div>
          </div>

          {/* Bond Level */}
          <div className="mb-4 px-1">
            <div className="text-xs flex justify-between items-center mb-1 text-gray-400">
              <span>Bond Level</span>
              <span className="font-bold text-white">Lvl. {bondLvl}</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${bondProgress}%` }}></div>
            </div>
          </div>


          {/* App Modes */}
          <nav className="space-y-1 mb-4">
            {APP_MODES.map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition relative group ${currentMode === mode ? 'text-white' : 'text-gray-300 hover:bg-black/20 hover:text-white'}`}
              >
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-purple-500 rounded-r-full transition-all duration-300 ${currentMode === mode ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>
                <Icon className="w-6 h-6" />
                <span className="font-medium">{mode}</span>
              </button>
            ))}
          </nav>
          
          {/* New Chat Button */}
          <div className="px-4 mb-4">
            <button 
                onClick={onNewChat} 
                className="w-full bg-black/20 text-gray-300 hover:bg-black/30 hover:text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
                + New Chat
            </button>
          </div>


           {/* History */}
          <div className="flex-grow flex flex-col space-y-2 overflow-y-auto pr-1">
             <button onClick={() => setHistoryOpen(!historyOpen)} className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:text-white">
                <div className="flex items-center gap-3">
                  <HistoryIcon />
                  <span className="font-semibold text-sm">History</span>
                </div>
                <ChevronUpIcon className={`w-5 h-5 transition-transform ${historyOpen ? '' : 'rotate-180'}`} />
             </button>
            <div className={`collapsible-content ${historyOpen ? 'open' : ''}`}>
                {history.length > 0 ? (
                    <div className="space-y-1 px-2">
                        {history.slice().reverse().map(h => {
                            const isActive = h.id === currentChatId;
                            return (
                                <button key={h.id} onClick={() => handleLoadChat(h.id)} className={`w-full text-left text-sm p-3 rounded-md transition truncate ${isActive ? 'bg-purple-500/30 text-white' : 'text-gray-400 bg-black/20 hover:bg-gray-700/70'}`}>
                                    {h.summary}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-xs text-gray-500 px-4 py-2">
                        Your conversations will appear here.
                    </div>
                )}
            </div>
          </div>


          {/* Settings */}
          <div className="space-y-2 mb-4 pt-4 border-t border-white/10">
            <button onClick={onSettingsClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-black/20 hover:text-white transition">
                <SettingsIcon /> <span>Settings</span>
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-center text-gray-500">
              Created by <span className="font-semibold text-white/80">{CREATOR_NAME}</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;