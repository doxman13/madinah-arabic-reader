import React from 'react';
import { GrammarItem } from '../types';
import { BookMarked, Sparkles } from 'lucide-react';
import { removeTashkeel } from '../utils/arabic';

interface GrammarViewProps {
  grammar: GrammarItem[];
  arabicSize: number;
  showTashkeel?: boolean;
}

export const GrammarView: React.FC<GrammarViewProps> = ({ 
  grammar, 
  arabicSize,
  showTashkeel = true 
}) => {
  if (!grammar || grammar.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        No grammar explanation (Sharh) available for this lesson.
      </div>
    );
  }

  const renderArabic = (text?: string) => {
    if (!text) return null;
    return showTashkeel ? text : removeTashkeel(text);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 pb-24 sm:pb-28">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sm:space-y-5">
        {grammar.map((item) => {
          switch (item.type) {
            case 24: // Lesson Title Header
              return (
                <div key={item.id} className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Grammar Sharh (الشرح)
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5 break-words">
                      <BookMarked className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="min-w-0 break-words">{item.english || item.titleEN}</span>
                    </h2>
                  </div>
                  {item.arabic && (
                    <div 
                      className="font-arabic font-bold text-slate-800 dark:text-slate-200 text-right text-xl sm:text-2xl break-words"
                      dir="rtl"
                    >
                      {renderArabic(item.arabic)}
                    </div>
                  )}
                </div>
              );

            case 3: // Subtitle
              return (
                <div key={item.id} className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                  {item.english}
                </div>
              );

            case 4: // Section Topic
              return (
                <div key={item.id} className="pt-4 first:pt-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white bg-emerald-50/60 dark:bg-emerald-950/30 p-3 sm:p-3.5 rounded-xl border-l-4 border-emerald-600 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="min-w-0 break-words">{item.english}</span>
                  </h3>
                </div>
              );

            case 1: // Subsection label / Rule prompt (e.g. "Examples:", "For instance:")
              return (
                <div key={item.id} className="text-sm font-bold text-slate-800 dark:text-slate-200 pt-2">
                  {item.english}
                </div>
              );

            case 2: // Arabic Grammar Diagram / Rule / Formula
              return (
                <div 
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 text-right shadow-2xs my-2"
                  dir="rtl"
                >
                  <div 
                    className="font-arabic font-bold text-slate-900 dark:text-amber-200 leading-relaxed tracking-wide break-words"
                    style={{ fontSize: `${arabicSize * 0.9}px` }}
                  >
                    {renderArabic(item.arabic)}
                  </div>
                  {item.english && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans text-left break-words" dir="ltr">
                      {item.english}
                    </div>
                  )}
                </div>
              );

            case 11: // Sample Sentence Pair (Arabic + English)
              return (
                <div 
                  key={item.id}
                  className="rounded-2xl p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 my-1.5 shadow-2xs"
                >
                  {/* English meaning */}
                  <div className="flex-1 min-w-0 text-sm font-medium text-slate-700 dark:text-slate-300 order-2 sm:order-1 break-words">
                    {item.english}
                  </div>

                  {/* Arabic Example (Prominent) */}
                  {item.arabic && (
                    <div 
                      className="font-arabic font-bold text-slate-900 dark:text-emerald-300 text-right order-1 sm:order-2 sm:max-w-[55%] break-words select-text"
                      dir="rtl"
                      style={{ fontSize: `${arabicSize * 0.9}px` }}
                    >
                      {renderArabic(item.arabic)}
                    </div>
                  )}
                </div>
              );

            case 21: // Rule Definition / Bullet with Arabic Term Badge
              return (
                <div key={item.id} className="flex flex-wrap sm:flex-nowrap items-start gap-2.5 sm:gap-3 text-sm text-slate-700 dark:text-slate-300 py-1">
                  {item.arabic ? (
                    <span 
                      className="font-arabic font-bold text-sm px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 max-w-full break-words whitespace-normal sm:shrink-0"
                      dir="rtl"
                    >
                      {renderArabic(item.arabic)}
                    </span>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  )}
                  <div className="flex-1 min-w-[200px] leading-relaxed break-words">
                    {item.english}
                  </div>
                </div>
              );

            case 20: // Two-column comparison
              return (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                  {item.arabic && <div className="text-right font-arabic font-bold break-words" dir="rtl">{renderArabic(item.arabic)}</div>}
                  <div className="text-slate-700 dark:text-slate-300 font-semibold break-words">{item.english}</div>
                </div>
              );

            case 50: // Divider
              return <hr key={item.id} className="border-slate-200 dark:border-slate-800 my-4" />;

            default:
              return (
                <div key={item.id} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                  {item.arabic && (
                    <div className="font-arabic font-bold text-lg mb-1 break-words" dir="rtl">
                      {renderArabic(item.arabic)}
                    </div>
                  )}
                  {item.english && <div>{item.english}</div>}
                </div>
              );
          }
        })}
      </div>
    </div>
  );
};
