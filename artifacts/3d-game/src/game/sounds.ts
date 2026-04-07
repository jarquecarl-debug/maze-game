let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType = "sine", vol = 0.25) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

function noise(duration: number, freq = 400, vol = 0.15) {
  const c = getCtx();
  const buf = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * vol;
  const src = c.createBufferSource();
  src.buffer = buf;
  const flt = c.createBiquadFilter();
  flt.type = "bandpass";
  flt.frequency.value = freq;
  src.connect(flt);
  flt.connect(c.destination);
  src.start();
}

export function playCollect(type: "gem" | "coin" | "star") {
  try {
    const c = getCtx();
    const freqs: Record<string, [number, number]> = {
      gem: [880, 1760],
      coin: [660, 990],
      star: [440, 1320],
    };
    const [f1, f2] = freqs[type];
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.frequency.setValueAtTime(f1, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(f2, c.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.3);
  } catch (_) {}
}

export function playKey() {
  try {
    [523, 659, 784, 1047].forEach((f, i) => {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      const t = c.currentTime + i * 0.1;
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  } catch (_) {}
}

export function playDamage() {
  try {
    noise(0.15, 300, 0.35);
    tone(80, 0.2, "sawtooth", 0.3);
  } catch (_) {}
}

export function playFootstep() {
  try {
    noise(0.04, 250 + Math.random() * 100, 0.12);
  } catch (_) {}
}

export function playWin() {
  try {
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      setTimeout(() => tone(f, 0.5, "sine", 0.3), i * 120);
    });
  } catch (_) {}
}

export function playLose() {
  try {
    [400, 300, 200, 100].forEach((f, i) => {
      setTimeout(() => tone(f, 0.3, "sawtooth", 0.25), i * 150);
    });
  } catch (_) {}
}

export function playEnemyNear() {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, c.currentTime + 0.4);
    gain.gain.setValueAtTime(0.3, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.4);
  } catch (_) {}
}
