"""Validate the Kindling topic bank.

Usage:  uv run scripts/validate_topics.py [path/to/topics.json]
Exit code 0 = valid, 1 = problems found (each one printed).

Keep the allowed values in sync with src/data/types.ts.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

CATEGORIES = {
    "get_to_know": "gtk",
    "deep_talk": "deep",
    "random_facts": "fact",
    "stories": "story",
    "would_you_rather": "wyr",
    "light_debate": "debate",
    "couples": "couple",
    "family": "family",
    "team_building": "team",
}
DEPTHS = {"light", "medium", "deep"}
GROUP_SIZES = {"pair", "small", "party"}
LANGUAGES = ("en", "es")
ALLOWED_KEYS = {"id", "category", "depth", "groupSize", "text", "followUps"}

DEFAULT_PATH = Path(__file__).resolve().parent.parent / "src" / "data" / "topics.json"


def check_topic(t: object, i: int) -> list[str]:
    if not isinstance(t, dict):
        return [f"#{i}: not an object"]
    where = f"#{i} ({t.get('id', '?')})"
    errors: list[str] = []

    extra = set(t) - ALLOWED_KEYS
    if extra:
        errors.append(f"{where}: unknown keys {sorted(extra)}")

    category = t.get("category")
    if category not in CATEGORIES:
        errors.append(f"{where}: invalid category {category!r}")

    tid = t.get("id")
    if not isinstance(tid, str) or not re.fullmatch(r"[a-z]+-\d{3}", tid):
        errors.append(f"{where}: id must look like 'gtk-001'")
    elif category in CATEGORIES and not tid.startswith(CATEGORIES[category] + "-"):
        errors.append(f"{where}: id prefix should be '{CATEGORIES[category]}-' for {category}")

    if t.get("depth") not in DEPTHS:
        errors.append(f"{where}: invalid depth {t.get('depth')!r}")

    sizes = t.get("groupSize")
    if not isinstance(sizes, list) or not sizes or any(s not in GROUP_SIZES for s in sizes):
        errors.append(f"{where}: groupSize must be a non-empty list of {sorted(GROUP_SIZES)}")
    elif len(set(sizes)) != len(sizes):
        errors.append(f"{where}: groupSize has duplicates")

    text = t.get("text")
    if not isinstance(text, dict):
        errors.append(f"{where}: text must be an object with {LANGUAGES}")
    else:
        for lang in LANGUAGES:
            value = text.get(lang)
            if not isinstance(value, str) or not value.strip():
                errors.append(f"{where}: text.{lang} is missing or empty")
            elif value != value.strip():
                errors.append(f"{where}: text.{lang} has leading/trailing spaces")

    follow = t.get("followUps")
    if follow is not None:
        if not isinstance(follow, dict):
            errors.append(f"{where}: followUps must be an object with {LANGUAGES}")
        else:
            lists = {lang: follow.get(lang) for lang in LANGUAGES}
            for lang, items in lists.items():
                if not isinstance(items, list) or not all(isinstance(s, str) and s.strip() for s in items):
                    errors.append(f"{where}: followUps.{lang} must be a list of non-empty strings")
            if all(isinstance(v, list) for v in lists.values()) and len({len(v) for v in lists.values()}) > 1:
                errors.append(f"{where}: followUps have a different count per language")

    return errors


def main() -> int:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PATH
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        print(f"Cannot read {path}: {e}")
        return 1
    if not isinstance(data, list):
        print("Top level must be a list of topics")
        return 1

    errors = [e for i, t in enumerate(data) for e in check_topic(t, i)]

    ids = Counter(t.get("id") for t in data if isinstance(t, dict))
    errors += [f"duplicate id {tid!r} ({n} times)" for tid, n in ids.items() if n > 1]
    for lang in LANGUAGES:
        texts = Counter(
            t["text"][lang].strip().lower()
            for t in data
            if isinstance(t, dict) and isinstance(t.get("text"), dict) and isinstance(t["text"].get(lang), str)
        )
        errors += [f"duplicate {lang} text: {s!r}" for s, n in texts.items() if n > 1]

    if errors:
        print(f"{len(errors)} problem(s) in {path.name}:")
        for e in errors:
            print(f"  - {e}")
        return 1

    valid = [t for t in data if isinstance(t, dict)]
    by_cat = Counter(t["category"] for t in valid)
    by_depth = Counter(t["depth"] for t in valid)
    print(f"OK: {len(data)} topics")
    print("  by category: " + ", ".join(f"{c} {by_cat.get(c, 0)}" for c in CATEGORIES))
    print("  by depth:    " + ", ".join(f"{d} {by_depth.get(d, 0)}" for d in ("light", "medium", "deep")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
