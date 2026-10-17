// The Word Behind the Word: shared data and helpers (word studies, alphabets, progress, read-aloud and voice input).
import { store, esc } from './util.js';
import { call, send } from './api.js';
import { S, privItem, setPriv } from './state.js';

export const PROMISE = 'Understand what you read, make time for God, and grow together, one day at a time.';

// Fonts that draw Hebrew vowel marks and Greek accents properly (loaded once, cached by the service worker).
export function wordFonts() {
  if (document.getElementById('wordFonts')) return;
  const l = document.createElement('link'); l.id = 'wordFonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+Hebrew:wght@400;600&family=GFS+Didot&family=Noto+Serif:wght@400;600&display=swap';
  document.head.appendChild(l);
}
export const scriptCls = (lang) => (lang === 'he' ? 'wscript he' : 'wscript grc');
export const scriptAttrs = (lang) => (lang === 'he' ? 'lang="he" dir="rtl"' : 'lang="grc" dir="ltr"');

// ---------- word studies and progress (from the server, kept on the device for speed) ----------
let W = store.pget('words', null), loadedAt = 0;
export const cached = () => W;
export const stale = () => Date.now() - loadedAt > 60000;
export async function loadWords() {
  const r = await call('words', S.token); W = r; loadedAt = Date.now(); store.pset('words', r); return r;
}
export const learnedKey = (day, word) => `${day}|${word}`;
export const isLearned = (w) => !!(W && W.learned.some((x) => learnedKey(x.day, x.word) === learnedKey(w.day, w.word)));
export async function setLearned(w, on) {
  if (!W) return;
  W.learned = W.learned.filter((x) => learnedKey(x.day, x.word) !== learnedKey(w.day, w.word));
  if (on) W.learned.push({ day: w.day, word: w.word, date: new Date().toISOString().slice(0, 10) });
  store.pset('words', W);
  return send('wordLearn', S.token, w.day, w.word, on);
}
// Today's word: the word for today's reading, or else the most recent one.
export function todayWord(r = W) {
  if (!r || !r.words.length) return null;
  const visible = r.words.filter((w) => w.day <= r.day && (!w.status || w.status === 'Approved' || S.data.me.leader));
  const exact = visible.find((w) => w.day === r.day); if (exact) return { w: exact, today: true };
  const prev = visible.filter((w) => w.day < r.day).pop(); return prev ? { w: prev, today: false } : null;
}
export const wordsSoFar = (r = W) => (r ? r.words.filter((w) => w.day <= r.day && (!w.status || w.status === 'Approved')) : []);
export const firstGloss = (w) => String(w.english || '').split(/[;(]/)[0].replace(/^["“]|["”]$/g, '').trim();

// Letters known and quiz scores are private items, so they sync to the member's other devices.
export const lettersKnown = () => { const it = privItem('lang', 'letters'); return (it && it.data) || { he: [], grc: [] }; };
export function setLetterKnown(lang, name, on) {
  const k = lettersKnown(); const set = new Set(k[lang] || []); if (on) set.add(name); else set.delete(name);
  return setPriv('lang', 'letters', { ...k, [lang]: [...set] });
}
export const quizStats = () => { const it = privItem('lang', 'quiz'); return (it && it.data) || {}; };
export function saveQuiz(set, score, total) {
  const q = quizStats(); const prev = q[set] || { best: 0, total, taken: 0 };
  const pct = (s, t) => (t ? s / t : 0);
  const best = pct(score, total) >= pct(prev.best, prev.total) ? { best: score, total } : { best: prev.best, total: prev.total };
  return setPriv('lang', 'quiz', { ...q, [set]: { ...best, last: score, lastTotal: total, taken: (prev.taken || 0) + 1, when: new Date().toISOString().slice(0, 10) } });
}
export function summary() {
  const r = W, k = lettersKnown(), q = quizStats();
  const sets = Object.values(q).filter((x) => x && x.total);
  const bestPct = sets.length ? Math.round(Math.max(...sets.map((x) => x.best / x.total)) * 100) : null;
  return { learned: r ? r.learned.length : 0, available: wordsSoFar().length, letters: (k.he || []).length + (k.grc || []).length, lettersTotal: HEBREW.length + GREEK.length,
    bestPct, quizzes: sets.reduce((a, x) => a + (x.taken || 0), 0), convs: r ? r.convs : 0 };
}

// ---------- alphabets ----------
// Hebrew: name, letter, final form, sound, transliteration. Sounds follow the common academic (and modern Israeli) reading.
export const HEBREW = [
  ['Alef', 'א', '', 'silent, or a slight catch in the voice', 'ʾ'], ['Bet', 'ב', '', 'b, or v without the dot (בּ = b, ב = v)', 'b / v'],
  ['Gimel', 'ג', '', 'g as in "go"', 'g'], ['Dalet', 'ד', '', 'd', 'd'], ['He', 'ה', '', 'h; silent at the end of a word', 'h'],
  ['Vav', 'ו', '', 'v (anciently w); also a vowel letter for o or u', 'v / w'], ['Zayin', 'ז', '', 'z', 'z'],
  ['Chet', 'ח', '', 'ch as in Scottish "loch"', 'ch (ḥ)'], ['Tet', 'ט', '', 't', 't (ṭ)'], ['Yod', 'י', '', 'y as in "yes"', 'y'],
  ['Kaf', 'כ', 'ך', 'k with the dot (כּ), ch as in "loch" without it', 'k / kh'], ['Lamed', 'ל', '', 'l', 'l'],
  ['Mem', 'מ', 'ם', 'm', 'm'], ['Nun', 'נ', 'ן', 'n', 'n'], ['Samekh', 'ס', '', 's', 's'],
  ['Ayin', 'ע', '', 'silent today; anciently a sound made deep in the throat', 'ʿ'], ['Pe', 'פ', 'ף', 'p with the dot (פּ), f without it', 'p / f'],
  ['Tsade', 'צ', 'ץ', 'ts as in "cats"', 'ts (ṣ)'], ['Qof', 'ק', '', 'k (made further back in the mouth)', 'q'], ['Resh', 'ר', '', 'r', 'r'],
  ['Shin / Sin', 'ש', '', 'sh with the dot on the right (שׁ), s with the dot on the left (שׂ)', 'sh / s'], ['Tav', 'ת', '', 't', 't'],
];
export const HEB_VOWELS = [
  ['Patach', 'בַ', 'a as in "father"', 'a'], ['Qamets', 'בָ', 'a as in "father" (sometimes o)', 'a'], ['Segol', 'בֶ', 'e as in "bed"', 'e'],
  ['Tsere', 'בֵ', 'e as in "they"', 'e'], ['Hireq', 'בִ', 'i as in "machine"', 'i'], ['Holem', 'בֹ', 'o as in "go" (also written בוֹ)', 'o'],
  ['Shureq', 'בוּ', 'u as in "rule"', 'u'], ['Qibbuts', 'בֻ', 'u as in "rule"', 'u'], ['Shva', 'בְ', 'silent, or a very short e', 'e or nothing'],
  ['Hataf vowels', 'חֲ חֱ חֳ', 'very short a, e or o', 'a, e, o'],
];
// Greek: name, capital, small, sound, transliteration (the common academic, "Erasmian", pronunciation).
export const GREEK = [
  ['Alpha', 'Α', 'α', 'a as in "father"', 'a'], ['Beta', 'Β', 'β', 'b', 'b'], ['Gamma', 'Γ', 'γ', 'g as in "go" (ng before γ, κ, ξ, χ)', 'g'],
  ['Delta', 'Δ', 'δ', 'd', 'd'], ['Epsilon', 'Ε', 'ε', 'e as in "bed"', 'e'], ['Zeta', 'Ζ', 'ζ', 'dz as in "adze"', 'z'],
  ['Eta', 'Η', 'η', 'e as in "they"', 'ē'], ['Theta', 'Θ', 'θ', 'th as in "think"', 'th'], ['Iota', 'Ι', 'ι', 'i as in "machine" or "bit"', 'i'],
  ['Kappa', 'Κ', 'κ', 'k', 'k'], ['Lambda', 'Λ', 'λ', 'l', 'l'], ['Mu', 'Μ', 'μ', 'm', 'm'], ['Nu', 'Ν', 'ν', 'n', 'n'],
  ['Xi', 'Ξ', 'ξ', 'x as in "box"', 'x'], ['Omicron', 'Ο', 'ο', 'o as in "pot"', 'o'], ['Pi', 'Π', 'π', 'p', 'p'],
  ['Rho', 'Ρ', 'ρ', 'r (rolled)', 'r'], ['Sigma', 'Σ', 'σ ς', 's (ς is used at the end of a word)', 's'], ['Tau', 'Τ', 'τ', 't', 't'],
  ['Upsilon', 'Υ', 'υ', 'like French "u" or German "ü"', 'u / y'], ['Phi', 'Φ', 'φ', 'f', 'ph'], ['Chi', 'Χ', 'χ', 'ch as in Scottish "loch"', 'ch'],
  ['Psi', 'Ψ', 'ψ', 'ps as in "lips"', 'ps'], ['Omega', 'Ω', 'ω', 'o as in "tone"', 'ō'],
];
export const GRK_EXTRA = [
  ['αι', 'ai as in "aisle"', 'ai'], ['ει', 'ei as in "eight"', 'ei'], ['οι', 'oi as in "oil"', 'oi'], ['ου', 'oo as in "soup"', 'ou'],
  ['αυ', 'ow as in "how"', 'au'], ['ευ', 'eu, like "feud" without the f', 'eu'], ['γγ', 'ng as in "angle" (ἄγγελος, angelos)', 'ng'],
];
export const BREATHING = [
  ['ἁ', 'Rough breathing (῾): add an h sound at the start of the word. ὁ is "ho", ἁμαρτία is "hamartia".', 'h'],
  ['ἀ', 'Smooth breathing (᾿): no extra sound. ἀγάπη is "agapē".', '(none)'],
  ['ῥ', 'A word that starts with rho always has rough breathing, written "rh": ῥῆμα is "rhēma".', 'rh'],
];

// ---------- read aloud (English only: Hebrew and Greek script is skipped, the transliteration is read instead) ----------
export const ttsOK = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
export const ttsPrefs = () => ({ voice: '', rate: 1, auto: true, ...(store.json('nc.tts', {}) || {}) });
// iPhones only allow speech that starts from a tap: a silent utterance during the tap unlocks the later spoken reply.
export function primeSpeech() { if (!ttsOK()) return; try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) { /* not supported */ } }
export const setTtsPrefs = (p) => store.setJson('nc.tts', { ...ttsPrefs(), ...p });
export function englishVoices() {
  if (!ttsOK()) return [];
  return speechSynthesis.getVoices().filter((v) => /^en([-_]|$)/i.test(v.lang)).sort((a, b) => (b.localService - a.localService) || a.name.localeCompare(b.name));
}
export function speakable(text) {
  return String(text)
    .replace(/[֐-׿יִ-ﭏ]+/g, ' ')                 // Hebrew letters, vowel marks and accents
    .replace(/[Ͱ-Ͽἀ-῿][̀-ͯͰ-Ͽἀ-῿]*/g, ' ') // Greek letters and accents
    .replace(/\(\s*([^()]*?)\s*\)/g, ', $1,')                        // "(chesed)" becomes ", chesed,"
    .replace(/[*_#>`]+/g, ' ').replace(/\s*,\s*,+/g, ',').replace(/^[\s,]+/gm, '').replace(/[ \t]+/g, ' ').trim();
}
let speakingId = null;
export const speaking = () => speakingId;
export function stopSpeaking() { if (ttsOK()) speechSynthesis.cancel(); speakingId = null; }
// Speaks text in short sentence-sized pieces (long single utterances stop early on some Android phones).
export function speak(text, id, onEnd) {
  if (!ttsOK()) return false;
  stopSpeaking();
  const p = ttsPrefs(); const voices = englishVoices(); const v = voices.find((x) => x.voiceURI === p.voice) || voices[0] || null;
  const parts = speakable(text).split(/(?<=[.!?:;])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
  if (!parts.length) return false;
  speakingId = id;
  parts.forEach((s, i) => {
    const u = new SpeechSynthesisUtterance(s); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-ZA';
    u.rate = Math.min(1.5, Math.max(0.6, Number(p.rate) || 1));
    if (i === parts.length - 1) u.onend = () => { if (speakingId === id) { speakingId = null; onEnd && onEnd(); } };
    u.onerror = () => { if (speakingId === id) { speakingId = null; onEnd && onEnd(); } };
    speechSynthesis.speak(u);
  });
  return true;
}
if (ttsOK()) { try { speechSynthesis.getVoices(); } catch (e) { /* voices load later */ } }

// ---------- voice input (only where the browser supports it) ----------
export const micOK = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);
export function listenOnce(onText, onState) {
  const R = window.SpeechRecognition || window.webkitSpeechRecognition; if (!R) return null;
  const rec = new R(); rec.lang = /^en/i.test(navigator.language || '') ? navigator.language : 'en-ZA';
  rec.interimResults = false; rec.maxAlternatives = 1;
  rec.onresult = (e) => { const t = Array.from(e.results).map((r) => r[0].transcript).join(' ').trim(); if (t) onText(t); };
  rec.onerror = (e) => onState && onState('error', e.error); rec.onend = () => onState && onState('end');
  try { rec.start(); onState && onState('start'); } catch (e) { onState && onState('error', e.message); return null; }
  return rec;
}

// ---------- displaying teacher replies ----------
// Escapes everything, then adds paragraphs, simple lists and bold, and marks Hebrew and Greek so they use the right font and direction.
export function richText(text) {
  const mark = (s) => s
    .replace(/([֐-׿יִ-ﭏ][֐-׿יִ-ﭏ\s־־]*[֐-׿יִ-ﭏ]|[֐-׿יִ-ﭏ])/g, '<span class="wscript he" lang="he" dir="rtl">$1</span>')
    .replace(/([Ͱ-Ͽἀ-῿][̀-ͯͰ-Ͽἀ-῿\s]*[Ͱ-Ͽἀ-῿̀-ͯ]|[Ͱ-Ͽἀ-῿])/g, '<span class="wscript grc" lang="grc">$1</span>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  return String(text).trim().split(/\n{2,}/).map((block) => {
    const lines = block.split('\n');
    if (lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l))) {
      const ol = /^\s*\d/.test(lines[0]);
      return `<${ol ? 'ol' : 'ul'}>${lines.map((l) => `<li>${mark(esc(l.replace(/^\s*([-*•]|\d+[.)])\s+/, '')))}</li>`).join('')}</${ol ? 'ol' : 'ul'}>`;
    }
    return `<p>${lines.map((l) => mark(esc(l.replace(/^#+\s*/, '')))).join('<br>')}</p>`;
  }).join('');
}
