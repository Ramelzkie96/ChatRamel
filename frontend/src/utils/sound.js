let ctx = null;
let lastPlayed = 0;

const getCtx = () => {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
  } catch {
    ctx = null;
  }
  return ctx;
};

// Browsers only allow sound after the user has interacted with the page,
// so the first click or key press "unlocks" audio.
export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume().catch(() => {});
}

if (typeof window !== "undefined") {
  ["pointerdown", "keydown"].forEach((evt) =>
    window.addEventListener(evt, unlockAudio, { passive: true })
  );
}

// a short two-note "ding"; `force` skips the anti-spam delay (used for the preview)
export function playPing(force = false) {
  const c = getCtx();
  if (!c || c.state !== "running") return;

  const now = performance.now();
  if (!force && now - lastPlayed < 700) return; // a burst of messages = one ding
  lastPlayed = now;

  const t = c.currentTime;
  [
    [880, 0],
    [1318.5, 0.12],
  ].forEach(([freq, delay]) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.0001, t + delay);
    gain.gain.exponentialRampToValueAtTime(0.18, t + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.28);

    osc.connect(gain).connect(c.destination);
    osc.start(t + delay);
    osc.stop(t + delay + 0.3);
  });
}

export { getCtx as getAudioContext };