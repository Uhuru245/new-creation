// Listen and learn: spoken lessons for the Words tab. Lessons are built from the approved word studies,
// the alphabet tables and the Berean Standard Bible text already in the app; nothing is generated at play time.
// Speech uses the phone's own English voice (Hebrew and Greek are read by their English spelling).
import { S, privItem, setPriv } from './state.js';
import { parseRef, loadChapter } from './bible.js';
import * as WB from './words.js';

const chunk = (a, n) => { const out = []; for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n)); return out; };
const spokenTr = (tr) => (/said "([^"]+)"/.exec(tr) || [])[1] || String(tr).split(' (')[0].replace(/\s*\/\s*/g, ' or ').replace(/[ʾʿ]/g, '').trim();
const say = (text, show = {}, pause = 900) => ({ say: text, show, pause });

// ---------- the lesson list ----------
export function lessonList(words = WB.wordsSoFar()) {
  const L = [];
  words.forEach((w) => L.push({ id: `w${w.day}`, kind: 'word', title: `${w.translit}`, sub: `${w.language} word · ${w.ref}`, w, mins: 3 }));
  const he = chunk(WB.HEBREW, 6), gr = chunk(WB.GREEK, 6);
  he.forEach((g, i) => L.push({ id: `he${i + 1}`, kind: 'letters', lang: 'he', group: g, title: `Hebrew letters ${i + 1}: ${g[0][0]} to ${g[g.length - 1][0]}`, sub: `${g.length} letters`, mins: 3 }));
  L.push({ id: 'hev', kind: 'vowels', lang: 'he', title: 'Hebrew vowel marks', sub: `${WB.HEB_VOWELS.length} marks`, mins: 3 });
  gr.forEach((g, i) => L.push({ id: `gr${i + 1}`, kind: 'letters', lang: 'grc', group: g, title: `Greek letters ${i + 1}: ${g[0][0]} to ${g[g.length - 1][0]}`, sub: `${g.length} letters`, mins: 3 }));
  L.push({ id: 'grx', kind: 'pairs', lang: 'grc', title: 'Greek letter pairs and breathing marks', sub: 'Diphthongs, γγ and breathing', mins: 3 });
  return L;
}
export const doneSet = () => { const it = privItem('lang', 'lessons'); return new Set((it && it.data && it.data.done) || []); };
export function markDone(id) { const d = doneSet(); if (d.has(id)) return Promise.resolve(); d.add(id); return setPriv('lang', 'lessons', { done: [...d] }); }

// ---------- the script for each lesson ----------
export async function buildSteps(lesson) {
  if (lesson.kind === 'word') return wordSteps(lesson.w);
  if (lesson.kind === 'letters') return letterSteps(lesson);
  if (lesson.kind === 'vowels') return vowelSteps();
  return pairSteps();
}
async function wordSteps(w) {
  const show = { big: w.word, lang: w.lang }; const gloss = WB.firstGloss(w); const tr = spokenTr(w.translit);
  const steps = [say(`Welcome. In this lesson you will learn the ${w.language} word ${tr}, from ${w.ref}.`, { ...show, caption: w.ref })];
  const r = parseRef(w.ref);
  if (r) {
    const verse = await loadChapter('bsb', r.b, r.c).then((c) => c[(r.v || 1) - 1] || '').catch(() => '');
    if (verse) steps.push(say(`First, listen to the verse in the Berean Standard Bible. ${w.ref}. ${verse}`, { text: verse, caption: `${w.ref} (BSB)` }, 1400));
  }
  steps.push(
    say(`In ${w.language}, the word is ${tr}.`, { ...show, caption: w.translit }, 1200),
    say(`Say it with me. ${tr}.`, { ...show, caption: 'Say it out loud' }, 2400),
    say(`Once more. ${tr}.`, { ...show, caption: 'Say it out loud' }, 2400),
    say(`How English Bibles translate it: ${w.english}.`, { ...show, caption: w.english }, 1200),
    say(`What it means. ${w.meaning}`, { ...show, text: w.meaning, caption: 'What it means' }, 1400),
    say(`Quick check. What does ${tr} mean? Think of your answer.`, { ...show, caption: 'Think of your answer' }, 4500),
    say(`${tr} means ${gloss}. Well done.`, { ...show, caption: `${w.translit}: ${gloss}` }, 1000),
    say(`To finish, one more time. ${tr}, meaning ${gloss}. Look out for it in your reading, and ask the teacher if you would like to go deeper.`, { ...show, caption: `${w.translit}: ${gloss}` }, 600),
  );
  return steps;
}
function letterSteps(l) {
  const he = l.lang === 'he'; const glyph = (x) => (he ? x[1] : `${x[1]} ${x[2].split(' ')[0]}`);
  const steps = [say(he ? `Welcome to ${l.title}. Hebrew is read from right to left, and every letter is a consonant. Listen, look at each letter, and say its name out loud.`
    : `Welcome to ${l.title}. Greek is read from left to right, and each letter has a capital and a small form. Listen, look at each letter, and say its name out loud.`, { caption: l.title })];
  l.group.forEach((x) => {
    const tr = spokenTr(he ? x[4] : x[4]);
    steps.push(say(`This letter is ${x[0]}. ${x[0]}.`, { big: glyph(x), lang: l.lang, caption: x[0] }, 1500));
    steps.push(say(`It sounds like ${x[3]}.${tr ? ` In English letters it is written ${tr}.` : ''}${he && x[2] ? ` At the end of a word it changes shape.` : ''}`, { big: glyph(x) + (he && x[2] ? `  ${x[2]}` : ''), lang: l.lang, caption: `${x[0]} · ${x[4]}` }, 1500));
  });
  steps.push(say("Now let's review. When you see the letter, say its name before I do.", { caption: 'Review' }, 800));
  [...l.group].sort(() => Math.random() - 0.5).forEach((x) => {
    steps.push(say('What is this letter?', { big: glyph(x), lang: l.lang, caption: 'Say its name' }, 3200));
    steps.push(say(`${x[0]}.`, { big: glyph(x), lang: l.lang, caption: x[0] }, 900));
  });
  steps.push(say(`Well done. You have finished ${l.title}. Practise these letters again with the flashcards in Practice.`, { caption: 'Lesson complete' }, 300));
  return steps;
}
function vowelSteps() {
  const steps = [say('Welcome to Hebrew vowel marks. Hebrew letters are consonants. Small marks under, over or beside a letter show the vowel. We will use the letter Bet, which sounds like b, to hear each one.', { big: 'ב', lang: 'he', caption: 'Bet' })];
  WB.HEB_VOWELS.forEach((v) => steps.push(say(`${v[0]}. It sounds like ${v[2]}.`, { big: v[1], lang: 'he', caption: `${v[0]} · ${v[3]}` }, 1700)));
  steps.push(say('One more thing. A dot inside a letter, called a dagesh, can double the letter, or turn v, k h and f into b, k and p.', { big: 'בּ', lang: 'he', caption: 'Dagesh' }, 1000));
  steps.push(say('Well done. You have finished the Hebrew vowel marks. Look for them in the words on your word cards.', { caption: 'Lesson complete' }, 300));
  return steps;
}
function pairSteps() {
  const steps = [say('Welcome. Some Greek letters are read together as one sound. These are called diphthongs. Listen and say each one.', { caption: 'Greek letter pairs' })];
  WB.GRK_EXTRA.forEach((v) => steps.push(say(`These letters together sound like ${v[1]}. Written ${v[2]}.`, { big: v[0], lang: 'grc', caption: v[2] }, 1700)));
  steps.push(say('Breathing marks. A word that starts with a vowel has a small mark over its first letter.', { caption: 'Breathing marks' }, 800));
  WB.BREATHING.forEach((v) => steps.push(say(v[1], { big: v[0], lang: 'grc', caption: v[2] }, 1700)));
  steps.push(say('Well done. You have finished Greek letter pairs and breathing marks.', { caption: 'Lesson complete' }, 300));
  return steps;
}

// ---------- the player ----------
// Speaks one step at a time, pauses for repetition, and moves on by itself. Stops cleanly when the page changes.
export function createPlayer(steps, { onStep, onEnd } = {}) {
  let i = 0, playing = false, timer = null, token = 0;
  const run = () => {
    if (!playing) return;
    if (i >= steps.length) { playing = false; onStep && onStep(i, false); onEnd && onEnd(); return; }
    const t = ++token; onStep && onStep(i, true);
    const done = () => { if (t !== token || !playing) return; timer = setTimeout(() => { if (t !== token || !playing) return; i++; run(); }, steps[i].pause || 800); };
    if (!WB.ttsOK()) { timer = setTimeout(done, 2500); return; }
    WB.speak(steps[i].say, 'lesson' + t, done);
  };
  return {
    play() { if (playing) return; if (i >= steps.length) i = 0; playing = true; WB.primeSpeech(); run(); },
    pause() { playing = false; token++; clearTimeout(timer); WB.stopSpeaking(); onStep && onStep(i, false); },
    next() { const was = playing; this.pause(); i = Math.min(steps.length - 1, i + 1); onStep && onStep(i, false); if (was) this.play(); },
    prev() { const was = playing; this.pause(); i = Math.max(0, i - 1); onStep && onStep(i, false); if (was) this.play(); },
    stop() { this.pause(); },
    get index() { return i; }, get playing() { return playing; }, length: steps.length,
  };
}
void S;
