// Bible reader: navigation, search, display settings, highlights, bookmarks, notes, sharing, mark as read.
import { $, $$, esc, icon, toast, sheet, closeSheet, store, copyText, shareText, waLink } from '../util.js';
import { S, setRead, keyRead, privItem, setPriv } from '../state.js';
import { META, TRANSLATIONS, loadChapter, bookName, chapterCount, isNT, parseRef, refLabel, search } from '../bible.js';
import { go } from '../app.js';
import { listen, onListen, isPlaying, toggle as audioToggle, state as audioState, openSheet as audioSheet } from '../audio.js';
import { offerMarkRead } from './listen-help.js';

export const title = (r) => (r.parts[0] ? `${bookName(r.parts[0]) || 'Bible'} ${r.parts[1] || ''}` : 'Bible');
const tr = () => store.get('nc.tr', 'bsb');
const HL = [['yellow', 'Yellow'], ['green', 'Green'], ['blue', 'Blue'], ['rose', 'Rose']];
let sel = new Set(), cur = null, posTimer = null, offListen = null;
// The KJV text marks words the translators added (printed in italics) with [square brackets].
const kjvItalics = (h) => h.replace(/\[([^\]]+)\]/g, '<i>$1</i>');
const plain = (t) => String(t).replace(/[\[\]]/g, '');

function where(r) {
  if (r.parts[0] && META.codes.includes(r.parts[0])) return { b: r.parts[0], c: Math.min(Math.max(Number(r.parts[1]) || 1, 1), chapterCount(r.parts[0])), v: Number(r.q.get('v')) || null };
  const p = store.json('nc.pos', null) || (privItem('pos', 'last') || {}).data; if (p && META.codes.includes(p.b)) return { b: p.b, c: p.c, v: p.v || null };
  return { b: 'GEN', c: 1, v: null };
}

export async function render(r) {
  if (r.q.has('search')) return renderSearch(r.q.get('search') || '');
  const w = where(r); cur = w; sel = new Set();
  let verses; try { verses = await loadChapter(tr(), w.b, w.c); }
  catch (e) { return `<div class="empty">${icon('bible')}<p>This chapter could not load. ${navigator.onLine === false ? "You're offline and it hasn't been saved on this device yet." : 'Please try again.'}</p><button class="btn" onclick="location.reload()">Try again</button></div>`; }
  const key = `${w.b}.${w.c}`, inPlan = !!(S.plan.positions[key]), read = inPlan && keyRead(key);
  const n = chapterCount(w.b), idx = META.codes.indexOf(w.b);
  const prev = w.c > 1 ? [w.b, w.c - 1] : idx > 0 ? [META.codes[idx - 1], META.chapters[idx - 1]] : null;
  const next = w.c < n ? [w.b, w.c + 1] : idx < 65 ? [META.codes[idx + 1], 1] : null;
  const vh = verses.map((t, i) => {
    const v = i + 1, k = `${w.b}.${w.c}.${v}`; const hl = privItem('highlight', k), bm = privItem('bookmark', k), nt = privItem('note', k);
    return `<span class="verse${hl ? ' hl-' + esc(hl.data.color) : ''}" id="v${v}" data-v="${v}" role="button" tabindex="0" aria-label="Verse ${v}${bm ? ', bookmarked' : ''}${nt ? ', has a note' : ''}"><sup>${v}</sup>${kjvItalics(esc(t))}${bm ? icon('bookmark', 'ico mk') : ''}${nt ? icon('note', 'ico mk') : ''}</span> `;
  }).join('');
  return `<div class="reader-head">
      <button class="refbtn" id="pick" aria-haspopup="dialog" aria-label="Choose book and chapter. Current: ${esc(bookName(w.b))} ${w.c}">${esc(bookName(w.b))} ${w.c} ${icon('down')}</button>
      <button class="trbtn" id="trSw" aria-haspopup="dialog" aria-label="Translation: ${TRANSLATIONS[tr()].name}">${TRANSLATIONS[tr()].short}</button>
      <span class="spacer"></span>
      <button class="icon-btn" id="listen" aria-label="${isPlaying(w.b, w.c) ? 'Pause listening' : `Listen to ${esc(bookName(w.b))} ${w.c}`}" aria-pressed="${isPlaying(w.b, w.c)}">${icon(isPlaying(w.b, w.c) ? 'pause' : 'listen')}</button>
      <a class="icon-btn" href="#/bible?search=" aria-label="Search the Bible">${icon('search')}</a>
      <button class="icon-btn" id="disp" aria-label="Reading settings">${icon('textsize')}</button>
    </div>
    <article class="scripture" aria-label="${esc(bookName(w.b))} chapter ${w.c}, ${TRANSLATIONS[tr()].name}">
      <p class="eyebrow" style="text-align:center">${isNT(w.b) ? 'New Testament' : 'Old Testament'}</p>
      <h2>${esc(bookName(w.b))} ${w.c}</h2>
      <p>${vh}</p>
    </article>
    <div class="reader-foot">
      ${inPlan ? `<button class="btn ${read ? '' : 'primary'} block" id="markRead" aria-pressed="${read}">${icon('check')} ${read ? 'Read · tap to undo' : 'Mark chapter as read'}</button>`
        : `<p class="small faint" style="text-align:center">This chapter is not part of the current reading plan, so it isn't counted in your progress.</p>`}
      <div class="btns">${prev ? `<a class="btn" href="#/bible/${prev[0]}/${prev[1]}" rel="prev">${icon('back')} ${esc(bookName(prev[0]))} ${prev[1]}</a>` : '<span></span>'}${next ? `<a class="btn" href="#/bible/${next[0]}/${next[1]}" rel="next">${esc(bookName(next[0]))} ${next[1]} ${icon('next')}</a>` : ''}</div>
      <p class="attrib">${esc(TRANSLATIONS[tr()].notice)}</p>
    </div>`;
}

function savePos(v) {
  const p = { b: cur.b, c: cur.c, v }; store.setJson('nc.pos', p);
  clearTimeout(posTimer); posTimer = setTimeout(() => setPriv('pos', 'last', p).catch(() => {}), 4000);
}

export function mount(root, r) {
  if (r.q.has('search')) return mountSearch(root, r);
  const w = cur;
  if (w.v) { const el = $('#v' + w.v, root); if (el) { setTimeout(() => { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); }, 60); } }
  savePos(w.v || 1);
  $('#pick', root).onclick = () => picker(w);
  $('#trSw', root).onclick = () => sheet(`<h3>Translation</h3><div class="stack-sm" style="margin-top:12px">${Object.values(TRANSLATIONS).map((t) => `<button class="itemlink" data-tr="${t.id}" aria-pressed="${t.id === tr()}"><span class="grow"><b>${t.name} (${t.short})</b><span>${esc(t.notice)}</span></span>${t.id === tr() ? icon('check') : ''}</button>`).join('')}</div>
    <p class="small faint" style="margin-top:12px">These translations are in the public domain, so they can be stored on your phone, searched and shared freely.</p>`, { label: 'Choose a translation', onOpen: (s) => $$('[data-tr]', s).forEach((b) => b.onclick = () => { store.set('nc.tr', b.dataset.tr); closeSheet(); go(location.hash); }) });
  $('#disp', root).onclick = displaySheet;
  $('#listen', root).onclick = () => { const a = audioState(); if (a.item && a.item.b === w.b && a.item.c === w.c) { audioToggle(); } else { listen([{ b: w.b, c: w.c }], { onDone: offerMarkRead }); if (!localStorage.getItem('nc.listen')) setTimeout(audioSheet, 400); } };
  if (offListen) offListen(); offListen = onListen(() => { const b = document.getElementById('listen'); if (!b) return; const on = isPlaying(w.b, w.c); b.innerHTML = icon(on ? 'pause' : 'listen'); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Pause listening' : `Listen to ${bookName(w.b)} ${w.c}`); });
  $$('.verse', root).forEach((el) => { el.onclick = () => toggleVerse(el); el.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleVerse(el); } }; });
  const mr = $('#markRead', root);
  if (mr) mr.onclick = async () => { if (mr.dataset.busy) return; mr.dataset.busy = 1; const key = `${w.b}.${w.c}`, on = !keyRead(key);
    await setRead([key], on).catch((e) => toast(e.message));
    toast(on ? `${bookName(w.b)} ${w.c} marked as read.` : 'Marked as unread.', { label: 'Undo', run: () => setRead([key], !on).then(() => go(location.hash)) });
    go(location.hash); };
  const io = new IntersectionObserver((ents) => { const top = ents.filter((e) => e.isIntersecting).map((e) => Number(e.target.dataset.v)).sort((a, b) => a - b)[0]; if (top) savePos(top); }, { rootMargin: '-120px 0px -60% 0px' });
  $$('.verse', root).forEach((el) => io.observe(el));
}

function toggleVerse(el) {
  const v = Number(el.dataset.v); if (sel.has(v)) { sel.delete(v); el.classList.remove('sel'); } else { sel.add(v); el.classList.add('sel'); }
  if (sel.size) verseSheet(); else closeSheet();
}
function selRef() { const vs = [...sel].sort((a, b) => a - b); return { vs, label: refLabel(cur.b, cur.c, vs[0], vs[vs.length - 1]) }; }
async function selText() { const verses = await loadChapter(tr(), cur.b, cur.c); const { vs, label } = selRef(); return `“${vs.map((v) => plain(verses[v - 1])).join(' ')}”\n— ${label} (${TRANSLATIONS[tr()].short})`; }
function clearSel() { sel.clear(); $$('.verse.sel').forEach((e) => e.classList.remove('sel')); }

function verseSheet() {
  const { vs, label } = selRef(); const k = `${cur.b}.${cur.c}.${vs[0]}`; const bm = privItem('bookmark', k), nt = privItem('note', k);
  const s = sheet(`<div class="card-head"><h3>${esc(label)}</h3><button class="icon-btn" id="vsClose" aria-label="Close">${icon('close')}</button></div>
    <div class="swatches" role="group" aria-label="Highlight colour" style="margin:12px 0">${HL.map(([c, n]) => `<button class="swatch" data-hl="${c}" aria-label="Highlight ${n}" style="background:var(--hl-${c})"></button>`).join('')}<button class="swatch" data-hl="" aria-label="Remove highlight" style="background:var(--surface)">${icon('close', 'ico')}</button></div>
    <div class="sheet-actions">
      <button class="btn" id="aBm" aria-pressed="${!!bm}">${icon('bookmark')}${bm ? 'Bookmarked' : 'Bookmark'}</button>
      <button class="btn" id="aNote">${icon('note')}${nt ? 'Edit note' : 'Private note'}</button>
      <button class="btn" id="aCopy">${icon('copy')}Copy</button>
      <button class="btn" id="aShare">${icon('share')}Share</button>
      <a class="btn" id="aWa" href="#" target="_blank" rel="noopener">${icon('chat')}WhatsApp</a>
      <a class="btn" href="#/original/${cur.b}/${cur.c}/${vs[0]}">${icon('original')}Explore original text</a>
    </div>`, { label: 'Verse actions' });
  selText().then((t) => { const a = $('#aWa', s); if (a) a.href = waLink(t); });
  $('#vsClose', s).onclick = () => { closeSheet(); clearSel(); };
  $$('[data-hl]', s).forEach((b) => b.onclick = async () => { const c = b.dataset.hl; vs.forEach((v) => setPriv('highlight', `${cur.b}.${cur.c}.${v}`, c ? { color: c } : null)); closeSheet(); clearSel(); go(location.hash); toast(c ? 'Highlighted.' : 'Highlight removed.'); });
  $('#aBm', s).onclick = () => { setPriv('bookmark', k, bm ? null : { label, at: new Date().toISOString() }); closeSheet(); clearSel(); go(location.hash); toast(bm ? 'Bookmark removed.' : 'Bookmarked. Find it under Me.'); };
  $('#aNote', s).onclick = () => noteSheet(k, label);
  $('#aCopy', s).onclick = async () => { await copyText(await selText()); closeSheet(); clearSel(); };
  $('#aShare', s).onclick = async () => { await shareText(await selText(), label); closeSheet(); clearSel(); };
}
export function noteSheet(k, label, after = () => go(location.hash)) {
  const nt = privItem('note', k);
  const s = sheet(`<h3>Private note · ${esc(label)}</h3><p class="small muted">Only you can see your notes.</p>
    <textarea class="input" id="noteT" maxlength="2000" style="margin-top:10px" aria-label="Your note">${esc(nt ? nt.data.text : '')}</textarea>
    <div class="btns" style="margin-top:12px">${nt ? '<button class="btn danger" id="noteDel">Delete note</button>' : ''}<button class="btn primary" id="noteSave">Save note</button></div>`, { label: 'Private note' });
  const ta = $('#noteT', s); ta.focus();
  $('#noteSave', s).onclick = () => { const t = ta.value.trim(); setPriv('note', k, t ? { text: t, label, at: new Date().toISOString() } : null); closeSheet(); clearSel(); after(); toast('Note saved.'); };
  const d = $('#noteDel', s); if (d) d.onclick = () => { setPriv('note', k, null); closeSheet(); clearSel(); after(); toast('Note deleted.'); };
}

function picker(w) {
  let testament = isNT(w.b) ? 'nt' : 'ot';
  const books = () => META.codes.map((c, i) => [c, META.names[i], i]).filter(([, , i]) => (testament === 'ot' ? i < 39 : i >= 39));
  const paint = (s) => {
    $('#pk', s).innerHTML = `<div class="seg" role="group" aria-label="Testament"><button data-t="ot" aria-pressed="${testament === 'ot'}">Old Testament</button><button data-t="nt" aria-pressed="${testament === 'nt'}">New Testament</button></div>
      <div class="booklist" style="margin-top:12px">${books().map(([c, n]) => `<button data-b="${c}" class="${c === w.b ? 'cur' : ''}">${esc(n)}</button>`).join('')}</div>`;
    $$('[data-t]', s).forEach((b) => b.onclick = () => { testament = b.dataset.t; paint(s); });
    $$('[data-b]', s).forEach((b) => b.onclick = () => chapters(s, b.dataset.b));
  };
  const chapters = (s, b) => {
    const n = chapterCount(b);
    $('#pk', s).innerHTML = `<button class="link" id="pkBack">${icon('back')} All books</button><h3 style="margin:6px 0 12px">${esc(bookName(b))}</h3>
      <div class="chgrid">${Array.from({ length: n }, (_, i) => i + 1).map((c) => `<button data-c="${c}" class="${b === w.b && c === w.c ? 'cur' : ''} ${S.plan.positions[b + '.' + c] && keyRead(b + '.' + c) ? 'read' : ''}" aria-label="Chapter ${c}${keyRead(b + '.' + c) ? ', read' : ''}">${c}</button>`).join('')}</div>`;
    $('#pkBack', s).onclick = () => paint(s);
    $$('[data-c]', s).forEach((x) => x.onclick = () => { closeSheet(); go(`#/bible/${b}/${x.dataset.c}`); });
  };
  const s = sheet(`<form id="lookup" class="row" style="margin-bottom:12px"><input class="input" id="lk" placeholder="Go to a passage, e.g. John 3:16" aria-label="Go to a passage"><button class="btn primary" type="submit">Go</button></form><div id="pk"></div>`, { label: 'Choose a book and chapter' });
  paint(s);
  $('#lookup', s).onsubmit = (e) => { e.preventDefault(); const r = parseRef($('#lk', s).value); if (!r) { toast('Try a reference like "Psalm 23" or "Rom 8:28".'); return; } closeSheet(); go(`#/bible/${r.b}/${r.c}${r.v ? '?v=' + r.v : ''}`); };
}

function displaySheet() {
  const size = Number(store.get('nc.size', 19)), lh = Number(store.get('nc.lh', 1.75)), th = store.get('nc.theme', 'auto');
  const s = sheet(`<h3>Reading settings</h3>
    <label class="field" style="margin-top:14px">Text size <span class="faint" id="szv">${size}px</span><input type="range" id="sz" min="15" max="30" step="1" value="${size}"></label>
    <label class="field">Line spacing <span class="faint" id="lhv">${lh}</span><input type="range" id="lh" min="1.4" max="2.2" step="0.05" value="${lh}"></label>
    <div class="field">Theme<div class="seg" role="group" aria-label="Theme">${[['auto', 'Auto'], ['light', 'Light'], ['sepia', 'Sepia'], ['dark', 'Dark']].map(([k, n]) => `<button data-th="${k}" aria-pressed="${th === k}">${n}</button>`).join('')}</div></div>
    <p class="scripture" style="padding:12px 0 0;margin:0">In the beginning God created the heavens and the earth.</p>`, { label: 'Reading settings' });
  $('#sz', s).oninput = (e) => { document.documentElement.style.setProperty('--read-size', e.target.value + 'px'); store.set('nc.size', e.target.value); $('#szv', s).textContent = e.target.value + 'px'; };
  $('#lh', s).oninput = (e) => { document.documentElement.style.setProperty('--read-lh', e.target.value); store.set('nc.lh', e.target.value); $('#lhv', s).textContent = e.target.value; };
  $$('[data-th]', s).forEach((b) => b.onclick = () => { setTheme(b.dataset.th); $$('[data-th]', s).forEach((x) => x.setAttribute('aria-pressed', x === b)); });
}
export function setTheme(t) { store.set('nc.theme', t); const v = t === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t; document.documentElement.dataset.theme = v; const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = v === 'dark' ? '#111513' : v === 'sepia' ? '#F3EAD6' : '#1F4D3A'; }

// ---------- search ----------
function renderSearch(q) {
  return `<div class="row"><a class="icon-btn" href="#/bible" aria-label="Back to reading">${icon('back')}</a><h1 style="font-size:24px">Search</h1></div>
    <form id="sf" class="row" role="search"><input class="input" id="sq" type="search" value="${esc(q)}" placeholder="Words or a reference, e.g. Psalm 23" aria-label="Search the Bible" autofocus><button class="btn primary" type="submit">${icon('search')}<span class="sr">Search</span></button></form>
    <p class="small faint">Searching ${esc(TRANSLATIONS[tr()].name)}. The first search downloads the whole translation (about 1.5 MB) and keeps it on this device.</p>
    <div id="sres" aria-live="polite"></div>`;
}
function mountSearch(root, r) {
  const run = async (q) => {
    const out = $('#sres', root); if (!q.trim()) { out.innerHTML = ''; return; }
    const ref = parseRef(q); if (ref && /\d/.test(q)) { go(`#/bible/${ref.b}/${ref.c}${ref.v ? '?v=' + ref.v : ''}`); return; }
    out.innerHTML = `<p class="muted">Searching… <span id="sp">0%</span></p><div class="bar"><span id="spb" style="width:0"></span></div>`;
    try {
      const res = await search(tr(), q, (f) => { const a = $('#sp'), b = $('#spb'); if (a) a.textContent = Math.round(f * 100) + '%'; if (b) b.style.width = f * 100 + '%'; });
      if (!res.total) { out.innerHTML = `<div class="empty">${icon('search')}<p>No verses found for “${esc(q)}”. Try fewer words.</p></div>`; return; }
      const re = new RegExp('(' + res.words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi');
      out.innerHTML = `<p class="small muted">${res.total} verse${res.total === 1 ? '' : 's'}${res.total > res.results.length ? ` · showing the first ${res.results.length}` : ''}</p><div class="stack-sm" style="margin-top:8px">${res.results.map((x) => `<a class="result" href="#/bible/${x.b}/${x.c}?v=${x.v}"><b>${esc(refLabel(x.b, x.c, x.v))}</b><p>${esc(x.text).replace(re, '<mark>$1</mark>')}</p></a>`).join('')}</div>`;
    } catch (e) { out.innerHTML = `<p class="notice">Search needs the Bible text, which couldn't download. ${navigator.onLine === false ? "You're offline." : 'Please try again.'}</p>`; }
  };
  $('#sf', root).onsubmit = (e) => { e.preventDefault(); history.replaceState(null, '', '#/bible?search=' + encodeURIComponent($('#sq', root).value)); run($('#sq', root).value); };
  if (r.q.get('search')) run(r.q.get('search'));
}
