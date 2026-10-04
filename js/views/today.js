// Today: greeting, today's chapters, progress, study and the discussion question.
import { $, $$, esc, icon, toast, fmtDate, hourJHB, todayISO } from '../util.js';
import { call } from '../api.js';
import { S, counts, setRead, keyRead, dayIndex } from '../state.js';
import { parseRef, bookName, readLabel } from '../bible.js';
import { go } from '../app.js';
import { listen } from '../audio.js';
import { offerMarkRead } from './listen-help.js';

export const title = 'Today';
// The GOSPEL discussion framework used since the first version of the app:
// G God · O Original context · S Sin and humanity · P Promise and plan · E Evangel and Christ · L Live it.
export const GOSPEL = [['G', 'God'], ['O', 'Original context'], ['S', 'Sin and humanity'], ['P', 'Promise and plan'], ['E', 'Evangel and Christ'], ['L', 'Live it']];
export function dayQuestion(d) {
  const deep = d.deep || d.read;
  if (d.ms) return `Milestone: ${d.ms}. Looking back, what is the big picture God has been showing you so far?`;
  if (d.week) return `Week ${d.week} review: what is one thing God has taught you through this week's reading?`;
  const Q = [`What does ${deep} show you about who God is?`, `What stands out about the world the first readers of ${d.read} lived in?`,
    `Where do you see yourself, or our world, in today's reading?`, `What promise of God do you find in ${deep}, and how is it kept?`,
    `How does ${deep} point forward to Jesus?`, `What is one thing from today's reading you will live out this week?`];
  return Q[(d.n - 1) % Q.length];
}
export const questionTheme = (d) => (d.ms || d.week ? null : GOSPEL[(d.n - 1) % 6]);

function ring(f, label) {
  const r = 32, c = 2 * Math.PI * r;
  return `<div class="ring" role="img" aria-label="${esc(label)}"><svg viewBox="0 0 78 78"><circle cx="39" cy="39" r="${r}" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="7"/><circle cx="39" cy="39" r="${r}" fill="none" stroke="#EAD6A6" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(1, f))}"/></svg><div class="t" aria-hidden="true">${label.split(' ')[0]}<small>today</small></div></div>`;
}
const chk = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.2 16.6 4.9 12.3l1.6-1.6 2.7 2.7 8.3-8.3 1.6 1.6Z"/></svg>';
function chapterRow(key, onHero) {
  const [b, c] = key.split('.'); const done = keyRead(key);
  return `<div class="chrow"><button class="check" role="checkbox" aria-checked="${done}" data-key="${key}" aria-label="${esc(bookName(b))} ${c} read">${chk}</button>
    <span class="name">${esc(bookName(b))} ${c}</span><a class="open" href="#/bible/${b}/${c}" aria-label="Read ${esc(bookName(b))} ${c}">Read ${icon('next', 'ico')}</a></div>`;
}
export function studyCard(n) {
  const r = S.data.content && S.data.content.studies ? S.data.content.studies[n] : null; if (!r) return '';
  const row = (l, t) => (t ? `<div class="stack-sm"><span class="eyebrow" style="color:var(--ink-3)">${l}</span><p>${esc(t)}</p></div>` : '');
  const draft = r.status !== 'approved' ? `<div class="row wrap"><span class="pill gold">Draft · only you can see this</span><button class="btn sm primary" data-approve="study|${n}">Approve for everyone</button></div>` : '';
  return `<section class="card" aria-labelledby="studyT">${draft}<p class="eyebrow">Today's study</p><h3 id="studyT">${esc(r.title)}</h3>
    ${row("What's happening", r.happening)}${row('The setting', r.setting)}${row('Where it points to Jesus', r.jesus)}${row('Live it', r.live)}${row('Pray', r.prayer)}
    <p class="faint small">Study notes drafted with AI assistance and reviewed by your leader. Read them alongside Scripture, not instead of it.</p></section>`;
}
function bookIntros(keys) {
  const B = (S.data.content && S.data.content.books) || {}; const seen = new Set(); let out = '';
  keys.forEach((k) => { const [b, c] = k.split('.'); const name = bookName(b); if (c === '1' && !seen.has(name) && B[name]) { seen.add(name); const r = B[name];
    out += `<section class="card"><p class="eyebrow">Meet the book</p><h3>${esc(name)}</h3>${r.status !== 'approved' ? `<div class="row wrap"><span class="pill gold">Draft</span><button class="btn sm primary" data-approve="book|${esc(name)}">Approve</button></div>` : ''}
      <div class="stack-sm"><span class="eyebrow" style="color:var(--ink-3)">Who and when</span><p>${esc(r.written)}</p></div><div class="stack-sm"><span class="eyebrow" style="color:var(--ink-3)">What it's about</span><p>${esc(r.purpose)}</p></div><div class="stack-sm"><span class="eyebrow" style="color:var(--ink-3)">Look for</span><p>${esc(r.look_for)}</p></div>
      <p class="faint small">Drafted with AI assistance and reviewed by your leader.</p></section>`; } });
  return out;
}

export async function render() {
  const d = S.data, p = S.plan, c = counts(), D = c.day, t = c.t, first = d.me.name.split(' ')[0];
  const h = hourJHB(); const hi = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const pre = t === 0, post = t > p.days.length;
  const sub = pre ? `${d.challenge.name} begins ${fmtDate(p.days[0].date, { weekday: 'long', day: 'numeric', month: 'long' })}.`
    : post ? `${d.challenge.name} is complete. Well done.` : `${d.challenge.name} · Day ${t} of ${p.days.length} · ${fmtDate(todayISO(), { weekday: 'long', day: 'numeric', month: 'long' })}`;
  const keys = c.todayKeys; const nextKey = keys.find((k) => !keyRead(k));
  const allDone = !nextKey;
  const pct = c.unique ? Math.round(c.total / c.unique * 100) : 0;
  const deepRef = D.deep ? parseRef(D.deep.split(';')[0].replace(/,.*$/, '')) : null;
  const theme = questionTheme(D);
  const nextCh = d.next && (post || t >= p.days.length - 6) ? `<section class="card"><p class="eyebrow">Next challenge</p><h3>${esc(d.next.name)}</h3><p class="muted">${esc(d.next.planName)} · ${d.next.n} days · starts ${fmtDate(d.next.start, { weekday: 'long', day: 'numeric', month: 'long' })}. You're already in: it opens here automatically on the first day, with fresh progress.</p></section>` : '';
  return `
  <div class="stack-sm"><h1>${hi}, ${esc(first)}.</h1><p class="muted">${esc(sub)}${d.me.streak > 1 ? ` · ${d.me.streak}-day streak` : ''}</p></div>
  ${nextCh}
  ${post ? '' : `<section class="card hero" aria-labelledby="todayT">
    <div class="row" style="align-items:flex-start"><div class="stack-sm" style="flex:1"><p class="eyebrow">${pre ? 'Day 1 reading' : "Today's reading"}</p><h2 id="todayT">${esc(D.read)}</h2>
      <p class="sub">${allDone ? 'All done for today. Well done.' : `${keys.length - c.todayDone} of ${keys.length} chapter${keys.length === 1 ? '' : 's'} to go.`}</p></div>
      ${ring(c.todayDone / Math.max(1, keys.length), `${c.todayDone}/${keys.length} chapters read today`)}</div>
    <div class="chlist">${keys.map((k) => chapterRow(k, true)).join('')}</div>
    <button class="btn on-hero block listen-btn" id="listenToday">${icon('listen')} Listen to today's reading</button>
    ${nextKey ? `<a class="btn on-hero block" href="#/bible/${nextKey.replace('.', '/')}">${icon('bible')} Continue reading: ${esc(bookName(nextKey.split('.')[0]))} ${nextKey.split('.')[1]}</a>` : `<a class="btn on-hero block" href="#/circle?compose=reflection&day=${D.n}">${icon('chat')} Share what God showed you</a>`}
  </section>`}
  <section class="card" aria-labelledby="progT"><div class="card-head"><h3 id="progT">Your progress</h3><span class="pill ok">${pct}% of the plan</span></div>
    <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Overall challenge progress"><span style="width:${pct}%"></span></div>
    <div class="stats"><div class="stat"><b>${c.todayDone}/${keys.length}</b><span>today</span></div><div class="stat"><b>${c.total}</b><span>chapters read</span></div><div class="stat"><b>${c.expectedDone}/${c.expected}</b><span>since you joined</span></div></div>
    ${c.catchUp > 0 ? `<p class="small muted">${c.startDay > 1 ? `You joined on day ${c.startDay}. ` : ''}There ${c.catchUp === 1 ? 'is 1 earlier chapter' : `are ${c.catchUp} earlier chapters`} you can read whenever you're ready. Every chapter you read counts.</p>` : t > 1 ? '<p class="small muted">You are reading right along with the circle.</p>' : ''}
    ${c.startDay > 1 ? `<p class="faint small">Chapters before day ${c.startDay} are optional and never count against you.</p>` : ''}
  </section>
  ${D.deep ? `<section class="card"><p class="eyebrow">Deep study · Day ${D.n}</p><h3 class="serif" style="font-size:20px">${esc(D.deep)}</h3>
    <p class="muted small">Read today's chapters broadly, then slow down over this passage.</p>
    <div class="btns">${deepRef ? `<a class="btn" href="#/bible/${deepRef.b}/${deepRef.c}${deepRef.v ? '?v=' + deepRef.v : ''}">${icon('bible')} Open the passage</a><a class="btn" href="#/original/${deepRef.b}/${deepRef.c}/${deepRef.v || 1}">${icon('original')} Original text</a>` : ''}</div></section>` : ''}
  ${studyCard(D.n)}
  ${bookIntros(keys)}
  <section class="card" aria-labelledby="qT"><p class="eyebrow">Today's question${theme ? ` · ${theme[0]} for ${theme[1]}` : ''}</p><p class="serif" id="qT" style="font-size:20px;line-height:1.45">${esc(dayQuestion(D))}</p>
    <a class="btn primary" href="#/circle?compose=reflection&day=${D.n}">${icon('chat')} Respond in the Circle</a></section>
  ${(d.cheers || []).length ? `<section class="card"><h3>Encouragement for you</h3>${d.cheers.map((x) => `<p><b>${esc(x.from)}</b>: ${esc(x.message)}</p>`).join('')}</section>` : ''}`;
}

export function mount(root) {
  const lt = $('#listenToday', root);
  if (lt) lt.onclick = () => { const keys = counts().todayKeys; const first = Math.max(0, keys.findIndex((k) => !keyRead(k)));
    listen(keys.map((k) => ({ b: k.split('.')[0], c: Number(k.split('.')[1]) })), { at: first, onDone: offerMarkRead }); };
  $$('.check', root).forEach((b) => b.onclick = async () => {
    if (b.dataset.busy) return; b.dataset.busy = '1';
    const key = b.dataset.key, on = b.getAttribute('aria-checked') !== 'true'; const [bk, c] = key.split('.');
    b.setAttribute('aria-checked', on);
    try { await setRead([key], on); } catch (e) { toast(e.message); }
    delete b.dataset.busy;
    toast(on ? `${bookName(bk)} ${c} marked as read.` : `${bookName(bk)} ${c} marked as unread.`, { label: 'Undo', run: () => setRead([key], !on).then(() => go('#/today')) });
    go('#/today');
  });
  $$('[data-approve]', root).forEach((b) => b.onclick = async () => { const [k, key] = b.dataset.approve.split('|'); b.disabled = true; b.textContent = 'Approving…';
    try { S.data.content = await call('approve', S.token, k, key); toast('Approved. Everyone can now see it.'); go('#/today'); } catch (e) { toast(e.message); b.disabled = false; } });
}
export function onData() { const h = location.hash.replace(/^#\/?/, ''); if ((h === '' || h.startsWith('today')) && (!document.activeElement || !/INPUT|TEXTAREA/.test(document.activeElement.tagName))) go(location.hash || '#/today'); }
void readLabel; void dayIndex;
