import booksJson from './books.json';
import { BookMeta, LessonMeta, DialogueItem, VocabItem, VerbItem, ConjugationItem, GrammarItem } from '../types';

import b1Lessons from './book1/lessons.json';
import b1Dialogues from './book1/dialogues.json';
import b1Vocab from './book1/vocab.json';
import b1Verbs from './book1/verbs.json';
import b1Grammar from './book1/grammar.json';

import b2Lessons from './book2/lessons.json';
import b2Dialogues from './book2/dialogues.json';
import b2Vocab from './book2/vocab.json';
import b2Verbs from './book2/verbs.json';
import b2Grammar from './book2/grammar.json';

import b3Lessons from './book3/lessons.json';
import b3Dialogues from './book3/dialogues.json';
import b3Vocab from './book3/vocab.json';
import b3Verbs from './book3/verbs.json';
import b3Grammar from './book3/grammar.json';

import b4Lessons from './book4/lessons.json';
import b4Dialogues from './book4/dialogues.json';
import b4Vocab from './book4/vocab.json';
import b4Verbs from './book4/verbs.json';
import b4Grammar from './book4/grammar.json';

export interface BookDataset {
  meta: BookMeta;
  lessons: LessonMeta[];
  dialogues: Record<string, DialogueItem[]>;
  vocab: Record<string, VocabItem[]>;
  verbs: {
    verbs: Record<string, VerbItem[]>;
    conjugations: Record<string, ConjugationItem[]>;
  };
  grammar: Record<string, GrammarItem[]>;
}

export const ALL_BOOKS: BookMeta[] = booksJson as BookMeta[];

export const BOOKS_DATA: Record<number, BookDataset> = {
  1: {
    meta: ALL_BOOKS[0],
    lessons: b1Lessons as LessonMeta[],
    dialogues: b1Dialogues as Record<string, DialogueItem[]>,
    vocab: b1Vocab as Record<string, VocabItem[]>,
    verbs: b1Verbs as { verbs: Record<string, VerbItem[]>; conjugations: Record<string, ConjugationItem[]> },
    grammar: b1Grammar as Record<string, GrammarItem[]>,
  },
  2: {
    meta: ALL_BOOKS[1],
    lessons: b2Lessons as LessonMeta[],
    dialogues: b2Dialogues as Record<string, DialogueItem[]>,
    vocab: b2Vocab as Record<string, VocabItem[]>,
    verbs: b2Verbs as { verbs: Record<string, VerbItem[]>; conjugations: Record<string, ConjugationItem[]> },
    grammar: b2Grammar as Record<string, GrammarItem[]>,
  },
  3: {
    meta: ALL_BOOKS[2],
    lessons: b3Lessons as LessonMeta[],
    dialogues: b3Dialogues as Record<string, DialogueItem[]>,
    vocab: b3Vocab as Record<string, VocabItem[]>,
    verbs: b3Verbs as { verbs: Record<string, VerbItem[]>; conjugations: Record<string, ConjugationItem[]> },
    grammar: b3Grammar as Record<string, GrammarItem[]>,
  },
  4: {
    meta: ALL_BOOKS[3],
    lessons: b4Lessons as LessonMeta[],
    dialogues: b4Dialogues as Record<string, DialogueItem[]>,
    vocab: b4Vocab as Record<string, VocabItem[]>,
    verbs: b4Verbs as { verbs: Record<string, VerbItem[]>; conjugations: Record<string, ConjugationItem[]> },
    grammar: b4Grammar as Record<string, GrammarItem[]>,
  },
};

export function getBookData(bookId: number): BookDataset {
  return BOOKS_DATA[bookId] || BOOKS_DATA[1];
}
