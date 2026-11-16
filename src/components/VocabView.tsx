import React, { useState } from 'react';
import { VocabItem, VoiceGender } from '../types';
import { Volume2, Play, Search, Star, Eye } from 'lucide-react';
import { removeTashkeel } from '../utils/arabic';

interface VocabViewProps {
  vocab: VocabItem[];
  currentAudioKey: string | null;
  isPlaying: boolean;
  onPlayAudio: (key: string) => void;
  showTranslation: boolean;
  showTashkeel?: boolean;
  arabicSize: number;
  gender: VoiceGender;
}

export const VocabView: React.FC<VocabViewProps> = ({
  vocab,
  currentAudioKey,
  isPlaying,
  onPlayAudio,
  showTranslation,
  showTashkeel = true,
  arabicSize,
  gender
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [starredIds, setStarredIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('madinah_starred_vocab');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());

  const toggleStar = (id: number) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('madinah_starred_vocab', JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const toggleReveal = (id: number) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredVocab = (vocab || []).filter(v => 
    v.arabic.includes(searchTerm) ||
    v.english.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!vocab || vocab.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        No vocabulary words listed for this lesson.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 pb-24 sm:pb-28">
      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Arabic word or English meaning..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none text-slate-900 dark:text-white"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 px-2 flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span>{filteredVocab.length} words</span>
          {starredIds.size > 0 && (
            <span className="text-amber-500 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              {starredIds.size} saved
            </span>
          )}
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredVocab.map((item) => {
          const isItemActive = currentAudioKey === item.voiceKey && isPlaying;
          const isStarred = starredIds.has(item.id);
          const isRevealed = showTranslation || revealedIds.has(item.id);

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-3.5 sm:p-4 transition-all duration-200 border flex flex-col justify-between min-w-0 ${
                isItemActive
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
                <button
                  onClick={() => toggleStar(item.id)}
                  aria-label={isStarred ? 'Unstar word' : 'Star word for review'}
                  className={`p-1.5 -m-0.5 rounded-lg transition-colors shrink-0 ${
                    isStarred 
                      ? 'text-amber-500 fill-amber-500' 
                      : 'text-slate-300 dark:text-slate-700 hover:text-slate-400'
                  }`}
                  title={isStarred ? "Unstar word" : "Star word for review"}
                >
                  <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                </button>

                {/* Arabic Word */}
                <div 
                  className="font-arabic font-bold text-slate-900 dark:text-white text-right flex-1 min-w-0 break-words select-text"
                  dir="rtl"
                  style={{ fontSize: `${arabicSize * 0.9}px` }}
                >
                  {showTashkeel ? item.arabic : removeTashkeel(item.arabic)}
                </div>
              </div>

              {/* Bottom line: Play audio & English Meaning */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2 min-w-0">
                <button
                  onClick={() => onPlayAudio(item.voiceKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 ${
                    isItemActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-700'
                  }`}
                >
                  {isItemActive ? (
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>Listen</span>
                </button>

                <div className="text-xs text-right font-medium min-w-0 break-words">
                  {isRevealed ? (
                    <span className="text-slate-700 dark:text-slate-300">{item.english}</span>
                  ) : (
                    <button
                      onClick={() => toggleReveal(item.id)}
                      className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer py-1"
                    >
                      <Eye className="w-3 h-3" />
                      Show
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
