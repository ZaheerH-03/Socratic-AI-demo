export type ProfessorStatus = 
  | 'Pensive' 
  | 'Skeptical' 
  | 'Demanding' 
  | 'Impressed' 
  | 'Trap Set' 
  | 'Intrigued' 
  | 'Disappointed';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: ProfessorStatus;
  timestamp: string;
  trapActive?: boolean;
  trapExplanation?: string;
  isTrapCallout?: boolean;
}

export type ExpertiseLevel = 'Beginner' | 'Intermediate' | 'Expert';

export interface ConceptScore {
  concept: string;
  score: number;
}

export interface MasteryReportData {
  conceptualStrengths: string[];
  knowledgeGaps: string[];
  grade: 'Fails' | 'Passes' | 'Meets Expectations' | 'Exceeds Expectations';
  professorEvaluation: string;
  conceptScores: ConceptScore[];
  trapResponse: string;
}
