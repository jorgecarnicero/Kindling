"""Synthesize Kindling's campfire ambience: a seamless loop of a soft, crackling fire.

Usage:  uv run scripts/make_fire.py [out.wav]
Writes assets/sounds/fire.wav by default. Stdlib only, so the sound is ours (no license).

Layers: a low, slowly breathing rumble (filtered brown noise), a faint airy hiss, and
random crackles and pops. The end crossfades into the start so it loops without a seam.
Tweak the constants below and re-run to change the sound.
"""

from __future__ import annotations

import math
import random
import struct
import sys
import wave
from pathlib import Path

RATE = 22_050  # ambience doesn't need more; keeps the file small
LOOP_SECONDS = 40
FADE_SECONDS = 3  # crossfade length for a seamless loop
LEVEL = 0.5  # peak before the app's own volume setting
SEED = 7  # fixed seed: the same file every time

# The steady layers stay low and dark (a warm bed, not a hiss); crackles carry the sound.
RUMBLE_GAIN = 0.16
RUMBLE_CUTOFF_HZ = 110  # applied twice: a deep, soft roar
HISS_GAIN = 0.006
CRACKLES_PER_SECOND = 5.5
POPS_PER_SECOND = 0.5

OUT = Path(__file__).resolve().parent.parent / "assets" / "sounds" / "fire.wav"


def one_pole_lowpass(x: list[float], cutoff_hz: float) -> list[float]:
    a = math.exp(-2 * math.pi * cutoff_hz / RATE)
    out, y = [], 0.0
    for v in x:
        y = (1 - a) * v + a * y
        out.append(y)
    return out


def slow_wobble(n: int, rng: random.Random, speed_hz: float, depth: float) -> list[float]:
    """A smooth random envelope around 1.0 (the fire 'breathing')."""
    points = int(n / RATE * speed_hz) + 3
    knots = [1 + depth * (rng.random() * 2 - 1) for _ in range(points)]
    step = RATE / speed_hz
    env = []
    for i in range(n):
        k = i / step
        j = int(k)
        t = k - j
        t = t * t * (3 - 2 * t)  # smoothstep between knots
        env.append(knots[j] * (1 - t) + knots[j + 1] * t)
    return env


def render(seconds: float, rng: random.Random) -> list[float]:
    n = int(seconds * RATE)

    # Rumble: leaky-integrated white noise (brown), low-passed, breathing slowly.
    brown, acc = [], 0.0
    for _ in range(n):
        acc = 0.995 * acc + rng.uniform(-1, 1) * 0.1
        brown.append(acc)
    rumble = one_pole_lowpass(one_pole_lowpass(brown, RUMBLE_CUTOFF_HZ), RUMBLE_CUTOFF_HZ)
    breathe = slow_wobble(n, rng, speed_hz=0.3, depth=0.6)
    peak = max(abs(v) for v in rumble) or 1.0
    out = [RUMBLE_GAIN * r / peak * b for r, b in zip(rumble, breathe)]

    # Hiss: white noise minus its low-passed self (a crude high-pass), very quiet.
    white = [rng.uniform(-1, 1) for _ in range(n)]
    low = one_pole_lowpass(white, 2000)
    hiss_env = slow_wobble(n, rng, speed_hz=0.5, depth=0.5)
    for i in range(n):
        out[i] += HISS_GAIN * (white[i] - low[i]) * hiss_env[i]

    # Crackles: tiny bright bursts; pops: rarer, longer, lower. Heavy-tailed loudness.
    def add_burst(start: int, length: int, gain: float, bright: float) -> None:
        y = 0.0
        a = math.exp(-2 * math.pi * bright / RATE)
        for k in range(length):
            if start + k >= n:
                break
            env = math.exp(-6.0 * k / length)
            y = (1 - a) * rng.uniform(-1, 1) + a * y
            noise = rng.uniform(-1, 1) - y  # keep the bright part
            out[start + k] += gain * env * noise

    t = 0.0
    while True:
        t += rng.expovariate(CRACKLES_PER_SECOND)
        if t >= seconds:
            break
        gain = min(0.9, 0.08 * rng.paretovariate(2.2))
        add_burst(int(t * RATE), int(RATE * rng.uniform(0.002, 0.012)), gain, bright=rng.uniform(1500, 4000))
        if rng.random() < 0.25:  # crackles often come in little clusters
            add_burst(int((t + rng.uniform(0.01, 0.05)) * RATE), int(RATE * 0.004), gain * 0.6, bright=3000)

    t = 0.0
    while True:
        t += rng.expovariate(POPS_PER_SECOND)
        if t >= seconds:
            break
        add_burst(int(t * RATE), int(RATE * rng.uniform(0.02, 0.05)), rng.uniform(0.25, 0.55), bright=600)

    return out


def main() -> int:
    out_path = Path(sys.argv[1]) if len(sys.argv) > 1 else OUT
    out_path.parent.mkdir(parents=True, exist_ok=True)
    rng = random.Random(SEED)

    total = LOOP_SECONDS + FADE_SECONDS
    raw = render(total, rng)
    loop_n, fade_n = LOOP_SECONDS * RATE, FADE_SECONDS * RATE
    # Seamless loop: the extra tail fades out over the beginning, which fades in.
    samples = raw[:loop_n]
    for i in range(fade_n):
        w = i / fade_n
        samples[i] = samples[i] * math.sqrt(w) + raw[loop_n + i] * math.sqrt(1 - w)

    peak = max(abs(s) for s in samples) or 1.0
    samples = [s / peak * LEVEL for s in samples]

    with wave.open(str(out_path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s)) * 32767)) for s in samples))
    print(f"Wrote {out_path} ({LOOP_SECONDS}s loop, {out_path.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
