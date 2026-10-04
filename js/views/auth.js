// Join (with or without an invitation) and sign in. No Google account needed.
import { $, esc, emblem, store } from '../util.js';
import { call, DEMO } from '../api.js';
import { setToken } from '../state.js';

export const title = 'Welcome';
export async function render() {
  const by = store.get('nc.by', '');
  return `<div class="auth"><div class="panel">
    <div class="mark">${emblem()}<div><p class="eyebrow" id="invLine">${by ? 'You’re invited' : 'Read the Bible together'}</p><h1>New Creation</h1></div>
      <p class="muted" id="invText">Daily readings, the whole Bible in your pocket, and a circle that prays for one another.</p></div>
    ${DEMO ? `<div class="notice"><b>Demonstration.</b> Use a sample account: leader <b>070 000 0001</b>, PIN <b>1111</b>; member <b>070 000 0002</b>, PIN <b>2222</b>. All people and posts here are samples.</div>` : ''}
    <div class="seg" role="tablist" aria-label="Join or sign in"><button role="tab" id="tJoin" aria-pressed="true" aria-selected="true">Join</button><button role="tab" id="tSign" aria-pressed="false" aria-selected="false">Sign in</button></div>
    <form id="fJoin" class="stack" novalidate>
      <label class="field">Your name<input class="input" id="jName" autocomplete="given-name" maxlength="40" required></label>
      <label class="field">WhatsApp number<input class="input" id="jPhone" inputmode="tel" autocomplete="tel" placeholder="e.g. 082 123 4567" required></label>
      <label class="field">Choose a 4-digit PIN<input class="input otp" id="jPin" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="new-password" required></label>
      <p class="small muted">Your name and reading progress are visible to the group. Your number is visible only to the leader. <a href="#/privacy" id="privLink">How we use your information</a></p>
      <p class="err" id="jErr" role="alert"></p>
      <button class="btn primary block" id="jBtn" type="submit">Join the circle</button>
    </form>
    <form id="fSign" class="stack" hidden novalidate>
      <label class="field">WhatsApp number<input class="input" id="sPhone" inputmode="tel" autocomplete="tel" required></label>
      <label class="field">PIN<input class="input otp" id="sPin" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="current-password" required></label>
      <p class="err" id="sErr" role="alert"></p>
      <button class="btn primary block" type="submit" id="sBtn">Sign in</button>
      <details class="more"><summary>Forgot your PIN?</summary><p class="small muted">Ask your group leader to reset it. They can do this in the Leader area; your reading history is kept. The leader sends you a new PIN on WhatsApp, and you can change it under Me after signing in.</p></details>
    </form>
  </div></div>`;
}
export function mount(root) {
  const by = store.get('nc.by', '');
  if (DEMO) call('ping').catch(() => {}); // prepares the sample data
  if (by) call('inviter', by).then((n) => { if (n) { $('#invLine').textContent = `${n} invited you`; $('#invText').textContent = `${n} would love you to join their Bible reading circle. Join with your name, WhatsApp number and a 4-digit PIN.`; $('#jBtn').textContent = `Join ${n}’s circle`; } }).catch(() => {});
  const tab = (join) => { $('#tJoin').setAttribute('aria-pressed', join); $('#tSign').setAttribute('aria-pressed', !join); $('#tJoin').setAttribute('aria-selected', join); $('#tSign').setAttribute('aria-selected', !join); $('#fJoin').hidden = !join; $('#fSign').hidden = join; };
  $('#tJoin').onclick = () => tab(true); $('#tSign').onclick = () => tab(false);
  if (!by && (DEMO || store.get('nc.known'))) tab(false);
  const busy = (b, on, txt) => { b.disabled = on; if (txt) b.textContent = txt; };
  const done = async (r) => { setToken(r.token); store.pset('snap', r.state); store.set('nc.known', '1'); store.del('nc.by'); const q = new URLSearchParams(location.search); q.delete('by'); const qs = q.toString(); history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + '#/today'); location.reload(); };
  $('#fJoin').onsubmit = async (e) => { e.preventDefault(); const b = $('#jBtn'), t = b.textContent; $('#jErr').textContent = '';
    if (!/^\d{4}$/.test($('#jPin').value)) { $('#jErr').textContent = 'Choose a PIN of exactly 4 numbers.'; return; }
    busy(b, true, 'Joining…'); try { const r = await call('joinState', $('#jName').value, $('#jPhone').value, $('#jPin').value); await done(r); } catch (x) { $('#jErr').textContent = x.message; busy(b, false, t); } };
  $('#fSign').onsubmit = async (e) => { e.preventDefault(); const b = $('#sBtn'); $('#sErr').textContent = ''; busy(b, true, 'Signing in…');
    try { const r = await call('loginState', $('#sPhone').value, $('#sPin').value); await done(r); } catch (x) { $('#sErr').textContent = x.message; busy(b, false, 'Sign in'); } };
}
