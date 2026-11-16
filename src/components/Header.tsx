import React from 'react';
import { ActiveTab, VoiceGender, BookMeta } from '../types';
import { 
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
  ChevronDown,
  Cloud
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
  onOpenSync: () => void;
  syncKey: string | null;
}

interface ReaderTogglesProps {
  showTranslation: boolean;
  setShowTranslation: (show: boolean) => void;
  showTashkeel: boolean;
  setShowTashkeel: (show: boolean) => void;
  hasDualVoice: boolean;
  gender: VoiceGender;
  onGenderChange: (g: VoiceGender) => void;
  compact?: boolean;
}

const ReaderToggles: React.FC<ReaderTogglesProps> = ({
  showTranslation,
  setShowTranslation,
  showTashkeel,
  setShowTashkeel,
  hasDualVoice,
  gender,
  onGenderChange,
  compact = false,
}) => (
  <>
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Translation Visibility Toggle */}
      <button
        onClick={() => setShowTranslation(!showTranslation)}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
          showTranslation
            ? 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            : 'border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
        }`}
        title={showTranslation ? 'Hide English Translation' : 'Show English Translation'}
      >
        {showTranslation ? <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
        <span>{showTranslation ? (compact ? 'English' : 'English On') : 'Recall'}</span>
      </button>

      {/* Tashkeel / Harakat Toggle */}
      <button
        onClick={() => setShowTashkeel(!showTashkeel)}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
          showTashkeel
            ? 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            : 'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
        }`}
        title={showTashkeel ? 'Turn off Tashkeel (read without vowels)' : 'Turn on Tashkeel (show vowels)'}
      >
        <span className="font-arabic font-bold text-sm leading-none">{showTashkeel ? 'حَرَكَات' : 'حركات'}</span>
        <span className={compact ? 'hidden min-[360px]:inline' : ''}>{showTashkeel ? 'Tashkeel' : 'No Vowels'}</span>
      </button>
    </div>

    {/* Voice Gender Switcher (Dual Voice for Book 1 & 2) */}
    {hasDualVoice ? (
      <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs shrink-0">
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
      <div className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-500 shrink-0">
        <Volume2 className="w-3 h-3 mr-1" />
        <span>Audio (A)</span>
      </div>
    )}
  </>
);

export const Header: React.FC<HeaderProps> = ({
  currentBookId,
  onBookChange,
  books,
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
  onOpenFlashcards,
  onOpenSync,
  syncKey
}) => {
  const [showSettings, setShowSettings] = React.useState(false);

  const currentBook = books.find((b) => b.id === currentBookId) || books[0];

  const tabs: {
    key: ActiveTab;
    shortLabel: string;
    label: string;
    bilingualLabel: string;
    icon: React.ReactNode;
    count?: number;
    disabled?: boolean;
  }[] = [
    { key: 'dialogue', shortLabel: 'Dialogue', label: 'Dialogue', bilingualLabel: 'Dialogue (حوار)', icon: <MessageSquare className="w-4 h-4 shrink-0" />, count: dialogueCount },
    { key: 'exercise', shortLabel: 'Exercises', label: 'Exercises', bilingualLabel: 'Exercises (تمارين)', icon: <Target className="w-4 h-4 shrink-0" />, count: dialogueCount },
    { key: 'vocab', shortLabel: 'Vocab', label: 'Vocabulary', bilingualLabel: 'Vocabulary (مفردات)', icon: <Layers className="w-4 h-4 shrink-0" />, count: vocabCount },
    { key: 'verbs', shortLabel: 'Verbs', label: 'Verbs & Sarf', bilingualLabel: 'Verbs & Sarf', icon: <Sparkles className="w-4 h-4 shrink-0" />, count: verbCount, disabled: verbCount === 0 },
    { key: 'grammar', shortLabel: 'Grammar', label: 'Grammar Sharh', bilingualLabel: 'Grammar Sharh (شرح)', icon: <FileText className="w-4 h-4 shrink-0" />, disabled: !hasGrammar },
  ];

  const visibleTabs = tabs.filter((tab) => !tab.disabled);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors mobile-landscape-unstick">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 py-2.5 sm:py-3 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              aria-label="Toggle Lessons List"
              className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Toggle Lessons List"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Compact Book Selector Pill with native select overlay */}
            <div className="relative shrink-0">
              <div className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span>Book {currentBookId}</span>
                {currentBook && (
                  <span className="hidden 2xl:inline font-arabic font-semibold">• {currentBook.arabicTitle}</span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <select
                aria-label="Switch Book"
                value={currentBookId}
                onChange={(e) => onBookChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Switch Book"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    Book {b.id} • {b.arabicTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">
                {lessonTitle}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block truncate">
                Madinah Arabic Course (دروس اللغة العربية)
              </p>
            </div>
          </div>

          {/* Primary Quick Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Cloud Sync Button */}
            <button
              onClick={onOpenSync}
              aria-label={syncKey ? `Cloud Sync active (${syncKey})` : 'Configure Cloud Sync'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                syncKey
                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 shadow-2xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={syncKey ? `Cloud Sync active (${syncKey})` : 'Configure Cloudflare D1 Cloud Sync'}
            >
              <Cloud className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline max-w-[90px] truncate">
                {syncKey ? syncKey : 'Sync'}
              </span>
              {syncKey && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {/* Flashcards CTA */}
            <button
              onClick={onOpenFlashcards}
              disabled={vocabCount === 0 && dialogueCount === 0}
              aria-label="Open Flashcards"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
              title="Open Flashcards"
            >
              <Zap className="w-4 h-4 sm:w-3.5 sm:h-3.5 fill-current" />
              <span className="hidden sm:inline">Flashcards</span>
            </button>

            {/* Inline Reader Toggles on Large Desktop */}
            <div className="hidden xl:flex items-center gap-2">
              <ReaderToggles
                showTranslation={showTranslation}
                setShowTranslation={setShowTranslation}
                showTashkeel={showTashkeel}
                setShowTashkeel={setShowTashkeel}
                hasDualVoice={hasDualVoice}
                gender={gender}
                onGenderChange={onGenderChange}
              />
            </div>

            {/* Settings Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Display and Audio Settings"
                aria-expanded={showSettings}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
                title="Display & Audio Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {showSettings && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSettings(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-[min(16rem,calc(100vw-1.5rem))] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 text-xs">
                    <div className="font-semibold text-slate-900 dark:text-white mb-3">Reader Settings</div>

                    {/* Arabic Size Slider */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1 text-slate-600 dark:text-slate-400">
                        <span>Arabic Text Size</span>
                        <span className="font-bold">{arabicSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="48"
                        step="2"
                        value={arabicSize}
                        onChange={(e) => setArabicSize(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                      <div className="font-arabic text-center mt-1 text-slate-800 dark:text-slate-200" style={{ fontSize: `${arabicSize * 0.8}px` }}>
                        كَيْفَ حَالُكَ
                      </div>
                    </div>

                    {/* Playback Speed */}
                    <div className="mb-1">
                      <div className="flex justify-between items-center mb-1 text-slate-600 dark:text-slate-400">
                        <span>Audio Speed</span>
                        <span className="font-bold">{speed}x</span>
                      </div>
                      <div className="flex gap-1">
                        {[0.75, 1.0, 1.25].map((s) => (
                          <button
                            key={s}
                            onClick={() => onSpeedChange(s)}
                            className={`flex-1 py-1.5 rounded border text-center transition-colors ${
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Quick Reader Toggles Strip for Mobile & Tablet (always visible, zero horizontal drag) */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 py-1.5 border-t border-slate-100 dark:border-slate-800/80 xl:hidden">
          <ReaderToggles
            showTranslation={showTranslation}
            setShowTranslation={setShowTranslation}
            showTashkeel={showTashkeel}
            setShowTashkeel={setShowTashkeel}
            hasDualVoice={hasDualVoice}
            gender={gender}
            onGenderChange={onGenderChange}
            compact
          />
        </div>

        {/* Tab Navigation (Equal-width mobile grid -> single clean row on tablet/desktop, zero horizontal drag) */}
        <nav
          aria-label="Lesson sections"
          className="grid grid-flow-col auto-cols-fr gap-1 md:flex md:flex-wrap md:items-center md:gap-1.5 py-1.5 border-t border-slate-100 dark:border-slate-800/80"
        >
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-1 sm:px-2.5 md:px-3 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all min-w-0 ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                <span className="md:hidden truncate max-w-full">{tab.shortLabel}</span>
                <span className="hidden md:inline xl:hidden whitespace-nowrap">{tab.label}</span>
                <span className="hidden xl:inline whitespace-nowrap">{tab.bilingualLabel}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`hidden sm:inline-flex px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? 'bg-emerald-200/60 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
