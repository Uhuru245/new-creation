// A soft worship pad played underneath the narration, made entirely in the browser (no recordings, no copyright).
// Slow, warm chords with a gentle swell and a little hall reverb, kept well below the voice.
let ctx = null, master = null, verb = null, timer = null, step = 0, on = false, offTimer = null, level = 0.5;
// I – V – vi – IV in D major, voiced low and open so it never competes with speech.
const CHORDS = [[50, 57, 62, 66], [45, 52, 57, 61], [47, 54, 59, 62], [43, 50, 55, 59]];
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const BAR = 8; // seconds per chord

function impulse(c, secs = 3.2) {
  const len = c.sampleRate * secs, b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  return b;
}
function setup() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  ctx = new AC(); master = ctx.createGain(); master.gain.value = 0;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.Q.value = 0.4;
  verb = ctx.createConvolver(); verb.buffer = impulse(ctx);
  const wet = ctx.createGain(); wet.gain.value = 0.55; const dry = ctx.createGain(); dry.gain.value = 0.6;
  master.connect(lp); lp.connect(dry); lp.connect(verb); verb.connect(wet); dry.connect(ctx.destination); wet.connect(ctx.destination);
  return true;
}
function playChord(notes, t) {
  notes.forEach((m, i) => {
    [-6, 6].forEach((det) => { // two slightly detuned voices per note for a soft chorus
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = i === 0 ? 'sine' : 'triangle'; o.frequency.value = hz(m); o.detune.value = det;
      const peak = (i === 0 ? 0.05 : 0.028);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 2.6);
      g.gain.setValueAtTime(peak, t + BAR - 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t + BAR + 2.4);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + BAR + 2.6);
    });
  });
}
function loop() { playChord(CHORDS[step++ % CHORDS.length], ctx.currentTime + 0.05); }

export function setLevel(v) { level = v; if (ctx && on) master.gain.setTargetAtTime(0.9 * level, ctx.currentTime, 0.4); }
export function start() {
  clearTimeout(offTimer); if (on) return; if (!setup()) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  on = true; loop(); timer = setInterval(loop, BAR * 1000);
  master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0.9 * level, ctx.currentTime, 1.2);
}
// A short grace period means the pad keeps breathing between chapters instead of stopping and restarting.
export function stop(now = false) {
  if (!on) return; clearTimeout(offTimer);
  offTimer = setTimeout(() => {
    if (!on) return; on = false; clearInterval(timer);
    master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, 0.8);
  }, now ? 0 : 1800);
}
export const playing = () => on;
