import React, { useState } from 'react';
import { Flashcard } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
}

const FlashcardComponent: React.FC<{ card: Flashcard }> = ({ card }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="w-full h-64 perspective-1000" onClick={() => setIsFlipped(!isFlipped)}>
            <div 
                className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-700 rounded-lg shadow-lg flex items-center justify-center p-6 text-center border-2 border-emerald-500 dark:border-emerald-400">
                    <div className="text-xl font-semibold">
                      <MarkdownRenderer text={card.question} />
                    </div>
                </div>
                {/* Back */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-emerald-100 dark:bg-slate-600 rounded-lg shadow-lg flex items-center justify-center p-6 text-center border-2 border-slate-300 dark:border-slate-500">
                    <div className="text-lg">
                      <MarkdownRenderer text={card.answer} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!flashcards || flashcards.length === 0) {
    return <p>No flashcards were generated.</p>;
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="flex flex-col items-center w-full">
        <style>{`
            .perspective-1000 { perspective: 1000px; }
            .transform-style-preserve-3d { transform-style: preserve-3d; }
            .rotate-y-180 { transform: rotateY(180deg); }
            .backface-hidden { backface-visibility: hidden; }
        `}</style>
        <h3 className="text-2xl font-bold mb-4">Flashcards</h3>
      <div className="w-full max-w-xl mb-4">
        <FlashcardComponent key={currentIndex} card={flashcards[currentIndex]}/>
      </div>
      <div className="flex items-center justify-between w-full max-w-xl">
        <button onClick={goToPrev} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors">
          Prev
        </button>
        <span className="text-slate-600 dark:text-slate-400 font-medium">
          {currentIndex + 1} / {flashcards.length}
        </span>
        <button onClick={goToNext} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors">
          Next
        </button>
      </div>
    </div>
  );
};