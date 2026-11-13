export interface LessonMeta {
  lessonNumber: number;
  title: string;
  dialogueCount: number;
  vocabCount: number;
  verbCount: number;
  conjugationCount: number;
  hasGrammar: boolean;
}

export interface DialogueItem {
  id: number;
  wordId: number;
  arabic: string;
  english: string;
  russian: string;
  voiceKey: string;
}

export interface VocabItem {
  id: number;
  wordId: number;
  arabic: string;
  english: string;
  russian: string;
  voiceKey: string;
}

export interface VerbItem {
  id: number;
  wordId: number;
  arabic: string;
  english: string;
  russian: string;
  voiceKey: string;
}

export interface ConjugationItem {
  id: number;
  wordId: number;
  marker: string; // e.g. "الْمَاضِي", "الْمُضَارِع", "الْأَمْر"
  arabic: string;
  english: string;
  russian: string;
  voiceKey: string;
}

export interface GrammarItem {
  id: number;
  type: number;
  arabic?: string;
  english?: string;
  titleEN?: string;
}

export type VoiceGender = 'a' | 'b'; // 'a' = female, 'b' = male
export type ActiveTab = 'dialogue' | 'exercise' | 'vocab' | 'verbs' | 'grammar' | 'flashcards';
export type TranslationLang = 'en' | 'ru';
