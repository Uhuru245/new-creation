// Shared helpers: escaping, icons, dates (Africa/Johannesburg), storage, toasts and sheets.
export const TZ = 'Africa/Johannesburg';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, el = document) => el.querySelector(sel);
export const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

// ---------- storage (never throws; private keys are cleared on sign-out) ----------
const PRIVATE_PREFIX = 'nc.p.';
export const store = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  json(k, d = null) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  setJson(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  // Private data (state snapshot, notes, drafts, queue) lives under nc.p.* so sign-out can wipe it all.
  pget(k, d = null) { return store.json(PRIVATE_PREFIX + k, d); },
  pset(k, v) { store.setJson(PRIVATE_PREFIX + k, v); },
  pdel(k) { store.del(PRIVATE_PREFIX + k); },
  clearPrivate() { try { Object.keys(localStorage).filter((k) => k.startsWith(PRIVATE_PREFIX)).forEach((k) => localStorage.removeItem(k)); } catch (e) {} },
};

// ---------- dates ----------
const dtf = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
export const todayISO = () => dtf.format(new Date());
export const hourJHB = () => Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hour12: false }).format(new Date()));
export function addDays(iso, n) { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
export function daysBetween(a, b) { return Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 864e5); }
export function fmtDate(iso, opts = { day: 'numeric', month: 'long' }) { if (!iso) return ''; return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-ZA', { ...opts, timeZone: 'UTC' }); }
export function when(stamp) {
  // stamp: "yyyy-MM-dd HH:mm" in Johannesburg time
  if (!stamp) return '';
  const d = stamp.slice(0, 10), t = stamp.slice(11, 16), today = todayISO();
  const diff = daysBetween(d, today);
  const day = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : diff < 7 ? new Date(d + 'T12:00:00Z').toLocaleDateString('en-ZA', { weekday: 'long', timeZone: 'UTC' }) : fmtDate(d, { day: 'numeric', month: 'short' });
  return t ? `${day}, ${t}` : day;
}
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)).replace(/-/g, '').slice(0, 12);

// ---------- icons (one consistent filled two-tone set) ----------
const I = {
  today: '<path opacity=".35" d="M5 11.7 12 6l7 5.7V20a1 1 0 0 1-1 1h-3.6v-5a1 1 0 0 0-1-1h-2.8a1 1 0 0 0-1 1v5H6a1 1 0 0 1-1-1z"/><path d="M12 3.2 2.7 10.9a1 1 0 0 0 1.3 1.6L12 5.9l8 6.6a1 1 0 0 0 1.3-1.6Z"/><rect x="10.3" y="16" width="3.4" height="5" rx=".6"/>',
  bible: '<path opacity=".35" d="M7 3h11a2 2 0 0 1 2 2v13H7.5A2.5 2.5 0 0 0 5 20.5V5a2 2 0 0 1 2-2Z"/><path d="M7.5 18H20v1.5a1.5 1.5 0 0 1-1.5 1.5h-11a1.5 1.5 0 0 1 0-3Z"/><path d="M11.6 6h1.8v2.6H16v1.8h-2.6V15h-1.8v-4.6H9V8.6h2.6Z"/>',
  original: '<path opacity=".35" d="M5 4h11.5A2.5 2.5 0 0 1 19 6.5V20H7.5A2.5 2.5 0 0 1 5 17.5Z"/><path d="M8.2 8.4h1.6l1.9 5.6h-1.5l-.4-1.3H8.2l-.4 1.3H6.3Zm.8 1.8-.5 1.5h1Zm3.9.1c.4-.7 1-1 1.7-1 1 0 1.6.6 1.6 1.6V14h-1.3v-.4c-.3.4-.7.5-1.2.5-.8 0-1.4-.5-1.4-1.2 0-.8.6-1.2 1.6-1.3l1-.1c0-.4-.2-.6-.6-.6-.3 0-.6.1-.8.5Zm2 2.1v-.3l-.8.1c-.4 0-.6.2-.6.4s.2.4.5.4c.5 0 .9-.3.9-.6Z"/>',
  circle: '<circle opacity=".35" cx="7" cy="9" r="3"/><circle opacity=".35" cx="17" cy="9" r="3"/><path opacity=".35" d="M1.5 19c.4-3 2.6-5 5.5-5 1 0 1.9.2 2.7.7A6.8 6.8 0 0 0 7.6 19Z"/><path opacity=".35" d="M22.5 19c-.4-3-2.6-5-5.5-5-1 0-1.9.2-2.7.7a6.8 6.8 0 0 1 2.1 4.3Z"/><circle cx="12" cy="8" r="3.6"/><path d="M5.6 20.2c.6-3.7 3.2-6.1 6.4-6.1s5.8 2.4 6.4 6.1c.1.5-.3.8-.8.8H6.4c-.5 0-.9-.3-.8-.8Z"/>',
  journey: '<path opacity=".3" d="M3 6.4 8.6 4l6.8 2.4L21 4v13.6L15.4 20l-6.8-2.4L3 20Z"/><path opacity=".6" d="M8.6 4v13.6L3 20V6.4Zm6.8 2.4V20l5.6-2.4V4Z"/><path fill-rule="evenodd" d="M12 7.2a2.8 2.8 0 0 0-2.8 2.8c0 2.2 2.8 5 2.8 5s2.8-2.8 2.8-5A2.8 2.8 0 0 0 12 7.2Zm0 3.9a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z"/>',
  me: '<circle cx="12" cy="7.8" r="4.1"/><path opacity=".4" d="M3.9 20.1c0-4.1 3.6-6.9 8.1-6.9s8.1 2.8 8.1 6.9c0 .5-.4.9-.9.9H4.8c-.5 0-.9-.4-.9-.9Z"/>',
  leader: '<path d="M9 21.6V9.2a4.6 4.6 0 1 1 9.2 0v1.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><rect opacity=".4" x="7.4" y="13.2" width="3.2" height="2.6" rx=".7"/>',
  heart: '<path d="M12 20.6S3.4 15.6 3.4 9.3A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.6 2.7c0 6.3-8.6 11.3-8.6 11.3Z"/>',
  chat: '<path d="M4 6.6A2.6 2.6 0 0 1 6.6 4h10.8A2.6 2.6 0 0 1 20 6.6v7.8a2.6 2.6 0 0 1-2.6 2.6H10.2l-4.5 3.6c-.7.5-1.7.1-1.7-.8Z"/>',
  bookmark: '<path d="M6.5 3h11A1.5 1.5 0 0 1 19 4.5v16a.8.8 0 0 1-1.3.6L12 16.9l-5.7 4.2a.8.8 0 0 1-1.3-.6v-16A1.5 1.5 0 0 1 6.5 3Z"/>',
  note: '<path opacity=".35" d="M5 3h10l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M15 3v3a1 1 0 0 0 1 1h3ZM7 11h10v1.6H7Zm0 3.4h10V16H7Zm0 3.4h6v1.6H7Z"/>',
  highlight: '<path opacity=".35" d="M3 19h18v2H3z"/><path d="m15.6 3.4 4 4a1 1 0 0 1 0 1.4l-7.9 7.9-4.3.9.9-4.3 7.9-7.9a1 1 0 0 1 1.4 0Z"/>',
  share: '<circle cx="18" cy="5.5" r="2.8"/><circle cx="6" cy="12" r="2.8"/><circle cx="18" cy="18.5" r="2.8"/><path d="m8.4 10.7 7.2-3.9.9 1.6-7.2 3.9Zm0 2.6.9-1.6 7.2 3.9-.9 1.6Z" opacity=".6"/>',
  copy: '<rect opacity=".4" x="4" y="4" width="11.5" height="11.5" rx="2"/><rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/>',
  trash: '<path opacity=".35" d="M6 7h12l-1 13a1.5 1.5 0 0 1-1.5 1.4h-7A1.5 1.5 0 0 1 7 20Z"/><path d="M9 3.5h6l.6 1.5H20v2H4V5h4.4Z"/>',
  check: '<path d="M9.2 16.6 4.9 12.3l1.6-1.6 2.7 2.7 8.3-8.3 1.6 1.6Z"/>',
  search: '<path d="m15.5 14 5.3 5.3-1.5 1.5-5.3-5.3Z"/><circle cx="10" cy="10" r="6.2" fill="none" stroke="currentColor" stroke-width="2.2"/>',
  textsize: '<path d="M3 18h2.2l1.1-3h4.3l1.1 3H14L9.6 6H7.4Zm3.9-5 1.6-4.4 1.6 4.4Z"/><path opacity=".5" d="M14.5 18h1.7l.7-1.9h3l.7 1.9H22l-3-8h-1.6Zm3-3.4.9-2.5.9 2.5Z"/>',
  back: '<path d="M14.7 5.3 8 12l6.7 6.7 1.6-1.6L11.2 12l5.1-5.1Z"/>',
  next: '<path d="M9.3 5.3 16 12l-6.7 6.7-1.6-1.6 5.1-5.1-5.1-5.1Z"/>',
  down: '<path d="m5.3 9.3 6.7 6.7 6.7-6.7-1.6-1.6-5.1 5.1-5.1-5.1Z"/>',
  close: '<path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4Z"/>',
  plus: '<path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7Z"/>',
  calendar: '<path opacity=".35" d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M6 4h1.5V2.5h2V4h5V2.5h2V4H18a2 2 0 0 1 2 2v2H4V6a2 2 0 0 1 2-2Zm2 8h3v3H8Z"/>',
  lock: '<path opacity=".35" d="M5 10h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"/><path d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10h-2V7.5a2.5 2.5 0 0 0-5 0V10Zm3.5 3.5h2v4h-2Z"/>',
  download: '<path opacity=".35" d="M4 17h16v3H4z"/><path d="M11 3h2v8.2l3-3 1.4 1.4-5.4 5.4-5.4-5.4L8 8.2l3 3Z"/>',
  link: '<path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0Z"/><path opacity=".5" d="M8.3 11.1 6 13.4a3 3 0 0 0 4.2 4.2l2.3-2.3 1.4 1.4-2.3 2.3a5 5 0 0 1-7-7l2.3-2.3Zm7.4 1.8 2.3-2.3a3 3 0 0 0-4.2-4.2l-2.3 2.3-1.4-1.4 2.3-2.3a5 5 0 0 1 7 7l-2.3 2.3Z"/>',
  star: '<path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7Z"/>',
  refresh: '<path d="M12 5a7 7 0 0 1 6.6 4.7l1.9-.7A9 9 0 0 0 4.3 7.3V4.5h-2V11h6.5V9H5.6A7 7 0 0 1 12 5Zm7 6v2h3.2A7 7 0 0 1 5.4 14.3l-1.9.7a9 9 0 0 0 16.2 1.7V19.5h2V13Z"/>',
  sun: '<circle cx="12" cy="12" r="4.5"/><path opacity=".5" d="M11 1.5h2v3h-2Zm0 18h2v3h-2ZM1.5 11h3v2h-3Zm18 0h3v2h-3ZM4.2 5.6l1.4-1.4 2.1 2.1-1.4 1.4Zm12.1 12.1 1.4-1.4 2.1 2.1-1.4 1.4ZM4.2 18.4l2.1-2.1 1.4 1.4-2.1 2.1Zm12.1-12.1 2.1-2.1 1.4 1.4-2.1 2.1Z"/>',
  info: '<circle opacity=".35" cx="12" cy="12" r="9.5"/><path d="M11 10.5h2V17h-2Zm0-3.5h2v2h-2Z"/>',
  ear: '<path d="M12 2.5a7 7 0 0 0-7 7h2a5 5 0 0 1 10 0c0 1.7-.8 2.6-1.8 3.6S13 15.4 13 17.3a2.2 2.2 0 0 1-4.4 0H6.6a4.2 4.2 0 0 0 8.4 0c0-1.1.6-1.8 1.6-2.8S19 12 19 9.5a7 7 0 0 0-7-7Z"/>',
};
export const icon = (n, cls = 'ico', label = '') => `<svg class="${cls}" viewBox="0 0 24 24" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'}>${I[n] || ''}</svg>`;

let emblemN = 0;
export function emblem(cls = 'emblem') {
  const k = 'e' + (++emblemN);
  return `<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="${k}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2C664E"/><stop offset="1" stop-color="#143526"/></linearGradient><linearGradient id="${k}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DE9C"/><stop offset=".55" stop-color="#C9A04A"/><stop offset="1" stop-color="#8E6A24"/></linearGradient></defs><path d="M14 9.2h21.6a2.6 2.6 0 0 1 2.6 2.6v26.4a1.8 1.8 0 0 1-1.8 1.8H14Z" fill="#F7F0DE"/><path d="M36 13v25M37.2 13v25" stroke="#D8C9A6" stroke-width=".4"/><path d="M30.6 38.6v7l1.9-1.7 1.9 1.7v-7Z" fill="#A61E2A"/><rect x="8.6" y="5.8" width="27.6" height="34.4" rx="3.2" fill="url(#${k}c)"/><rect x="8.6" y="5.8" width="5" height="34.4" rx="2.4" fill="#000" opacity=".25"/><rect x="16.2" y="9.4" width="16.8" height="27.2" rx="1.6" fill="none" stroke="url(#${k}g)" stroke-width=".7" opacity=".9"/><path d="M23.4 13.2h2.6v5.4h4.4v2.6H26v10.6h-2.6V21.2H19v-2.6h4.4Z" fill="url(#${k}g)"/></svg>`;
}

// ---------- toasts ----------
let toastTimer = null;
export function toast(msg, action = null, ms = 4200) {
  let el = $('#toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
  el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ''}`;
  el.hidden = false;
  if (action) el.querySelector('button').onclick = () => { el.hidden = true; action.run(); };
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, action ? Math.max(ms, 6000) : ms);
}

// ---------- bottom sheet / dialog ----------
let lastFocus = null;
export function sheet(html, { label = 'Dialog', onOpen = null } = {}) {
  closeSheet();
  lastFocus = document.activeElement;
  const scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.id = 'scrim'; scrim.onclick = closeSheet;
  const s = document.createElement('div'); s.className = 'sheet'; s.id = 'sheet'; s.setAttribute('role', 'dialog'); s.setAttribute('aria-modal', 'true'); s.setAttribute('aria-label', label);
  s.innerHTML = `<div class="grab" aria-hidden="true"></div>${html}`;
  document.body.append(scrim, s);
  document.body.style.overflow = 'hidden';
  const f = s.querySelector('[autofocus], button, input, select, textarea, a[href]'); if (f) f.focus({ preventScroll: true });
  if (onOpen) onOpen(s);
  return s;
}
export function closeSheet() {
  const s = $('#sheet'), c = $('#scrim'); if (s) s.remove(); if (c) c.remove();
  document.body.style.overflow = '';
  if (lastFocus && document.contains(lastFocus)) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#sheet')) closeSheet(); });

// ---------- copy / share with fallbacks ----------
export async function copyText(text) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); toast('Copied.'); return true; } } catch (e) {}
  const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta);
  ta.select(); ta.setSelectionRange(0, text.length); let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
  ta.remove(); if (ok) { toast('Copied.'); return true; }
  sheet(`<h3>Copy this text</h3><p class="muted small">Press and hold to select, then copy.</p><textarea class="input" rows="8" readonly>${esc(text)}</textarea>`, { label: 'Copy text' });
  return false;
}
export const waLink = (text, phone = '') => `https://wa.me/${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
export async function shareText(text, title = 'New Creation') {
  if (navigator.share) { try { await navigator.share({ title, text }); return true; } catch (e) { if (e && e.name === 'AbortError') return false; } }
  return copyText(text);
}
export function download(name, text, type = 'application/json') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
