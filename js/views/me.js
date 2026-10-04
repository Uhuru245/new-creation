// Me: profile, reading preferences, saved items, invitation, reminders, privacy and account.
import { $, $$, esc, icon, toast, sheet, closeSheet, store, copyText, shareText, waLink, download, fmtDate, todayISO } from '../util.js';
import { call, DEMO } from '../api.js';
import { S, privList, setPriv, signOutLocal } from '../state.js';
import { META, TRANSLATIONS, loadBook, refLabel } from '../bible.js';
import { setTheme } from './bible.js';
import { go } from '../app.js';

export const title = 'Me';
const CFG = window.NC_CONFIG || {};
export const inviteLink = () => `${location.origin}${location.pathname}?${DEMO ? 'demo=1&' : ''}by=${encodeURIComponent(S.data.me.id)}`;
const refOf = (k) => { const [b, c, v] = k.split('.'); return { b, c: Number(c), v: Number(v), label: refLabel(b, Number(c), Number(v)) }; };

function savedList(kind, empty) {
  const items = privList(kind).sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
  if (!items.length) return `<p class="small muted">${empty}</p>`;
  return `<div class="list-plain">${items.slice(0, 50).map((x) => {
    if (kind === 'word') { const d = x.data; return `<a class="itemlink" href="#/original/${d.b}/${d.c}/${d.v}?w=${d.w}"><span class="grow"><b dir="auto">${esc(d.lemma)} · ${esc(String(d.gloss).replace(/[<>]/g, ''))}</b><span>${esc(d.ref)}</span></span>${icon('next')}</a>`; }
    const r = refOf(x.key); const sub = kind === 'note' ? x.data.text : kind === 'highlight' ? `Highlighted ${x.data.color}` : 'Bookmark';
    return `<a class="itemlink" href="#/bible/${r.b}/${r.c}?v=${r.v}"><span class="grow"><b>${esc(r.label)}</b><span>${esc(sub)}</span></span>${icon('next')}</a>`; }).join('')}</div>`;
}
function reminderLinks(time) {
  const [h, m] = time.split(':').map(Number); const p = S.plan; const startD = todayISO() > p.days[0].date ? todayISO() : p.days[0].date; const until = p.days[p.days.length - 1].date;
  const [y, mo, dd] = startD.split('-').map(Number); const st = new Date(Date.UTC(y, mo - 1, dd, h - 2, m)), en = new Date(st.getTime() + 20 * 60000);
  const z = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const app = location.origin + location.pathname;
  const g = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent("New Creation: today's reading") + '&details=' + encodeURIComponent("Open the app for today's chapters:\n" + app) + '&dates=' + z(st) + '/' + z(en) + '&recur=' + encodeURIComponent('RRULE:FREQ=DAILY;UNTIL=' + until.replace(/-/g, '') + 'T215959Z');
  const ics = CFG.apiUrl && !DEMO ? `${CFG.apiUrl}?ics=${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}&from=${p.days[0].date}&until=${until}` : '';
  return { g, ics, until };
}

export async function render() {
  const d = S.data, m = d.me, st = m.settings || {}; const rem = store.get('nc.rem', '06:00'); const L = reminderLinks(rem);
  const size = store.get('nc.size', '19'), th = store.get('nc.theme', 'auto'), tr = store.get('nc.tr', 'bsb');
  return `<div class="row"><span class="avatar" style="width:56px;height:56px;font-size:22px" aria-hidden="true">${esc(m.name.charAt(0).toUpperCase())}</span><div><h1>${esc(m.name)}</h1><p class="muted small">Joined ${fmtDate(m.joined, { day: 'numeric', month: 'long', year: 'numeric' })}${m.leader ? ' · Leader' : ''}</p></div></div>
  ${m.leader ? `<a class="card" href="#/leader" style="text-decoration:none;color:inherit;flex-direction:row;align-items:center;border-color:var(--gold-2)">${icon('leader', 'ico')}<span style="flex:1"><b>Leader area</b><br><span class="small muted">Members, PIN resets, the daily group post and challenge scheduling</span></span>${icon('next')}</a>` : ''}
  <section class="card"><h3>Invite a friend</h3><p class="small muted">Your personal link welcomes them with your name.</p><p class="code" id="invUrl">${esc(inviteLink())}</p>
    <div class="btns"><button class="btn" id="invCopy">${icon('copy')} Copy link</button><a class="btn primary" target="_blank" rel="noopener" href="${esc(waLink(`I'm reading the Bible with a small circle: ${d.challenge.name}. Join me here:\n${inviteLink()}`))}">${icon('chat')} WhatsApp</a><button class="btn" id="invShare">${icon('share')} Share</button></div></section>
  <section class="card"><h3>Reading preferences</h3>
    <label class="field">Translation<select class="input" id="pTr">${Object.values(TRANSLATIONS).map((t) => `<option value="${t.id}" ${t.id === tr ? 'selected' : ''}>${t.name} (${t.short})</option>`).join('')}</select></label>
    <label class="field">Text size <span class="faint" id="pSzv">${size}px</span><input type="range" id="pSz" min="15" max="30" value="${size}"></label>
    <div class="field">Theme<div class="seg" role="group" aria-label="Theme">${[['auto', 'Auto'], ['light', 'Light'], ['sepia', 'Sepia'], ['dark', 'Dark']].map(([k, n]) => `<button data-th="${k}" aria-pressed="${th === k}">${n}</button>`).join('')}</div></div>
    <button class="btn" id="offline">${icon('download')} Save ${TRANSLATIONS[tr].short} on this device for offline reading</button><p class="small faint" id="offMsg"></p></section>
  <section class="card"><h3>Bookmarks</h3>${savedList('bookmark', 'Tap any verse in the Bible and choose Bookmark.')}</section>
  <section class="card"><h3>Private notes</h3>${savedList('note', 'Notes you write on verses appear here. Only you can see them.')}</section>
  <section class="card"><h3>Highlights</h3>${savedList('highlight', 'Highlighted verses appear here.')}</section>
  <section class="card"><h3>Word studies</h3>${savedList('word', 'Save a word from the Original languages tab to find it here.')}</section>
  <section class="card"><h3>Daily reminder</h3><p class="small muted">Add a repeating reminder to your phone's calendar. It runs until ${fmtDate(L.until)}. (The app doesn't send push notifications.)</p>
    <label class="field">Time<input class="input" type="time" id="remT" value="${esc(rem)}"></label>
    <div class="btns"><a class="btn" id="remG" href="${esc(L.g)}" target="_blank" rel="noopener">${icon('calendar')} Google Calendar</a>${L.ics ? `<a class="btn" id="remI" href="${esc(L.ics)}" target="_blank" rel="noopener">${icon('calendar')} iPhone or Outlook</a>` : ''}</div></section>
  <section class="card"><h3>Privacy</h3>
    <label class="toggle"><span><b>Keep my progress private</b><br><span class="small muted">Others will see your name but not your chapter count. Your leader still sees it.</span></span><input type="checkbox" id="hideP" ${st.hideProgress ? 'checked' : ''}></label>
    <p class="small muted">What the circle sees: your name, your progress (unless private) and your posts. Only the leader sees your WhatsApp number. Notes, highlights and bookmarks are only ever visible to you.</p>
    <a class="link" href="#/privacy">Read the privacy notice</a></section>
  <section class="card"><h3>Account</h3>
    <label class="field">Display name<div class="row"><input class="input" id="nm" maxlength="40" value="${esc(m.name)}"><button class="btn" id="nmSave">Save</button></div></label>
    <label class="field">Change PIN<div class="row"><input class="input otp" id="np" inputmode="numeric" maxlength="4" placeholder="••••" autocomplete="new-password"><button class="btn" id="npSave">Save</button></div></label>
    <p class="small faint">Forgot your PIN on another device? Your leader can reset it without changing your reading history.</p>
    <div class="btns"><button class="btn" id="exp">${icon('download')} Download my data</button><button class="btn" id="out">Sign out</button></div>
    <button class="link danger" id="del">Delete my account</button></section>
  <p class="small faint" style="text-align:center">New Creation ${DEMO ? '· demonstration' : ''} · Bible text: ${esc(TRANSLATIONS[tr].name)}</p>`;
}

export function mount(root) {
  $('#invCopy', root).onclick = () => copyText(inviteLink());
  $('#invShare', root).onclick = () => shareText(`Join me in New Creation: ${inviteLink()}`);
  $('#pTr', root).onchange = (e) => { store.set('nc.tr', e.target.value); toast('Translation updated.'); go('#/me'); };
  $('#pSz', root).oninput = (e) => { store.set('nc.size', e.target.value); document.documentElement.style.setProperty('--read-size', e.target.value + 'px'); $('#pSzv', root).textContent = e.target.value + 'px'; };
  $$('[data-th]', root).forEach((b) => b.onclick = () => { setTheme(b.dataset.th); $$('[data-th]', root).forEach((x) => x.setAttribute('aria-pressed', x === b)); });
  $('#offline', root).onclick = async () => { const tr = store.get('nc.tr', 'bsb'); const b = $('#offline', root); b.disabled = true; let n = 0;
    try { await Promise.all(META.codes.map((c) => loadBook(tr, c).then(() => { n++; $('#offMsg', root).textContent = `Saving… ${Math.round(n / 66 * 100)}%`; }))); $('#offMsg', root).textContent = `${TRANSLATIONS[tr].name} is saved on this device.`; }
    catch (e) { $('#offMsg', root).textContent = 'Could not finish. Check your connection and try again.'; } b.disabled = false; };
  $('#remT', root).onchange = (e) => { store.set('nc.rem', e.target.value); const L = reminderLinks(e.target.value); $('#remG', root).href = L.g; const i = $('#remI', root); if (i) i.href = L.ics; };
  $('#hideP', root).onchange = async (e) => { try { const r = await call('settings', S.token, { hideProgress: e.target.checked }); S.data.me.settings = r.settings; toast(e.target.checked ? 'Your progress is now private.' : 'Your progress is visible to the circle.'); } catch (x) { e.target.checked = !e.target.checked; toast(x.message); } };
  $('#nmSave', root).onclick = async () => { try { const r = await call('settings', S.token, { name: $('#nm', root).value }); S.data.me.name = r.name; toast('Name updated.'); go('#/me'); } catch (x) { toast(x.message); } };
  $('#npSave', root).onclick = async () => { const v = $('#np', root).value; if (!/^\d{4}$/.test(v)) { toast('Choose a PIN of exactly 4 numbers.'); return; } try { await call('setPin', S.token, v); $('#np', root).value = ''; toast('PIN changed.'); } catch (x) { toast(x.message); } };
  $('#exp', root).onclick = async () => { try { const data = await call('exportMe', S.token); download(`new-creation-my-data-${todayISO()}.json`, JSON.stringify(data, null, 2)); toast('Your data has been downloaded.'); } catch (x) { toast(x.message); } };
  $('#out', root).onclick = async () => { const b = $('#out', root); b.disabled = true; try { await call('signOut', S.token); } catch (e) {} signOutLocal(); location.hash = '#/'; location.reload(); };
  $('#del', root).onclick = () => {
    const s = sheet(`<h3>Delete your account?</h3><p class="muted">This permanently removes your profile, reading progress, posts, encouragements and private notes from New Creation. It can't be undone. You may want to download your data first.</p>
      <label class="field" style="margin-top:12px">Enter your PIN to confirm<input class="input otp" id="dp" inputmode="numeric" maxlength="4" autocomplete="current-password"></label><p class="err" id="derr" role="alert"></p>
      <div class="btns"><button class="btn" id="dno">Keep my account</button><button class="btn danger" id="dyes">Delete permanently</button></div>`, { label: 'Delete account' });
    $('#dno', s).onclick = closeSheet;
    $('#dyes', s).onclick = async () => { const b = $('#dyes', s); b.disabled = true; try { await call('deleteAccount', S.token, $('#dp', s).value); signOutLocal(); closeSheet(); alertGone(); } catch (x) { $('#derr', s).textContent = x.message; b.disabled = false; } };
  };
}
function alertGone() { document.getElementById('root').innerHTML = `<div class="auth"><div class="panel"><h1>Your account has been deleted</h1><p class="muted">Thank you for reading with us. You're welcome back any time.</p><a class="btn primary" href="./">Close</a></div></div>`; }
void setPriv;
