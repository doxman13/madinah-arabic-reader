import React, { useState } from 'react';
import { VerbItem, ConjugationItem, VoiceGender } from '../types';
import { Volume2, Play, Sparkles } from 'lucide-react';

interface VerbsViewProps {
  verbs: VerbItem[];
  conjugations: ConjugationItem[];
  currentAudioKey: string | null;
  isPlaying: boolean;
  onPlayAudio: (key: string) => void;
  arabicSize: number;
  gender: VoiceGender;
}

export const VerbsView: React.FC<VerbsViewProps> = ({
  verbs,
  conjugations,
  currentAudioKey,
  isPlaying,
  onPlayAudio,
  arabicSize,
}) => {
  const [selectedVerb, setSelectedVerb] = useState<VerbItem | null>(null);
  const [activeTenseFilter, setActiveTenseFilter] = useState<string>('ALL');

  // If no verb selected yet, select the first verb by default if available
  const currentVerb = selectedVerb || (verbs && verbs.length > 0 ? verbs[0] : null);

  // Filter conjugations for the currently active verb
  const verbConjugations = conjugations || [];
  
  // Get distinct markers (tenses)
  const availableMarkers = Array.from(new Set(verbConjugations.map(c => c.marker)));

  const filteredConjugations = activeTenseFilter === 'ALL'
    ? verbConjugations
    : verbConjugations.filter(c => c.marker === activeTenseFilter);

  if (!verbs || verbs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        <Sparkles className="w-10 h-10 mx-auto text-slate-400 mb-3" />
        <h3 className="font-bold text-slate-700 dark:text-slate-300">No verb conjugation tables for this lesson.</h3>
        <p className="text-xs mt-1">Check Lessons 32, 33, and 34 for extensive Sarf verb conjugation drills!</p>
      </div>
    );
  }

  const hasConjugations = verbConjugations.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 sm:pb-28">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 rounded-2xl p-3.5 sm:p-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          Sarf & Verb Conjugation Studio
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Master Arabic verb forms with audio pronunciation for each pronoun and tense.
        </p>
      </div>

      {/* Main Grid: Verb Selector on left (or full width when no conjugation tables), Conjugation Matrix on right */}
      <div className={`grid grid-cols-1 ${hasConjugations ? 'lg:grid-cols-3 gap-4 sm:gap-6' : ''}`}>
        {/* Verbs list */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Verbs in this lesson ({verbs.length})
          </div>
          <div
            className={
              hasConjugations
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 max-h-56 lg:max-h-[500px] overflow-y-auto pr-1'
                : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5'
            }
          >
            {verbs.map((v) => {
              const isSelected = currentVerb?.id === v.id;
              const isItemPlaying = currentAudioKey === v.voiceKey && isPlaying;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVerb(v)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2.5 min-w-0 ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 shadow-xs'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayAudio(v.voiceKey);
                    }}
                    aria-label={`Listen to ${v.english}`}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isItemPlaying
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-900'
                    }`}
                  >
                    {isItemPlaying ? (
                      <Volume2 className="w-4 h-4 animate-pulse" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0 text-right" dir="rtl">
                    <div className="font-arabic font-bold text-slate-900 dark:text-white text-lg break-words">
                      {v.arabic}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans break-words" dir="ltr">
                      {v.english}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conjugation Tables */}
        {hasConjugations && (
          <div className="lg:col-span-2 space-y-4 min-w-0">
            {/* Tense Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveTenseFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTenseFilter === 'ALL'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All Tenses
              </button>
              {availableMarkers.map((marker) => (
                <button
                  key={marker}
                  onClick={() => setActiveTenseFilter(marker)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors font-arabic ${
                    activeTenseFilter === marker
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {marker}
                </button>
              ))}
            </div>

            {/* Conjugation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredConjugations.map((conj) => {
                const isItemActive = currentAudioKey === conj.voiceKey && isPlaying;
                return (
                  <div
                    key={conj.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 min-w-0 ${
                      isItemActive
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                    }`}
                  >
                    <button
                      onClick={() => onPlayAudio(conj.voiceKey)}
                      aria-label={`Listen to ${conj.english}`}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isItemActive
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-900 hover:text-amber-800'
                      }`}
                    >
                      {isItemActive ? (
                        <Volume2 className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 text-right" dir="rtl">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-arabic">
                          {conj.marker}
                        </span>
                      </div>
                      <div
                        className="font-arabic font-bold text-slate-900 dark:text-white break-words"
                        style={{ fontSize: `${arabicSize * 0.85}px` }}
                      >
                        {conj.arabic}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans break-words" dir="ltr">
                        {conj.english}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
