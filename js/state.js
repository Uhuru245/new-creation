// App state: the signed-in member, the shared challenge, progress and private items.
import { store, todayISO, daysBetween } from './util.js';
import { call, send } from './api.js';
import { buildPlan, progressOf } from './bible.js';

export const S = {
  token: store.pget('token', ''),
  data: null,        // server state (me, challenge, circle, content, next, past...)
  plan: null,        // built reading plan for the current challenge
  bits: '',          // '1' / '0' per plan position
  priv: [],          // private items (bookmarks, highlights, notes, word studies)
  fresh: false,      // true once data came from the server in this session
};
const listeners = new Set();
export const onChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = (why) => listeners.forEach((f) => f(why));

export function signedIn() { return !!S.token; }
export function setToken(t) { S.token = t; store.pset('token', t); }
export function signOutLocal() { store.clearPrivate(); S.token = ''; S.data = null; S.plan = null; S.bits = ''; S.priv = []; }

function apply(data, why) {
  S.data = data;
  const c = data.challenge;
  if (!S.plan || S.plan.id !== c.plan || S.plan.start !== c.start) { S.plan = buildPlan(c.plan, c.start); S.plan.start = c.start; }
  S.bits = data.me.bits || '';
  store.pset('snap', data);
  emit(why);
}

// Show the last saved copy instantly; refresh from the server in the background.
export function loadSnapshot() { const s = store.pget('snap', null); if (s && s.me && s.challenge) { apply(s, 'snapshot'); S.priv = store.pget('priv', []); return true; } return false; }
export async function refresh() {
  const data = await call('state', S.token, { lite: true });
  S.fresh = true; apply(data, 'server');
  call('private', S.token).then((p) => { S.priv = p; store.pset('priv', p); emit('private'); }).catch(() => {});
  // Warm the Circle so it opens instantly.
  call('posts', S.token, { limit: 20 }).then((r) => store.pset('posts', r.posts)).catch(() => {});
  return data;
}

// ---------- progress ----------
export const me = () => S.data && S.data.me;
export const today = () => todayISO();
export function dayIndex() {
  const p = S.plan; if (!p) return 0; const d = daysBetween(p.days[0].date, today());
  return d < 0 ? 0 : d >= p.days.length ? p.days.length + 1 : d + 1;
}
export const planDay = () => Math.min(Math.max(dayIndex(), 1), S.plan.days.length);
export function counts() {
  const p = S.plan, bits = S.bits; const t = dayIndex(), sd = (me() && me().startDay) || 1;
  const { count } = progressOf(p, bits);
  const td = Math.min(Math.max(t, 1), p.days.length); const D = p.days[td - 1];
  const todayKeys = [...new Set(p.CH.slice(D.first, D.last).map((x) => x.key))];
  const todayDone = todayKeys.filter((k) => (p.positions[k] || []).some((i) => bits[i] === '1')).length;
  // Expected since joining: chapters scheduled from the member's start day up to and including today.
  const from = p.cum[sd - 1], to = t === 0 ? from : p.cum[Math.min(t, p.days.length)];
  const expectedKeys = new Set(p.CH.slice(from, to).map((x) => x.key));
  const expectedDone = [...expectedKeys].filter((k) => (p.positions[k] || []).some((i) => bits[i] === '1')).length;
  // Earlier, optional chapters for late joiners (never counted as overdue).
  const yesterdayTo = t <= 1 ? from : p.cum[Math.min(t - 1, p.days.length)];
  const owedKeys = new Set(p.CH.slice(from, yesterdayTo).map((x) => x.key));
  const catchUp = [...owedKeys].filter((k) => !(p.positions[k] || []).some((i) => bits[i] === '1')).length;
  return { t, td, day: D, todayKeys, todayDone, total: count, unique: p.unique, expected: expectedKeys.size, expectedDone, catchUp, startDay: sd };
}
export const keyRead = (key) => (S.plan.positions[key] || []).some((i) => S.bits[i] === '1');

// Mark chapters (by key "GEN.1") read or unread. Every schedule position of that chapter is updated, so it counts once.
export async function setRead(keys, on) {
  const pos = []; keys.forEach((k) => (S.plan.positions[k] || []).forEach((i) => pos.push(i)));
  if (!pos.length) return false;
  const arr = S.bits.split(''); const max = Math.max(...pos); while (arr.length <= max) arr.push('0');
  pos.forEach((i) => { arr[i] = on ? '1' : '0'; });
  S.bits = arr.join('').replace(/0+$/, ''); S.data.me.bits = S.bits;
  const prog = progressOf(S.plan, S.bits); S.data.me.ch = prog.count;
  if (on) S.data.me.lastReadDate = today();
  const mine = (S.data.circle || []).find((m) => m.id === S.data.me.id); if (mine) { mine.ch = prog.count; mine.pct = Math.round(prog.count / S.plan.total * 1000) / 10; if (on) mine.readToday = true; }
  store.pset('snap', S.data); emit('progress');
  const r = await send('tick', S.token, S.data.challenge.id, pos, on);
  if (r && r.bits !== undefined && !store.pget('queue', []).length) { S.bits = r.bits; S.data.me.bits = r.bits; S.data.me.ch = r.ch; S.data.me.streak = r.streak; store.pset('snap', S.data); emit('progress'); }
  return true;
}

// ---------- private items ----------
export const privItem = (kind, key) => S.priv.find((x) => x.kind === kind && x.key === key);
export const privList = (kind) => S.priv.filter((x) => x.kind === kind);
export async function setPriv(kind, key, data) {
  S.priv = S.priv.filter((x) => !(x.kind === kind && x.key === key));
  if (data != null) S.priv.push({ kind, key, data, updated: new Date().toISOString() });
  store.pset('priv', S.priv); emit('private');
  return send('privateSet', S.token, kind, key, data);
}
