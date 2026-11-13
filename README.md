# Madinah Arabic Book 2 - Interactive Reader & Audio Studio

A modern, fast, cross-platform interactive study app for **Madinah Arabic Course Book 2 (دروس اللغة العربية الجزء الثاني)**, extracted from the mobile application and enhanced for PC, tablet, and mobile.

---

## ✨ Features

- **All 36 Lessons Organized**:
  - **2,929 Dialogues**: Conversational phrases with full vowel marks (*harakat*) and English translations.
  - **737 Vocabulary Words**: Core word lists with bookmarking/starred capability.
  - **97 Verbs & 1,274 Conjugations (Sarf Studio)**: Interactive tables for Past (*Al-Madi*), Present (*Al-Mudari*), Imperative (*Al-Amr*), Jussive (*Al-Majzum*), and Prohibitive (*La An-Nahiyah*).
  - **1,790 Classical Grammar Rules (*Sharh*)**: Formatted grammatical explanations with highlighted examples.
- **10,090 High-Quality Audio Clips**:
  - Instant click-to-listen on every word, sentence, and verb conjugation.
  - Dual Voice System: Switch between **Male (Voice B)** and **Female (Voice A)** recordings.
  - Speed controls: `0.75x`, `1.0x`, and `1.25x`.
- **Continuous Dialogue Playback**:
  - "Play Continuous" mode with auto-scroll and line-by-line synchronized highlighting.
- **Recall & Memorization Mode**:
  - One-click toggle to hide English translations for active recall and self-testing.
- **Interactive Flashcard Studio**:
  - Flip cards with Arabic on front and English + audio on back.
  - Shuffle mode and "Mastered" progress tracker.
- **Beautiful Typography**:
  - Traditional Arabic Naskh fonts (*Amiri* and *Scheherazade New*) with customizable text sizing slider.

---

## 🚀 Quick Start

### 1. Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

*(You can also open the Network IP shown in terminal on your phone if connected to the same Wi-Fi).*

### 2. Production Build
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
madinah-arabic-reader/
├── public/
│   └── audio/                  # 10,090 offline MP3 recordings
├── src/
│   ├── data/
│   │   ├── lessons.json        # 36 lessons overview & metadata
│   │   ├── dialogues.json      # 2,929 dialogue entries
│   │   ├── vocab.json          # 737 vocabulary terms
│   │   ├── verbs.json          # 97 verbs + 1,274 conjugations
│   │   └── grammar.json        # Classical grammar notes (Sharh)
│   ├── components/
│   │   ├── Header.tsx          # Navigation, tabs, voice & size controls
│   │   ├── LessonSidebar.tsx   # Lesson drawer with search & indicators
│   │   ├── DialogueView.tsx    # Conversational reader & continuous playback
│   │   ├── VocabView.tsx       # Vocab card grid with starring
│   │   ├── VerbsView.tsx       # Sarf conjugation studio & tables
│   │   ├── GrammarView.tsx     # Formatted grammar notes & rules
│   │   └── FlashcardModal.tsx  # Interactive flashcard SRS module
│   ├── hooks/
│   │   └── useAudio.ts         # Audio playback engine
│   ├── types.ts                # TypeScript interfaces
│   ├── App.tsx                 # Core application layout
│   └── index.css               # Tailwind & Arabic typography
└── scripts/
    └── process_data.py         # Extractor script from SQLite to JSON
```
