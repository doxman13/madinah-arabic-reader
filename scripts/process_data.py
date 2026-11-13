import sqlite3
import json
import html
import os
import re

DB_PATH = "/Users/admin/Documents/gits/madinah-arabic-reader/extracted_raw/madinah_book2.db"
OUTPUT_DIR = "/Users/admin/Documents/gits/madinah-arabic-reader/src/data"

os.makedirs(OUTPUT_DIR, exist_ok=True)
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

def clean_text(text):
    if not text:
        return ""
    text = html.unescape(text)
    # Clean redundant spaces
    text = text.strip()
    return text

# 1. Dialogues (questionsLesson)
cursor.execute("SELECT _id, wordID, marker, translationRU, translationEN, wordHarakat, lessonNumber, voice FROM questionsLesson ORDER BY lessonNumber, _id")
dialogues_by_lesson = {}
for row in cursor.fetchall():
    less = row["lessonNumber"]
    if less not in dialogues_by_lesson:
        dialogues_by_lesson[less] = []
    dialogues_by_lesson[less].append({
        "id": row["_id"],
        "wordId": row["wordID"],
        "arabic": clean_text(row["wordHarakat"]),
        "english": clean_text(row["translationEN"]),
        "russian": clean_text(row["translationRU"]),
        "voiceKey": row["voice"]
    })

# 2. Vocabulary (wordsLesson)
cursor.execute("SELECT _id, wordID, marker, wordHarakat, translationRU, translationEN, lessonNumber, voice FROM wordsLesson ORDER BY lessonNumber, _id")
vocab_by_lesson = {}
for row in cursor.fetchall():
    less = row["lessonNumber"]
    if less not in vocab_by_lesson:
        vocab_by_lesson[less] = []
    vocab_by_lesson[less].append({
        "id": row["_id"],
        "wordId": row["wordID"],
        "arabic": clean_text(row["wordHarakat"]),
        "english": clean_text(row["translationEN"]),
        "russian": clean_text(row["translationRU"]),
        "voiceKey": row["voice"]
    })

# 3. Verbs and Conjugations
cursor.execute("SELECT _id, wordID, marker, wordHarakat, translationRU, translationEN, lessonNumber, voice FROM verbsLesson ORDER BY lessonNumber, _id")
verbs_by_lesson = {}
for row in cursor.fetchall():
    less = row["lessonNumber"]
    if less not in verbs_by_lesson:
        verbs_by_lesson[less] = []
    verbs_by_lesson[less].append({
        "id": row["_id"],
        "wordId": row["wordID"],
        "arabic": clean_text(row["wordHarakat"]),
        "english": clean_text(row["translationEN"]),
        "russian": clean_text(row["translationRU"]),
        "voiceKey": row["voice"]
    })

# Conjugations
cursor.execute("SELECT _id, wordID, marker, wordHarakat, translationRU, translationEN, lessonNumber, voice FROM conjugationVerbsLesson ORDER BY lessonNumber, _id")
conjugations_by_lesson = {}
for row in cursor.fetchall():
    less = row["lessonNumber"]
    if less not in conjugations_by_lesson:
        conjugations_by_lesson[less] = []
    conjugations_by_lesson[less].append({
        "id": row["_id"],
        "wordId": row["wordID"],
        "marker": clean_text(row["marker"]),
        "arabic": clean_text(row["wordHarakat"]),
        "english": clean_text(row["translationEN"]),
        "russian": clean_text(row["translationRU"]),
        "voiceKey": row["voice"]
    })

def is_arabic(text):
    if not text:
        return False
    ar_chars = len(re.findall(r'[\u0600-\u06FF]', text))
    total_chars = len(re.findall(r'\w', text))
    if total_chars == 0:
        return False
    return (ar_chars / total_chars) > 0.35

# 4. Grammar Articles
cursor.execute("SELECT _id, articleName, type, translate1, translate2, item1RU, item2RU, item1EN, item2EN FROM articles ORDER BY _id")
grammar_by_lesson = {}
for row in cursor.fetchall():
    art_name = row["articleName"]
    # Check if articleName matches lessonDesc_X
    m = re.match(r"lessonDesc_(\d+)", art_name)
    if not m:
        continue
    less = int(m.group(1))
    if less not in grammar_by_lesson:
        grammar_by_lesson[less] = []
    
    t = row["type"]
    tr1 = row["translate1"]
    tr2 = row["translate2"]
    i1ru = clean_text(row["item1RU"])
    i2ru = clean_text(row["item2RU"])
    i1en = clean_text(row["item1EN"])
    i2en = clean_text(row["item2EN"])

    if i1ru == "*": i1ru = ""
    if i2ru == "*": i2ru = ""
    if i1en == "*": i1en = ""
    if i2en == "*": i2en = ""

    # Skip system UI buttons
    if t in (40, 41, 42):
        continue

    ar_text = ""
    en_text = ""

    if tr1 == 'no' and i1ru and is_arabic(i1ru):
        ar_text = i1ru
        en_text = i2en or i1en
    elif tr2 == 'no' and i2ru and is_arabic(i2ru):
        ar_text = i2ru
        en_text = i1en or i2en
    elif is_arabic(i1ru):
        ar_text = i1ru
        en_text = i1en or i2en
    elif is_arabic(i2ru):
        ar_text = i2ru
        en_text = i1en or i2en
    else:
        # Non-Arabic explanatory row
        if i1en and i2en and i1en != i2en:
            en_text = f"{i1en}: {i2en}"
        else:
            en_text = i1en or i2en or i1ru

    if not ar_text and not en_text and t != 50:
        continue

    grammar_by_lesson[less].append({
        "id": row["_id"],
        "type": t,
        "arabic": ar_text,
        "english": en_text,
        "titleEN": en_text if t in (3, 4, 24) else ""
    })

# 5. Lessons Overview
lessons = []
all_lesson_nums = sorted(list(set(
    list(dialogues_by_lesson.keys()) +
    list(vocab_by_lesson.keys()) +
    list(verbs_by_lesson.keys()) +
    list(grammar_by_lesson.keys())
)))

for l_num in all_lesson_nums:
    d_count = len(dialogues_by_lesson.get(l_num, []))
    v_count = len(vocab_by_lesson.get(l_num, []))
    vb_count = len(verbs_by_lesson.get(l_num, []))
    c_count = len(conjugations_by_lesson.get(l_num, []))
    g_count = len(grammar_by_lesson.get(l_num, []))
    
    # Try finding title from grammar
    title = f"Lesson {l_num}"
    if l_num in grammar_by_lesson and len(grammar_by_lesson[l_num]) > 0:
        # First check type 4 (actual grammar topic)
        for item in grammar_by_lesson[l_num]:
            if item["type"] == 4 and item["titleEN"]:
                title = f"Lesson {l_num}: {item['titleEN']}"
                break
        if title == f"Lesson {l_num}":
            for item in grammar_by_lesson[l_num]:
                if item["type"] in (3, 1) and item["titleEN"] and "sharh" not in item["titleEN"].lower():
                    title = f"Lesson {l_num}: {item['titleEN']}"
                    break

    lessons.append({
        "lessonNumber": l_num,
        "title": title,
        "dialogueCount": d_count,
        "vocabCount": v_count,
        "verbCount": vb_count,
        "conjugationCount": c_count,
        "hasGrammar": g_count > 0
    })

# Write JSON files
with open(os.path.join(OUTPUT_DIR, "lessons.json"), "w", encoding="utf-8") as f:
    json.dump(lessons, f, ensure_ascii=False, indent=2)

with open(os.path.join(OUTPUT_DIR, "dialogues.json"), "w", encoding="utf-8") as f:
    json.dump(dialogues_by_lesson, f, ensure_ascii=False, indent=2)

with open(os.path.join(OUTPUT_DIR, "vocab.json"), "w", encoding="utf-8") as f:
    json.dump(vocab_by_lesson, f, ensure_ascii=False, indent=2)

with open(os.path.join(OUTPUT_DIR, "verbs.json"), "w", encoding="utf-8") as f:
    json.dump({
        "verbs": verbs_by_lesson,
        "conjugations": conjugations_by_lesson
    }, f, ensure_ascii=False, indent=2)

with open(os.path.join(OUTPUT_DIR, "grammar.json"), "w", encoding="utf-8") as f:
    json.dump(grammar_by_lesson, f, ensure_ascii=False, indent=2)

print(f"Extraction complete! {len(lessons)} lessons processed.")
conn.close()
