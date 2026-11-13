import React, { useState, useEffect, useRef } from 'react';
import { DialogueItem, VoiceGender } from '../types';
import { Play, Pause, Volume2, RotateCcw, Check, Sparkles, Eye, EyeOff } from 'lucide-react';
import { removeTashkeel } from '../utils/arabic';

interface DialogueViewProps {
  dialogues: DialogueItem[];
  currentAudioKey: string | null;
  isPlaying: boolean;
  onPlayAudio: (key: string, onEnd?: () => void) => void;
  onStopAudio: () => void;
  showTranslation: boolean;
  showTashkeel: boolean;
  setShowTashkeel: (show: boolean) => void;
  arabicSize: number;
  gender: VoiceGender;
}

export const DialogueView: React.FC<DialogueViewProps> = ({
  dialogues,
  currentAudioKey,
  isPlaying,
  onPlayAudio,
  onStopAudio,
  showTranslation,
  showTashkeel,
  setShowTashkeel,
  arabicSize,
  gender
}) => {
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());
  const [continuousPlay, setContinuousPlay] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const activeCardRef = useRef<HTMLDivElement | null>(null);

  // Toggle reveal for a specific dialogue in recall mode
  const toggleReveal = (id: number) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Continuous playback engine
  const playNext = (index: number) => {
    if (index >= dialogues.length) {
      setContinuousPlay(false);
      setCurrentIndex(-1);
      return;
    }
    setCurrentIndex(index);
    const item = dialogues[index];
    onPlayAudio(item.voiceKey, () => {
      // Short pause between dialogues
      setTimeout(() => {
        playNext(index + 1);
      }, 400);
    });
  };

  const handleToggleContinuous = () => {
    if (continuousPlay) {
      setContinuousPlay(false);
      onStopAudio();
      setCurrentIndex(-1);
    } else {
      setContinuousPlay(true);
      playNext(0);
    }
  };

  // Scroll active item into view during continuous play
  useEffect(() => {
    if (continuousPlay && activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex, continuousPlay]);

  if (!dialogues || dialogues.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        No dialogues for this lesson.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 pb-28">
      {/* Continuous Play Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Dialogue Reading & Listening
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {dialogues.length} conversational sentences with native audio. Tap any line or listen all.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tashkeel Pill */}
          <div className="flex items-center rounded-xl p-0.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
            <button
              onClick={() => setShowTashkeel(true)}
              className={`px-2.5 py-1 rounded-lg transition-colors font-arabic ${
                showTashkeel 
                  ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              مَشْكُول
            </button>
            <button
              onClick={() => setShowTashkeel(false)}
              className={`px-2.5 py-1 rounded-lg transition-colors font-arabic ${
                !showTashkeel 
                  ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              بدون تشكيل
            </button>
          </div>

          <button
            onClick={handleToggleContinuous}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs ${
              continuousPlay
                ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {continuousPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            {continuousPlay ? `Playing (${currentIndex + 1}/${dialogues.length})` : 'Play Continuous'}
          </button>
        </div>
      </div>

      {/* Dialogue Cards */}
      <div className="space-y-3">
        {dialogues.map((item, idx) => {
          const isItemActive = currentAudioKey === item.voiceKey && isPlaying;
          const isCurrentInSequence = continuousPlay && currentIndex === idx;
          const isRevealed = showTranslation || revealedIds.has(item.id);

          return (
            <div
              key={item.id}
              ref={isItemActive || isCurrentInSequence ? activeCardRef : null}
              className={`group rounded-2xl p-4 transition-all duration-200 border ${
                isItemActive || isCurrentInSequence
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500/60 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Play Button */}
                <button
                  onClick={() => onPlayAudio(item.voiceKey)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isItemActive
                      ? 'bg-emerald-600 text-white shadow-md scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 group-hover:text-emerald-700'
                  }`}
                  title="Listen to phrase"
                >
                  {isItemActive ? (
                    <Volume2 className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  )}
                </button>

                {/* Arabic Text (Right to Left) */}
                <div className="flex-1 text-right" dir="rtl">
                  <div
                    className="font-arabic font-normal text-slate-900 dark:text-slate-100 tracking-wide select-text leading-relaxed"
                    style={{ fontSize: `${arabicSize}px` }}
                  >
                    {showTashkeel ? item.arabic : removeTashkeel(item.arabic)}
                  </div>
                </div>
              </div>

              {/* Translation line */}
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                <div className="text-slate-600 dark:text-slate-400 font-medium">
                  {isRevealed ? (
                    <span className="animate-fade-in">{item.english}</span>
                  ) : (
                    <button
                      onClick={() => toggleReveal(item.id)}
                      className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Tap to reveal English translation
                    </button>
                  )}
                </div>
                
                <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
                  #{idx + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
