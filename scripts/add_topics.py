"""Merge a batch of new topics into the Kindling topic bank.

Usage:  uv run scripts/add_topics.py path/to/batch.json [--dry-run]

Each new topic is inserted right after the last existing topic of its category, so the
bank stays grouped by category. Refuses ids that already exist (ids are permanent:
favorites are saved by id on users' phones). Run validate_topics.py afterwards.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

BANK = Path(__file__).resolve().parent.parent / "src" / "data" / "topics.json"
KEY_ORDER = ["id", "category", "depth", "groupSize", "text", "starter", "followUps"]


def ordered(topic: dict) -> dict:
    return {k: topic[k] for k in KEY_ORDER if k in topic} | {k: v for k, v in topic.items() if k not in KEY_ORDER}


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry_run = "--dry-run" in sys.argv
    if len(args) != 1:
        print(__doc__)
        return 2

    bank: list[dict] = json.loads(BANK.read_text(encoding="utf-8"))
    batch: list[dict] = json.loads(Path(args[0]).read_text(encoding="utf-8"))

    existing = {t["id"] for t in bank}
    clashes = sorted({t["id"] for t in batch} & existing)
    if clashes:
        print(f"Refusing: these ids already exist: {', '.join(clashes)}")
        return 1

    added: dict[str, int] = {}
    for topic in batch:
        last = max((i for i, t in enumerate(bank) if t["category"] == topic["category"]), default=len(bank) - 1)
        bank.insert(last + 1, ordered(topic))
        added[topic["category"]] = added.get(topic["category"], 0) + 1

    summary = ", ".join(f"{c} +{n}" for c, n in added.items())
    if dry_run:
        print(f"Dry run: would add {len(batch)} topics ({summary})")
        return 0

    BANK.write_text(json.dumps(bank, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Added {len(batch)} topics ({summary}); bank now has {len(bank)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
