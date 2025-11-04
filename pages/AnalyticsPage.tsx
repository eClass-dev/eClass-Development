import React, { useRef, useEffect } from 'react';
import { StudySet } from '../types';

interface AnalyticsPageProps {
  studySets: StudySet[];
  theme: string;
  onBack: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{value}</p>
    </div>
);

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ studySets, theme, onBack }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    const quizzesTaken = studySets.filter(s => s.quizScore !== undefined);
    const totalFlashcards = studySets.reduce((acc, set) => acc + (set.flashcards?.length || 0), 0);
    const averageScore = quizzesTaken.length > 0
        ? (quizzesTaken.reduce((acc, set) => acc + (set.quizScore! / set.quiz!.length), 0) / quizzesTaken.length * 100).toFixed(1)
        : 'N/A';
    
    useEffect(() => {
        if (!chartRef.current || quizzesTaken.length === 0) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
        
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const isDarkMode = theme === 'dark';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDarkMode ? '#e2e8f0' : '#334155';

        chartInstanceRef.current = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels: quizzesTaken.map(s => s.fileName.substring(0, 15) + '...'),
                datasets: [{
                    label: 'Quiz Score (%)',
                    data: quizzesTaken.map(s => (s.quizScore! / s.quiz!.length) * 100),
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textColor } } },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: gridColor },
                        ticks: { color: textColor, callback: (value) => value + '%' }
                    },
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    }
                }
            }
        });
        
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };

    }, [quizzesTaken, theme]);


  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg">
      <div className="flex items-center gap-4 mb-6 border-b-2 border-slate-200 dark:border-slate-700 pb-4">
        <button 
            onClick={onBack}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
            aria-label="Go back to uploader">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
        </button>
        <h2 className="text-3xl font-bold">Study Analytics</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Documents Studied" value={studySets.length} />
        <StatCard title="Flashcards Created" value={totalFlashcards} />
        <StatCard title="Quizzes Taken" value={quizzesTaken.length} />
        <StatCard title="Average Score" value={averageScore === 'N/A' ? 'N/A' : `${averageScore}%`} />
      </div>

      <h3 className="text-2xl font-semibold mb-4">Quiz Performance</h3>
      {quizzesTaken.length > 0 ? (
        <div className="relative w-full h-96 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <canvas ref={chartRef}></canvas>
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <h4 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No quiz data yet!</h4>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Take a quiz to see your performance here.</p>
        </div>
      )}
    </div>
  );
};