// Leader area: members, PIN resets, daily group post, challenge scheduling, study review.
import { $, $$, esc, icon, toast, sheet, closeSheet, copyText, waLink, fmtDate, todayISO, addDays, when, download } from '../util.js';
import { call } from '../api.js';
import { S, planDay } from '../state.js';
import { PLANS, buildPlan } from '../bible.js';
import { dayQuestion } from './today.js';
import { inviteLink } from './me.js';
import { go } from '../app.js';

export const title = 'Leader';
let members = null, chList = null, q = '';
const STATUS = { ok: 'On track', slip: 'A day to catch up', behind: 'A few days to catch up', call: 'Might appreciate a call' };
const appLink = () => `${location.origin}${location.pathname}`;

export function groupPost() {
  const D = S.plan.days[planDay() - 1]; const c = S.data.challenge;
  let t = `*${c.name} · Day ${D.n} of ${S.plan.days.length}*\n${fmtDate(D.date, { weekday: 'long', day: 'numeric', month: 'long' })}\n\n*Today's reading:* ${D.read}${D.deep ? `\n*Deep study:* ${D.deep}` : ''}\n\n*Question:* ${dayQuestion(D)}\n\n`;
  if (D.ms) t += `Milestone reached: ${D.ms}. Well done, everyone.\n\n`;
  return t + `Tick off your chapters and share your answer in the app:\n${appLink()}`;
}
function catchUpMsg(m) {
  const first = m.name.split(' ')[0]; const D = S.plan.days[planDay() - 1];
  if (m.status === 'ok') return `Hi ${first}, just wanted to say I'm glad you're reading with us. Today is ${D.read}. Keep going!`;
  return `Hi ${first}, thinking of you on our ${S.data.challenge.name} reading. No pressure and no guilt: just pick up with today's chapters (${D.read}). If you'd like to catch up, tap "Make my back-on-track plan" on the Today page and it will spread the missed chapters over a few days. Every chapter counts.\n${appLink()}`;
}

export async function render() {
  if (!S.data.me.leader) return '<p class="notice">The Leader area is only available to the group leader.</p>';
  const post = groupPost(); const R = S.data.content && S.data.content.review;
  const t = planDay(); const studies = R && S.data.challenge.plan === 'bible93' ? [t, t + 1].filter((n) => n <= S.plan.days.length) : [];
  return `<div class="stack-sm"><h1>Leader</h1><p class="muted">Only you can see this area. Changes here are checked on the server, not just in the app.</p></div>
  <a class="card itemlink" href="#/teach" style="padding:16px 18px"><span class="info" style="flex:1"><b>Life Group teaching</b><span class="small muted" style="display:block">Prepared lessons and your master prompt for preparing new ones</span></span>${icon('next')}</a>
  <section class="card"><div class="card-head"><h3>Today's group post</h3><span class="pill">WhatsApp</span></div>
    <textarea class="input" id="gp" rows="9" readonly aria-label="Today's group post">${esc(post)}</textarea>
    <div class="btns"><button class="btn" id="gpCopy">${icon('copy')} Copy post</button><a class="btn primary" href="${esc(waLink(post))}" target="_blank" rel="noopener">${icon('chat')} Share to WhatsApp</a></div>
    <p class="small faint">WhatsApp opens with the message ready. Nothing is sent until you press send.</p></section>
  <section class="card"><div class="card-head"><h3>Members</h3><span class="pill" id="mcount">${members ? members.length : '…'}</span></div>
    <input class="input" id="msearch" type="search" placeholder="Search by name" aria-label="Search members" value="${esc(q)}">
    <div class="people" id="mlist">${members ? '' : '<div class="skeleton" style="height:60px"></div>'}</div></section>
  <section class="card" id="emList"><div class="card-head"><h3>Email list</h3><span class="pill" id="emCount">…</span></div>
    <p class="small muted">People who chose to receive verses, announcements and upcoming challenges by email. Each person gets their own email with their own name in it. To write to one person, tap their name under Members.</p>
    <div class="btns"><button class="btn primary" id="emWrite">${icon('note')} Write an email</button><button class="btn" id="emCopy">${icon('copy')} Copy addresses</button><button class="btn" id="emCsv">${icon('download')} Download list</button></div>
    <p class="small faint" id="emNote"></p></section>
  <section class="card" id="chBox"><div class="card-head"><h3>Challenges</h3><span class="pill">One at a time</span></div><div id="chList"><div class="skeleton" style="height:60px"></div></div></section>
  ${studies.length ? `<section class="card"><div class="card-head"><h3>Study review</h3><span class="pill">${R.studies.approved}/${R.studies.total} days · ${R.books.approved}/${R.books.total} books</span></div>
    <p class="small muted">Members only see studies and book introductions after you approve them.</p>
    ${studies.map((n) => { const r = S.data.content.studies[n]; return `<div class="row"><b style="width:60px">Day ${n}</b><span style="flex:1">${r ? esc(r.title) : 'Not written yet'}</span>${r && r.status !== 'approved' ? `<button class="btn sm primary" data-approve="study|${n}">Approve</button>` : (r ? '<span class="pill ok">Approved</span>' : '')}</div>`; }).join('')}
    <div class="btns"><a class="btn" href="${esc(R.studyUrl)}" target="_blank" rel="noopener">Study sheet</a><a class="btn" href="${esc(R.bookUrl)}" target="_blank" rel="noopener">Book sheet</a></div></section>` : ''}
  <section class="card"><h3>Moderation and notifications</h3><p class="small muted">You can remove any post in the Circle. When a member posts a prayer request, the Google account that owns the app receives an email naming the member, without the request text.</p></section>`;
}

function memberRows(root) {
  if (!$('#mlist', root) || !document.contains(root.querySelector('#mlist'))) return;
  const list = (members || []).filter((m) => !q || m.name.toLowerCase().includes(q.toLowerCase()));
  $('#mcount', root).textContent = members ? members.length : '…';
  $('#mlist', root).innerHTML = list.length ? list.map((m) => `<button class="person itemlink" data-m="${esc(m.id)}"><span class="avatar" aria-hidden="true">${esc(m.name.charAt(0).toUpperCase())}</span><span class="info"><b>${esc(m.name)}</b><span>${esc(STATUS[m.status] || m.label)} · ${m.ch} chapters · last seen ${m.lastSeen ? esc(fmtDate(m.lastSeen, { day: 'numeric', month: 'short' })) : 'never'}</span></span>${icon('next')}</button>`).join('') : '<p class="small muted">No members match.</p>';
  $$('[data-m]', root).forEach((b) => b.onclick = () => memberSheet(members.find((m) => m.id === b.dataset.m), root));
  emailList(root);
}
const fillName = (s, m) => s.replace(/\{first\}/gi, m.name.split(' ')[0]).replace(/\{name\}/gi, m.name);
const DRAFT = 'nc.mailDraft';
function composer(ids) {
  const people = members.filter((m) => m.email); const pick = new Set(ids);
  let d = {}; try { d = JSON.parse(localStorage.getItem(DRAFT) || '{}'); } catch (e) {}
  const one = ids.length === 1 && people.find((m) => m.id === ids[0]);
  const s = sheet(`<div class="card-head"><h3>${one ? `Email ${esc(one.name)}` : 'Write an email'}</h3><button class="icon-btn" id="cmX" aria-label="Close">${icon('close')}</button></div>
    <p class="small muted">Type <b>{first}</b> where you want each person's first name, or <b>{name}</b> for their full name. Each person receives their own email, from your Google account, as "New Creation".</p>
    <label class="field" style="margin-top:10px">Subject<input class="input" id="cmS" maxlength="150" value="${esc(d.s || '')}" placeholder="A verse for your week, {first}"></label>
    <label class="field">Message<textarea class="input" id="cmB" rows="9" placeholder="Hi {first},&#10;&#10;This week's verse is ...">${esc(d.b || '')}</textarea></label>
    <details ${one ? '' : 'open'} style="margin-top:8px"><summary class="small"><b id="cmN"></b></summary>
      <div class="stack-sm" style="margin-top:8px">${people.length > 1 ? '<div class="btns"><button class="btn sm" type="button" id="cmAll">Everyone</button><button class="btn sm" type="button" id="cmNone">No one</button></div>' : ''}
      ${people.map((m) => `<label class="toggle"><span><b>${esc(m.name)}</b><br><span class="small muted">${esc(m.email)}</span></span><input type="checkbox" data-to="${esc(m.id)}" ${pick.has(m.id) ? 'checked' : ''}></label>`).join('')}</div></details>
    <div class="note small" style="margin-top:12px" id="cmPrev"></div>
    <p class="err" id="cmErr" role="alert"></p>
    <div class="btns"><button class="btn primary" id="cmGo">${icon('check')} Send</button><button class="btn" id="cmCancel">Cancel</button></div>`, { label: 'Write an email' });
  const chosen = () => $$('[data-to]', s).filter((c) => c.checked).map((c) => c.dataset.to);
  const paint = () => {
    const ids2 = chosen(), n = ids2.length; const first = people.find((m) => m.id === ids2[0]);
    $('#cmN', s).textContent = `Sending to ${n} ${n === 1 ? 'person' : 'people'}`;
    $('#cmGo', s).innerHTML = `${icon('check')} Send to ${n} ${n === 1 ? 'person' : 'people'}`; $('#cmGo', s).disabled = !n;
    const sub = $('#cmS', s).value, body = $('#cmB', s).value;
    $('#cmPrev', s).innerHTML = first && (sub || body) ? `<b>Preview for ${esc(first.name)}</b><br><b>${esc(fillName(sub, first))}</b><br>${esc(fillName(body, first)).replace(/\n/g, '<br>')}` : 'A preview appears here as you type.';
    try { localStorage.setItem(DRAFT, JSON.stringify({ s: sub, b: body })); } catch (e) {}
  };
  s.addEventListener('input', paint); s.addEventListener('change', paint); paint();
  const all = $('#cmAll', s); if (all) { all.onclick = () => { $$('[data-to]', s).forEach((c) => { c.checked = true; }); paint(); }; $('#cmNone', s).onclick = () => { $$('[data-to]', s).forEach((c) => { c.checked = false; }); paint(); }; }
  $('#cmX', s).onclick = closeSheet; $('#cmCancel', s).onclick = closeSheet;
  let armed = false;
  $('#cmGo', s).onclick = async () => {
    const to = chosen(), subject = $('#cmS', s).value.trim(), body = $('#cmB', s).value.trim(); const err = $('#cmErr', s); err.textContent = '';
    if (!subject || !body) { err.textContent = 'Add a subject and a message.'; return; }
    const b = $('#cmGo', s);
    if (!armed) { armed = true; b.innerHTML = `${icon('check')} Tap again to send ${to.length} ${to.length === 1 ? 'email' : 'emails'}`; setTimeout(() => { armed = false; if (document.contains(b)) paint(); }, 5000); return; }
    b.disabled = true; b.textContent = 'Sending…';
    try { const r = await call('mail', S.token, { subject, body, ids: to }); try { localStorage.removeItem(DRAFT); } catch (e) {} closeSheet();
      toast(`Sent ${r.sent} ${r.sent === 1 ? 'email' : 'emails'}.${r.failed && r.failed.length ? ' Not sent: ' + r.failed.join(', ') + '.' : ''} ${r.remaining} left today.`, null, 7000); }
    catch (x) { err.textContent = x.message; armed = false; paint(); }
  };
}
function emailList(root) {
  const box = $('#emList', root); if (!box || !members) return;
  const list = members.filter((m) => m.email); const addrs = list.map((m) => m.email);
  $('#emCount', box).textContent = `${list.length} of ${members.length}`;
  $('#emWrite', box).onclick = () => composer(list.map((m) => m.id));
  $('#emNote', box).textContent = list.length ? '' : 'No one has added an email yet. Everyone is asked once in the app, and can add it under Me.';
  $('#emCopy', box).onclick = () => { if (!addrs.length) { toast('No email addresses yet.'); return; } copyText(addrs.join(', ')); };
  $('#emCsv', box).onclick = () => { if (!list.length) { toast('No email addresses yet.'); return; } const q2 = (x) => '"' + String(x).replace(/"/g, '""') + '"'; download(`new-creation-email-list-${todayISO()}.csv`, 'name,email\n' + list.map((m) => q2(m.name) + ',' + q2(m.email)).join('\n'), 'text/csv'); };
}
function memberSheet(m, root) {
  const msg = catchUpMsg(m);
  const s = sheet(`<div class="row"><span class="avatar" aria-hidden="true">${esc(m.name.charAt(0))}</span><div><h3>${esc(m.name)}</h3><p class="small muted">+${esc(m.phone)}${m.email ? ` · ${esc(m.email)}` : ''}</p></div></div>
    <dl class="kv" style="margin-top:12px"><dt>Joined</dt><dd>${fmtDate(m.joined, { day: 'numeric', month: 'long', year: 'numeric' })}</dd><dt>Progress</dt><dd>${m.ch} chapters · ${esc(STATUS[m.status] || m.label)}</dd>
      <dt>Last read</dt><dd>${m.lastReadDate ? fmtDate(m.lastReadDate) : 'Not yet'}</dd><dt>Last seen</dt><dd>${m.lastSeen ? fmtDate(m.lastSeen) : 'Never'}</dd><dt>Streak</dt><dd>${m.streak || 0} days</dd>${m.nudged ? `<dt>Last encouraged</dt><dd>${fmtDate(m.nudged)}</dd>` : ''}</dl>
    <label class="field" style="margin-top:12px">Message<textarea class="input" id="mmsg" rows="5">${esc(msg)}</textarea></label>
    <div class="btns"><a class="btn primary" id="mwa" href="${esc(waLink(msg, m.phone))}" target="_blank" rel="noopener">${icon('chat')} Message on WhatsApp</a>${m.email ? `<button class="btn" id="mmail">${icon('note')} Email ${esc(m.name.split(' ')[0])}</button>` : ''}</div>
    <div class="btns" style="margin-top:10px"><button class="btn" id="mpin">${icon('lock')} Reset PIN</button><button class="btn danger" id="mrem">${icon('trash')} Remove member</button></div>
    <p class="small faint">Resetting a PIN signs them out and keeps all their reading history.</p>`, { label: m.name });
  $('#mmsg', s).oninput = (e) => { $('#mwa', s).href = waLink(e.target.value, m.phone); };
  const mm = $('#mmail', s); if (mm) mm.onclick = () => composer([m.id]);
  $('#mwa', s).addEventListener('click', () => call('markNudged', S.token, m.id, S.data.challenge.id).catch(() => {}));
  $('#mpin', s).onclick = async () => { const b = $('#mpin', s); if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Tap again to reset the PIN'; return; } b.disabled = true;
    try { const r = await call('resetPin', S.token, m.id); const first = r.name.split(' ')[0]; const txt = `Hi ${first}, your New Creation PIN has been reset. Your new PIN is ${r.pin}.\n\nSign in with your WhatsApp number and this PIN, then change it under Me if you like:\n${appLink()}`;
      sheet(`<h3>New PIN for ${esc(first)}</h3><p class="muted">Their progress is kept. Send them the new PIN privately:</p><p style="font-size:36px;font-weight:750;letter-spacing:.3em;text-align:center">${esc(r.pin)}</p>
        <div class="btns"><button class="btn" id="pc">${icon('copy')} Copy message</button><a class="btn primary" href="${esc(waLink(txt, r.phone))}" target="_blank" rel="noopener">${icon('chat')} Send on WhatsApp</a></div>`, { label: 'New PIN', onOpen: (x) => { $('#pc', x).onclick = () => copyText(txt); } });
    } catch (e) { toast(e.message); b.disabled = false; } };
  $('#mrem', s).onclick = async () => { const b = $('#mrem', s); if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Tap again to remove'; return; } b.disabled = true;
    try { await call('remove', S.token, m.id); members = members.filter((x) => x.id !== m.id); closeSheet(); memberRows(root); toast('Member removed.'); } catch (e) { toast(e.message); b.disabled = false; } };
}

function announce(c) { return `*${c.name}* starts ${fmtDate(c.start, { weekday: 'long', day: 'numeric', month: 'long' })}!\n${c.planName}, ${c.n} days (until ${fmtDate(c.end)}).\n\nAlready in the circle? It opens in the app automatically, with fresh progress. New? Join here:\n${inviteLink()}`; }
function chRows(root) {
  const box = $('#chList', root); if (!box) return; const next = (chList || []).find((c) => c.role === 'next');
  const role = { current: 'Running now', next: 'Next', later: 'Scheduled', past: 'Finished' };
  box.innerHTML = `<div class="list-plain">${(chList || []).map((c) => `<div><div class="row"><b style="flex:1">${esc(c.name)}</b><span class="pill ${c.role === 'current' ? 'ok' : c.role === 'next' ? 'gold' : ''}">${role[c.role] || ''}</span></div>
      <p class="small muted">${esc(c.planName)} · ${fmtDate(c.start, { day: 'numeric', month: 'short', year: 'numeric' })} to ${fmtDate(c.end, { day: 'numeric', month: 'short', year: 'numeric' })} · ${c.members} members</p>
      ${c.role === 'next' ? `<div class="btns" style="margin-top:8px"><a class="btn sm primary" href="${esc(waLink(announce(c)))}" target="_blank" rel="noopener">${icon('chat')} Announce</a><button class="btn sm" data-copyann="${esc(c.id)}">${icon('copy')} Copy</button><button class="btn sm" data-edit="${esc(c.id)}">Edit</button><button class="btn sm danger" data-cancel="${esc(c.id)}">Cancel</button></div>` : ''}</div>`).join('')}</div>
    ${next ? '' : '<button class="btn primary" id="newCh">Schedule the next challenge</button>'}
    <p class="small faint">Members move into the next challenge automatically on its start date, even if nobody opens the app that night. Progress from the current challenge is kept.</p>`;
  const nb = $('#newCh', box); if (nb) nb.onclick = () => chForm(null, root);
  $$('[data-edit]', box).forEach((b) => b.onclick = () => chForm(chList.find((c) => c.id === b.dataset.edit), root));
  $$('[data-copyann]', box).forEach((b) => b.onclick = () => copyText(announce(chList.find((c) => c.id === b.dataset.copyann))));
  $$('[data-cancel]', box).forEach((b) => b.onclick = async () => { if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Tap again to cancel it'; return; } b.disabled = true;
    try { chList = await call('cancelChallenge', S.token, b.dataset.cancel); chRows(root); toast('Cancelled.'); } catch (e) { toast(e.message); b.disabled = false; } });
}
function chForm(edit, root) {
  const cur = S.data.challenge; const min = cur.end >= todayISO() ? addDays(cur.end, 1) : addDays(todayISO(), 1);
  const plans = Object.entries(PLANS.plans);
  const s = sheet(`<h3>${edit ? 'Edit the next challenge' : 'Schedule the next challenge'}</h3>
    <form id="chf" class="stack" style="margin-top:12px" novalidate>
      <label class="field">Reading plan<select class="input" id="cfPlan">${plans.map(([id, p]) => `<option value="${id}" ${(edit ? edit.plan : 'gospels30') === id ? 'selected' : ''}>${esc(p.name)} (${p.days.length} days)</option>`).join('')}</select></label>
      <label class="field">Challenge name<input class="input" id="cfName" maxlength="60" value="${esc(edit ? edit.name : '')}" placeholder="e.g. The Gospels in January"></label>
      <label class="field">Start date<input class="input" type="date" id="cfStart" min="${min}" value="${esc(edit ? edit.start : min)}"></label>
      <label class="field">New WhatsApp group link (optional)<input class="input" id="cfLink" inputmode="url" value="${esc(edit ? edit.link || '' : '')}" placeholder="https://chat.whatsapp.com/..."></label>
      <div class="card flat" id="cfPrev" aria-live="polite"></div>
      <p class="err" id="cfErr" role="alert"></p>
      <button class="btn primary" type="submit">${edit ? 'Save changes' : 'Schedule'}</button></form>`, { label: 'Schedule a challenge' });
  const prev = () => { const id = $('#cfPlan', s).value, st = $('#cfStart', s).value || min; const p = buildPlan(id, st);
    $('#cfPrev', s).innerHTML = `<p class="eyebrow">Preview</p><p class="small">${esc(PLANS.plans[id].blurb)}</p><p class="small"><b>${p.days.length} days</b>, ${p.unique} chapters · ${fmtDate(st, { day: 'numeric', month: 'long', year: 'numeric' })} to ${fmtDate(p.days[p.days.length - 1].date, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <div class="small muted">${p.days.slice(0, 4).map((d) => `Day ${d.n}: ${esc(d.read)}`).join('<br>')}${p.days.length > 4 ? '<br>…' : ''}</div>`; };
  $('#cfPlan', s).onchange = prev; $('#cfStart', s).onchange = prev; prev();
  $('#chf', s).onsubmit = async (e) => { e.preventDefault(); const o = { plan: $('#cfPlan', s).value, name: $('#cfName', s).value, start: $('#cfStart', s).value, link: $('#cfLink', s).value };
    try { chList = edit ? await call('updateChallenge', S.token, edit.id, o) : await call('createChallenge', S.token, o); closeSheet(); chRows(root); toast(edit ? 'Saved.' : 'Scheduled. Use Announce to share it with the group.'); }
    catch (x) { $('#cfErr', s).textContent = x.message; } };
}

export function mount(root) {
  if (!S.data.me.leader) return;
  $('#gpCopy', root).onclick = () => copyText(groupPost());
  $('#msearch', root).oninput = (e) => { q = e.target.value; memberRows(root); };
  if (members) memberRows(root);
  call('leader', S.token, S.data.challenge.id).then((r) => { members = r.sort((a, b) => a.name.localeCompare(b.name)); memberRows(root); }).catch((e) => { if ($('#mlist', root)) $('#mlist', root).innerHTML = `<p class="notice">${esc(e.message)}</p>`; });
  call('challenges', S.token).then((r) => { chList = r; chRows(root); }).catch((e) => { if ($('#chList', root)) $('#chList', root).innerHTML = `<p class="notice">${esc(e.message)}</p>`; });
  $$('[data-approve]', root).forEach((b) => b.onclick = async () => { const [k, key] = b.dataset.approve.split('|'); b.disabled = true; try { S.data.content = await call('approve', S.token, k, key); toast('Approved.'); go('#/leader'); } catch (e) { toast(e.message); b.disabled = false; } });
}
void when;
