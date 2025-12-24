
export type Subject = 'Math' | 'Reading' | 'Spelling';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  question: string;
  answer: string;
}

export interface DailyActivity {
  id: string; // e.g., childId_YYYY-MM-DD
  childId: string;
  date: string; // YYYY-MM-DD
  mathQuestions: Question[];
  readingPassage: string;
  readingQuestions: Question[];
  status: 'pending' | 'viewed' | 'graded';
  score?: {
      math: number; // percentage
      reading: number; // percentage
      overall: number; // percentage
  };
}

export interface SpellingResult {
    words: string[];
    score: number; // percentage
    timestamp: number;
}

export interface Child {
  id: string;
  name: string;
  gradeLevel: string;
  avatar: string;
  spellingProgress: SpellingResult[];
}

export interface Parent {
  id: string; // firebase auth uid
  username: string;
  email: string;
  children: Child[];
}
