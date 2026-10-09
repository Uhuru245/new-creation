// New Creation — app shell, routing and boot.
import { $, esc, icon, emblem, toast, store } from './util.js';
import { DEMO, onSync, flush } from './api.js';
import { loadMeta } from './bible.js';
import { S, signedIn, loadSnapshot, refresh, onChange } from './state.js';

const VIEWS = {
  today: () => import('./views/today.js'), bible: () => import('./views/bible.js'), original: () => import('./views/original.js'),
  circle: () => import('./views/circle.js'), journey: () => import('./views/journey.js'), me: () => import('./views/me.js'),
  leader: () => import('./views/leader.js'), privacy: () => import('./views/privacy.js'), auth: () => import('./views/auth.js'),
};
const NAV = [['today', 'Today', 'today'], ['bible', 'Bible', 'bible'], ['original', 'Original', 'original'], ['circle', 'Circle', 'circle'], ['journey', 'Journey', 'journey'], ['me', 'Me', 'me']];

export function parseRoute() {
  const h = location.hash.replace(/^#\/?/, ''); const [path, qs] = h.split('?');
  const parts = path.split('/').filter(Boolean); const q = new URLSearchParams(qs || '');
  return { name: parts[0] || 'today', parts: parts.slice(1), q };
}
export const go = (hash) => { if (location.hash === hash) render(); else location.hash = hash; };

let current = null, renderSeq = 0, syncState = { status: 'synced', pending: 0 };
function shell() {
  const lead = S.data && S.data.me && S.data.me.leader;
  const items = NAV.concat(lead ? [['leader', 'Leader', 'leader']] : []);
  return `${DEMO ? '<div class="demo-banner" role="note">Demonstration with sample data. Nothing here is real or shared. <a href="?demo=1" id="demoReset" style="color:#fff">Reset demo</a></div>' : ''}
  <header class="topbar" id="topbar"><button class="back-btn" id="backBtn" type="button" hidden>${icon('back')}<span>Back</span></button><a class="brand" href="#/today" aria-label="New Creation home">${emblem()}<span>New Creation</span></a>
    <div class="top-actions"><span class="sync" id="sync" role="status" aria-live="polite"></span></div></header>
  <nav class="nav" aria-label="Main" style="--n:${NAV.length}"><a class="nav-brand" href="#/today" aria-hidden="true" tabindex="-1">${emblem()}<span>New Creation</span></a>${items.map(([k, l, i]) => `<a href="#/${k}" data-nav="${k}" ${k === 'leader' ? 'class="lead-only"' : ''}>${icon(i)}<span>${l}</span></a>`).join('')}</nav>
  <main id="main" tabindex="-1"></main>`;
}
function paintSync() {
  const el = $('#sync'); if (!el) return; const { status, pending } = syncState;
  const txt = status === 'offline' ? `Offline${pending ? ` · ${pending} to sync` : ''}` : status === 'error' ? 'Not synced · retrying' : pending ? 'Syncing…' : (S.fresh ? '' : 'Updating…');
  el.className = 'sync ' + (status === 'offline' ? 'offline' : status === 'error' ? 'error' : pending || !S.fresh ? 'pending' : '');
  el.innerHTML = txt ? `<span class="dot" aria-hidden="true"></span>${esc(txt)}` : '';
}

// ---------- going back ----------
// The pages visited in this session, so "Back" returns to wherever you were (even in the installed app,
// which has no browser back button). With nothing to go back to, Back goes up to the natural parent page.
const HK = 'nc.hist';
let hist = (() => { try { return JSON.parse(sessionStorage.getItem(HK)) || []; } catch (e) { return []; } })();
function trackHistory() {
  const h = location.hash || '#/today';
  if (hist.length > 1 && hist[hist.length - 2] === h) hist.pop(); else if (hist[hist.length - 1] !== h) hist.push(h);
  hist = hist.slice(-50); try { sessionStorage.setItem(HK, JSON.stringify(hist)); } catch (e) { /* private mode */ }
}
const ROOTS = ['today', 'bible', 'original', 'circle', 'journey', 'me'];
function parentOf(r) {
  if (r.name === 'original' && r.parts[0]) return `#/bible/${r.parts[0]}/${r.parts[1] || 1}${r.parts[2] ? '?v=' + r.parts[2] : ''}`;
  if (r.name === 'privacy' || r.name === 'leader') return '#/me';
  if (r.name === 'bible' && r.q.has('search')) return '#/bible';
  if (r.name === 'circle' && [...r.q.keys()].length) return '#/circle';
  if (ROOTS.includes(r.name) && !r.parts.length) return null;
  return '#/today';
}
const PAGE_NAMES = { today: 'Today', bible: 'Bible', original: 'Original', circle: 'Circle', journey: 'Journey', me: 'Me', leader: 'Leader', privacy: 'Privacy' };
function backTarget() {
  if (hist.length > 1) { const prev = hist[hist.length - 2]; const n = (prev.replace(/^#\/?/, '').split(/[/?]/)[0]) || 'today'; return { history: true, label: PAGE_NAMES[n] || 'previous page' }; }
  const p = parentOf(parseRoute()); if (!p) return null;
  const n = p.replace(/^#\/?/, '').split(/[/?]/)[0]; return { hash: p, label: PAGE_NAMES[n] || 'previous page' };
}
function paintBack() {
  const b = $('#backBtn'); if (!b) return; const t = backTarget();
  b.hidden = !t; if (!t) return;
  b.setAttribute('aria-label', `Back to ${t.label}`); b.title = `Back to ${t.label}`;
  b.onclick = () => { if (t.history) history.back(); else location.hash = t.hash; };
}

export async function render() {
  const seq = ++renderSeq; const r = parseRoute();
  if (!signedIn() && r.name === 'privacy') { const m = await VIEWS.privacy(); $('#root').innerHTML = `<main id="main" class="auth" style="display:block"><div class="view" style="max-width:720px;margin:0 auto">${(await m.render(r)).replace('href="#/me"', 'href="#/"')}</div></main>`; window.scrollTo(0, 0); return; }
  if (!signedIn()) { const m = await VIEWS.auth(); if (seq !== renderSeq) return; $('#root').innerHTML = `<main id="main">${await m.render(r)}</main>`; m.mount && m.mount($('#main'), r); current = null; return; }
  if (!S.data) { $('#root').innerHTML = `<div class="boot">${emblem()}<p>New Creation</p></div>`; return; }
  if (!$('#main') || !$('.nav') || ($('.nav .lead-only') ? !S.data.me.leader : S.data.me.leader)) { $('#root').innerHTML = shell(); paintSync(); const dr = $('#demoReset'); if (dr) dr.onclick = async (e) => { e.preventDefault(); (await (await import('./demo.js')).createDemo()).reset(); }; }
  paintBack();
  let name = r.name; if (!VIEWS[name] || name === 'auth') name = 'today';
  if (name === 'leader' && !S.data.me.leader) name = 'me';
  document.querySelectorAll('[data-nav]').forEach((a) => a.toggleAttribute('aria-current', a.dataset.nav === name || (name === 'privacy' && a.dataset.nav === 'me')));
  document.querySelectorAll('[data-nav]').forEach((a) => { if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'page'); });
  const m = await VIEWS[name](); if (seq !== renderSeq) return;
  const main = $('#main'); const same = current && current.name === name;
  const html = await m.render(r); if (seq !== renderSeq) return;
  main.innerHTML = `<div class="view">${html}</div>`;
  current = { name, mod: m };
  m.mount && m.mount(main, r);
  document.title = (m.title ? (typeof m.title === 'function' ? m.title(r) : m.title) + ' · ' : '') + 'New Creation';
  if (!same && !r.q.get('v')) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
}

window.addEventListener('hashchange', () => { trackHistory(); render(); });
trackHistory();
window.addEventListener('scroll', () => { const t = $('#topbar'); if (t) t.classList.toggle('scrolled', window.scrollY > 4); }, { passive: true });
onSync((e) => { if (e.type === 'status') { syncState = { status: e.status, pending: e.pending }; paintSync(); } if (e.type === 'rejected') toast('One change could not be saved: ' + e.error); });
onChange((why) => {
  paintSync(); if (why !== 'server' || !current) return;
  const a = document.activeElement; if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return; // never re-render under someone's typing
  if ($('#sheet')) return;
  if (parseRoute().name !== current.name) return; // a newer page is already loading
  if (current.mod.onData) current.mod.onData(why); else render();
});

async function boot() {
  // Invitations: ?by=<memberId> on the link opens the join screen with the inviter's name.
  const by = new URLSearchParams(location.search).get('by'); if (by) store.set('nc.by', by);
  try { await loadMeta(); } catch (e) { $('#root').innerHTML = `<div class="auth"><div class="panel"><div class="mark">${emblem()}<h1>New Creation</h1></div><p class="notice">The app files could not load. Check your connection and try again.</p><button class="btn primary" onclick="location.reload()">Try again</button></div></div>`; return; }
  if (!signedIn()) { render(); return; }
  const had = loadSnapshot();
  render();
  try { await flush(); await refresh(); paintSync(); if (!had) render(); }
  catch (e) {
    if (/sign in again/i.test(e.message)) { (await import('./state.js')).signOutLocal(); toast('Please sign in again.'); render(); return; }
    paintSync();
    if (!had) $('#root').innerHTML = `<div class="auth"><div class="panel"><div class="mark">${emblem()}<h1>New Creation</h1></div><p class="notice">${esc(e.message)}</p><button class="btn primary" id="retry">Try again</button></div></div>`, $('#retry').onclick = () => location.reload();
  }
}
boot();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
setInterval(() => { if (signedIn() && S.data && document.visibilityState === 'visible') refresh().catch(() => {}); }, 5 * 60 * 1000);
