import React, { useState } from 'react';
import { UPGRADE_CODES, VOICE_OPTIONS } from '../constants';
import { VoiceOption } from '../types';

interface ModalProps {
  show: boolean;
  children: React.ReactNode;
}

const ModalWrapper: React.FC<ModalProps> = ({ show, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="glassmorphic text-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all duration-300 scale-95 animate-fade-in-up">
        {children}
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};


interface OnboardingModalProps {
    show: boolean;
    onSave: (name: string) => void;
}
export const OnboardingModal: React.FC<OnboardingModalProps> = ({ show, onSave }) => {
    const [name, setName] = useState('');

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <ModalWrapper show={show}>
            <h2 className="text-3xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Welcome to Nihara</h2>
            <p className="text-center text-gray-400 mb-6">Let's get acquainted. What should I call you?</p>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Enter your name..."
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
                onClick={handleSave}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
                Begin
            </button>
        </ModalWrapper>
    );
};

interface UpgradeModalProps {
    show: boolean;
    onClose: () => void;
    onUpgrade: () => void;
}
export const UpgradeModal: React.FC<UpgradeModalProps> = ({ show, onClose, onUpgrade }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleUpgrade = () => {
        if (UPGRADE_CODES.includes(code.trim().toUpperCase())) {
            onUpgrade();
            onClose();
        } else {
            setError('Invalid upgrade code. Please try again.');
        }
    };

    return (
        <ModalWrapper show={show}>
            <h2 className="text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">Upgrade to Mega Pro</h2>
            <p className="text-center text-gray-400 mb-6">Unlock ultimate capabilities by entering your upgrade code.</p>
            <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(''); }}
                placeholder="Enter upgrade code..."
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
            <div className="flex gap-4 mt-6">
                <button onClick={onClose} className="w-full bg-gray-700/80 text-white font-bold py-3 rounded-lg hover:bg-gray-600/80 transition-colors">Cancel</button>
                <button onClick={handleUpgrade} className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">Verify & Upgrade</button>
            </div>
        </ModalWrapper>
    );
};

interface SettingsModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (voiceId: string, language: string) => void;
    currentVoice: string;
    currentLanguage: string;
}
export const SettingsModal: React.FC<SettingsModalProps> = ({ show, onClose, onSave, currentVoice, currentLanguage }) => {
    const [selectedVoice, setSelectedVoice] = useState(currentVoice);
    const [language, setLanguage] = useState(currentLanguage);

    const handleSave = () => {
        onSave(selectedVoice, language);
        onClose();
    };

    return (
        <ModalWrapper show={show}>
            <h2 className="text-3xl font-bold text-center mb-6">Settings</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Live Mode Voice</label>
                    <div className="grid grid-cols-2 gap-3">
                        {VOICE_OPTIONS.map((voice: VoiceOption) => (
                            <button key={voice.id} onClick={() => setSelectedVoice(voice.id)} className={`p-3 rounded-lg text-left transition-all ${selectedVoice === voice.id ? 'bg-purple-600 ring-2 ring-purple-400' : 'bg-gray-900/50 hover:bg-gray-700/50'}`}>
                                <p className="font-bold">{voice.name}</p>
                                <p className="text-sm text-gray-300 capitalize">{voice.gender}</p>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="language" className="block text-gray-300 mb-2 font-semibold">Language</label>
                    <input
                        id="language"
                        type="text"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        placeholder="e.g., English"
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>
            <div className="flex gap-4 mt-8">
                <button onClick={onClose} className="w-full bg-gray-700/80 text-white font-bold py-3 rounded-lg hover:bg-gray-600/80 transition-colors">Cancel</button>
                <button onClick={handleSave} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">Save Changes</button>
            </div>
        </ModalWrapper>
    );
};
