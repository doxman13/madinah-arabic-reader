import React, { useState, useEffect, useMemo } from 'react';
import { DialogueItem, VocabItem, VoiceGender } from '../types';
import { 
  Check, 
  X, 
  Volume2, 
  RotateCcw, 
  Sparkles, 
  Trophy, 
  Keyboard,
  Puzzle,
  ChevronRight,
  ArrowRightLeft,
  RotateCw,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { removeTashkeel } from '../utils/arabic';

interface ExerciseViewProps {
  dialogues: DialogueItem[];
  vocab: VocabItem[];
  currentLessonNum: number;
  onPlayAudio: (key: string) => void;
  arabicSize: number;
  gender: VoiceGender;
  showTashkeel: boolean;
}

type ExerciseMode = 'scramble' | 'type';
type ExerciseDirection = 'en-ar' | 'ar-en' | 'mixed';

interface Token {
  id: string;
  text: string;
  isDistractor?: boolean;
}

interface ProgressRecord {
  completedIds: number[];
  score: number;
  streak: number;
}

export const ExerciseView: React.FC<ExerciseViewProps> = ({
  dialogues,
  vocab,
  currentLessonNum,
  onPlayAudio,
  arabicSize,
  gender,
  showTashkeel
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<ExerciseMode>('scramble');
  const [direction, setDirection] = useState<ExerciseDirection>('en-ar');
  
  // Progress State from localStorage
  const progressKey = `madinah_lesson_${currentLessonNum}_progress`;
  const [progress, setProgress] = useState<ProgressRecord>(() => {
    try {
      const saved = localStorage.getItem(progressKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { completedIds: [], score: 0, streak: 0 };
  });

  // Scramble mode state
  const [bankWords, setBankWords] = useState<Token[]>([]);
  const [selectedWords, setSelectedWords] = useState<Token[]>([]);
  
  // Typing mode state
  const [userInput, setUserInput] = useState('');
  
  // Feedback
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const currentItem: DialogueItem | undefined = dialogues[currentIndex];

  // Determine current question direction (for mixed mode)
  const activeDirection: 'en-ar' | 'ar-en' = useMemo(() => {
    if (direction === 'mixed') {
      return currentIndex % 2 === 0 ? 'en-ar' : 'ar-en';
    }
    return direction;
  }, [direction, currentIndex]);

  // Save progress to localStorage
  const saveProgress = (newProgress: ProgressRecord) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(progressKey, JSON.stringify(newProgress));
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to normalize strings for comparison
  const normalizeAr = (text: string) => {
    return text
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[أإآء]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[^\u0621-\u064A\s]/g, '')
      .trim();
  };

  const normalizeEn = (text: string) => {
    return text
      .toLowerCase()
      .replace(/&apos;/g, "'")
      .replace(/[«»"'.,?!():;-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Clean words
  const cleanWord = (w: string) => w.replace(/[.,?!():;«»"']/g, '').trim();

  // Reset / Clear entire lesson progress
  const handleResetLessonProgress = () => {
    if (window.confirm("Are you sure you want to reset your exercise progress for this lesson?")) {
      const resetData = { completedIds: [], score: 0, streak: 0 };
      saveProgress(resetData);
      setCurrentIndex(0);
      setStatus('idle');
      setUserInput('');
      setSelectedWords([]);
    }
  };

  // Initialize question tokens (Target Words + Distractors)
  useEffect(() => {
    if (!currentItem) return;

    setStatus('idle');
    setUserInput('');
    setSelectedWords([]);

    if (activeDirection === 'en-ar') {
      // English ➔ Arabic
      const rawWords = currentItem.arabic
        .split(/\s+/)
        .map(cleanWord)
        .filter(w => w.length > 0);

      // Target tokens
      const targetTokens: Token[] = rawWords.map((w, idx) => ({
        id: `target-${idx}-${w}`,
        text: showTashkeel ? w : removeTashkeel(w),
        isDistractor: false
      }));

      // Generate 3 to 5 Distractor Arabic words
      const distractorPool: string[] = [];
      // From Vocab
      if (vocab && vocab.length > 0) {
        vocab.forEach(v => {
          v.arabic.split(/\s+/).forEach(w => {
            const cw = cleanWord(w);
            if (cw && !rawWords.includes(cw) && !distractorPool.includes(cw)) {
              distractorPool.push(cw);
            }
          });
        });
      }
      // From other dialogues in this lesson
      dialogues.forEach(d => {
        if (d.id !== currentItem.id) {
          d.arabic.split(/\s+/).forEach(w => {
            const cw = cleanWord(w);
            if (cw && !rawWords.includes(cw) && !distractorPool.includes(cw)) {
              distractorPool.push(cw);
            }
          });
        }
      });

      // Pick 3-4 random distractors
      const shuffledDistractors = distractorPool.sort(() => Math.random() - 0.5).slice(0, 4);
      const distractorTokens: Token[] = shuffledDistractors.map((w, idx) => ({
        id: `distractor-${idx}-${w}`,
        text: showTashkeel ? w : removeTashkeel(w),
        isDistractor: true
      }));

      // Combine & shuffle
      const combined = [...targetTokens, ...distractorTokens].sort(() => Math.random() - 0.5);
      setBankWords(combined);

    } else {
      // Arabic ➔ English
      const rawWords = currentItem.english
        .replace(/[«»"'.,?!():;-]/g, ' ')
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 0);

      const targetTokens: Token[] = rawWords.map((w, idx) => ({
        id: `target-en-${idx}-${w}`,
        text: w,
        isDistractor: false
      }));

      // Generate 3 to 4 English Distractors from other dialogues
      const distractorPool: string[] = [];
      dialogues.forEach(d => {
        if (d.id !== currentItem.id) {
          d.english.replace(/[«»"'.,?!():;-]/g, ' ').split(/\s+/).forEach(w => {
            const cw = w.trim();
            if (cw && !rawWords.map(rw => rw.toLowerCase()).includes(cw.toLowerCase()) && !distractorPool.includes(cw)) {
              distractorPool.push(cw);
            }
          });
        }
      });

      const shuffledDistractors = distractorPool.sort(() => Math.random() - 0.5).slice(0, 4);
      const distractorTokens: Token[] = shuffledDistractors.map((w, idx) => ({
        id: `distractor-en-${idx}-${w}`,
        text: w,
        isDistractor: true
      }));

      const combined = [...targetTokens, ...distractorTokens].sort(() => Math.random() - 0.5);
      setBankWords(combined);
    }
  }, [currentIndex, currentItem, activeDirection, showTashkeel, dialogues, vocab]);

  if (!dialogues || dialogues.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        No exercises available for this lesson.
      </div>
    );
  }

  // Word selection handlers
  const handleSelectWord = (token: Token) => {
    if (status !== 'idle') return;
    setBankWords(prev => prev.filter(w => w.id !== token.id));
    setSelectedWords(prev => [...prev, token]);
  };

  const handleRemoveWord = (token: Token) => {
    if (status !== 'idle') return;
    setSelectedWords(prev => prev.filter(w => w.id !== token.id));
    setBankWords(prev => [...prev, token]);
  };

  // Check Answer
  const handleCheck = () => {
    if (!currentItem) return;

    let isCorrect = false;

    if (activeDirection === 'en-ar') {
      if (mode === 'scramble') {
        const userSentence = selectedWords.map(w => w.text).join(' ');
        const targetWords = currentItem.arabic.split(/\s+/).map(cleanWord).filter(Boolean);
        const userWords = selectedWords.map(w => cleanWord(w.text));
        
        if (userWords.join(' ') === targetWords.join(' ')) {
          isCorrect = true;
        } else {
          isCorrect = normalizeAr(userSentence) === normalizeAr(currentItem.arabic);
        }
      } else {
        isCorrect = normalizeAr(userInput) === normalizeAr(currentItem.arabic);
      }
    } else {
      // Arabic ➔ English
      if (mode === 'scramble') {
        const userSentence = normalizeEn(selectedWords.map(w => w.text).join(' '));
        const targetSentence = normalizeEn(currentItem.english);
        isCorrect = userSentence === targetSentence;
      } else {
        isCorrect = normalizeEn(userInput) === normalizeEn(currentItem.english);
      }
    }

    if (isCorrect) {
      setStatus('correct');
      const alreadyCompleted = progress.completedIds.includes(currentItem.id);
      const newScore = progress.score + (alreadyCompleted ? 2 : 10);
      const newStreak = progress.streak + 1;
      const newCompleted = alreadyCompleted ? progress.completedIds : [...progress.completedIds, currentItem.id];
      
      saveProgress({
        completedIds: newCompleted,
        score: newScore,
        streak: newStreak
      });

      // Play audio on correct answer
      onPlayAudio(currentItem.voiceKey);
    } else {
      setStatus('incorrect');
      saveProgress({
        ...progress,
        streak: 0
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < dialogues.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleRetryCurrent = () => {
    setStatus('idle');
    setUserInput('');
    setSelectedWords([]);
    // Restore all words back to bank
    setBankWords(prev => [...prev, ...selectedWords].sort(() => Math.random() - 0.5));
  };

  const isCurrentCompleted = currentItem && progress.completedIds.includes(currentItem.id);
  const completionPercent = Math.round((progress.completedIds.length / dialogues.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Top Score, Direction & Reset Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Score & Streak */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lesson Progress</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{progress.score} pts</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {progress.completedIds.length}/{dialogues.length} ({completionPercent}%)
                </span>
                {progress.streak > 1 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-semibold animate-pulse">
                    🔥 {progress.streak}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Reset & Restart Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleResetLessonProgress}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-900 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Reset progress for this lesson"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Direction & Mode Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Language Direction Toggle */}
          <div className="flex items-center rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setDirection('en-ar')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                direction === 'en-ar'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span>EN ➔ AR</span>
            </button>
            <button
              onClick={() => setDirection('ar-en')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                direction === 'ar-en'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span>AR ➔ EN</span>
            </button>
            <button
              onClick={() => setDirection('mixed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                direction === 'mixed'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Mixed</span>
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 font-semibold">
            <button
              onClick={() => setMode('scramble')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                mode === 'scramble'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5" />
              <span>Word Tiles</span>
            </button>
            <button
              onClick={() => setMode('type')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                mode === 'type'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Type</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500 px-1 font-medium">
          <span>Question {currentIndex + 1} of {dialogues.length}</span>
          {isCurrentCompleted && (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
            </span>
          )}
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / dialogues.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Prompt Header */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              {activeDirection === 'en-ar' 
                ? (mode === 'scramble' ? 'Assemble the phrase in Arabic:' : 'Type in Arabic (no harakat needed):')
                : (mode === 'scramble' ? 'Assemble the phrase in English:' : 'Type the English translation:')}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              #{currentIndex + 1}
            </span>
          </div>
          
          {/* Prompt Display */}
          {activeDirection === 'en-ar' ? (
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              "{currentItem.english}"
            </div>
          ) : (
            <div 
              className="font-arabic font-bold text-slate-900 dark:text-white text-right leading-relaxed select-text"
              dir="rtl"
              style={{ fontSize: `${arabicSize}px` }}
            >
              {showTashkeel ? currentItem.arabic : removeTashkeel(currentItem.arabic)}
            </div>
          )}

          {/* Audio Hint button */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onPlayAudio(currentItem.voiceKey)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen Pronunciation</span>
            </button>
          </div>
        </div>

        {/* Word Scramble Construction Zone */}
        {mode === 'scramble' ? (
          <div className="space-y-6">
            {/* Answer Assembly Box */}
            <div 
              className={`min-h-[100px] p-4 rounded-2xl border-2 border-dashed flex flex-wrap items-center gap-2.5 transition-all ${
                activeDirection === 'en-ar' ? 'justify-end' : 'justify-start'
              } ${
                status === 'correct'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : status === 'incorrect'
                  ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                  : selectedWords.length > 0
                  ? 'border-emerald-300 dark:border-emerald-800 bg-slate-50 dark:bg-slate-800/40'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'
              }`}
              dir={activeDirection === 'en-ar' ? 'rtl' : 'ltr'}
            >
              {selectedWords.length === 0 ? (
                <div className="w-full text-center text-slate-400 text-xs py-4 font-sans" dir="ltr">
                  Tap word tiles below to form the sentence
                </div>
              ) : (
                selectedWords.map((token) => (
                  <button
                    key={token.id}
                    onClick={() => handleRemoveWord(token)}
                    className={`font-bold px-4 py-2 rounded-xl shadow-xs border transition-all cursor-pointer animate-scale-in ${
                      activeDirection === 'en-ar' ? 'font-arabic text-slate-900 dark:text-white' : 'font-sans text-xs text-slate-800 dark:text-slate-100'
                    } bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-rose-400 hover:text-rose-600`}
                    style={{ fontSize: activeDirection === 'en-ar' ? `${arabicSize * 0.8}px` : undefined }}
                  >
                    {token.text}
                  </button>
                ))
              )}
            </div>

            {/* Word Bank with Distractors */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Word Bank (Select the correct words):</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({bankWords.length} available choices)
                </span>
              </div>
              <div 
                className="flex flex-wrap items-center justify-center gap-2.5 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 min-h-[80px]"
                dir={activeDirection === 'en-ar' ? 'rtl' : 'ltr'}
              >
                {bankWords.map((token) => (
                  <button
                    key={token.id}
                    onClick={() => handleSelectWord(token)}
                    className={`font-bold px-4 py-2 rounded-xl shadow-xs border transition-all cursor-pointer hover:border-emerald-500 hover:shadow-sm hover:scale-105 active:scale-95 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white ${
                      activeDirection === 'en-ar' ? 'font-arabic' : 'font-sans text-xs'
                    }`}
                    style={{ fontSize: activeDirection === 'en-ar' ? `${arabicSize * 0.8}px` : undefined }}
                  >
                    {token.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Type Mode */
          <div className="space-y-4">
            <input
              type="text"
              placeholder={activeDirection === 'en-ar' ? "اكتب الجواب هنا..." : "Type the English translation here..."}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && status === 'idle' && userInput.trim()) {
                  handleCheck();
                }
              }}
              dir={activeDirection === 'en-ar' ? 'rtl' : 'ltr'}
              className={`w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none text-slate-900 dark:text-white font-bold transition-colors ${
                activeDirection === 'en-ar' ? 'font-arabic text-xl' : 'font-sans text-base'
              }`}
            />
            <p className="text-xs text-slate-400">
              {activeDirection === 'en-ar' 
                ? "Tip: Arabic harakat/vowels are optional. Letter variants like أ/إ/ا are normalized." 
                : "Tip: Punctuation is ignored."}
            </p>
          </div>
        )}

        {/* Feedback Messages */}
        {status === 'correct' && (
          <div className="p-4 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between text-emerald-900 dark:text-emerald-200 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">Right! أحسنت</div>
                <div className="font-arabic font-bold text-base mt-0.5 text-right" dir="rtl">
                  {showTashkeel ? currentItem.arabic : removeTashkeel(currentItem.arabic)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {currentItem.english}
                </div>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all shrink-0"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'incorrect' && (
          <div className="p-4 rounded-2xl bg-rose-100/80 dark:bg-rose-950/60 border border-rose-500/50 flex items-start justify-between text-rose-900 dark:text-rose-200 animate-fade-in gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                <X className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">Not quite right!</div>
                <div className="text-xs mt-1 text-slate-700 dark:text-slate-300">Correct Target:</div>
                <div className="font-arabic font-bold text-base text-right text-emerald-700 dark:text-emerald-300 mt-1" dir="rtl">
                  {showTashkeel ? currentItem.arabic : removeTashkeel(currentItem.arabic)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  "{currentItem.english}"
                </div>
              </div>
            </div>
            <button
              onClick={handleRetryCurrent}
              className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-xs font-semibold hover:bg-rose-200/50 dark:hover:bg-rose-900/50 transition-colors shrink-0"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRetryCurrent}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset current question"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-medium transition-colors"
            >
              Skip
            </button>
          </div>

          <div className="flex items-center gap-2">
            {status === 'idle' ? (
              <button
                onClick={handleCheck}
                disabled={mode === 'scramble' ? selectedWords.length === 0 : !userInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
