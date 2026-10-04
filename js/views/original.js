// Original Languages: Hebrew/Aramaic or Greek text with word meanings, literal and natural English, context and sources.
import { $, $$, esc, icon, toast, sheet, closeSheet, store } from '../util.js';
import { S, privItem, setPriv } from '../state.js';
import { META, TRANSLATIONS, loadChapter, loadOriginal, loadLexEntry, bookName, chapterCount, isNT, parseRef, refLabel } from '../bible.js';
import * as morph from '../morph.js';
import { noteSheet } from './bible.js';
import { go } from '../app.js';

export const title = 'Original languages';
let st = null; // { b, c, v, data, words, sel }

function fontsOnce() {
  if (document.getElementById('origFonts')) return;
  const l = document.createElement('link'); l.id = 'origFonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+Hebrew:wght@400;600&family=Noto+Serif:ital,wght@0,400;0,600;1,400&display=swap';
  document.head.appendChild(l);
}
const cleanWord = (t) => String(t).replace(/\\/g, '').replace(/\//g, '');
const FW = new Set(['the','and','of','to','in','a','an','for','with','on','at','by','from','that','this','is','was','be','but','or','not','obj','he','she','it','they','we','you','i','who','which','as','so','then','also','into','upon']);
const isFunction = (g) => { const w = String(g).replace(/<[^>]*>|\[[^\]]*\]|[^A-Za-z ]/g, ' ').trim().toLowerCase().split(/\s+/).filter(Boolean); return !w.length || w.every((x) => FW.has(x)); };

function where(r) {
  if (r.parts[0] && META.codes.includes(r.parts[0])) return { b: r.parts[0], c: Math.min(Math.max(Number(r.parts[1]) || 1, 1), chapterCount(r.parts[0])), v: Number(r.parts[2]) || 1 };
  const p = store.json('nc.pos', null); if (p && META.codes.includes(p.b)) return { b: p.b, c: p.c, v: p.v || 1 };
  return { b: 'JHN', c: 1, v: 1 };
}
// Word-level comparison: marks words in `b` that are not matched in `a` (longest common subsequence).
function diffWords(a, b) {
  const A = a.split(/\s+/), B = b.split(/\s+/), n = A.length, m = B.length, norm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = norm(A[i]) === norm(B[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const keep = new Set(); let i = 0, j = 0; while (i < n && j < m) { if (norm(A[i]) === norm(B[j])) { keep.add(j); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
  return B.map((w, k) => (keep.has(k) ? esc(w) : `<ins>${esc(w)}</ins>`)).join(' ');
}

export async function render(r) {
  fontsOnce();
  const w = where(r); const nt = isNT(w.b);
  let data; try { data = await loadOriginal(w.b, w.c); }
  catch (e) { return `<h1>Original languages</h1><div class="empty">${icon('original')}<p>The original-language data for ${esc(refLabel(w.b, w.c))} could not load. ${navigator.onLine === false ? "You're offline and it isn't saved on this device yet." : 'Please try again.'}</p><button class="btn" onclick="location.reload()">Try again</button></div>`; }
  const nv = data.v.length; if (w.v > nv) w.v = nv;
  const words = (data.v[w.v - 1] || []).map((x, i) => ({ i, t: cleanWord(x[0]), x: x[1], g: x[2], s: x[3], m: x[4], p: x[5], k: x[6], ed: x[7], vr: x[8] }));
  // Greek: words whose type lacks "N" are not in the Nestle-Aland text most modern translations follow.
  words.forEach((wd) => { wd.notInNA = nt && !/N/.test(String(wd.k).toUpperCase()); });
  st = { ...w, data, words, sel: Number(r.q.get('w')) || words.findIndex((x) => !isFunction(x.g)) };
  if (st.sel < 0) st.sel = 0;
  const [bsb, kjv, web] = await Promise.all(['bsb', 'kjv', 'web'].map((t) => loadChapter(t, w.b, w.c).then((c) => c[w.v - 1] || '').catch(() => '')));
  const lang = data.lang === 'he' ? 'Hebrew' : 'Greek';
  const aram = data.lang === 'he' && words.some((x) => /^A/.test(x.p));
  const langLabel = aram ? 'Aramaic' : lang;
  const nVar = words.filter((x) => x.notInNA).length;
  const kq = data.lang === 'he' ? words.filter((x) => /^Q|K/.test(x.k) || x.vr) : [];
  const ref = refLabel(w.b, w.c, w.v);
  const ws = privItem('word', `${words[st.sel] && words[st.sel].m}@${w.b}.${w.c}.${w.v}`);
  const book = bookName(w.b); const intro = S.data.content && S.data.content.books && S.data.content.books[book];
  const studyDay = S.plan.days.find((d) => d.deep && d.deep.split(';').some((part) => { const q = parseRef(part.replace(/,.*$/, '')); return q && q.b === w.b && q.c === w.c; }));
  const study = studyDay && S.data.content && S.data.content.studies && S.data.content.studies[studyDay.n];
  const seenM = new Set(); const diffs = words.filter((x) => { if (!x.m || isFunction(x.g) || seenM.has(x.m)) return false; seenM.add(x.m); return true; });
  return `
  <div class="stack-sm"><p class="eyebrow">Original languages</p><h1>${esc(ref)}</h1>
    <p class="muted small">${esc(langLabel)} text · ${nt ? 'Greek New Testament (Tyndale House amalgamated text)' : 'Hebrew Bible (Leningrad Codex)'}</p></div>
  <div class="row wrap">
    <button class="refbtn" id="opick">${esc(ref)} ${icon('down')}</button>
    <button class="icon-btn" id="vPrev" aria-label="Previous verse" ${w.v <= 1 ? 'disabled' : ''}>${icon('back')}</button>
    <button class="icon-btn" id="vNext" aria-label="Next verse" ${w.v >= nv ? 'disabled' : ''}>${icon('next')}</button>
    <span class="spacer"></span><a class="btn sm" href="#/bible/${w.b}/${w.c}?v=${w.v}">${icon('bible')} Back to the verse</a>
  </div>
  <details class="card flat" ${store.get('nc.origIntro') ? '' : 'open'} id="oIntro"><summary style="cursor:pointer;font-weight:650">New to the original languages? Start here</summary>
    <div class="prose small muted" style="margin-top:8px">
      <p>The Old Testament was written mostly in Hebrew (with a few chapters in Aramaic), and the New Testament in Greek. We don't have the original handwritten documents. What we have are many careful later copies, which scholars compare to produce printed editions. This screen shows one of those editions.</p>
      <p>Follow the steps in order: tap a word to see what it means, read the word-by-word English, then the natural English, then the background. A word-by-word reading helps you see how the sentence is built. It is not a "hidden" or better meaning than a good translation.</p>
    </div></details>
  <nav class="flow" aria-label="Steps on this page"><a href="#o1">1 Original text</a><a href="#o2">2 Word meanings</a><a href="#o3">3 Literal English</a><a href="#o4">4 Natural English</a><a href="#o5">5 Context</a><a href="#o6">Ancient wording</a></nav>

  <section class="card" id="o1" aria-labelledby="o1h"><div class="card-head"><h3 id="o1h">1 · Original text</h3><span class="pill">${esc(langLabel)}</span></div>
    <div class="orig ${data.lang}" lang="${data.lang === 'he' ? (aram ? 'arc' : 'he') : 'grc'}" dir="${data.lang === 'he' ? 'rtl' : 'ltr'}" role="group" aria-label="${esc(langLabel)} words. Select a word to see its meaning.">
      ${words.map((x) => `<button class="w${x.notInNA ? ' var' : ''}" data-w="${x.i}" aria-pressed="${x.i === st.sel}" aria-label="${esc(x.x)}, ${esc(x.g)}"><span>${esc(x.t)}</span><span class="x">${esc(x.x)}</span></button>`).join('')}
    </div>
    <p class="small faint">Under each word is a transliteration: a way to sound it out in English letters. No verified audio recordings are available, so audio isn't offered.</p>
    ${nVar ? `<p class="small muted">* Words marked * appear in some manuscripts (often the later "Traditional" ones behind the King James Version) but not in the edition most modern translations follow. See "Ancient wording" below.</p>` : ''}
  </section>

  <section class="card wordpanel" id="o2" aria-live="polite" aria-labelledby="o2h"><h3 id="o2h">2 · Word meanings</h3><div id="wp"><div class="skeleton"></div></div></section>

  <section class="card" id="o3" aria-labelledby="o3h"><h3 id="o3h">3 · Literal English</h3>
    <p class="literal">${words.map((x) => `<span>${esc(String(x.g).replace(/[<>]/g, ''))}</span>`).join(' ')}</p>
    <p class="small faint">Each word's English gloss, in the original word order${data.lang === 'he' ? ' (read from right to left in Hebrew, shown here left to right)' : ''}. Words in angle brackets in the data, like the Hebrew object marker, have no English equivalent and are left plain.</p>
  </section>

  <section class="card" id="o4" aria-labelledby="o4h"><h3 id="o4h">4 · Natural English</h3>
    <div class="cmp">
      <p class="tr"><b>BSB · Berean Standard Bible</b>${esc(bsb)}</p>
      <p class="tr"><b>KJV · King James Version</b>${kjv ? diffWords(bsb, kjv) : '<span class="faint">Not available</span>'}</p>
      <p class="tr"><b>WEB · World English Bible</b>${web ? diffWords(bsb, web) : '<span class="faint">Not available</span>'}</p>
    </div>
    <p class="small faint">Highlighted words differ from the BSB. This comparison is automatic: it shows where the wording differs, but it doesn't explain why the translators chose differently.${nVar ? ' In this verse some differences come from the manuscripts each translation follows (see below).' : ''}</p>
  </section>

  <section class="card" id="o5" aria-labelledby="o5h"><h3 id="o5h">5 · Context</h3>
    ${intro ? `<div class="stack-sm"><p class="eyebrow">About ${esc(book)}</p><p><b>Who and when:</b> ${esc(intro.written)}</p><p><b>What it's about:</b> ${esc(intro.purpose)}</p><p><span class="label-ai">AI-assisted</span> <span class="small faint">Drafted with AI assistance and reviewed by your leader. No scholarly citations are attached.</span></p></div>` : ''}
    ${study && study.setting ? `<div class="stack-sm"><p class="eyebrow">The setting (Day ${studyDay.n} study)</p><p>${esc(study.setting)}</p><p><span class="label-ai">AI-assisted</span> <span class="small faint">From the daily study card, reviewed by your leader.</span></p></div>` : ''}
    ${!intro && !(study && study.setting) ? `<p class="muted">There are no reviewed historical notes for this passage yet. We don't write them automatically, because background claims need checked sources.</p>` : ''}
    <p class="small faint">Historical notes describe the setting. They are separate from the language evidence above, and from any church's interpretation.</p>
  </section>

  <section class="card" id="o6" aria-labelledby="o6h"><h3 id="o6h">Understanding the ancient wording</h3>
    <div class="stack-sm"><p class="eyebrow" style="color:var(--ink-3)">Meaning here, and meanings elsewhere</p>
      <p class="small muted">A word can have several meanings. The first gloss is how the editors understand it in this verse; the dictionary entry lists meanings the word can have in other places. Context decides which one applies.</p>
      <div class="list-plain" id="wmeanings">${diffs.slice(0, 10).map((x) => `<button class="itemlink" data-w="${x.i}"><span class="grow"><b dir="auto" class="${data.lang === 'he' ? 'lemma he' : 'lemma grc'}" style="font-size:18px">${esc(x.t)}</b><span>In this verse: “${esc(String(x.g).replace(/[<>]/g, ''))}” · tap for other meanings</span></span>${icon('next')}</button>`).join('')}</div></div>
    <div class="stack-sm"><p class="eyebrow" style="color:var(--ink-3)">Idioms and wordplay</p><p class="small muted">No verified notes on idioms or wordplay are available for this verse yet, so none are shown. We don't generate them.</p></div>
    <div class="stack-sm"><p class="eyebrow" style="color:var(--ink-3)">Manuscript differences</p>
      ${nt ? (nVar ? `<p class="small">In this verse, ${nVar} word${nVar === 1 ? '' : 's'} (marked with * above) ${nVar === 1 ? 'is' : 'are'} found in later "Traditional" manuscripts, which the King James Version follows, but not in the older manuscripts that most modern translations, including the BSB and WEB, follow. Scholars compare thousands of copies; differences like this are recorded openly.</p>` : '<p class="small muted">The main printed Greek editions agree on the words of this verse in ways that affect translation.</p>')
        : (kq.length ? `<p class="small">This verse has ${kq.length} place${kq.length === 1 ? '' : 's'} where the Hebrew scribes noted a difference between what is written (Ketiv) and what is read aloud (Qere). Translations normally follow the Qere.</p>` : '<p class="small muted">No scribal reading notes (Ketiv/Qere) are recorded for this verse in the source data.</p>')}
    </div>
  </section>

  <section class="sources card flat" aria-label="Sources"><b>Sources</b>
    <p>${nt ? 'Greek text, transliteration, word glosses, grammar and edition notes: <i>Translators Amalgamated Greek New Testament</i> (TAGNT), STEPBible.org / Tyndale House, Cambridge, CC BY 4.0. Editions compared include NA27/NA28, SBL, Tyndale House, Westcott-Hort, Tregelles, the Textus Receptus and the Byzantine text.' : 'Hebrew/Aramaic text (Leningrad Codex via the Westminster Leningrad Codex and OpenScriptures), transliteration, glosses and grammar: <i>Translators Amalgamated Hebrew Old Testament</i> (TAHOT), STEPBible.org / Tyndale House, Cambridge, CC BY 4.0.'}
    Dictionary entries: ${nt ? '<i>Translators Brief lexicon of Extended Strongs for Greek</i> (TBESG, including Abbott-Smith)' : '<i>Translators Brief lexicon of Extended Strongs for Hebrew</i> (TBESH, based on Brown-Driver-Briggs via OpenScriptures)'}, STEPBible.org, CC BY 4.0. Data reformatted for this app without changing its content. <a href="https://github.com/STEPBible/STEPBible-Data" target="_blank" rel="noopener">github.com/STEPBible</a></p>
    <p>English: ${Object.values(TRANSLATIONS).map((t) => esc(t.notice)).join(' ')}</p>
    <p>Plain-English grammar descriptions are generated by this app from the grammar codes in the source data.</p></section>`;
}

async function wordPanel(root) {
  const x = st.words[st.sel], box = $('#wp', root); if (!box) return; if (!x) { box.innerHTML = '<p class="muted">Select a word above.</p>'; return; }
  const lex = st.data.lex[x.m] || st.data.lex[String(x.m).replace(/[A-Za-z]$/, '')] || null;
  const g = st.data.lang === 'he' ? morph.hebrew(x.p) : morph.greek(x.p);
  const key = `${x.m}@${st.b}.${st.c}.${st.v}`; const saved = privItem('word', key);
  const cls = st.data.lang === 'he' ? 'lemma he' : 'lemma grc';
  box.innerHTML = `<div class="row wrap" style="align-items:flex-end;gap:16px"><div><p class="faint small">This word</p><p class="${cls}" dir="auto">${esc(x.t)}</p><p class="small muted"><i>${esc(x.x)}</i></p></div>
      ${lex ? `<div><p class="faint small">Dictionary form</p><p class="${cls}" dir="auto">${esc(lex[0])}</p><p class="small muted"><i>${esc(lex[1])}</i> · ${esc(x.m)}</p></div>` : ''}</div>
    <dl class="kv"><dt>In this verse</dt><dd><b>${esc(String(x.g).replace(/[<>]/g, ''))}</b></dd>
      ${lex ? `<dt>Basic meaning</dt><dd>${esc(lex[2])}</dd>` : ''}
      <dt>Role in the sentence</dt><dd>${esc(g.role || 'Not stated in the source data')}</dd></dl>
    ${g.parts.length || (g.pieces && g.pieces.length > 1) ? `<details class="more"><summary>Grammar details</summary><dl class="kv" style="margin-top:8px">${g.parts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}${g.pieces && g.pieces.length > 1 ? `<dt>Made of</dt><dd>${g.pieces.map((p) => esc(p.role)).join(' + ')}</dd>` : ''}<dt>Code</dt><dd class="faint">${esc(x.p)}</dd></dl></details>` : ''}
    <details class="more" id="lexMore"><summary>Other meanings this word can have</summary><div class="lexdef" id="lexDef"><div class="skeleton"></div></div><p class="small faint">From the dictionary entry. Not every meaning applies here: the editors' gloss above is the meaning supported by this verse.</p></details>
    <div class="btns"><button class="btn sm" id="wsSave" aria-pressed="${!!saved}">${icon('bookmark')} ${saved ? 'Saved word study' : 'Save word study'}</button><button class="btn sm" id="wsNote">${icon('note')} Private note</button></div>`;
  $('#lexMore', box).ontoggle = async (e) => { if (!e.target.open) return; const full = await loadLexEntry(x.m).catch(() => null); $('#lexDef', box).textContent = full ? full[3] || full[2] : 'The dictionary entry could not load.'; };
  $('#wsSave', box).onclick = () => { setPriv('word', key, saved ? null : { word: x.t, lemma: lex ? lex[0] : x.t, gloss: x.g, ref: refLabel(st.b, st.c, st.v), b: st.b, c: st.c, v: st.v, w: st.sel, lang: st.data.lang }); toast(saved ? 'Word study removed.' : 'Word study saved under Me.'); wordPanel(root); };
  $('#wsNote', box).onclick = () => noteSheet(`${st.b}.${st.c}.${st.v}`, refLabel(st.b, st.c, st.v), () => {});
}

export function mount(root) {
  if (!st) return;
  wordPanel(root);
  const intro = $('#oIntro', root); if (intro) intro.ontoggle = () => { if (!intro.open) store.set('nc.origIntro', '1'); };
  const select = (i) => { st.sel = i; $$('.orig .w', root).forEach((b) => b.setAttribute('aria-pressed', Number(b.dataset.w) === i)); wordPanel(root); history.replaceState(null, '', `#/original/${st.b}/${st.c}/${st.v}?w=${i}`); };
  $$('.orig .w', root).forEach((b) => b.onclick = () => select(Number(b.dataset.w)));
  $$('#wmeanings [data-w]', root).forEach((b) => b.onclick = () => { select(Number(b.dataset.w)); $('#o2', root).scrollIntoView({ behavior: 'smooth', block: 'start' }); setTimeout(() => { const d = $('#lexMore', root); if (d) d.open = true; }, 300); });
  // keyboard: arrows move between words (respecting reading direction)
  $('.orig', root).addEventListener('keydown', (e) => { const rtl = st.data.lang === 'he'; const d = e.key === 'ArrowRight' ? (rtl ? -1 : 1) : e.key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0; if (!d) return; e.preventDefault(); const n = Math.min(Math.max(st.sel + d, 0), st.words.length - 1); select(n); $(`.orig .w[data-w="${n}"]`, root).focus(); });
  $('#vPrev', root).onclick = () => go(`#/original/${st.b}/${st.c}/${st.v - 1}`);
  $('#vNext', root).onclick = () => go(`#/original/${st.b}/${st.c}/${st.v + 1}`);
  $('#opick', root).onclick = () => {
    const s = sheet(`<h3>Choose a passage</h3><form id="olk" class="row" style="margin-top:12px"><input class="input" id="olki" placeholder="e.g. Genesis 1:1 or John 3:16" aria-label="Passage" value="${esc(refLabel(st.b, st.c, st.v))}"><button class="btn primary">Go</button></form>
      <p class="small faint" style="margin-top:8px">Any verse from Genesis to Revelation.</p>`, { label: 'Choose a passage' });
    $('#olk', s).onsubmit = (e) => { e.preventDefault(); const r = parseRef($('#olki', s).value); if (!r) { toast('Try a reference like "Psalm 23:1".'); return; } closeSheet(); go(`#/original/${r.b}/${r.c}/${r.v || 1}`); };
  };
  $$('.flow a', root).forEach((a) => a.onclick = (e) => { e.preventDefault(); const t = $(a.getAttribute('href'), root); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
}
