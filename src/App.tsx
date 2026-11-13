import React, { useState, useEffect } from 'react';
import lessonsData from './data/lessons.json';
import dialoguesData from './data/dialogues.json';
import vocabData from './data/vocab.json';
import verbsData from './data/verbs.json';
import grammarData from './data/grammar.json';

import { ActiveTab, LessonMeta, DialogueItem, VocabItem, VerbItem, ConjugationItem, GrammarItem } from './types';
import { useAudio } from './hooks/useAudio';
import { Header } from './components/Header';
import { LessonSidebar } from './components/LessonSidebar';
import { DialogueView } from './components/DialogueView';
import { ExerciseView } from './components/ExerciseView';
import { VocabView } from './components/VocabView';
import { VerbsView } from './components/VerbsView';
import { GrammarView } from './components/GrammarView';
import { FlashcardModal } from './components/FlashcardModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function App() {
  const lessons: LessonMeta[] = lessonsData as LessonMeta[];
  
  const [currentLessonNum, setCurrentLessonNum] = useState<number>(() => {
    const saved = localStorage.getItem('madinah_current_lesson');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dialogue');
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showTashkeel, setShowTashkeel] = useState<boolean>(() => {
    const saved = localStorage.getItem('madinah_show_tashkeel');
    return saved !== null ? saved === 'true' : true;
  });
  const [arabicSize, setArabicSize] = useState<number>(32);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState<boolean>(false);

  const audio = useAudio();

  // Save current lesson to localStorage
  useEffect(() => {
    localStorage.setItem('madinah_current_lesson', currentLessonNum.toString());
  }, [currentLessonNum]);

  // Save tashkeel preference to localStorage
  useEffect(() => {
    localStorage.setItem('madinah_show_tashkeel', showTashkeel.toString());
  }, [showTashkeel]);

  // Current lesson data
  const currentLessonMeta = lessons.find(l => l.lessonNumber === currentLessonNum) || lessons[0];
  
  const currentDialogues: DialogueItem[] = (dialoguesData as Record<string, DialogueItem[]>)[currentLessonNum.toString()] || [];
  const currentVocab: VocabItem[] = (vocabData as Record<string, VocabItem[]>)[currentLessonNum.toString()] || [];
  
  const verbsMap = (verbsData as { verbs: Record<string, VerbItem[]>; conjugations: Record<string, ConjugationItem[]> });
  const currentVerbs: VerbItem[] = verbsMap.verbs[currentLessonNum.toString()] || [];
  const currentConjugations: ConjugationItem[] = verbsMap.conjugations[currentLessonNum.toString()] || [];
  
  const currentGrammar: GrammarItem[] = (grammarData as Record<string, GrammarItem[]>)[currentLessonNum.toString()] || [];

  // Stop audio if lesson changes
  const handleSelectLesson = (num: number) => {
    audio.stop();
    setCurrentLessonNum(num);
  };

  const goToNextLesson = () => {
    if (currentLessonNum < lessons.length) {
      handleSelectLesson(currentLessonNum + 1);
    }
  };

  const goToPrevLesson = () => {
    if (currentLessonNum > 1) {
      handleSelectLesson(currentLessonNum - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors">
      {/* Sidebar Drawer */}
      <LessonSidebar
        lessons={lessons}
        currentLessonNum={currentLessonNum}
        onSelectLesson={handleSelectLesson}
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-80 transition-all">
        {/* Navigation & Controls Header */}
        <Header
          currentLessonNum={currentLessonNum}
          lessonTitle={currentLessonMeta.title}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          showTranslation={showTranslation}
          setShowTranslation={setShowTranslation}
          showTashkeel={showTashkeel}
          setShowTashkeel={setShowTashkeel}
          arabicSize={arabicSize}
          setArabicSize={setArabicSize}
          gender={audio.gender}
          onGenderChange={audio.changeGender}
          speed={audio.speed}
          onSpeedChange={audio.changeSpeed}
          dialogueCount={currentDialogues.length}
          vocabCount={currentVocab.length}
          verbCount={currentVerbs.length}
          hasGrammar={currentGrammar.length > 0}
          onOpenFlashcards={() => setIsFlashcardOpen(true)}
        />

        {/* Tab View */}
        <main className="flex-1">
          {activeTab === 'dialogue' && (
            <DialogueView
              dialogues={currentDialogues}
              currentAudioKey={audio.currentKey}
              isPlaying={audio.isPlaying}
              onPlayAudio={audio.play}
              onStopAudio={audio.stop}
              showTranslation={showTranslation}
              showTashkeel={showTashkeel}
              setShowTashkeel={setShowTashkeel}
              arabicSize={arabicSize}
              gender={audio.gender}
            />
          )}

          {activeTab === 'exercise' && (
            <ExerciseView
              dialogues={currentDialogues}
              vocab={currentVocab}
              currentLessonNum={currentLessonNum}
              onPlayAudio={audio.play}
              arabicSize={arabicSize}
              gender={audio.gender}
              showTashkeel={showTashkeel}
            />
          )}

          {activeTab === 'vocab' && (
            <VocabView
              vocab={currentVocab}
              currentAudioKey={audio.currentKey}
              isPlaying={audio.isPlaying}
              onPlayAudio={audio.play}
              showTranslation={showTranslation}
              showTashkeel={showTashkeel}
              arabicSize={arabicSize}
              gender={audio.gender}
            />
          )}

          {activeTab === 'verbs' && (
            <VerbsView
              verbs={currentVerbs}
              conjugations={currentConjugations}
              currentAudioKey={audio.currentKey}
              isPlaying={audio.isPlaying}
              onPlayAudio={audio.play}
              arabicSize={arabicSize}
              gender={audio.gender}
            />
          )}

          {activeTab === 'grammar' && (
            <GrammarView
              grammar={currentGrammar}
              arabicSize={arabicSize}
              showTashkeel={showTashkeel}
            />
          )}
        </main>

        {/* Floating Lesson Footer Navigator */}
        <footer className="fixed bottom-0 left-0 right-0 lg:left-80 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs">
            <button
              onClick={goToPrevLesson}
              disabled={currentLessonNum <= 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 font-medium transition-colors text-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Lesson</span>
            </button>

            <span className="font-semibold text-slate-600 dark:text-slate-400">
              Lesson {currentLessonNum} of {lessons.length}
            </span>

            <button
              onClick={goToNextLesson}
              disabled={currentLessonNum >= lessons.length}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 font-medium transition-colors text-slate-700 dark:text-slate-300"
            >
              <span>Next Lesson</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </div>

      {/* Interactive Flashcard Modal */}
      <FlashcardModal
        isOpen={isFlashcardOpen}
        onClose={() => setIsFlashcardOpen(false)}
        vocab={currentVocab}
        dialogues={currentDialogues}
        onPlayAudio={audio.play}
        arabicSize={arabicSize}
      />
    </div>
  );
}

export default App;
