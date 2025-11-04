import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { GenerationOptions } from './components/GenerationOptions';
import { FlashcardViewer } from './components/FlashcardViewer';
import { MindMapViewer } from './components/MindMapViewer';
import { QuizViewer } from './components/QuizViewer';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateFlashcards, generateMindMap, generateQuiz, generateVisualAid, generateSummary } from './services/geminiService';
import { GenerationType, Flashcard, MindMapNode, QuizQuestion, ChartData, StudySet } from './types';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { VisualAidViewer } from './components/VisualAidViewer';
import { SummaryViewer } from './components/SummaryViewer';


// Extend the Window interface for external libraries
declare global {
  interface Window {
    pdfjsLib: any;
    d3: any;
    Chart: any;
    mammoth: any;
    pptx: any;
  }
}

type View = 'upload' | 'generation' | 'analytics';

const App: React.FC = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [currentView, setCurrentView] = useState<View>('upload');
  const [studySets, setStudySets] = useState<StudySet[]>([]);

  const [pdfText, setPdfText] = useState<string | null>(null);
  const [currentStudySet, setCurrentStudySet] = useState<StudySet | null>(null);
  
  const [generationType, setGenerationType] = useState<GenerationType | null>(null);
  const [generatedData, setGeneratedData] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedSets = localStorage.getItem('eClassStudySets');
      if (storedSets) {
        setStudySets(JSON.parse(storedSets));
      }
    } catch (e) {
      console.error("Failed to parse study sets from localStorage", e);
      localStorage.removeItem('eClassStudySets');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const updateStudySets = (updatedSets: StudySet[]) => {
    setStudySets(updatedSets);
    localStorage.setItem('eClassStudySets', JSON.stringify(updatedSets));
  }

  const resetGenerationState = () => {
    setGenerationType(null);
    setGeneratedData(null);
    setError(null);
  }

  const handleFileProcessed = (text: string, name: string) => {
    setPdfText(text);
    const newStudySet: StudySet = {
      id: `set-${Date.now()}`,
      fileName: name,
      createdAt: Date.now(),
    };
    setCurrentStudySet(newStudySet);
    setCurrentView('generation');
    resetGenerationState();
  };
  
  const handleGenerationSelect = useCallback(async (type: GenerationType, count: number) => {
    if (!pdfText || !currentStudySet) return;

    setIsLoading(true);
    setGenerationType(type);
    setGeneratedData(null);
    setError(null);

    try {
      let data;
      let updatedStudySet = { ...currentStudySet };

      switch (type) {
        case GenerationType.Flashcards:
          data = await generateFlashcards(pdfText, count);
          updatedStudySet.flashcards = data;
          break;
        case GenerationType.MindMap:
          data = await generateMindMap(pdfText);
          updatedStudySet.mindMap = data;
          break;
        case GenerationType.Quiz:
          data = await generateQuiz(pdfText, count);
          updatedStudySet.quiz = data;
          break;
        case GenerationType.VisualAid:
          data = await generateVisualAid(pdfText);
          updatedStudySet.visualAid = data;
          break;
        case GenerationType.Summary:
          data = await generateSummary(pdfText);
          updatedStudySet.summary = data;
          break;
        default:
          throw new Error('Invalid generation type');
      }
      setGeneratedData(data);
      setCurrentStudySet(updatedStudySet);
      
      const existingSetIndex = studySets.findIndex(s => s.id === updatedStudySet.id);
      if (existingSetIndex > -1) {
        const newSets = [...studySets];
        newSets[existingSetIndex] = updatedStudySet;
        updateStudySets(newSets);
      } else {
        updateStudySets([...studySets, updatedStudySet]);
      }
      
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [pdfText, currentStudySet, studySets]);
  
  const handleNewFile = () => {
    setPdfText(null);
    setCurrentStudySet(null);
    setCurrentView('upload');
    resetGenerationState();
  };

  const handleQuizComplete = (score: number) => {
    if (!currentStudySet) return;

    const updatedStudySet = { ...currentStudySet, quizScore: score };
    setCurrentStudySet(updatedStudySet);

    const updatedSets = studySets.map(s => 
      s.id === updatedStudySet.id ? updatedStudySet : s
    );
    updateStudySets(updatedSets);
  }

  const renderGeneratedContent = () => {
    if (isLoading) {
      return <LoadingSpinner type={generationType} />;
    }

    if (error) {
      return <div className="text-center text-red-500 dark:text-red-400 p-8 bg-red-100 dark:bg-red-900/20 rounded-lg">{error}</div>;
    }

    if (!generatedData) return null;

    switch (generationType) {
      case GenerationType.Flashcards:
        return <FlashcardViewer flashcards={generatedData as Flashcard[]} />;
      case GenerationType.MindMap:
        return <MindMapViewer data={generatedData as MindMapNode} />;
      case GenerationType.Quiz:
        return <QuizViewer questions={generatedData as QuizQuestion[]} onQuizComplete={handleQuizComplete} />;
      case GenerationType.VisualAid:
        return <VisualAidViewer data={generatedData as ChartData} />;
      case GenerationType.Summary:
        return <SummaryViewer summary={generatedData as string} />;
      default:
        return null;
    }
  };
  
  const renderMainContent = () => {
    switch (currentView) {
        case 'analytics':
            return <AnalyticsPage studySets={studySets} theme={theme} onBack={() => setCurrentView('upload')} />;
        case 'upload':
            return <FileUpload onFileProcessed={handleFileProcessed} setIsLoading={setIsLoading} isLoading={isLoading} />;
        case 'generation':
            return (
                <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleNewFile} 
                            className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                            aria-label="Upload a new file">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Loaded Document:</p>
                            <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-xs sm:max-w-md">{currentStudySet?.fileName}</h2>
                        </div>
                    </div>
                  </div>
    
                  <GenerationOptions onSelect={handleGenerationSelect} disabled={isLoading} />
                  
                  <div className="mt-8 min-h-[300px] flex items-center justify-center">
                    {renderGeneratedContent()}
                  </div>
                </div>
              );
        default:
            return <FileUpload onFileProcessed={handleFileProcessed} setIsLoading={setIsLoading} isLoading={isLoading} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onNavigate={(view) => setCurrentView(view)}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
};

export default App;