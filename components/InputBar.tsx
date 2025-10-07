


import React, { useState, useRef } from 'react';
import { PaperclipIcon, SendIcon, MicIcon } from '../constants';

interface InputBarProps {
  onSendMessage: (text: string, file?: File) => void;
  isLoading: boolean;
  isLive: boolean;
  onToggleLive: () => void;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading, isLive, onToggleLive }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((text.trim() || file) && !isLoading) {
      onSendMessage(text.trim(), file || undefined);
      setText('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="px-6 pb-6 pt-4">
      <div className="glassmorphic rounded-2xl p-2 flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-gray-400 hover:text-white hover:bg-black/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Attach file"
        >
          <PaperclipIcon />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,text/*"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={file ? `${file.name} attached. Add a message...` : `Message Nihara...`}
          className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none max-h-32 p-2 disabled:opacity-50"
          rows={1}
          disabled={isLoading || isLive}
        />
        <button 
          onClick={onToggleLive}
          className={`p-3 rounded-full transition-colors ${isLive ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-white hover:bg-black/20'} disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Toggle Live Mode"
        >
            <MicIcon />
        </button>
        <button
          onClick={handleSend}
          disabled={isLoading || isLive}
          className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default InputBar;
