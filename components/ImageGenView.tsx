import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { ImageIcon, SparklesIcon } from '../constants';

interface ImageGenViewProps {
  onGenerate: (prompt: string, aspectRatio: string) => void;
  isLoading: boolean;
  images: GeneratedImage[];
}

const AspectRatioButton: React.FC<{ label: string; value: string; selected: string; onSelect: (value: string) => void; }> = ({ label, value, selected, onSelect }) => (
    <button
        onClick={() => onSelect(value)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selected === value ? 'bg-purple-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'}`}
    >
        {label}
    </button>
);

const ImageGenView: React.FC<ImageGenViewProps> = ({ onGenerate, isLoading, images }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const aspectRatios = [
        { label: 'Square (1:1)', value: '1:1' },
        { label: 'Landscape (16:9)', value: '16:9' },
        { label: 'Portrait (9:16)', value: '9:16' },
        { label: 'Standard (4:3)', value: '4:3' },
        { label: 'Photo (3:4)', value: '3:4' },
    ];

    const handleGenerateClick = () => {
        if (prompt.trim() && !isLoading) {
            onGenerate(prompt, aspectRatio);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 chat-view-bg overflow-y-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Image Generation Studio</h1>

            <div className="glassmorphic rounded-2xl p-6 mb-6">
                <label htmlFor="prompt" className="block text-lg font-semibold mb-3">Your Creative Prompt</label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A futuristic cityscape at sunset, with flying cars and neon lights, hyperrealistic..."
                    className="w-full h-28 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />

                <label className="block text-lg font-semibold mt-6 mb-3">Aspect Ratio</label>
                <div className="flex flex-wrap gap-3">
                    {aspectRatios.map(ar => (
                        <AspectRatioButton key={ar.value} {...ar} selected={aspectRatio} onSelect={setAspectRatio} />
                    ))}
                </div>

                <button
                    onClick={handleGenerateClick}
                    disabled={isLoading || !prompt.trim()}
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            Generate Image
                        </>
                    )}
                </button>
            </div>

            <div className="flex-1">
                <h2 className="text-xl font-semibold mb-4">Generated Images</h2>
                {images.length === 0 && !isLoading ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-2xl text-gray-500">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                        <p>Your creations will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.slice().reverse().map(image => (
                            <div key={image.id} className="glassmorphic rounded-2xl p-3 animate-fade-in-blur">
                                <img src={image.src} alt={image.prompt} className="w-full rounded-lg mb-3" style={{ aspectRatio: image.aspectRatio.replace(':', ' / ') }} />
                                <p className="text-xs text-gray-400 px-1 line-clamp-2">{image.prompt}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageGenView;
