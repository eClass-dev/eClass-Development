export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export interface StudySet {
  id: string; // Unique ID for each study set
  fileName: string;
  flashcards?: Flashcard[];
  mindMap?: MindMapNode;
  quiz?: QuizQuestion[];
  visualAid?: ChartData;
  summary?: string;
  quizScore?: number;
  createdAt: number; // Timestamp
}

export enum GenerationType {
  Flashcards = 'FLASHCARDS',
  MindMap = 'MIND_MAP',
  Quiz = 'QUIZ',
  VisualAid = 'VISUAL_AID',
  Summary = 'SUMMARY',
}