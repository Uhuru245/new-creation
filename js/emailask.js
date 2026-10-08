// Asks a signed-in member, once, for an email address so New Creation can send verses, announcements and challenges.
import { $, esc, icon, toast, sheet, closeSheet, store } from './util.js';
import { call } from './api.js';
import { S } from './state.js';

const SNOOZE = 'nc.emailSnooze'; const DAYS = 10;
export const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[a-z]{2,}$/i;
let shown = false;

export function needed() {
  const st = (S.data && S.data.me && S.data.me.settings) || {};
  if (st.email || st.emailAsk === 'no') return false;
  const until = Number(store.get(SNOOZE, '0')) || 0; return Date.now() > until;
}
export async function save(email) {
  const r = await call('settings', S.token, { email });
  if (email && (r.settings || {}).email !== email.toLowerCase()) throw new Error('Your email could not be saved just now. Please try again later.');
  S.data.me.settings = r.settings; store.pset('snap', S.data); return r.settings;
}

export function maybeAsk() {
  if (shown || !S.fresh || !needed() || document.getElementById('sheet')) return;
  shown = true; setTimeout(() => { if (!document.getElementById('sheet') && needed()) open(); }, 1500);
}

export function open() {
  const first = esc((S.data.me.name || '').split(' ')[0]);
  const s = sheet(`<div class="card-head"><h3>Stay connected${first ? `, ${first}` : ''}</h3><button class="icon-btn" id="emX" aria-label="Close">${icon('close')}</button></div>
    <p class="muted" style="margin-top:6px">Add your email to receive a verse for the week, group announcements and upcoming challenges from New Creation.</p>
    <form id="emF" class="stack-sm" style="margin-top:12px" novalidate>
      <label class="field">Email address<input class="input" id="emI" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com" required autofocus></label>
      <label class="toggle"><span class="small">Yes, email me from New Creation. My address stays private, and I can stop at any time under Me.</span><input type="checkbox" id="emOk"></label>
      <p class="err" id="emErr" role="alert"></p>
      <div class="btns"><button class="btn primary" type="submit" id="emGo">${icon('check')} Keep me posted</button><button class="btn" type="button" id="emLater">Not now</button></div>
      <button class="link" type="button" id="emNo" style="justify-self:start">No thanks, don't ask again</button>
    </form>`, { label: 'Add your email' });
  const later = () => { store.set(SNOOZE, String(Date.now() + DAYS * 864e5)); closeSheet(); };
  $('#emX', s).onclick = later; $('#emLater', s).onclick = later;
  $('#emNo', s).onclick = async () => { closeSheet(); try { const r = await call('settings', S.token, { emailAsk: 'no' }); S.data.me.settings = r.settings; } catch (e) { store.set(SNOOZE, String(Date.now() + 90 * 864e5)); } toast('No problem. You can add your email any time under Me.'); };
  $('#emF', s).onsubmit = async (e) => {
    e.preventDefault(); const v = $('#emI', s).value.trim(); const err = $('#emErr', s); err.textContent = '';
    if (!EMAIL_RE.test(v)) { err.textContent = 'Please enter a valid email address.'; $('#emI', s).focus(); return; }
    if (!$('#emOk', s).checked) { err.textContent = 'Please tick the box to agree to receive emails.'; return; }
    const b = $('#emGo', s); b.disabled = true;
    try { await save(v); closeSheet(); toast("Thank you. You'll hear from us by email."); }
    catch (x) { err.textContent = x.message; b.disabled = false; }
  };
}
