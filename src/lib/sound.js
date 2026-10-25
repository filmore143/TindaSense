// Mga sound effect na gawa sa Web Audio API (walang audio file na kailangan).
// May mute toggle na naka-save sa LocalStorage.

import { LocalStorage } from "quasar";

const MUTE_KEY = "tindasense.muted";
let audioCtx = null;
let muted = LocalStorage.getItem(MUTE_KEY) === true;

function ctx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  // I-resume kung na-suspend (browser autoplay policy).
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

// Tumugtog ng isang tono.
function tone({ freq = 880, start = 0, dur = 0.12, type = "sine", gain = 0.2 }) {
  const ac = ctx();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function isMuted() {
  return muted;
}

export function setMuted(val) {
  muted = !!val;
  LocalStorage.set(MUTE_KEY, muted);
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

// "Ka-ching" — dalawang mabilis na mataas na tono (parang cash register).
export function playKaching() {
  if (muted) return;
  tone({ freq: 1318, dur: 0.1, type: "triangle", gain: 0.22 }); // E6
  tone({ freq: 1760, start: 0.09, dur: 0.18, type: "triangle", gain: 0.2 }); // A6
}

// "Pop" / success — pataas na dalawang nota (pag-add).
export function playSuccess() {
  if (muted) return;
  tone({ freq: 660, dur: 0.1, type: "sine", gain: 0.2 });
  tone({ freq: 990, start: 0.09, dur: 0.14, type: "sine", gain: 0.2 });
}

// Maikling click (gastos / neutral).
export function playClick() {
  if (muted) return;
  tone({ freq: 520, dur: 0.07, type: "square", gain: 0.12 });
}

// Babala — dalawang pababang tono (low stock).
export function playWarning() {
  if (muted) return;
  tone({ freq: 440, dur: 0.14, type: "sawtooth", gain: 0.16 });
  tone({ freq: 294, start: 0.13, dur: 0.22, type: "sawtooth", gain: 0.16 });
}
