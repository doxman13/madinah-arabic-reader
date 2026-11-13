import sqlite3
import json
import html
import os
import re

DATA_DIR = "/Users/admin/Documents/gits/madinah-arabic-reader/src/data"
RAW_DIR = "/Users/admin/Documents/gits/madinah-arabic-reader/extracted_raw"

def is_arabic(text):
    if not text:
        return False
    ar_chars = len(re.findall(r'[\u0600-\u06FF]', text))
    total_chars = len(re.findall(r'\w', text))
    if total_chars == 0:
        return False
    return (ar_chars / total_chars) > 0.35

def clean_text(text):
    if not text or text == "*":
        return ""
    text = text.strip()
    if text.startswith("{") and '"text"' in text:
        try:
            return clean_text(json.loads(text).get("text", ""))
        except:
            pass
    elif text.startswith("[") and '"text"' in text:
        try:
            items = json.loads(text)
            return " ".join(clean_text(it.get("text", "")) for it in items)
        except:
            pass
    return html.unescape(text).strip()

def process_book_1():
    out_dir = os.path.join(DATA_DIR, "book1")
    os.makedirs(out_dir, exist_ok=True)
    db_path = os.path.join(RAW_DIR, "madinah_book1.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # 1. Dialogues
    c.execute("""
        SELECT m._id, m.arabic, m.lessonNumber, m.voice, t.valueEN, t.valueRU
        FROM dialoguesMain m
        LEFT JOIN dialoguesTranslate t ON m._id = t._id
        ORDER BY m.lessonNumber, m._id
    """)
    dialogues_by_lesson = {}
    for r in c.fetchall():
        less = r["lessonNumber"]
        if less not in dialogues_by_lesson: dialogues_by_lesson[less] = []
        dialogues_by_lesson[less].append({
            "id": r["_id"],
            "wordId": r["_id"],
            "arabic": clean_text(r["arabic"]),
            "english": clean_text(r["valueEN"]),
            "russian": clean_text(r["valueRU"]),
            "voiceKey": r["voice"]
        })

    # 2. Words
    c.execute("""
        SELECT m._id, m.arabic, m.lessonNumber, m.voice, t.valueEN, t.valueRU
        FROM wordsMain m
        LEFT JOIN wordsTranslate t ON m._id = t._id
        ORDER BY m.lessonNumber, m._id
    """)
    vocab_by_lesson = {}
    for r in c.fetchall():
        less = r["lessonNumber"]
        if less not in vocab_by_lesson: vocab_by_lesson[less] = []
        vocab_by_lesson[less].append({
            "id": r["_id"],
            "wordId": r["_id"],
            "arabic": clean_text(r["arabic"]),
            "english": clean_text(r["valueEN"]),
            "russian": clean_text(r["valueRU"]),
            "voiceKey": r["voice"]
        })

    # 3. Verbs (Book 1 has no verbs table)
    verbs_by_lesson = {}
    conjugations_by_lesson = {}

    # 4. Grammar Articles
    c.execute("""
        SELECT m._id, m.type, m.articleName, m.defItem1, m.defItem2, t.item1, t.item2
        FROM articlesMain m
        LEFT JOIN articlesTranslateEN t ON m._id = t._id
        ORDER BY m._id
    """)
    grammar_by_lesson = {}
    for r in c.fetchall():
        m_name = r["articleName"]
        match = re.match(r"lessonDesc_(\d+)", m_name)
        if not match: continue
        less = int(match.group(1))
        if less not in grammar_by_lesson: grammar_by_lesson[less] = []

        t = r["type"]
        if t in (40, 41, 42): continue

        d1 = clean_text(r["defItem1"])
        d2 = clean_text(r["defItem2"])
        e1 = clean_text(r["item1"])
        e2 = clean_text(r["item2"])

        ar_text = ""
        en_text = ""

        if is_arabic(d1):
            ar_text = d1
            en_text = e2 or e1 or d2
        elif is_arabic(d2):
            ar_text = d2
            en_text = e1 or e2 or d1
        else:
            en_text = e1 or e2 or d1 or d2

        if not ar_text and not en_text and t != 50:
            continue

        grammar_by_lesson[less].append({
            "id": r["_id"],
            "type": t,
            "arabic": ar_text,
            "english": en_text,
            "titleEN": en_text if t in (3, 4, 24) else ""
        })

    # 5. Lessons Overview
    lessons = []
    all_lessons = sorted(list(set(list(dialogues_by_lesson.keys()) + list(vocab_by_lesson.keys()) + list(grammar_by_lesson.keys()))))
    for l_num in all_lessons:
        title = f"Lesson {l_num}"
        if l_num in grammar_by_lesson:
            for it in grammar_by_lesson[l_num]:
                if it["type"] == 4 and it["english"]:
                    title = f"Lesson {l_num}: {it['english']}"
                    break
        lessons.append({
            "lessonNumber": l_num,
            "title": title,
            "dialogueCount": len(dialogues_by_lesson.get(l_num, [])),
            "vocabCount": len(vocab_by_lesson.get(l_num, [])),
            "verbCount": 0,
            "conjugationCount": 0,
            "hasGrammar": len(grammar_by_lesson.get(l_num, [])) > 0
        })

    with open(os.path.join(out_dir, "lessons.json"), "w", encoding="utf-8") as f:
        json.dump(lessons, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "dialogues.json"), "w", encoding="utf-8") as f:
        json.dump(dialogues_by_lesson, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "vocab.json"), "w", encoding="utf-8") as f:
        json.dump(vocab_by_lesson, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "verbs.json"), "w", encoding="utf-8") as f:
        json.dump({"verbs": {}, "conjugations": {}}, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "grammar.json"), "w", encoding="utf-8") as f:
        json.dump(grammar_by_lesson, f, ensure_ascii=False, indent=2)

    conn.close()
    return len(lessons), sum(l["dialogueCount"] for l in lessons), sum(l["vocabCount"] for l in lessons)

def process_book_2():
    out_dir = os.path.join(DATA_DIR, "book2")
    os.makedirs(out_dir, exist_ok=True)
    db_path = os.path.join(RAW_DIR, "madinah_book2.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # 1. Dialogues
    c.execute("SELECT _id, wordID, marker, translationRU, translationEN, wordHarakat, lessonNumber, voice FROM questionsLesson ORDER BY lessonNumber, _id")
    dialogues_by_lesson = {}
    for row in c.fetchall():
        less = row["lessonNumber"]
        if less not in dialogues_by_lesson: dialogues_by_lesson[less] = []
        dialogues_by_lesson[less].append({
            "id": row["_id"],
            "wordId": row["wordID"],
            "arabic": clean_text(row["wordHarakat"]),
            "english": clean_text(row["translationEN"]),
            "russian": clean_text(row["translationRU"]),
            "voiceKey": row["voice"]
        })

    # 2. Vocab
    c.execute("SELECT _id, wordID, marker, wordHarakat, translationRU, translationEN, lessonNumber, voice FROM wordsLesson ORDER BY lessonNumber, _id")
    vocab_by_lesson = {}
    for row in c.fetchall():
        less = row["lessonNumber"]
        if less not in vocab_by_lesson: vocab_by_lesson[less] = []
        vocab_by_lesson[less].append({
            "id": row["_id"],
            "wordId": row["wordID"],
            "arabic": clean_text(row["wordHarakat"]),
            "english": clean_text(row["translationEN"]),
            "russian": clean_text(row["translationRU"]),
            "voiceKey": row["voice"]
        })

    # 3. Verbs
    c.execute("SELECT _id, wordID, marker, wordHarakat, translationRU, translationEN, lessonNumber, voice FROM verbsLesson ORDER BY lessonNumber, _id")
    verbs_by_lesson = {}
    for row in c.fetchall():
        less = row["lessonNumber"]
        if less not in verbs_by_lesson: verbs_by_lesson[less] = []
        verbs_by_lesson[less].append({
            "id": row["_id"],
            "wordId": row["wordID"],
            "arabic": clean_text(row["wordHarakat"]),
            "english": clean_text(row["translationEN"]),
            "russian": clean_text(row["translationRU"]),
            "voiceKey": row["voice"]
        })

    c.execute("SELECT _id, wordID, marker, wordHarakat, translationRU, translationEN, lessonNumber, voice FROM conjugationVerbsLesson ORDER BY lessonNumber, _id")
    conjugations_by_lesson = {}
    for row in c.fetchall():
        less = row["lessonNumber"]
        if less not in conjugations_by_lesson: conjugations_by_lesson[less] = []
        conjugations_by_lesson[less].append({
            "id": row["_id"],
            "wordId": row["wordID"],
            "marker": clean_text(row["marker"]),
            "arabic": clean_text(row["wordHarakat"]),
            "english": clean_text(row["translationEN"]),
            "russian": clean_text(row["translationRU"]),
            "voiceKey": row["voice"]
        })

    # 4. Grammar
    c.execute("SELECT _id, articleName, type, translate1, translate2, item1RU, item2RU, item1EN, item2EN FROM articles ORDER BY _id")
    grammar_by_lesson = {}
    for row in c.fetchall():
        art_name = row["articleName"]
        m = re.match(r"lessonDesc_(\d+)", art_name)
        if not m: continue
        less = int(m.group(1))
        if less not in grammar_by_lesson: grammar_by_lesson[less] = []
        
        t = row["type"]
        tr1 = row["translate1"]
        tr2 = row["translate2"]
        i1ru = clean_text(row["item1RU"])
        i2ru = clean_text(row["item2RU"])
        i1en = clean_text(row["item1EN"])
        i2en = clean_text(row["item2EN"])

        if t in (40, 41, 42): continue

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
    all_lessons = sorted(list(set(list(dialogues_by_lesson.keys()) + list(vocab_by_lesson.keys()) + list(verbs_by_lesson.keys()) + list(grammar_by_lesson.keys()))))
    for l_num in all_lessons:
        title = f"Lesson {l_num}"
        if l_num in grammar_by_lesson:
            for it in grammar_by_lesson[l_num]:
                if it["type"] == 4 and it["english"]:
                    title = f"Lesson {l_num}: {it['english']}"
                    break
        lessons.append({
            "lessonNumber": l_num,
            "title": title,
            "dialogueCount": len(dialogues_by_lesson.get(l_num, [])),
            "vocabCount": len(vocab_by_lesson.get(l_num, [])),
            "verbCount": len(verbs_by_lesson.get(l_num, [])),
            "conjugationCount": len(conjugations_by_lesson.get(l_num, [])),
            "hasGrammar": len(grammar_by_lesson.get(l_num, [])) > 0
        })

    with open(os.path.join(out_dir, "lessons.json"), "w", encoding="utf-8") as f:
        json.dump(lessons, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "dialogues.json"), "w", encoding="utf-8") as f:
        json.dump(dialogues_by_lesson, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "vocab.json"), "w", encoding="utf-8") as f:
        json.dump(vocab_by_lesson, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "verbs.json"), "w", encoding="utf-8") as f:
        json.dump({"verbs": verbs_by_lesson, "conjugations": conjugations_by_lesson}, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "grammar.json"), "w", encoding="utf-8") as f:
        json.dump(grammar_by_lesson, f, ensure_ascii=False, indent=2)

    conn.close()
    return len(lessons), sum(l["dialogueCount"] for l in lessons), sum(l["vocabCount"] for l in lessons)

def process_book_3_or_4(book_id):
    out_dir = os.path.join(DATA_DIR, f"book{book_id}")
    os.makedirs(out_dir, exist_ok=True)
    db_path = os.path.join(RAW_DIR, f"madinah_book{book_id}.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # 1. Dialogues
    c.execute("SELECT _id, wordID, marker, translationRU, translationEN, wordHarakat, lessonNumber, voice FROM questionsLesson ORDER BY lessonNumber, _id")
    dialogues_by_lesson = {}
    for row in c.fetchall():
        less = row["lessonNumber"]
        if less not in dialogues_by_lesson: dialogues_by_lesson[less] = []
        dialogues_by_lesson[less].append({
            "id": row["_id"],
            "wordId": row["wordID"],
            "arabic": clean_text(row["wordHarakat"]),
            "english": clean_text(row["translationEN"]),
            "russian": clean_text(row["translationRU"]),
            "voiceKey": row["voice"]
        })

    # 2. Vocab
    c.execute("SELECT _id, wordID, marker, wordHarakat, translationRU, translationEN, lessonNumber, voice FROM wordsLesson ORDER BY lessonNumber, _id")
    vocab_by_lesson = {}
    for row in c.fetchall():
        less = row["lessonNumber"]
        if less not in vocab_by_lesson: vocab_by_lesson[less] = []
        vocab_by_lesson[less].append({
            "id": row["_id"],
            "wordId": row["wordID"],
            "arabic": clean_text(row["wordHarakat"]),
            "english": clean_text(row["translationEN"]),
            "russian": clean_text(row["translationRU"]),
            "voiceKey": row["voice"]
        })

    # 3. Verbs (Book 4 has verbsLesson)
    verbs_by_lesson = {}
    c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='verbsLesson'")
    if c.fetchone():
        c.execute("SELECT _id, wordID, marker, wordHarakat, translationRU, translationEN, lessonNumber, voice FROM verbsLesson ORDER BY lessonNumber, _id")
        for row in c.fetchall():
            less = row["lessonNumber"]
            if less not in verbs_by_lesson: verbs_by_lesson[less] = []
            verbs_by_lesson[less].append({
                "id": row["_id"],
                "wordId": row["wordID"],
                "arabic": clean_text(row["wordHarakat"]),
                "english": clean_text(row["translationEN"]),
                "russian": clean_text(row["translationRU"]),
                "voiceKey": row["voice"]
            })

    # 4. Grammar
    c.execute("""
        SELECT m._id, m.type, m.articleName, m.defItem1, m.defItem2, t.item1, t.item2
        FROM articlesMain m
        LEFT JOIN articlesTranslateEN t ON m._id = t._id
        ORDER BY m._id
    """)
    grammar_by_lesson = {}
    for r in c.fetchall():
        m_name = r["articleName"]
        match = re.match(r"lessonDesc_(\d+)", m_name)
        if not match: continue
        less = int(match.group(1))
        if less not in grammar_by_lesson: grammar_by_lesson[less] = []

        t = r["type"]
        if t in (40, 41, 42): continue

        d1 = clean_text(r["defItem1"])
        d2 = clean_text(r["defItem2"])
        e1 = clean_text(r["item1"])
        e2 = clean_text(r["item2"])

        ar_text = ""
        en_text = ""

        if is_arabic(d1):
            ar_text = d1
            en_text = e2 or e1 or d2
        elif is_arabic(d2):
            ar_text = d2
            en_text = e1 or e2 or d1
        else:
            en_text = e1 or e2 or d1 or d2

        if not ar_text and not en_text and t != 50:
            continue

        grammar_by_lesson[less].append({
            "id": r["_id"],
            "type": t,
            "arabic": ar_text,
            "english": en_text,
            "titleEN": en_text if t in (3, 4, 24) else ""
        })

    # 5. Lessons Overview
    lessons = []
    all_lessons = sorted(list(set(list(dialogues_by_lesson.keys()) + list(vocab_by_lesson.keys()) + list(verbs_by_lesson.keys()) + list(grammar_by_lesson.keys()))))
    for l_num in all_lessons:
        title = f"Lesson {l_num}"
        if l_num in grammar_by_lesson:
            for it in grammar_by_lesson[l_num]:
                if it["type"] == 4 and it["english"]:
                    title = f"Lesson {l_num}: {it['english']}"
                    break
        lessons.append({
            "lessonNumber": l_num,
            "title": title,
            "dialogueCount": len(dialogues_by_lesson.get(l_num, [])),
            "vocabCount": len(vocab_by_lesson.get(l_num, [])),
            "verbCount": len(verbs_by_lesson.get(l_num, [])),
            "conjugationCount": 0,
            "hasGrammar": len(grammar_by_lesson.get(l_num, [])) > 0
        })

    with open(os.path.join(out_dir, "lessons.json"), "w", encoding="utf-8") as f:
        json.dump(lessons, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "dialogues.json"), "w", encoding="utf-8") as f:
        json.dump(dialogues_by_lesson, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "vocab.json"), "w", encoding="utf-8") as f:
        json.dump(vocab_by_lesson, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "verbs.json"), "w", encoding="utf-8") as f:
        json.dump({"verbs": verbs_by_lesson, "conjugations": {}}, f, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "grammar.json"), "w", encoding="utf-8") as f:
        json.dump(grammar_by_lesson, f, ensure_ascii=False, indent=2)

    conn.close()
    return len(lessons), sum(l["dialogueCount"] for l in lessons), sum(l["vocabCount"] for l in lessons)

def main():
    print("Processing Book 1...")
    l1, d1, v1 = process_book_1()
    print(f"Book 1: {l1} lessons, {d1} dialogues, {v1} vocab")

    print("Processing Book 2...")
    l2, d2, v2 = process_book_2()
    print(f"Book 2: {l2} lessons, {d2} dialogues, {v2} vocab")

    print("Processing Book 3...")
    l3, d3, v3 = process_book_3_or_4(3)
    print(f"Book 3: {l3} lessons, {d3} dialogues, {v3} vocab")

    print("Processing Book 4...")
    l4, d4, v4 = process_book_4 = process_book_3_or_4(4)
    print(f"Book 4: {l4} lessons, {d4} dialogues, {v4} vocab")

    # Master Books Manifest
    books = [
        {"id": 1, "title": "Book 1", "arabicTitle": "الجزء الأول", "lessonCount": l1, "dialogueCount": d1, "vocabCount": v1, "hasDualVoice": True},
        {"id": 2, "title": "Book 2", "arabicTitle": "الجزء الثاني", "lessonCount": l2, "dialogueCount": d2, "vocabCount": v2, "hasDualVoice": True},
        {"id": 3, "title": "Book 3", "arabicTitle": "الجزء الثالث", "lessonCount": l3, "dialogueCount": d3, "vocabCount": v3, "hasDualVoice": False},
        {"id": 4, "title": "Book 4", "arabicTitle": "الجزء الرابع", "lessonCount": l4, "dialogueCount": d4, "vocabCount": v4, "hasDualVoice": False},
    ]

    with open(os.path.join(DATA_DIR, "books.json"), "w", encoding="utf-8") as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print("All books processed successfully!")

if __name__ == "__main__":
    main()
