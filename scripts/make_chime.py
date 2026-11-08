"""Synthesize Kindling's time's-up chime: a soft, warm two-note bell.

Usage:  uv run scripts/make_chime.py [out.wav]
Writes assets/sounds/chime.wav by default. Stdlib only, so the sound is ours (no license).

Tweak NOTES / LEVEL below and re-run to change the sound.
"""

from __future__ import annotations

import math
import struct
import sys
import wave
from pathlib import Path

RATE = 44_100
LEVEL = 0.32  # peak loudness (0..1); kept low on purpose: a chime, never an alarm

# (frequency Hz, start s, length s, gain). G5 then C6: a gentle rising fourth.
NOTES = [
    (783.99, 0.00, 1.10, 0.85),
    (1046.50, 0.18, 1.30, 1.00),
]
# Bell-like partials: (frequency multiple, relative gain, extra decay)
PARTIALS = [(1.0, 1.0, 1.0), (2.0, 0.22, 1.8), (3.01, 0.07, 2.6)]
DECAY = 3.2  # higher = shorter ring
ATTACK = 0.008  # seconds; avoids a click at note start
TAIL = 0.25  # silence-ish fade at the end

DEFAULT_OUT = Path(__file__).resolve().parent.parent / "assets" / "sounds" / "chime.wav"


def render() -> list[float]:
    total = max(start + length for _, start, length, _ in NOTES) + TAIL
    samples = [0.0] * int(total * RATE)
    for freq, start, length, gain in NOTES:
        first = int(start * RATE)
        for n in range(int(length * RATE)):
            t = n / RATE
            env = min(1.0, t / ATTACK) * math.exp(-DECAY * t)
            # Fade the last 50 ms of each note to zero so nothing is cut off abruptly.
            env *= min(1.0, (length - t) / 0.05)
            value = sum(g * math.exp(-DECAY * (d - 1) * t) * math.sin(2 * math.pi * freq * m * t) for m, g, d in PARTIALS)
            samples[first + n] += gain * env * value
    peak = max(abs(s) for s in samples) or 1.0
    return [s / peak * LEVEL for s in samples]


def main() -> int:
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OUT
    out.parent.mkdir(parents=True, exist_ok=True)
    samples = render()
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(s * 32767)) for s in samples))
    print(f"Wrote {out} ({len(samples) / RATE:.2f}s, {out.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
