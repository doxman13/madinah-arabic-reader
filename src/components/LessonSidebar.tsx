import React, { useState } from 'react';
import { LessonMeta, BookMeta } from '../types';
import { Search, X } from 'lucide-react';

interface LessonSidebarProps {
  books: BookMeta[];
  currentBookId: number;
  onSelectBook: (bookId: number) => void;
  lessons: LessonMeta[];
  currentLessonNum: number;
  onSelectLesson: (num: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  books,
  currentBookId,
  onSelectBook,
  lessons,
  currentLessonNum,
  onSelectLesson,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const currentBook = books.find(b => b.id === currentBookId) || books[0];

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
        className={`fixed top-0 bottom-0 left-0 z-40 w-[min(20rem,86vw)] lg:w-72 xl:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                M{currentBookId}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">Madinah Arabic</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {currentBook?.title} ({lessons.length} Lessons)
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close lessons menu"
              className="p-2 -mr-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Book Switcher Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            {books.map(b => (
              <button
                key={b.id}
                onClick={() => onSelectBook(b.id)}
                className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                  b.id === currentBookId
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={`${b.title} - ${b.arabicTitle}`}
              >
                <span>Book {b.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search Book ${currentBookId} lessons...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white outline-none transition-colors"
            />
          </div>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto p-2 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-1 scrollbar-thin">
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
                  <div className="truncate font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {l.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{l.dialogueCount} phrases</span>
                    {l.vocabCount > 0 && (
                      <>
                        <span>•</span>
                        <span>{l.vocabCount} words</span>
                      </>
                    )}
                    {l.verbCount > 0 && (
                      <>
                        <span>•</span>
                        <span>{l.verbCount} verbs</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {filteredLessons.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No lessons match "{searchTerm}"
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
