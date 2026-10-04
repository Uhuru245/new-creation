// Listen: human-narrated Bible audio, with the phone's own voice as a fallback.
// Recordings: Berean Standard Bible audio narrated by Bob Souer, Barry Hays and Jordan Gilbert,
// dedicated to the public domain (CC0 1.0) by the Berean Bible team, streamed from openbible.com.
// Nothing is generated: the narrators read the published BSB text, and the device voice reads the text on screen word for word.
import { $, $$, esc, icon, toast, sheet, closeSheet, store } from './util.js';
import { META, TRANSLATIONS, loadChapter, bookName, chapterCount } from './bible.js';

const AB = ['Gen', 'Exo', 'Lev', 'Num', 'Deu', 'Jos', 'Jdg', 'Rut', '1Sa', '2Sa', '1Ki', '2Ki', '1Ch', '2Ch', 'Ezr', 'Neh', 'Est', 'Job', 'Psa', 'Pro', 'Ecc', 'Sng', 'Isa', 'Jer', 'Lam', 'Ezk', 'Dan', 'Hos', 'Jol', 'Amo', 'Oba', 'Jon', 'Mic', 'Nam', 'Hab', 'Zep', 'Hag', 'Zec', 'Mal', 'Mat', 'Mrk', 'Luk', 'Jhn', 'Act', 'Rom', '1Co', '2Co', 'Gal', 'Eph', 'Php', 'Col', '1Th', '2Th', '1Ti', '2Ti', 'Tts', 'Phm', 'Heb', 'Jas', '1Pe', '2Pe', '1Jn', '2Jn', '3Jn', 'Jud', 'Rev'];
export const NARRATORS = {
  souer: { name: 'Bob Souer', desc: 'Warm, steady and pastoral. A good first choice.', dir: 'souer', suf: '' },
  hays: { name: 'Barry Hays', desc: 'Deep and measured, with a preacher’s weight.', dir: 'hays', suf: '_H' },
  gilbert: { name: 'Jordan Gilbert', desc: 'Clear and expressive, a little brighter.', dir: 'gilbert', suf: '_G' },
  device: { name: 'Phone voice', desc: 'Reads the translation on screen, also offline. Less natural.', device: true },
};
export const RATES = [0.75, 0.9, 1, 1.15, 1.3, 1.5];
const SRC_NOTE = 'Berean Standard Bible audio by Bob Souer, Barry Hays and Jordan Gilbert, public domain (CC0), via openbible.com.';

export const audioUrl = (narr, b, c) => { const n = NARRATORS[narr], i = META.codes.indexOf(b); return `https://openbible.com/audio/${n.dir}/BSB_${String(i + 1).padStart(2, '0')}_${AB[i]}_${String(c).padStart(3, '0')}${n.suf}.mp3`; };
const prefs = () => ({ narr: 'souer', rate: 1, cont: true, ...store.json('nc.listen', {}) });
const savePrefs = (p) => store.setJson('nc.listen', { ...prefs(), ...p });

const P = { queue: [], i: 0, playing: false, el: null, utter: null, verse: 0, verses: null, onEnd: null, started: false };
const cur = () => P.queue[P.i];
const label = (it) => it ? `${bookName(it.b)} ${it.c}` : '';
const listeners = new Set();
export const onListen = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = () => { paint(); listeners.forEach((f) => f(state())); };
export const state = () => ({ active: !!cur(), playing: P.playing, item: cur(), narr: prefs().narr });
export const isPlaying = (b, c) => { const it = cur(); return !!(it && P.playing && it.b === b && it.c === c); };

// ---------- public controls ----------
// Start listening to one chapter, or to a list of chapters (e.g. today's reading). `onDone(item)` runs when a chapter finishes.
export async function listen(items, { onDone = null, at = 0 } = {}) {
  stopEngines();
  P.queue = items.map((x) => ({ b: x.b, c: Number(x.c) })); P.i = Math.max(0, Math.min(at, P.queue.length - 1)); P.onEnd = onDone; P.started = true;
  await playCurrent();
}
export function toggle() { if (!cur()) return; if (P.playing) pause(); else resume(); }
export function pause() {
  if (P.el && !P.el.paused) P.el.pause();
  if (speechSynthesis && speechSynthesis.speaking) speechSynthesis.pause();
  P.playing = false; emit();
}
export function resume() {
  const n = prefs().narr;
  if (NARRATORS[n].device) { if (speechSynthesis.paused) { speechSynthesis.resume(); P.playing = true; emit(); } else playCurrent(); return; }
  if (P.el && P.el.src) { P.el.play().then(() => { P.playing = true; emit(); }).catch(failed); } else playCurrent();
}
export function stop() { stopEngines(); P.queue = []; P.i = 0; P.playing = false; emit(); }
export function skip(sec) { if (P.el && P.el.src && isFinite(P.el.duration)) P.el.currentTime = Math.max(0, Math.min(P.el.duration - 0.5, P.el.currentTime + sec)); else if (NARRATORS[prefs().narr].device) speakFrom(Math.max(0, P.verse + (sec > 0 ? 1 : -1))); }
export function nextChapter() { advance(true); }
export function prevChapter() {
  if (P.el && P.el.currentTime > 5) { P.el.currentTime = 0; return; }
  if (P.i > 0) { P.i--; playCurrent(); return; }
  const it = cur(); if (!it) return; const p = neighbour(it, -1); if (p) { P.queue.splice(P.i, 0, p); playCurrent(); }
}
export function setNarrator(n) { const was = prefs().narr; savePrefs({ narr: n }); if (cur() && was !== n) { const t = P.el && !NARRATORS[was].device ? P.el.currentTime : 0; stopEngines(); playCurrent(NARRATORS[n].device ? 0 : t); } else emit(); }
export function setRate(r) { savePrefs({ rate: r }); if (P.el) P.el.playbackRate = r; if (NARRATORS[prefs().narr].device && cur() && P.playing) speakFrom(P.verse); emit(); }

// ---------- engines ----------
function stopEngines() {
  if (P.el) { P.el.pause(); P.el.removeAttribute('src'); P.el.load(); }
  if (window.speechSynthesis) { P.utter = null; speechSynthesis.cancel(); }
  markVerse(0);
}
async function playCurrent(startAt = 0) {
  const it = cur(); if (!it) return stop();
  const pr = prefs(); P.playing = true; emit(); media(it);
  if (NARRATORS[pr.narr].device) return speakChapter(it);
  if (!P.el) {
    P.el = new Audio(); P.el.preload = 'auto';
    P.el.addEventListener('ended', () => chapterDone());
    P.el.addEventListener('error', () => { if (P.el.getAttribute('src')) failed(); });
    P.el.addEventListener('timeupdate', paintTime);
    P.el.addEventListener('pause', () => { if (P.playing && !P.el.ended) { P.playing = false; emit(); } });
    P.el.addEventListener('play', () => { P.playing = true; emit(); });
  }
  P.el.src = audioUrl(pr.narr, it.b, it.c); P.el.playbackRate = pr.rate;
  if (startAt) P.el.addEventListener('loadedmetadata', () => { P.el.currentTime = startAt; }, { once: true });
  try { await P.el.play(); } catch (e) { failed(e); }
}
function failed(e) {
  if (e && e.name === 'NotAllowedError') { P.playing = false; emit(); return; } // the browser wants a tap first
  P.playing = false; emit();
  toast(navigator.onLine === false ? "You're offline. The narrated recordings need a connection; switch to Phone voice to listen offline." : 'This recording could not play right now. Please try again.', { label: 'Phone voice', run: () => setNarrator('device') }, 7000);
}
function chapterDone() {
  const it = cur(); P.playing = false; markVerse(0);
  if (P.onEnd && it) { try { P.onEnd(it); } catch (e) { /* ignore */ } }
  advance(false);
}
function neighbour(it, dir) {
  const idx = META.codes.indexOf(it.b); const n = chapterCount(it.b);
  if (dir > 0) return it.c < n ? { b: it.b, c: it.c + 1 } : idx < 65 ? { b: META.codes[idx + 1], c: 1 } : null;
  return it.c > 1 ? { b: it.b, c: it.c - 1 } : idx > 0 ? { b: META.codes[idx - 1], c: META.chapters[idx - 1] } : null;
}
function advance(manual) {
  if (P.i < P.queue.length - 1) { P.i++; playCurrent(); return; }
  const it = cur(); const nx = it && neighbour(it, 1);
  if (nx && (manual || (P.queue.length === 1 && prefs().cont))) { P.queue.push(nx); P.i++; playCurrent(); return; }
  stopEngines(); P.playing = false; emit();
  if (!manual) toast(P.queue.length > 1 ? 'Finished listening to the reading.' : `Finished ${label(it)}.`);
}

// Phone voice: reads the translation on screen verse by verse, pausing between verses the way a reader breathes.
function bestVoice() {
  const vs = speechSynthesis.getVoices().filter((v) => /^en(-|_|$)/i.test(v.lang)); if (!vs.length) return null;
  const score = (v) => (/premium|enhanced|natural|neural/i.test(v.name) ? 40 : 0) + (/google|siri|microsoft/i.test(v.name) ? 10 : 0) + (/en[-_]ZA/i.test(v.lang) ? 8 : /en[-_]GB/i.test(v.lang) ? 6 : /en[-_]US/i.test(v.lang) ? 4 : 0) + (/daniel|arthur|aaron|guy|ryan|tom|male/i.test(v.name) ? 3 : 0) + (v.localService ? 1 : 0);
  return vs.sort((a, b) => score(b) - score(a))[0];
}
async function speakChapter(it) {
  if (!('speechSynthesis' in window)) { P.playing = false; emit(); toast("This device doesn't offer a reading voice. Choose one of the narrators instead."); return; }
  try { P.verses = (await loadChapter(store.get('nc.tr', 'bsb'), it.b, it.c)).map((t) => String(t).replace(/[\[\]]/g, '')); }
  catch (e) { P.playing = false; emit(); toast("This chapter isn't saved on this device yet."); return; }
  speakFrom(0, true);
}
function speakFrom(v, announce = false) {
  speechSynthesis.cancel(); P.verse = v; const it = cur(); if (!it || !P.verses) return;
  const voice = bestVoice(), rate = prefs().rate;
  const say = (text, pauseAfter, onDone) => {
    const u = new SpeechSynthesisUtterance(text); if (voice) u.voice = voice; u.lang = voice ? voice.lang : 'en-GB';
    u.rate = 0.9 * rate; u.pitch = 0.92; P.utter = u;
    u.onend = () => { if (P.utter !== u) return; setTimeout(() => { if (P.utter === u && P.playing) onDone(); }, pauseAfter); };
    speechSynthesis.speak(u);
  };
  const step = (i) => {
    if (i >= P.verses.length) { P.utter = null; chapterDone(); return; }
    P.verse = i; markVerse(i + 1);
    // Longer pauses at paragraph-like endings give the reading a spoken, unhurried rhythm.
    const t = P.verses[i]; const pause = /[.?!]["”’']?$/.test(t) ? 650 : 380;
    say(t, pause / rate, () => step(i + 1));
  };
  P.playing = true; emit();
  if (announce && v === 0) say(`${bookName(it.b)}, chapter ${it.c}.`, 700, () => step(0)); else step(v);
}
function markVerse(v) {
  $$('.verse.speaking').forEach((e) => e.classList.remove('speaking'));
  const it = cur(); if (!v || !it || !location.hash.startsWith(`#/bible/${it.b}/${it.c}`)) return;
  const el = $('#v' + v); if (el) { el.classList.add('speaking'); if (store.get('nc.follow', '1') === '1') el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
}

// Lock-screen and headphone controls.
function media(it) {
  if (!('mediaSession' in navigator)) return;
  const n = NARRATORS[prefs().narr];
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: label(it), artist: n.device ? 'Phone voice' : `${n.name} · Berean Standard Bible`, album: 'New Creation', artwork: [{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }] });
    const h = { play: resume, pause, previoustrack: prevChapter, nexttrack: nextChapter, seekbackward: () => skip(-15), seekforward: () => skip(15), stop };
    Object.entries(h).forEach(([k, f]) => { try { navigator.mediaSession.setActionHandler(k, f); } catch (e) { /* unsupported action */ } });
  } catch (e) { /* ignore */ }
}

// ---------- mini player ----------
function paint() {
  let bar = $('#player'); const it = cur();
  if (!it) { if (bar) bar.remove(); document.body.classList.remove('has-player'); return; }
  const pr = prefs(), n = NARRATORS[pr.narr];
  if (!bar) {
    bar = document.createElement('div'); bar.id = 'player'; bar.className = 'player'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Audio player');
    document.body.appendChild(bar);
  }
  document.body.classList.add('has-player');
  bar.innerHTML = `<button class="pl-main" id="plToggle" aria-label="${P.playing ? 'Pause' : 'Play'} ${esc(label(it))}">${icon(P.playing ? 'pause' : 'play')}</button>
    <button class="pl-info" id="plOpen" aria-haspopup="dialog" aria-label="Listening options"><b>${esc(label(it))}</b><span>${esc(n.name)}${pr.rate !== 1 ? ` · ${pr.rate}×` : ''}${P.queue.length > 1 ? ` · ${P.i + 1} of ${P.queue.length}` : ''}</span><span class="pl-prog"><span id="plBar"></span></span></button>
    <button class="icon-btn" id="plNext" aria-label="Next chapter">${icon('skip')}</button>
    <button class="icon-btn" id="plClose" aria-label="Stop listening">${icon('close')}</button>`;
  $('#plToggle', bar).onclick = toggle; $('#plOpen', bar).onclick = openSheet; $('#plNext', bar).onclick = nextChapter; $('#plClose', bar).onclick = stop;
  paintTime();
}
function paintTime() {
  const b = $('#plBar'); if (!b) return;
  if (P.el && P.el.src && isFinite(P.el.duration) && P.el.duration > 0) b.style.width = (P.el.currentTime / P.el.duration * 100).toFixed(1) + '%';
  else if (P.verses && NARRATORS[prefs().narr].device) b.style.width = (P.verse / Math.max(1, P.verses.length) * 100).toFixed(1) + '%';
  else b.style.width = '0';
}

export function openSheet() {
  const pr = prefs(), it = cur(), t = store.get('nc.tr', 'bsb');
  const s = sheet(`<div class="card-head"><h3>${it ? 'Listening: ' + esc(label(it)) : 'Listen'}</h3><button class="icon-btn" id="lsClose" aria-label="Close">${icon('close')}</button></div>
    ${it ? `<div class="pl-ctrls" role="group" aria-label="Playback">
      <button class="icon-btn" id="lsPrev" aria-label="Previous chapter">${icon('back')}</button>
      <button class="btn" id="lsBack" aria-label="Back 15 seconds">− 15s</button>
      <button class="pl-main big" id="lsToggle" aria-label="${P.playing ? 'Pause' : 'Play'}">${icon(P.playing ? 'pause' : 'play')}</button>
      <button class="btn" id="lsFwd" aria-label="Forward 15 seconds">+ 15s</button>
      <button class="icon-btn" id="lsNext" aria-label="Next chapter">${icon('next')}</button></div>` : ''}
    <p class="eyebrow" style="margin-top:16px">Voice</p>
    <div class="stack-sm">${Object.entries(NARRATORS).map(([k, n]) => `<button class="itemlink" data-narr="${k}" aria-pressed="${k === pr.narr}"><span class="grow"><b>${esc(n.name)}</b><span>${n.device ? '' : 'Human narrator. '}${esc(n.desc)}</span></span>${k === pr.narr ? icon('check') : ''}</button>`).join('')}</div>
    ${t !== 'bsb' && !NARRATORS[pr.narr].device ? `<p class="small muted" style="margin-top:8px">The narrators read the Berean Standard Bible, so some words will differ from the ${esc(TRANSLATIONS[t].short)} text on screen.</p>` : ''}
    <p class="eyebrow" style="margin-top:16px">Speed</p>
    <div class="seg" role="group" aria-label="Speed">${RATES.map((r) => `<button data-rate="${r}" aria-pressed="${r === pr.rate}">${r}×</button>`).join('')}</div>
    <label class="switch" style="margin-top:14px"><input type="checkbox" id="lsCont" ${pr.cont ? 'checked' : ''}><span>Keep playing the next chapter</span></label>
    <p class="attrib" style="margin-top:14px">${esc(SRC_NOTE)}</p>`, { label: 'Listening options' });
  const on = (id, f) => { const e = $(id, s); if (e) e.onclick = f; };
  on('#lsClose', closeSheet); on('#lsPrev', prevChapter); on('#lsNext', nextChapter); on('#lsBack', () => skip(-15)); on('#lsFwd', () => skip(15));
  on('#lsToggle', () => { toggle(); const b = $('#lsToggle', s); if (b) { b.innerHTML = icon(P.playing ? 'pause' : 'play'); b.setAttribute('aria-label', P.playing ? 'Pause' : 'Play'); } });
  $$('[data-narr]', s).forEach((b) => b.onclick = () => { setNarrator(b.dataset.narr); closeSheet(); openSheet(); });
  $$('[data-rate]', s).forEach((b) => b.onclick = () => { setRate(Number(b.dataset.rate)); $$('[data-rate]', s).forEach((x) => x.setAttribute('aria-pressed', x === b)); });
  $('#lsCont', s).onchange = (e) => savePrefs({ cont: e.target.checked });
}
// Keep the verse highlight in step when the reader re-renders the chapter being spoken.
window.addEventListener('hashchange', () => setTimeout(() => { if (NARRATORS[prefs().narr].device && P.playing) markVerse(P.verse + 1); }, 120));
