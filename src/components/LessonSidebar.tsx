import React, { useState } from 'react';
import { LessonMeta } from '../types';
import { Search, X, CheckCircle, BookOpen, Layers, Sparkles, FileText } from 'lucide-react';

interface LessonSidebarProps {
  lessons: LessonMeta[];
  currentLessonNum: number;
  onSelectLesson: (num: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  lessons,
  currentLessonNum,
  onSelectLesson,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLessons = lessons.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `lesson ${l.lessonNumber}`.includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              M2
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Madinah Arabic</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Book 2 (36 Lessons)</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search lessons or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white outline-none transition-colors"
            />
          </div>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {filteredLessons.map((l) => {
            const isSelected = l.lessonNumber === currentLessonNum;
            return (
              <button
                key={l.lessonNumber}
                onClick={() => {
                  onSelectLesson(l.lessonNumber);
                  onClose();
                }}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-3 group ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 font-medium'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-700'
                  }`}
                >
                  {l.lessonNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {l.title.replace(`Lesson ${l.lessonNumber}: `, '')}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    {l.dialogueCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <BookOpen className="w-3 h-3" />
                        {l.dialogueCount}
                      </span>
                    )}
                    {l.vocabCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Layers className="w-3 h-3" />
                        {l.vocabCount}w
                      </span>
                    )}
                    {l.verbCount > 0 && (
                      <span className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400">
                        <Sparkles className="w-3 h-3" />
                        {l.verbCount}v
                      </span>
                    )}
                    {l.hasGrammar && (
                      <span className="flex items-center gap-0.5">
                        <FileText className="w-3 h-3" />
                        Sharh
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};
