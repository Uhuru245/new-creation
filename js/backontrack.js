// Back on track: a gentle, personal plan for members who have fallen behind, or who joined part-way through.
// Unread chapters are spread over a number of days the member chooses, on top of the day's normal reading.
// Late joiners automatically get a gentle plan for the days before they joined (optional: they can change or stop it,
// and those chapters never count against them). The plan is private: only the member sees it.
import { store, todayISO, addDays, daysBetween, fmtDate } from './util.js';
import { S, counts, keyRead, privItem, setPriv } from './state.js';
import { bookName } from './bible.js';

const KEY = 'backontrack'; // stored as a private "pos" item, so it syncs across the member's devices
let DUR = null;
export async function loadDurations() { if (DUR) return DUR; try { DUR = await (await fetch('data/durations.json')).json(); } catch (e) { DUR = {}; } return DUR; }
const secs = (key) => { const [b, c] = key.split('.'); const d = DUR && DUR[b] && DUR[b][c - 1]; return d || 210; };
export const minutesFor = (keys) => Math.max(1, Math.round(keys.reduce((a, k) => a + secs(k), 0) / 60));

// Chapters the member has missed since joining, in reading order (each chapter once).
export function missedKeys(scope = currentScope()) {
  const p = S.plan, c = counts(); if (!p || c.t <= 1) return [];
  const from = scope === 'all' ? 0 : p.cum[c.startDay - 1], to = p.cum[Math.min(c.t - 1, p.days.length)];
  const seen = new Set(), out = [];
  p.CH.slice(from, to).forEach((x) => { if (!seen.has(x.key) && !keyRead(x.key)) { seen.add(x.key); out.push(x.key); } });
  return out;
}
export const plan = () => { const it = privItem('pos', KEY); return it && it.data && it.data.until ? it.data : null; };
const dismissed = () => { const it = privItem('pos', KEY); return !!(it && it.data && it.data.dismissed); };
export const lateJoiner = () => { const c = counts(); return c.startDay > 1; };
// 'all' = from day 1 (late joiners' earlier days included); 'joined' = only what was missed since joining.
export function currentScope() { const pl = plan(); if (pl) return pl.scope || 'joined'; return lateJoiner() && !dismissed() ? 'all' : 'joined'; }
export const earlierDays = () => counts().startDay - 1;
const lastDay = () => S.plan.days[S.plan.days.length - 1].date;

// Pace choices: the number of days to catch up, never past the end of the challenge.
export function options() {
  const n = missedKeys().length; if (!n) return [];
  const left = Math.max(1, daysBetween(todayISO(), lastDay()) + 1);
  const days = [3, 7, 14].filter((d) => d < left);
  const opts = days.map((d) => ({ days: d, label: `In ${d} days`, until: addDays(todayISO(), d - 1) }));
  opts.push({ days: left, label: `By the end of the challenge (${fmtDate(lastDay(), { day: 'numeric', month: 'long' })})`, until: lastDay() });
  const out = opts.map((o) => { const per = Math.ceil(n / o.days); const avg = minutesFor(missedKeys()) / n; return { ...o, per, minutes: Math.max(1, Math.round(per * avg)), heavy: per > 6 }; });
  // Suggest the quickest pace that stays at five extra chapters a day or fewer (about 20 minutes).
  const rec = out.find((o) => o.per <= 5) || out[out.length - 1]; rec.recommended = true;
  return out;
}

export async function start(o, extra = {}) {
  const scope = currentScope();
  const data = { until: o.until, started: todayISO(), total: missedKeys(scope).length, days: o.days, today: null, scope, ...extra };
  await setPriv('pos', KEY, data); return data;
}
// Stopping remembers the choice for late joiners, so the automatic plan is not created again.
export const cancel = () => setPriv('pos', KEY, lateJoiner() ? { dismissed: true } : null);

// Today's extra chapters. Fixed for the day once worked out, so the list does not shrink while you read it.
export function todayList() {
  const pl = plan(); if (!pl) return null;
  const t = todayISO(); const missed = missedKeys();
  if (pl.today && pl.today.date === t) return { keys: pl.today.keys, missed };
  const daysLeft = Math.max(1, daysBetween(t, pl.until) + 1);
  const quota = Math.ceil(missed.length / daysLeft); const keys = missed.slice(0, quota);
  pl.today = { date: t, keys }; setPriv('pos', KEY, pl).catch(() => {});
  return { keys, missed };
}

// Everything the Today card needs, in one place.
export function status() {
  const c = counts(); if (!S.plan || c.t < 1 || c.t > S.plan.days.length) return { kind: 'none' };
  let pl = plan();
  // Someone who joined part-way through gets a gentle plan for the earlier days straight away.
  if (!pl && lateJoiner() && !dismissed() && missedKeys('all').length) {
    const opts = options(); const o = opts.find((x) => x.recommended) || opts[opts.length - 1];
    if (o) { start(o, { auto: true }).catch(() => {}); pl = plan(); }
  }
  const missed = missedKeys();
  if (!pl) return missed.length ? { kind: 'offer', missed: missed.length } : { kind: 'none' };
  const total = Math.max(pl.total, missed.length), caught = Math.max(0, total - missed.length);
  if (!missed.length) return { kind: 'done', total };
  if (daysBetween(pl.until, todayISO()) > 0) return { kind: 'expired', missed: missed.length, total, caught };
  const tl = todayList(); const doneToday = tl.keys.filter((k) => keyRead(k)).length;
  const dayNo = Math.min(pl.days, daysBetween(pl.started, todayISO()) + 1);
  return { kind: 'active', plan: pl, keys: tl.keys, doneToday, missed: missed.length, total, caught, dayNo, daysLeft: daysBetween(todayISO(), pl.until) + 1, joiner: pl.scope === 'all' && lateJoiner(), earlier: earlierDays() };
}
export const label = (key) => { const [b, c] = key.split('.'); return `${bookName(b)} ${c}`; };
void store;
