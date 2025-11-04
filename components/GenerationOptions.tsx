import React, { useState, useEffect } from 'react';
import { GenerationType } from '../types';

interface GenerationOptionsProps {
  onSelect: (type: GenerationType, count: number) => void;
  disabled: boolean;
}

const options = [
  { type: GenerationType.Flashcards, label: 'Flashcards', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z', needsCount: true },
  { type: GenerationType.MindMap, label: 'Mind Map', icon: 'M17.657 18.657l-4.243-4.243m0 0l-4.243 4.243m4.243-4.243l4.243 4.243m-4.243-4.243l-4.243-4.243', needsCount: false },
  { type: GenerationType.Quiz, label: 'Quiz', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.104.448-2.104 1.172-2.832l-1.34-1.34A6.5 6.5 0 1012 19.5a6.5 6.5 0 000-13c-1.32 0-2.523.402-3.535 1.076l-1.54-1.54A8.45 8.45 0 0112 4.5c2.518 0 4.78 1.04 6.42 2.723l.707-.707A9.953 9.953 0 0012 3a9.953 9.953 0 00-7.464 3.56l-1.54-1.54v4.4h4.4l-1.452-1.452z', needsCount: true },
  { type: GenerationType.VisualAid, label: 'Visual Aid', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', needsCount: false },
  { type: GenerationType.Summary, label: 'Summarized Note', icon: 'M4 6h16M4 12h16M4 18h7', needsCount: false },
];

export const GenerationOptions: React.FC<GenerationOptionsProps> = ({ onSelect, disabled }) => {
    const [selectedOption, setSelectedOption] = useState<GenerationType | null>(null);
    const [count, setCount] = useState<number>(() => {
        const savedCount = localStorage.getItem('eClassGenerationCount');
        return savedCount ? parseInt(savedCount, 10) : 10;
    });

    useEffect(() => {
        localStorage.setItem('eClassGenerationCount', count.toString());
    }, [count]);

    const handleSelect = (type: GenerationType) => {
        setSelectedOption(type);
        const optionConfig = options.find(o => o.type === type);
        // Automatically trigger generation if no count is needed
        if (optionConfig && !optionConfig.needsCount) {
            onSelect(type, 0); // Pass 0 as count is not applicable
        }
    };

    const handleGenerate = () => {
        if(selectedOption) {
            onSelect(selectedOption, count);
        }
    }

    const currentOptionConfig = options.find(o => o.type === selectedOption);

    return (
        <div>
            <p className="text-center font-medium mb-4 text-slate-600 dark:text-slate-300">Choose a study tool to generate:</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            {options.map((opt) => (
                <button
                key={opt.type}
                onClick={() => handleSelect(opt.type)}
                disabled={disabled}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 text-center
                    ${selectedOption === opt.type 
                        ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' 
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:border-emerald-400 dark:hover:border-emerald-500'}
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={opt.icon} />
                </svg>
                <span className="font-semibold text-sm">{opt.label}</span>
                </button>
            ))}
            </div>

            {currentOptionConfig?.needsCount && (
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                    <label htmlFor="item-count" className="font-medium">Number of {currentOptionConfig.label}:</label>
                    <input 
                        type="number" 
                        id="item-count"
                        value={count}
                        onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-24 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-center"
                        min="1"
                        max="50"
                    />
                    <button onClick={handleGenerate} disabled={disabled} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-slate-400">
                        Generate
                    </button>
                 </div>
            )}
        </div>
    );
};