import React, { useState, useEffect } from 'react';
import { VocabItem, DialogueItem, VoiceGender } from '../types';
import { X, Volume2, RotateCw, ChevronLeft, ChevronRight, Shuffle, Check, ArrowRight } from 'lucide-react';
import { removeTashkeel } from '../utils/arabic';

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  vocab: VocabItem[];
  dialogues: DialogueItem[];
  onPlayAudio: (key: string) => void;
  arabicSize: number;
  showTashkeel?: boolean;
}

export const FlashcardModal: React.FC<FlashcardModalProps> = ({
  isOpen,
  onClose,
  vocab,
  dialogues,
  onPlayAudio,
  arabicSize,
  showTashkeel = true
}) => {
  const [mode, setMode] = useState<'vocab' | 'dialogue'>('vocab');
  const [cards, setCards] = useState<{ id: number; arabic: string; english: string; voiceKey: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());

  // Prepare card items based on mode
  useEffect(() => {
    let rawItems: { id: number; arabic: string; english: string; voiceKey: string }[] = [];
    if (mode === 'vocab' && vocab && vocab.length > 0) {
      rawItems = vocab.map(v => ({ id: v.id, arabic: v.arabic, english: v.english, voiceKey: v.voiceKey }));
    } else if (dialogues && dialogues.length > 0) {
      rawItems = dialogues.map(d => ({ id: d.id, arabic: d.arabic, english: d.english, voiceKey: d.voiceKey }));
    }
    setCards(rawItems);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [mode, vocab, dialogues]);

  if (!isOpen || cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMarkMastered = () => {
    setMasteredIds(prev => new Set(prev).add(currentCard.id));
    handleNext();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Flashcard Studio
            </span>
            <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs">
              <button
                onClick={() => setMode('vocab')}
                disabled={!vocab || vocab.length === 0}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mode === 'vocab' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Vocab ({vocab?.length || 0})
              </button>
              <button
                onClick={() => setMode('dialogue')}
                disabled={!dialogues || dialogues.length === 0}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mode === 'dialogue' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                Dialogues ({dialogues?.length || 0})
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div
            className="bg-emerald-500 h-1 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-[300px] text-center">
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full py-8 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-emerald-500 transition-all flex flex-col items-center justify-center gap-4 relative group"
          >
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider absolute top-3 left-4">
              {isFlipped ? "Answer (English)" : "Question (Arabic)"}
            </div>

            {/* Front (Arabic) */}
            <div 
              className="font-arabic font-bold text-slate-900 dark:text-white select-text leading-relaxed px-2"
              dir="rtl"
              style={{ fontSize: `${arabicSize * 1.1}px` }}
            >
              {showTashkeel ? currentCard.arabic : removeTashkeel(currentCard.arabic)}
            </div>

            {/* Back (English) */}
            {isFlipped ? (
              <div className="text-base sm:text-lg font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in border-t border-slate-200 dark:border-slate-700 pt-3 w-full">
                {currentCard.english}
              </div>
            ) : (
              <div className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                <RotateCw className="w-3.5 h-3.5" />
                Tap card to reveal English
              </div>
            )}
          </div>

          {/* Audio button */}
          <div className="mt-4">
            <button
              onClick={() => onPlayAudio(currentCard.voiceKey)}
              className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs flex items-center gap-2 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              Listen Pronunciation
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Shuffle Cards"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-500">
              {currentIndex + 1} / {cards.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleMarkMastered}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Know it</span>
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
