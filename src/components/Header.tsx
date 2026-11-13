import React from 'react';
import { ActiveTab, VoiceGender, BookMeta } from '../types';
import { 
  BookOpen, 
  MessageSquare, 
  Layers, 
  Sparkles, 
  FileText, 
  Volume2, 
  Menu, 
  Eye, 
  EyeOff, 
  Zap,
  Sliders,
  Target,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentBookId: number;
  onBookChange: (bookId: number) => void;
  books: BookMeta[];
  currentLessonNum: number;
  lessonTitle: string;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  showTranslation: boolean;
  setShowTranslation: (show: boolean) => void;
  showTashkeel: boolean;
  setShowTashkeel: (show: boolean) => void;
  arabicSize: number;
  setArabicSize: (size: number) => void;
  gender: VoiceGender;
  onGenderChange: (g: VoiceGender) => void;
  speed: number;
  onSpeedChange: (s: number) => void;
  dialogueCount: number;
  vocabCount: number;
  verbCount: number;
  hasGrammar: boolean;
  hasDualVoice: boolean;
  onOpenFlashcards: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBookId,
  onBookChange,
  books,
  currentLessonNum,
  lessonTitle,
  activeTab,
  setActiveTab,
  showSidebar,
  setShowSidebar,
  showTranslation,
  setShowTranslation,
  showTashkeel,
  setShowTashkeel,
  arabicSize,
  setArabicSize,
  gender,
  onGenderChange,
  speed,
  onSpeedChange,
  dialogueCount,
  vocabCount,
  verbCount,
  hasGrammar,
  hasDualVoice,
  onOpenFlashcards
}) => {
  const [showSettings, setShowSettings] = React.useState(false);

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode; count?: number; disabled?: boolean }[] = [
    { key: 'dialogue', label: 'Dialogue (حوار)', icon: <MessageSquare className="w-4 h-4" />, count: dialogueCount },
    { key: 'exercise', label: 'Exercises (تمارين)', icon: <Target className="w-4 h-4" />, count: dialogueCount },
    { key: 'vocab', label: 'Vocabulary (مفردات)', icon: <Layers className="w-4 h-4" />, count: vocabCount },
    { key: 'verbs', label: 'Verbs & Sarf', icon: <Sparkles className="w-4 h-4" />, count: verbCount, disabled: verbCount === 0 },
    { key: 'grammar', label: 'Grammar Sharh (شرح)', icon: <FileText className="w-4 h-4" />, disabled: !hasGrammar },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Lessons List"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2.5">
              {/* Interactive Book Selector Dropdown */}
              <div className="relative">
                <select
                  value={currentBookId}
                  onChange={(e) => onBookChange(Number(e.target.value))}
                  className="appearance-none pl-2.5 pr-7 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  title="Switch Book"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      Book {b.id} • {b.arabicTitle}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-700 dark:text-emerald-400" />
              </div>

              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                  {lessonTitle}
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  Madinah Arabic Course (دروس اللغة العربية)
                </p>
              </div>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2">
            {/* Flashcards CTA */}
            <button
              onClick={onOpenFlashcards}
              disabled={vocabCount === 0 && dialogueCount === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Flashcards</span>
            </button>

            {/* Translation Visibility Toggle */}
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                showTranslation 
                  ? 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' 
                  : 'border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
              }`}
              title={showTranslation ? "Hide English Translation" : "Show English Translation"}
            >
              {showTranslation ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="hidden md:inline">{showTranslation ? 'English On' : 'Recall'}</span>
            </button>

            {/* Tashkeel / Harakat Toggle */}
            <button
              onClick={() => setShowTashkeel(!showTashkeel)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                showTashkeel 
                  ? 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' 
                  : 'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              }`}
              title={showTashkeel ? "Turn off Tashkeel (read without vowels)" : "Turn on Tashkeel (show vowels)"}
            >
              <span className="font-arabic font-bold text-sm leading-none">{showTashkeel ? 'حَرَكَات' : 'حركات'}</span>
              <span className="hidden md:inline">{showTashkeel ? 'Tashkeel' : 'No Vowels'}</span>
            </button>

            {/* Voice Gender Switcher (Dual Voice for Book 1 & 2) */}
            {hasDualVoice ? (
              <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs">
                <button
                  onClick={() => onGenderChange('b')}
                  className={`px-2 py-1 rounded-md font-medium transition-colors ${
                    gender === 'b'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Male Voice (Voice B)"
                >
                  Male
                </button>
                <button
                  onClick={() => onGenderChange('a')}
                  className={`px-2 py-1 rounded-md font-medium transition-colors ${
                    gender === 'a'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Female Voice (Voice A)"
                >
                  Female
                </button>
              </div>
            ) : (
              <div className="hidden sm:inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-500">
                <Volume2 className="w-3 h-3 mr-1" />
                <span>Audio (A)</span>
              </div>
            )}

            {/* Settings Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
                title="Display & Audio Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white mb-3">Reader Settings</div>
                  
                  {/* Arabic Size Slider */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1 text-slate-600 dark:text-slate-400">
                      <span>Arabic Text Size</span>
                      <span className="font-bold">{arabicSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="22"
                      max="48"
                      step="2"
                      value={arabicSize}
                      onChange={(e) => setArabicSize(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="font-arabic text-center mt-1 text-slate-800 dark:text-slate-200" style={{ fontSize: `${arabicSize * 0.8}px` }}>
                      كَيْفَ حَالُكَ
                    </div>
                  </div>

                  {/* Playback Speed */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1 text-slate-600 dark:text-slate-400">
                      <span>Audio Speed</span>
                      <span className="font-bold">{speed}x</span>
                    </div>
                    <div className="flex gap-1">
                      {[0.75, 1.0, 1.25].map((s) => (
                        <button
                          key={s}
                          onClick={() => onSpeedChange(s)}
                          className={`flex-1 py-1 rounded border text-center transition-colors ${
                            speed === s
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 border-t border-slate-100 dark:border-slate-800/80">
          {tabs.map((tab) => {
            if (tab.disabled) return null;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-emerald-200/60 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
