// The Word Behind the Word: today's word, progress, the Hebrew and Greek alphabets, and practice (flashcards and quizzes).
import { $, $$, esc, icon, toast, sheet, closeSheet } from '../util.js';
import { call } from '../api.js';
import { S } from '../state.js';
import { go } from '../app.js';
import * as WB from '../words.js';

export const title = (r) => ({ alphabet: 'Alphabet', practice: 'Practice' }[r.parts[0]] || 'The Word Behind the Word');
let data = null;

// ---------- the word card (also used on Today) ----------
export function wordCard(w, { today = true, compact = false } = {}) {
  if (!w) return '';
  const learned = WB.isLearned(w); const draft = w.status && w.status !== 'Approved';
  return `<section class="card wordcard" aria-labelledby="wc${w.day}">
    ${draft ? `<div class="row wrap"><span class="pill gold">Draft · only you can see this</span><button class="btn sm primary" data-wapprove="${w.day}">Approve for everyone</button></div>` : ''}
    <div class="card-head"><p class="eyebrow">${today ? "Today's word" : `Word for day ${w.day}`} · ${esc(w.language)}</p><span class="pill">${esc(w.ref)}</span></div>
    <p class="${WB.scriptCls(w.lang)} big" ${WB.scriptAttrs(w.lang)} id="wc${w.day}">${esc(w.word)}</p>
    <p class="translit"><i>${esc(w.translit)}</i></p>
    <dl class="kv"><dt>English Bibles</dt><dd>${esc(w.english)}</dd>${compact ? '' : `<dt>Strong's</dt><dd>${esc(w.strongs)}</dd>`}</dl>
    <p>${esc(w.meaning)}</p>
    <div class="btns"><button class="btn ${learned ? '' : 'primary'}" data-wlearn="${w.day}" aria-pressed="${learned}">${icon('check')} ${learned ? 'Learned' : 'Mark as learned'}</button>
      <a class="btn" href="#/teacher?day=${w.day}">${icon('chat')} Ask the Teacher about this word</a></div>
    ${compact ? `<a class="link small" href="#/words">More: alphabet, practice and your progress ${icon('next', 'ico sm')}</a>` : ''}
    <p class="faint small">Explanation drafted with AI assistance and checked against standard lexicons by the New Creation team. Compare it with an interlinear such as STEP Bible.</p>
  </section>`;
}
export function summaryHtml() {
  const s = WB.summary();
  return `<div class="stats four"><div class="stat"><b>${s.learned}</b><span>words learned</span></div><div class="stat"><b>${s.letters}<small>/${s.lettersTotal}</small></b><span>letters known</span></div>
    <div class="stat"><b>${s.bestPct == null ? '–' : s.bestPct + '%'}</b><span>best quiz</span></div><div class="stat"><b>${s.convs}</b><span>teacher chats</span></div></div>`;
}
export function bindWordCard(root, words, after) {
  $$('[data-wlearn]', root).forEach((b) => b.onclick = async () => {
    const w = words.find((x) => String(x.day) === b.dataset.wlearn); if (!w) return; const on = !WB.isLearned(w);
    WB.setLearned(w, on).catch((e) => toast(e.message)); toast(on ? `${w.translit} added to your learned words.` : `${w.translit} moved back to learning.`); after();
  });
  $$('[data-wapprove]', root).forEach((b) => b.onclick = async () => {
    b.disabled = true; b.textContent = 'Approving…';
    try { const r = await call('wordApprove', S.token, Number(b.dataset.wapprove)); Object.assign(WB.cached() || {}, r); toast('Approved. Members will see it on its day.'); after(); }
    catch (e) { toast(e.message); b.disabled = false; }
  });
}

// ---------- pages ----------
export async function render(r) {
  WB.wordFonts();
  data = WB.cached(); const page = r.parts[0];
  if (!data) { try { data = await WB.loadWords(); } catch (e) { return `<h1>The Word Behind the Word</h1><div class="empty">${icon('original')}<p>${esc(/Unknown request/.test(e.message) ? 'Word study is not switched on yet. Please check back soon.' : e.message)}</p><button class="btn" onclick="location.reload()">Try again</button></div>`; } }
  // Refresh in the background (at most once a minute); only the overview repaints, so a quiz in progress is never reset.
  else if (WB.stale()) WB.loadWords().then((x) => { data = x; if (!page && /^#\/words\/?$/.test(location.hash)) go(location.hash); }).catch(() => {});
  if (page === 'alphabet') return alphabetPage(r);
  if (page === 'practice') return practicePage(r);
  return overview();
}

function overview() {
  const t = WB.todayWord(data); const main = S.data.challenge.plan === 'bible93';
  const list = data.words.filter((w) => !t || w.day !== t.w.day);
  const lead = S.data.me.leader;
  return `<div class="stack-sm"><p class="eyebrow">Original languages</p><h1>The Word Behind the Word</h1><p class="muted">${esc(WB.PROMISE)}</p></div>
    ${main ? (t ? wordCard(t.w, { today: t.today }) : `<section class="card"><p class="eyebrow">Today's word</p><p class="muted">The first word study will appear here soon.</p></section>`)
      : `<section class="card"><p class="muted">Daily words follow the Genesis to Revelation journey. You can still use the alphabet, practice and the teacher.</p></section>`}
    <section class="card" aria-labelledby="wpT"><h3 id="wpT">Your progress</h3>${summaryHtml()}</section>
    <div class="tiles">
      <a class="tile" href="#/teacher">${icon('chat')}<b>Ask the Teacher</b><span>Ask about any word, verse or translation</span></a>
      <a class="tile" href="#/words/alphabet?l=he">${icon('original')}<b>Alphabet</b><span>Hebrew and Greek letters</span></a>
      <a class="tile" href="#/words/practice">${icon('check')}<b>Practice</b><span>Flashcards and quizzes</span></a>
    </div>
    ${list.length ? `<section class="card"><h3>${lead ? 'All word studies (you see drafts and future days)' : 'Words so far'}</h3><div class="list-plain">${list.map((w) => `
      <button class="itemlink" data-open="${w.day}"><span class="grow"><b class="${WB.scriptCls(w.lang)}" ${WB.scriptAttrs(w.lang)}>${esc(w.word)}</b> <i class="small muted">${esc(w.translit)}</i>
        <span class="small faint" style="display:block">Day ${w.day} · ${esc(w.ref)} · ${esc(WB.firstGloss(w))}${w.status && w.status !== 'Approved' ? ' · <span class="pill gold">Draft</span>' : ''}</span></span>
        ${WB.isLearned(w) ? `<span class="pill ok">${icon('check', 'ico sm')} Learned</span>` : ''}${icon('next')}</button>`).join('')}</div></section>` : ''}`;
}

function alphabetPage(r) {
  const l = r.q.get('l') === 'grc' ? 'grc' : 'he'; const known = new Set(WB.lettersKnown()[l] || []);
  const seg = `<div class="seg" role="group" aria-label="Alphabet"><button aria-pressed="${l === 'he'}" data-l="he">Hebrew</button><button aria-pressed="${l === 'grc'}" data-l="grc">Greek</button></div>`;
  const letters = l === 'he' ? WB.HEBREW : WB.GREEK;
  const grid = `<div class="letters ${l}" ${l === 'he' ? 'dir="rtl"' : ''}>${letters.map((x, i) => `<button class="letter${known.has(x[0]) ? ' known' : ''}" data-i="${i}" aria-label="${esc(x[0])}${known.has(x[0]) ? ', known' : ''}">
      <span class="${WB.scriptCls(l)}" ${WB.scriptAttrs(l)}>${l === 'he' ? x[1] : `${x[1]} ${x[2].split(' ')[0]}`}</span><b>${esc(x[0])}</b><small>${esc(x[4])}</small></button>`).join('')}</div>`;
  const he = `<p class="muted small">Hebrew is read from right to left, so the alphabet starts at the top right. There are 22 letters, all consonants; vowels were added later as small marks above and below the letters.</p>${grid}
    <section class="card"><h3>Five letters change shape at the end of a word</h3><div class="finals">${WB.HEBREW.filter((x) => x[2]).map((x) => `<div class="final"><b>${esc(x[0])}</b><span><span class="wscript he" lang="he">${x[1]}</span><small>usual</small></span><span><span class="wscript he" lang="he">${x[2]}</span><small>at the end</small></span></div>`).join('')}</div>
      <p class="small muted">Example: מֶלֶךְ (melekh, "king") ends with final kaf ך.</p></section>
    <section class="card"><h3>Vowel marks</h3><p class="small muted">Shown here on the letter bet (ב). The marks sit under, above or beside the letter, and the letter is said first, then the vowel: בַ is "ba".</p>
      <dl class="vowels">${WB.HEB_VOWELS.map((v) => `<dt><span class="wscript he" lang="he" dir="rtl">${v[1]}</span></dt><dd><b>${esc(v[0])}</b> · ${esc(v[2])} <i class="faint">(${esc(v[3])})</i></dd>`).join('')}</dl>
      <p class="small faint">A dot inside a letter (dagesh) can double it, or turn v, kh and f into b, k and p.</p></section>`;
  const gr = `<p class="muted small">Greek is read from left to right. There are 24 letters, with capital and small forms. Many will look familiar from mathematics and science.</p>${grid}
    <section class="card"><h3>Letter pairs (diphthongs) and γγ</h3><dl class="vowels">${WB.GRK_EXTRA.map((v) => `<dt><span class="wscript grc" lang="grc">${v[0]}</span></dt><dd>${esc(v[1])} <i class="faint">(${esc(v[2])})</i></dd>`).join('')}</dl></section>
    <section class="card"><h3>Breathing marks</h3><p class="small muted">A word that starts with a vowel has a small mark over its first letter.</p><dl class="vowels">${WB.BREATHING.map((v) => `<dt><span class="wscript grc" lang="grc">${v[0]}</span></dt><dd>${esc(v[1])}</dd>`).join('')}</dl></section>
    <p class="small faint">Sounds follow the pronunciation used in most Bible colleges. Modern Greek is pronounced differently, and both are fine.</p>`;
  return `<div class="stack-sm"><p class="eyebrow">The Word Behind the Word</p><h1>${l === 'he' ? 'Hebrew' : 'Greek'} alphabet</h1></div>${seg}
    <p class="small muted">Tap a letter to see how it sounds and mark it as known. You know ${known.size} of ${letters.length}.</p>
    ${l === 'he' ? he : gr}
    <a class="btn primary block" href="#/words/practice?set=${l}">${icon('check')} Practise the ${l === 'he' ? 'Hebrew' : 'Greek'} letters</a>`;
}

// ---------- practice ----------
function items(set) {
  if (set === 'he') return WB.HEBREW.map((x) => ({ id: x[0], front: x[1], lang: 'he', answer: x[0], back: `${x[0]} · ${x[3]}`, tr: x[4], known: (WB.lettersKnown().he || []).includes(x[0]) }));
  if (set === 'grc') return WB.GREEK.map((x) => ({ id: x[0], front: `${x[1]} ${x[2].split(' ')[0]}`, lang: 'grc', answer: x[0], back: `${x[0]} · ${x[3]}`, tr: x[4], known: (WB.lettersKnown().grc || []).includes(x[0]) }));
  return WB.wordsSoFar(data).map((w) => ({ id: `${w.day}|${w.word}`, w, front: w.word, lang: w.lang, answer: WB.firstGloss(w), back: `${WB.firstGloss(w)} · ${w.ref}`, tr: w.translit, known: WB.isLearned(w) }));
}
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// Items not yet known come first; known ones are mixed in afterwards for review.
const ordered = (list) => shuffle(list.filter((x) => !x.known)).concat(shuffle(list.filter((x) => x.known)));
let P = null; // practice session state

function practicePage(r) {
  const set = ['he', 'grc', 'words'].includes(r.q.get('set')) ? r.q.get('set') : 'words';
  const mode = r.q.get('mode') === 'quiz' ? 'quiz' : 'cards';
  const list = items(set); const label = { he: 'Hebrew letters', grc: 'Greek letters', words: 'Words' }[set];
  const seg = (k, v, cur, l) => `<button aria-pressed="${cur === v}" data-${k}="${v}">${l}</button>`;
  const head = `<div class="stack-sm"><p class="eyebrow">The Word Behind the Word</p><h1>Practice</h1></div>
    <div class="seg" role="group" aria-label="What to practise">${seg('set', 'words', set, 'Words')}${seg('set', 'he', set, 'Hebrew')}${seg('set', 'grc', set, 'Greek')}</div>
    <div class="seg" role="group" aria-label="How to practise">${seg('mode', 'cards', mode, 'Flashcards')}${seg('mode', 'quiz', mode, 'Quiz')}</div>`;
  if (list.length < (mode === 'quiz' ? 4 : 1)) return `${head}<div class="empty">${icon('original')}<p>${set === 'words' ? `Quizzes need at least 4 words, and you have ${list.length} so far. New words arrive with the reading plan; meanwhile, try the letters.` : 'Nothing to practise yet.'}</p></div>`;
  P = { set, mode, label, list, deck: ordered(list), i: 0, score: 0, answered: false, flipped: false };
  if (mode === 'quiz') P.deck = P.deck.slice(0, Math.min(10, P.deck.length));
  const s = WB.quizStats()[set];
  return `${head}<p class="small muted">${esc(label)}: ${list.filter((x) => !x.known).length} still to learn, ${list.filter((x) => x.known).length} known.${s ? ` Best quiz: ${s.best} of ${s.total}.` : ''} New and not-yet-known items come first.</p><div id="pr"></div>`;
}
function paintCard(root) {
  const box = $('#pr', root); if (!box || !P) return;
  if (P.i >= P.deck.length) { box.innerHTML = `<section class="card center"><h3>Deck finished</h3><p class="muted">You went through ${P.deck.length} card${P.deck.length === 1 ? '' : 's'}.</p><button class="btn primary" id="again">Go again</button></section>`; $('#again', box).onclick = () => go(location.hash); return; }
  const x = P.deck[P.i];
  box.innerHTML = `<p class="small faint">Card ${P.i + 1} of ${P.deck.length}</p>
    <button class="flash${P.flipped ? ' flipped' : ''}" id="flip" aria-label="${P.flipped ? 'Answer shown. Tap to see the front again.' : 'Tap to see the answer'}">
      <span class="face front"><span class="${WB.scriptCls(x.lang)} big" ${WB.scriptAttrs(x.lang)}>${esc(x.front)}</span><small>Tap to flip</small></span>
      <span class="face back"><span class="${WB.scriptCls(x.lang)}" ${WB.scriptAttrs(x.lang)}>${esc(x.front)}</span><i>${esc(x.tr)}</i><b>${esc(x.back)}</b></span></button>
    <div class="btns"><button class="btn" id="still">Still learning</button><button class="btn primary" id="know">${icon('check')} I know this</button></div>`;
  $('#flip', box).onclick = () => { P.flipped = !P.flipped; paintCard(root); };
  $('#still', box).onclick = () => { P.i++; P.flipped = false; paintCard(root); };
  $('#know', box).onclick = () => {
    if (!x.known) { x.known = true; if (P.set === 'words') WB.setLearned(x.w, true).catch(() => {}); else WB.setLetterKnown(P.set, x.id, true).catch(() => {}); }
    P.i++; P.flipped = false; paintCard(root);
  };
}
function paintQuiz(root) {
  const box = $('#pr', root); if (!box || !P) return;
  if (P.i >= P.deck.length) {
    WB.saveQuiz(P.set, P.score, P.deck.length).catch(() => {});
    box.innerHTML = `<section class="card center"><p class="eyebrow">Quiz complete</p><h3>${P.score} of ${P.deck.length}</h3><p class="muted">${P.score === P.deck.length ? 'Every one right. Well done.' : P.score >= P.deck.length * 0.7 ? 'Good work. A little more practice and these will stick.' : 'Every attempt helps. Try the flashcards, then come back.'}</p>
      <div class="btns"><button class="btn primary" id="again">Try another quiz</button><a class="btn" href="#/teacher?ask=quiz">${icon('chat')} Ask the Teacher to quiz me</a></div></section>`;
    $('#again', box).onclick = () => go(location.hash); return;
  }
  const x = P.deck[P.i];
  if (!x.opts) { const others = shuffle(P.list.filter((y) => y.answer !== x.answer).map((y) => y.answer)); x.opts = shuffle([x.answer, ...[...new Set(others)].slice(0, 3)]); }
  box.innerHTML = `<p class="small faint">Question ${P.i + 1} of ${P.deck.length} · ${P.score} right so far</p>
    <section class="card center"><p class="muted small">${P.set === 'words' ? 'What does this word mean?' : 'What is this letter called?'}</p><p class="${WB.scriptCls(x.lang)} big" ${WB.scriptAttrs(x.lang)}>${esc(x.front)}</p>${P.set === 'words' ? `<p><i>${esc(x.tr)}</i></p>` : ''}</section>
    <div class="opts" role="group" aria-label="Choose an answer">${x.opts.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join('')}</div><div id="qfb" aria-live="polite"></div>`;
  $$('.opt', box).forEach((b) => b.onclick = () => {
    if (P.answered) return; P.answered = true; const pick = x.opts[Number(b.dataset.k)], ok = pick === x.answer; if (ok) P.score++;
    $$('.opt', box).forEach((o) => { const v = x.opts[Number(o.dataset.k)]; o.disabled = true; if (v === x.answer) o.classList.add('right'); else if (o === b) o.classList.add('wrong'); });
    $('#qfb', box).innerHTML = `<p class="${ok ? 'ok-text' : 'muted'}">${ok ? 'Right.' : `Not quite. It is <b>${esc(x.answer)}</b>.`} ${esc(x.back)}${x.tr ? ` (${esc(x.tr)})` : ''}</p><button class="btn primary block" id="nextq">${P.i + 1 < P.deck.length ? 'Next question' : 'See my score'}</button>`;
    $('#nextq', box).onclick = () => { P.i++; P.answered = false; paintQuiz(root); }; $('#nextq', box).focus();
  });
}

export function mount(root, r) {
  const page = r.parts[0];
  const rerender = () => go(location.hash);
  if (!page) {
    bindWordCard(root, data.words, rerender);
    $$('[data-open]', root).forEach((b) => b.onclick = () => {
      const w = data.words.find((x) => String(x.day) === b.dataset.open);
      const s = sheet(`<div class="card-head"><h3>Day ${w.day}</h3><button class="icon-btn" id="wsClose" aria-label="Close">${icon('close')}</button></div>${wordCard(w, { today: false })}`, { label: `Word for day ${w.day}` });
      $('#wsClose', s).onclick = closeSheet; bindWordCard(s, data.words, () => { closeSheet(); rerender(); });
    });
  }
  if (page === 'alphabet') {
    const l = r.q.get('l') === 'grc' ? 'grc' : 'he'; const letters = l === 'he' ? WB.HEBREW : WB.GREEK;
    $$('[data-l]', root).forEach((b) => b.onclick = () => go(`#/words/alphabet?l=${b.dataset.l}`));
    $$('.letter', root).forEach((b) => b.onclick = () => {
      const x = letters[Number(b.dataset.i)]; const known = (WB.lettersKnown()[l] || []).includes(x[0]);
      const s = sheet(`<div class="card-head"><h3>${esc(x[0])}</h3><button class="icon-btn" id="lClose" aria-label="Close">${icon('close')}</button></div>
        <p class="${WB.scriptCls(l)} huge" ${WB.scriptAttrs(l)}>${l === 'he' ? x[1] + (x[2] ? ' ' + x[2] : '') : x[1] + ' ' + x[2]}</p>
        <dl class="kv"><dt>Sound</dt><dd>${esc(x[3])}</dd><dt>Written in English as</dt><dd>${esc(x[4])}</dd>${l === 'he' && x[2] ? `<dt>At the end of a word</dt><dd><span class="wscript he" lang="he">${x[2]}</span></dd>` : ''}</dl>
        <button class="btn ${known ? '' : 'primary'} block" id="lKnow" aria-pressed="${known}">${icon('check')} ${known ? 'Known (tap to undo)' : 'I know this letter'}</button>`, { label: x[0] });
      $('#lClose', s).onclick = closeSheet;
      $('#lKnow', s).onclick = async () => { await WB.setLetterKnown(l, x[0], !known).catch(() => {}); closeSheet(); rerender(); };
    });
  }
  if (page === 'practice') {
    const q = new URLSearchParams(location.hash.split('?')[1] || '');
    $$('[data-set]', root).forEach((b) => b.onclick = () => { q.set('set', b.dataset.set); go(`#/words/practice?${q}`); });
    $$('[data-mode]', root).forEach((b) => b.onclick = () => { q.set('mode', b.dataset.mode); go(`#/words/practice?${q}`); });
    if (P && P.mode === 'quiz') paintQuiz(root); else paintCard(root);
  }
}
export function onData() { /* word data refreshes itself; reading-plan updates don't change this page */ }
