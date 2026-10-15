import { getAudioContext, unlockAudio } from "./sound";

let timer = null;

function tone(c, freq, start, duration, volume) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.03);
  gain.gain.setValueAtTime(volume, start + duration - 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

const PATTERNS = {
  // "ring-ring" for an incoming call
  incoming: {
    every: 2400,
    play: (c, t) => {
      tone(c, 880, t, 0.3, 0.14);
      tone(c, 660, t + 0.35, 0.3, 0.14);
      tone(c, 880, t + 0.9, 0.3, 0.14);
      tone(c, 660, t + 1.25, 0.3, 0.14);
    },
  },
  // the long "brrr" you hear while you wait for them to pick up
  outgoing: {
    every: 3500,
    play: (c, t) => {
      tone(c, 440, t, 1.4, 0.07);
      tone(c, 480, t, 1.4, 0.07);
    },
  },
};

export function stopRing() {
  clearInterval(timer);
  timer = null;
}

export function startRing(kind) {
  stopRing();
  unlockAudio();

  const pattern = PATTERNS[kind];
  if (!pattern) return;

  const ring = () => {
    const c = getAudioContext();
    if (c && c.state === "running") pattern.play(c, c.currentTime + 0.02);
  };

  ring();
  timer = setInterval(ring, pattern.every);
}