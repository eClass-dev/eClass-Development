import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface QuizViewerProps {
  questions: QuizQuestion[];
  onQuizComplete: (score: number) => void;
}

export const QuizViewer: React.FC<QuizViewerProps> = ({ questions, onQuizComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(new Array(questions.length).fill(null));
  const [isFinished, setIsFinished] = useState(false);
  
  const score = selectedAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length;

  // Effect to call onQuizComplete when the quiz is finished
  useEffect(() => {
    if (isFinished) {
      onQuizComplete(score);
    }
  }, [isFinished, score, onQuizComplete]);

  if (!questions || questions.length === 0) {
    return <p>No quiz questions were generated.</p>;
  }

  const handleAnswerSelect = (option: string) => {
    if (isFinished) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = option;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
    }
  };
  
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
    setIsFinished(false);
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  if (isFinished) {
    return (
        <div className="text-center p-4">
            <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
            <p className="text-xl mb-6">Your Score: <span className="font-bold text-emerald-600 dark:text-emerald-400">{score} / {questions.length}</span></p>
            <button
              onClick={handleRestart}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
        </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Quiz</h3>
            <p className="font-medium">{currentQuestionIndex + 1} / {questions.length}</p>
        </div>
      <div className="bg-slate-100 dark:bg-slate-700/50 p-6 rounded-lg">
        <div className="text-lg font-semibold mb-6 min-h-[56px]">
            <MarkdownRenderer text={currentQuestion.question} />
        </div>
        <div className="space-y-3">
          {currentQuestion.options.map((option, i) => {
            const isSelected = selectedAnswer === option;
            return (
              <button
                key={i}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 
                  ${isSelected ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-100 dark:bg-emerald-900/50' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500'}
                `}
              >
                <MarkdownRenderer text={option} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={handleNext}
          disabled={!selectedAnswer}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
        </button>
      </div>
    </div>
  );
};