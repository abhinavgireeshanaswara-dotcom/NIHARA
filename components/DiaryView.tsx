import React, { useState, useRef, useEffect } from 'react';
import { DiaryEntry } from '../types';
import { JournalIcon } from '../constants';

interface DiaryViewProps {
  entries: DiaryEntry[];
  onAddEntry: (content: string) => void;
  onSetPin: (pin: string) => void;
  onUnlock: (pin: string) => boolean;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  pinIsSet: boolean;
}

const PinInput: React.FC<{ onComplete: (pin: string) => void }> = ({ onComplete }) => {
    const [pin, setPin] = useState<string[]>(['', '', '', '']);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (/^[0-9]$/.test(value) || value === '') {
            const newPin = [...pin];
            newPin[index] = value;
            setPin(newPin);

            if (value && index < 3) {
                inputsRef.current[index + 1]?.focus();
            }

            if (newPin.every(digit => digit !== '')) {
                onComplete(newPin.join(''));
            }
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    return (
        <div className="flex justify-center gap-3">
            {pin.map((digit, index) => (
                <input
                    key={index}
                    ref={el => { inputsRef.current[index] = el; }}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-14 h-16 bg-gray-900/50 border-2 border-gray-700 rounded-lg text-center text-3xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    pattern="[0-9]*"
                    inputMode="numeric"
                />
            ))}
        </div>
    );
};

const DiaryView: React.FC<DiaryViewProps> = ({ entries, onAddEntry, onSetPin, onUnlock, isLocked, setIsLocked, pinIsSet }) => {
    const [newEntry, setNewEntry] = useState('');
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'enter' | 'create'>('enter');

    useEffect(() => {
      // Automatically focus first PIN input on mount if locked
      if(isLocked && !pinIsSet) {
        setMode('create');
      }
    }, [isLocked, pinIsSet]);

    const handlePinComplete = (pin: string) => {
        if (mode === 'create') {
            onSetPin(pin);
            setIsLocked(false);
            setError('');
        } else {
            if (onUnlock(pin)) {
                setIsLocked(false);
                setError('');
            } else {
                setError('Incorrect PIN. Please try again.');
            }
        }
    };

    const handleSaveEntry = () => {
        if(newEntry.trim()) {
            onAddEntry(newEntry.trim());
            setNewEntry('');
        }
    };

    if (isLocked) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 chat-view-bg animate-fade-in-blur">
                <div className="w-full max-w-sm text-center">
                    <JournalIcon className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">{mode === 'create' ? 'Create a PIN' : 'Diary Locked'}</h2>
                    <p className="text-gray-400 mb-8">{mode === 'create' ? 'Set a 4-digit PIN to protect your diary.' : 'Enter your 4-digit PIN to unlock.'}</p>
                    <PinInput onComplete={handlePinComplete} />
                    {error && <p className="text-red-400 mt-4">{error}</p>}
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex-1 flex flex-col p-6 chat-view-bg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">My Private Diary</h1>
                <button onClick={() => setIsLocked(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Lock Diary</button>
            </div>
            <div className="glassmorphic rounded-2xl flex-1 flex flex-col p-4">
                <h2 className="text-xl font-semibold mb-3">New Entry</h2>
                <textarea 
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    placeholder="Write about your feelings..."
                    className="w-full flex-1 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <button onClick={handleSaveEntry} className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity self-end px-8">Save</button>
            </div>
             <div className="mt-6">
                <h2 className="text-xl font-semibold mb-3">Past Entries</h2>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {entries.length > 0 ? entries.slice().reverse().map(entry => (
                        <div key={entry.id} className="glassmorphic rounded-lg p-4">
                            <p className="text-xs text-gray-400 mb-2">{new Date(entry.timestamp).toLocaleString()}</p>
                            <p className="text-gray-200 whitespace-pre-wrap">{entry.content}</p>
                        </div>
                    )) : (
                        <p className="text-gray-500 text-center py-4">No entries yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiaryView;