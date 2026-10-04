// Journey: the plan, milestones, calendar and day-by-day schedule, upcoming and completed challenges.
import { $, $$, esc, icon, sheet, closeSheet, fmtDate, toast, store, todayISO } from '../util.js';
import { S, counts, keyRead, setRead, dayIndex } from '../state.js';
import { bookName } from '../bible.js';
import { go } from '../app.js';

export const title = 'Journey';
const dayDone = (d) => { const keys = [...new Set(S.plan.CH.slice(d.first, d.last).map((x) => x.key))]; return [keys.filter(keyRead).length, keys.length, keys]; };

function calendar(p, t, sd) {
  const months = []; let cur = null;
  p.days.forEach((d) => { const m = d.date.slice(0, 7); if (!cur || cur.m !== m) { cur = { m, days: [] }; months.push(cur); } cur.days.push(d); });
  return months.map((mo) => {
    // Leading blanks only up to the weekday of the first plan day shown in this month (no empty weeks).
    const lead = Array.from({ length: (new Date(mo.days[0].date + 'T12:00:00Z').getUTCDay() + 6) % 7 }, () => '<button class="none" tabindex="-1" aria-hidden="true"></button>');
    return `<div class="stack-sm"><h3 style="font-size:15px">${new Date(mo.m + '-01T12:00:00Z').toLocaleDateString('en-ZA', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</h3>
      <div class="cal" role="group" aria-label="Reading calendar">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x) => `<span class="dow" aria-hidden="true">${x}</span>`).join('')}${lead.join('')}
      ${mo.days.map((d) => { const [a, b] = dayDone(d); const cls = a === b ? 'done' : a ? 'part' : ''; return `<button class="${cls} ${d.n === t ? 'today' : ''}" data-day="${d.n}" aria-label="Day ${d.n}, ${fmtDate(d.date)}: ${esc(d.read)}. ${a} of ${b} read${d.n < sd ? ', optional' : ''}">${Number(d.date.slice(8))}</button>`; }).join('')}</div></div>`;
  }).join('');
}

export async function render() {
  const d = S.data, p = S.plan, c = counts(), t = dayIndex(), sd = c.startDay;
  const view = store.get('nc.jview', 'cal');
  const secs = p.sections.map((s, i) => { const st = p.sectionStarts[i], en = (p.sectionStarts[i + 1] || p.days.length + 1) - 1; const state = t > en ? 'done' : t >= st ? 'now' : ''; return `<div class="milestone ${state}"><span class="dot" aria-hidden="true"></span><div><b>${esc(s)}</b><p class="small faint">Days ${st}${en > st ? '–' + en : ''}${state === 'now' ? ' · you are here' : ''}</p></div></div>`; }).join('');
  const pct = c.unique ? Math.round(c.total / c.unique * 100) : 0;
  return `<div class="stack-sm"><h1>Journey</h1><p class="muted">${esc(d.challenge.name)} · ${esc(d.challenge.planName)}</p></div>
  <section class="card"><div class="card-head"><h3>${fmtDate(d.challenge.start)} to ${fmtDate(d.challenge.end, { day: 'numeric', month: 'long', year: 'numeric' })}</h3><span class="pill ok">${pct}%</span></div>
    <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Plan progress"><span style="width:${pct}%"></span></div>
    <p class="small muted">${c.total} of ${c.unique} chapters read${t >= 1 && t <= p.days.length ? ` · Day ${t} of ${p.days.length}` : ''}.${sd > 1 ? ` You joined on day ${sd}; earlier days are optional.` : ''}</p></section>
  <section class="card"><h3>Milestones</h3><div class="stack">${secs}</div></section>
  <div class="seg" role="group" aria-label="Schedule view"><button data-v="cal" aria-pressed="${view === 'cal'}">Calendar</button><button data-v="list" aria-pressed="${view === 'list'}">Day by day</button></div>
  <section class="card" id="sched">${view === 'cal' ? calendar(p, t, sd) : `<div class="days">${p.days.map((x) => { const [a, b] = dayDone(x); return `<button class="day ${a === b ? 'done' : ''} ${x.n === t ? 'today' : ''} ${x.n < sd ? 'optional' : ''}" data-day="${x.n}"><span class="n">${x.n}<small>${fmtDate(x.date, { day: 'numeric', month: 'short' })}</small></span><span><span class="r">${esc(x.read)}</span><br><span class="d">${x.n < sd ? 'Optional · ' : ''}${x.ms ? esc(x.ms) : x.deep ? 'Deep study: ' + esc(x.deep) : ''}</span></span><span class="pill ${a === b ? 'ok' : ''}">${a}/${b}</span></button>`; }).join('')}</div>`}</section>
  ${d.next ? `<section class="card"><p class="eyebrow">Coming next</p><h3>${esc(d.next.name)}</h3><p class="muted">${esc(d.next.planName)} · ${d.next.n} days · ${fmtDate(d.next.start, { weekday: 'long', day: 'numeric', month: 'long' })} to ${fmtDate(d.next.end)}</p>${d.next.blurb ? `<p class="small">${esc(d.next.blurb)}</p>` : ''}<p class="small faint">Everyone moves into it automatically on the first day, with fresh progress. This challenge's progress is kept.</p></section>` : ''}
  <section class="card"><h3>Completed challenges</h3>${(d.past || []).length ? `<div class="list-plain">${d.past.map((x) => `<div><b>${esc(x.name)}</b><p class="small muted">${esc(x.planName)} · ${fmtDate(x.start)} to ${fmtDate(x.end, { day: 'numeric', month: 'long', year: 'numeric' })} · ${x.ch || 0} chapters (${x.pct}%)</p></div>`).join('')}</div>` : '<p class="muted small">Challenges you finish will be kept here with your progress.</p>'}</section>`;
}

export function mount(root) {
  $$('[data-v]', root).forEach((b) => b.onclick = () => { store.set('nc.jview', b.dataset.v); go('#/journey'); });
  $$('[data-day]', root).forEach((b) => b.onclick = () => daySheet(Number(b.dataset.day)));
  const td = $('.today', root); if (td && store.get('nc.jview', 'cal') === 'list') td.scrollIntoView({ block: 'center' });
}
function daySheet(n) {
  const d = S.plan.days[n - 1]; const [, , keys] = dayDone(d); const sd = counts().startDay;
  const s = sheet(`<p class="eyebrow">Day ${n} · ${fmtDate(d.date, { weekday: 'long', day: 'numeric', month: 'long' })}</p><h3>${esc(d.read)}</h3>${n < sd ? '<p class="small faint">Optional: this day is before you joined.</p>' : ''}${d.date > todayISO() ? '<p class="small faint">Coming up. You can read ahead if you like.</p>' : ''}
    <div class="chlist" style="margin-top:12px">${keys.map((k) => { const [b, c] = k.split('.'); return `<div class="chrow"><button class="check" role="checkbox" aria-checked="${keyRead(k)}" data-key="${k}" aria-label="${esc(bookName(b))} ${c} read"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.2 16.6 4.9 12.3l1.6-1.6 2.7 2.7 8.3-8.3 1.6 1.6Z"/></svg></button><span class="name">${esc(bookName(b))} ${c}</span><a class="open" href="#/bible/${b}/${c}">Read ${icon('next')}</a></div>`; }).join('')}</div>`, { label: `Day ${n}` });
  $$('.check', s).forEach((b) => b.onclick = async () => { const on = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', on); await setRead([b.dataset.key], on).catch((e) => toast(e.message)); });
  $$('a.open', s).forEach((a) => a.addEventListener('click', closeSheet));
  s.addEventListener('remove', () => go('#/journey'));
  const obs = new MutationObserver(() => { if (!document.contains(s)) { obs.disconnect(); go('#/journey'); } }); obs.observe(document.body, { childList: true });
}
