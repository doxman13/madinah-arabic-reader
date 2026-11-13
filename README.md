# Madinah Arabic Reader & Exercise Studio (Books 1 - 4)

A modern, fast, cross-platform interactive study app covering all four volumes of the **Madinah Arabic Course (دروس اللغة العربية لغير الناطقين بها - الأجزاء ١-٤)** by Dr. V. Abdur Rahim, enhanced for PC, tablet, and mobile.

---

## ✨ Features

- **All 4 Books (94 Lessons Total)**:
  - **Book 1 (الجزء الأول)**: 23 Lessons • 1,379 Dialogues • 496 Vocabulary words
  - **Book 2 (الجزء الثاني)**: 36 Lessons • 2,929 Dialogues • 737 Vocabulary words • 97 Verbs & 1,274 Conjugations
  - **Book 3 (الجزء الثالث)**: 18 Lessons • 1,386 Dialogues • 605 Vocabulary words
  - **Book 4 (الجزء الرابع)**: 17 Lessons • 1,209 Dialogues • 524 Vocabulary words • 42 Verbs
- **Interactive Exercise Studio**:
  - **Free Navigation & Jump**: Jump to any question using the scrollable question ribbon or the visual **Question Grid Modal**.
  - **Skip & Review**: Previous / Next buttons with no penalty for skipping.
  - **Distractor Generator**: Dynamically generates realistic distractors from lesson vocabulary and dialogue words.
  - **Bilingual Directions**: English ➔ Arabic, Arabic ➔ English, and Mixed.
  - **Two Exercise Modes**: Interactive Word Tiles (scramble) and full Arabic/English typing.
  - **Persistent Progress**: Automatically saves completion and position per lesson and book.
- **Tashkeel / Harakat Toggle**:
  - One-click toggle between full vowel marks (*harakat*) and unvocalized text across Dialogues, Exercises, Vocabulary, Flashcards, and Grammar notes.
- **18,333 High-Quality Audio Clips**:
  - Instant offline click-to-listen on every word, dialogue phrase, and verb conjugation.
  - Dual Voice Switcher for Books 1 & 2: Male (Voice B) & Female (Voice A).
  - Audio speed controls: `0.75x`, `1.0x`, and `1.25x`.
- **Continuous Dialogue Playback**:
  - "Play Continuous" mode with auto-scroll and line-by-line synchronized highlighting.
- **Recall & Memorization Mode**:
  - Hide English translations for active recall and self-testing.
- **Interactive Flashcard Studio**:
  - Flip cards with Arabic on front and English + audio on back, with shuffle mode and Tashkeel support.
- **Classical Grammar Notes (*Sharh*)**:
  - Arabic and English explanations with highlighted grammatical examples.
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

*(You can also open the Network IP shown in terminal on your phone/tablet when connected to the same Wi-Fi).*

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
│   └── audio/
│       ├── book1/              # 3,792 MP3 recordings
│       ├── book2/              # 10,090 MP3 recordings
│       ├── book3/              # 1,994 MP3 recordings
│       └── book4/              # 2,457 MP3 recordings
├── src/
│   ├── data/
│   │   ├── books.json          # Overview & metadata for Books 1-4
│   │   ├── book1/              # Lessons, dialogues, vocab, grammar
│   │   ├── book2/              # Lessons, dialogues, vocab, verbs, grammar
│   │   ├── book3/              # Lessons, dialogues, vocab, grammar
│   │   ├── book4/              # Lessons, dialogues, vocab, verbs, grammar
│   │   └── index.ts            # Typed book dataset loader
│   ├── components/
│   │   ├── Header.tsx          # Book selector, navigation, voice & display controls
│   │   ├── LessonSidebar.tsx   # Book tabs, lesson drawer & search
│   │   ├── DialogueView.tsx    # Conversational reader & continuous playback
│   │   ├── ExerciseView.tsx    # Question ribbon, jump grid, tile scramble & typing
│   │   ├── VocabView.tsx       # Vocab card grid with audio
│   │   ├── VerbsView.tsx       # Sarf conjugation studio & tables
│   │   ├── GrammarView.tsx     # Formatted grammar notes & rules
│   │   └── FlashcardModal.tsx  # Interactive flashcard SRS module
│   ├── hooks/
│   │   └── useAudio.ts         # Audio playback engine
│   ├── types.ts                # TypeScript interfaces
│   ├── App.tsx                 # Core application layout
│   └── index.css               # Tailwind & Arabic typography
└── scripts/
    └── process_all_books.py    # Database extraction & processing script
```
