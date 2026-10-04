// Talks to the Apps Script API (or the in-browser demo). Queues safe changes while offline.
import { store } from './util.js';

const CFG = window.NC_CONFIG || {};
export const DEMO = /[?&]demo=1\b/.test(location.search) || CFG.env === 'demo';
const ENV = DEMO ? 'demo' : (new URLSearchParams(location.search).get('env') === 'test' ? 'test' : (CFG.env || 'prod'));
export const envName = ENV;

let demo = null;
async function demoBackend() { if (!demo) demo = (await import('./demo.js')).createDemo(); return demo; }

const FRIENDLY = [
  [/Failed to fetch|NetworkError|Load failed|network/i, "You're offline or the connection dropped. We'll keep trying."],
  [/timed out/i, 'The server is taking longer than usual. Please try again.'],
  [/Service invoked too many times|Exceeded maximum/i, 'The server is busy right now. Please try again in a minute.'],
];
export class ApiError extends Error { constructor(msg, network = false) { super(msg); this.network = network; } }

async function rawCall(fn, args, { timeout = 20000 } = {}) {
  if (window.__ncOffline) throw new ApiError(FRIENDLY[0][1], true); // test hook: simulate a dropped connection
  if (DEMO) { const d = await demoBackend(); await new Promise((r) => setTimeout(r, 120)); return d.call(fn, args); }
  if (!CFG.apiUrl) throw new ApiError('The app is not connected to a server yet. See docs/SETUP.md.');
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeout);
  let res;
  try {
    // text/plain keeps this a "simple" request, so no CORS preflight is needed with Apps Script.
    res = await fetch(CFG.apiUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ fn, args, env: ENV }), signal: ctl.signal, redirect: 'follow', credentials: 'omit' });
  } catch (e) {
    throw new ApiError(e.name === 'AbortError' ? 'The request timed out.' : (FRIENDLY[0][1]), true);
  } finally { clearTimeout(t); }
  let body; try { body = await res.json(); } catch (e) { throw new ApiError('The server sent an unexpected reply. Please try again.', true); }
  if (!body.ok) throw new ApiError(body.error || 'Something went wrong.');
  return body.data;
}

export async function call(fn, ...args) {
  try { const r = await rawCall(fn, args); setStatus(queue().length ? 'pending' : 'synced'); return r; }
  catch (e) { if (e.network) setStatus(navigator.onLine === false ? 'offline' : 'error'); const f = FRIENDLY.find(([re]) => re.test(e.message)); if (f && !e.network) e.message = f[1]; throw e; }
}

// ---------- offline queue (only idempotent changes: ticks, private items, settings) ----------
const QKEY = 'queue';
const queue = () => store.pget(QKEY, []);
const saveQueue = (q) => store.pset(QKEY, q);
const QUEUEABLE = new Set(['tick', 'privateSet', 'settings']);
let flushing = false;

export async function send(fn, ...args) {
  if (!QUEUEABLE.has(fn)) return call(fn, ...args);
  const q = queue();
  // Collapse repeated private item writes to the latest one.
  if (fn === 'privateSet') { for (let i = q.length - 1; i >= 0; i--) if (q[i].fn === 'privateSet' && q[i].args[1] === args[1] && q[i].args[2] === args[2]) q.splice(i, 1); }
  q.push({ fn, args, at: Date.now() }); saveQueue(q); setStatus('pending');
  return flush();
}
export async function flush() {
  if (flushing) return null; flushing = true; let last = null;
  try {
    let q = queue();
    while (q.length) {
      const item = q[0];
      try { last = await rawCall(item.fn, item.args); }
      catch (e) {
        if (e.network) { setStatus(navigator.onLine === false ? 'offline' : 'error'); return null; }
        listeners.forEach((l) => l({ type: 'rejected', item, error: e.message })); // server refused: drop it
      }
      q = queue(); q.shift(); saveQueue(q);
    }
    setStatus('synced');
    return last;
  } finally { flushing = false; }
}
export const pendingCount = () => queue().length;

// ---------- sync status ----------
let status = 'synced'; const listeners = new Set();
export function onSync(fn) { listeners.add(fn); fn({ type: 'status', status, pending: pendingCount() }); return () => listeners.delete(fn); }
function setStatus(s) { status = s; listeners.forEach((l) => l({ type: 'status', status: s, pending: pendingCount() })); }
window.addEventListener('online', () => flush());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && pendingCount()) flush(); });
setInterval(() => { if (pendingCount() && navigator.onLine !== false) flush(); }, 30000);

// Fire-and-forget request that survives the page reloading (used for signing out after local data is already cleared).
export async function sendAndForget(fn, args) {
  try {
    if (DEMO) { const d = await demoBackend(); return d.call(fn, args); }
    if (!CFG.apiUrl) return;
    fetch(CFG.apiUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ fn, args, env: ENV }), keepalive: true, credentials: 'omit' }).catch(() => {});
  } catch (e) { /* the server session simply expires */ }
}
