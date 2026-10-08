// New Creation: a speaking engine with a preacher's rhythm, and word-by-word highlighting that stays in step.
// Uses the phone's own voice (Web Speech). Each clause is a separate utterance, so pitch, pace and pauses
// can rise and fall the way a preacher builds and lands a line. The highlight follows the voice's own word
// events; where a voice does not report words, it is timed from the pace and re-aligned at every clause.

const WORD = /\S+/g;
export const supported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function wordsOf(text) { const out = []; let m; WORD.lastIndex = 0; while ((m = WORD.exec(text))) out.push({ s: m.index, e: m.index + m[0].length }); return out; }

// Split into clauses at punctuation, keeping offsets. Very short pieces join the next one so the voice doesn't stutter.
function clauses(text) {
  const re = /[^.!?;:,—]+(?:[.!?;:,—]+["”’')\]]*)?\s*/g; const raw = []; let m;
  while ((m = re.exec(text))) { if (!m[0]) { re.lastIndex++; continue; } raw.push({ s: m.index, t: m[0] }); }
  if (!raw.length) return [{ s: 0, t: text }];
  const out = [];
  for (const c of raw) {
    const last = out[out.length - 1];
    if (last && wordsOf(last.t).length < 3 && !/[.!?]["”’')\]]*\s*$/.test(last.t)) { last.t += c.t; continue; }
    out.push({ ...c });
  }
  return out.filter((c) => c.t.trim());
}

// Pick a clear English voice. Voices installed on the device usually report each word, which keeps the highlight exact.
export function pickVoice(preferDeep = false) {
  if (!supported()) return null;
  const vs = speechSynthesis.getVoices().filter((v) => /^en(-|_|$)/i.test(v.lang)); if (!vs.length) return null;
  const score = (v) => (v.localService ? 30 : 0) + (/premium|enhanced|natural|neural/i.test(v.name) ? 25 : 0)
    + (/en[-_]ZA/i.test(v.lang) ? 8 : /en[-_]GB/i.test(v.lang) ? 6 : /en[-_]US/i.test(v.lang) ? 5 : 0)
    + (preferDeep && /daniel|arthur|aaron|guy|ryan|tom|fred|alex|reed|rocko|grandpa|eddy|male/i.test(v.name) ? 12 : 0)
    + (/google|siri|microsoft/i.test(v.name) ? 4 : 0);
  return vs.sort((a, b) => score(b) - score(a))[0];
}
if (supported()) { try { speechSynthesis.getVoices(); speechSynthesis.addEventListener('voiceschanged', () => {}); } catch (e) { /* ignore */ } }

// How a preacher would deliver this clause: build through commas, lift on questions, fire on exclamations, land slowly.
function delivery(t, k, n, mode, emph, rate) {
  const end = (t.trim().match(/[.!?;:,—](?=["”’')\]]*$)/) || [''])[0];
  if (mode !== 'preach') return { rate: rate * 0.95, pitch: 0.95, vol: 1, pause: end === '.' || end === '!' || end === '?' ? 520 : end ? 220 : 120 };
  let r = rate * 0.93, p = 0.95, pause = 200;
  const build = Math.min(k, 4);
  if (end === ',' || end === ';' || end === ':' || end === '—') { r *= 1 + build * 0.03; p += build * 0.035; pause = 170 + build * 30; }
  else if (end === '!') { r *= 1.07; p = 1.12; pause = 720; }
  else if (end === '?') { r *= 0.97; p = 1.08; pause = 680; }
  else if (end === '.') { if (k === n - 1) { r *= 0.86; p = 0.86; pause = 760; } else { r *= 0.95; p = 0.94; pause = 520; } }
  if (emph === 'strong') { r *= 0.86; p = Math.min(p, 0.88); pause += 300; }
  if (emph === 'lift') { r *= 1.08; p = Math.max(p, 1.12); }
  if (/\.\.\.|…/.test(t)) pause += 450;
  return { rate: Math.max(0.5, Math.min(1.6, r)), pitch: Math.max(0.6, Math.min(1.4, p)), vol: 1, pause };
}

let reportsWords = null; // learned per session: does this voice fire word events?
let token = 0;
export function cancel() { token++; if (supported()) speechSynthesis.cancel(); }

// Speak one piece of text. onWord(i) gets the index of the word (in wordsOf(text)) being spoken right now.
export function speak(text, { mode = 'preach', rate = 1, emph = '', voice = null, onWord = null, onDone = null } = {}) {
  if (!supported()) { if (onDone) setTimeout(onDone, 0); return { cancel() {} }; }
  const my = ++token; const v = voice || pickVoice(mode === 'preach');
  const all = wordsOf(text); const parts = mode === 'preach' ? clauses(text) : [{ s: 0, t: text }];
  let timer = null; const clear = () => { if (timer) { clearInterval(timer); timer = null; } };
  const at = (off) => { let i = all.findIndex((w) => off < w.e); if (i < 0) i = all.length - 1; return i; };
  const run = (k) => {
    if (my !== token) return;
    if (k >= parts.length) { clear(); if (onDone) onDone(); return; }
    const c = parts[k]; const d = delivery(c.t, k, parts.length, mode, emph, rate);
    const first = at(c.s), lastW = at(c.s + c.t.trimEnd().length - 1); let shown = first;
    const u = new SpeechSynthesisUtterance(c.t.trim()); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
    u.rate = d.rate; u.pitch = d.pitch; u.volume = d.vol;
    const lead = c.t.length - c.t.trimStart().length;
    u.onstart = () => {
      if (my !== token) return; if (onWord) onWord(first);
      clear();
      if (reportsWords !== true && onWord) {
        const per = 60000 / (150 * d.rate); // fallback pace, re-aligned at the start of every clause
        timer = setInterval(() => { if (my !== token) return clear(); if (speechSynthesis.paused) return; if (shown < lastW) { shown++; onWord(shown); } }, per);
      }
    };
    u.onboundary = (e) => {
      if (my !== token || !onWord) return; if (e.name && e.name !== 'word') return;
      if (reportsWords !== true) { reportsWords = true; clear(); }
      const i = at(c.s + lead + e.charIndex); if (i >= shown || i === first) { shown = i; onWord(i); }
    };
    u.onend = () => { if (my !== token) return; clear(); if (onWord) onWord(lastW); setTimeout(() => run(k + 1), d.pause / Math.max(0.6, rate)); };
    u.onerror = (e) => { if (my !== token) return; clear(); if (e && (e.error === 'interrupted' || e.error === 'canceled')) return; setTimeout(() => run(k + 1), 200); };
    speechSynthesis.speak(u);
  };
  speechSynthesis.cancel(); setTimeout(() => run(0), 60);
  return { cancel() { if (my === token) cancel(); } };
}

// Wrap each word of an element's text in a span (skipping verse numbers and icons) so it can be lit as it is spoken.
export function wrapWords(el) {
  if (!el) return []; if (el.__w && el.__w.every((s) => el.contains(s))) return el.__w;
  const spans = []; const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement && n.parentElement.closest('sup,svg,.mk,.now-reading')) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const nodes = []; while (walk.nextNode()) nodes.push(walk.currentNode);
  nodes.forEach((n) => {
    const parts = n.nodeValue.split(/(\s+)/); if (parts.length === 1 && !parts[0].trim()) return;
    const frag = document.createDocumentFragment();
    parts.forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p)); else { const s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.appendChild(s); spans.push(s); } });
    n.parentNode.replaceChild(frag, n);
  });
  el.__w = spans; return spans;
}
export function lightWord(spans, i) {
  spans.forEach((s, k) => { s.classList.toggle('w-now', k === i); s.classList.toggle('w-done', k < i); });
}
