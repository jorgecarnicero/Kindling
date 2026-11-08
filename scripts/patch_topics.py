"""Set fields on existing topics in the Kindling topic bank.

Usage:  uv run scripts/patch_topics.py path/to/patch.json [--dry-run]

patch.json maps topic ids to the fields to set, e.g.
  {"gtk-001": {"starter": {"en": "...", "es": "..."}}}
Refuses unknown ids and the fields id/category (those are permanent). Keeps key order.
Run validate_topics.py afterwards.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

BANK = Path(__file__).resolve().parent.parent / "src" / "data" / "topics.json"
KEY_ORDER = ["id", "category", "depth", "groupSize", "text", "starter", "followUps"]
PROTECTED = {"id", "category"}


def ordered(topic: dict) -> dict:
    return {k: topic[k] for k in KEY_ORDER if k in topic} | {k: v for k, v in topic.items() if k not in KEY_ORDER}


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry_run = "--dry-run" in sys.argv
    if len(args) != 1:
        print(__doc__)
        return 2

    bank: list[dict] = json.loads(BANK.read_text(encoding="utf-8"))
    patch: dict[str, dict] = json.loads(Path(args[0]).read_text(encoding="utf-8"))

    by_id = {t["id"]: i for i, t in enumerate(bank)}
    unknown = sorted(set(patch) - set(by_id))
    if unknown:
        print(f"Refusing: unknown ids: {', '.join(unknown)}")
        return 1
    blocked = sorted({k for fields in patch.values() for k in fields} & PROTECTED)
    if blocked:
        print(f"Refusing: these fields can't be patched: {', '.join(blocked)}")
        return 1

    for tid, fields in patch.items():
        bank[by_id[tid]] = ordered({**bank[by_id[tid]], **fields})

    if dry_run:
        print(f"Dry run: would patch {len(patch)} topics")
        return 0
    BANK.write_text(json.dumps(bank, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Patched {len(patch)} topics")
    return 0


if __name__ == "__main__":
    sys.exit(main())
