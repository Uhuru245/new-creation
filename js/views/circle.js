// Circle: reflections, prayer requests, questions and praise; who is reading; encouragement.
import { $, $$, esc, icon, toast, sheet, closeSheet, when, uid, store } from '../util.js';
import { call } from '../api.js';
import { S, planDay } from '../state.js';
import { dayQuestion } from './today.js';
import { go } from '../app.js';

export const title = 'Circle';
const KINDS = [['reflection', 'Reflection'], ['prayer', 'Prayer'], ['question', 'Question'], ['praise', 'Praise']];
const HINT = { reflection: 'What did God show you in today’s reading?', prayer: 'How can the circle pray for you?', question: 'What would you like to ask the circle?', praise: 'What are you thankful for?' };
const CHEERS = ['Praying for you today.', 'Keep going, you’re doing so well!', 'Well done on today’s reading!', 'Missing you in the reading. There’s grace for today.'];
let filter = '', posts = null, more = false, loading = false;

const draft = () => store.pget('draft', { kind: 'reflection', text: '', clientId: '' });
const saveDraft = (d) => store.pset('draft', d);

function postHtml(p) {
  const mine = p.by === S.data.me.id, lead = S.data.me.leader;
  return `<article class="post" data-id="${esc(p.id)}"><header><span class="avatar" aria-hidden="true">${esc(p.name.charAt(0).toUpperCase())}</span>
      <span class="who"><b>${esc(p.name)}</b><span>${p.day ? `Day ${p.day} · ` : ''}${esc(when(p.when))}</span></span><span class="kind ${esc(p.kind)}">${esc((KINDS.find((k) => k[0] === p.kind) || KINDS[0])[1])}</span></header>
    <p>${esc(p.text)}</p>
    <footer>${p.kind === 'prayer' ? `<button class="pray" data-pray="${esc(p.id)}" aria-pressed="${!!p.iPray}">${icon('heart')} ${p.iPray ? 'You prayed' : 'I prayed for you'}${p.prayers ? ` · ${p.prayers}` : ''}</button>` : ''}
      <span class="spacer"></span>${mine || lead ? `<button class="link danger" data-del="${esc(p.id)}" aria-label="Remove this post">${mine ? 'Remove' : 'Remove (leader)'}</button>` : ''}</footer></article>`;
}
function listHtml() {
  if (posts === null) return '<div class="stack-sm"><div class="skeleton" style="height:90px"></div><div class="skeleton" style="height:90px"></div></div>';
  if (!posts.length) return `<div class="empty">${icon('chat')}<p>${filter ? 'Nothing here yet.' : 'No posts yet. Be the first to share what God showed you.'}</p></div>`;
  return posts.map(postHtml).join('') + (more ? '<button class="btn block" id="more">Show older posts</button>' : '');
}
function peopleHtml() {
  const c = (S.data.circle || []);
  return c.map((m) => `<div class="person"><span class="avatar" aria-hidden="true">${esc(m.name.charAt(0).toUpperCase())}</span>
    <span class="info"><b>${esc(m.name)}${m.id === S.data.me.id ? ' (you)' : ''}${m.leader ? ' · leader' : ''}</b><span>${m.hidden ? 'Keeps progress private' : `${m.ch} chapters${m.readToday ? ' · read today' : ''}`}</span></span>
    ${m.hidden ? '' : `<div class="bar" aria-hidden="true"><span style="width:${Math.min(100, m.pct)}%"></span></div>`}
    ${m.id !== S.data.me.id ? `<button class="icon-btn" data-cheer="${esc(m.id)}" data-name="${esc(m.name)}" aria-label="Encourage ${esc(m.name)}">${icon('heart')}</button>` : ''}</div>`).join('');
}

export async function render(r) {
  const d = draft(); const k = r.q.get('compose'); if (k && KINDS.some((x) => x[0] === k)) { d.kind = k; saveDraft(d); }
  const D = S.plan.days[planDay() - 1];
  if (posts === null) posts = store.pget('posts', null);
  return `<div class="stack-sm"><h1>Circle</h1><p class="muted">${esc(S.data.challenge.name)}: reflections, prayer, questions and praise.</p></div>
  <section class="card" aria-labelledby="compH"><h3 id="compH" class="sr">Write a post</h3>
    <p class="small"><span class="eyebrow">Today's question</span><br><span class="serif" style="font-size:17px">${esc(dayQuestion(D))}</span></p>
    <div class="chips" role="group" aria-label="Type of post">${KINDS.map(([v, l]) => `<button class="chip" data-kind="${v}" aria-pressed="${d.kind === v}">${l}</button>`).join('')}</div>
    <label class="sr" for="ptext">Your post</label><textarea class="input" id="ptext" maxlength="1000" placeholder="${esc(HINT[d.kind])}">${esc(d.text)}</textarea>
    <p class="small faint" id="pdisc">${d.kind === 'prayer' ? 'Prayer requests are visible to everyone in this circle. Your leader receives an email saying you posted one; the email does not include what you wrote.' : 'Posts are visible to everyone in this circle. You can remove your own posts at any time.'}</p>
    <p class="err" id="perr" role="alert"></p>
    <button class="btn primary" id="psend">Share with the circle</button>
  </section>
  <div class="chips" role="group" aria-label="Filter posts"><button class="chip" data-f="" aria-pressed="${!filter}">All</button>${KINDS.map(([v, l]) => `<button class="chip" data-f="${v}" aria-pressed="${filter === v}">${l}</button>`).join('')}</div>
  <div class="stack" id="plist" aria-live="polite">${listHtml()}</div>
  <details class="card" id="peopleBox"><summary style="cursor:pointer;font-weight:650;min-height:32px">Where everyone is (${(S.data.circle || []).length})</summary><div class="people">${peopleHtml()}</div>
    <p class="small faint">Names and chapter counts are visible to the circle. Members can keep their progress private under Me.</p></details>`;
}

async function load(root, append = false) {
  if (loading) return; loading = true;
  try {
    const res = await call('posts', S.token, { kind: filter, before: append && posts.length ? posts[posts.length - 1].id : '', limit: 20 });
    posts = append ? posts.concat(res.posts) : res.posts; more = res.more; if (!filter && !append) store.pset('posts', posts);
  } catch (e) { if (!posts) posts = []; toast(e.message); }
  loading = false; paint(root);
}
function paint(root) { const el = $('#plist', root); if (!el) return; el.innerHTML = listHtml(); bindList(root); }
function bindList(root) {
  const mb = $('#more', root); if (mb) mb.onclick = () => { mb.disabled = true; mb.textContent = 'Loading…'; load(root, true); };
  $$('[data-pray]', root).forEach((b) => b.onclick = async () => { if (b.disabled) return; b.disabled = true;
    try { const p = await call('pray', S.token, b.dataset.pray); posts = posts.map((x) => (x.id === p.id ? p : x)); paint(root); } catch (e) { toast(e.message); b.disabled = false; } });
  $$('[data-del]', root).forEach((b) => b.onclick = async () => {
    if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Tap again to remove'; return; }
    b.disabled = true; try { await call('deletePost', S.token, b.dataset.del); posts = posts.filter((x) => x.id !== b.dataset.del); store.pset('posts', posts); paint(root); toast('Post removed.'); } catch (e) { toast(e.message); b.disabled = false; } });
}

export function mount(root, r) {
  const ta = $('#ptext', root);
  if (r.q.get('compose')) { ta.focus(); ta.scrollIntoView({ block: 'center' }); }
  ta.oninput = () => { const d = draft(); d.text = ta.value; saveDraft(d); };
  $$('[data-kind]', root).forEach((b) => b.onclick = () => { const d = draft(); d.kind = b.dataset.kind; saveDraft(d); $$('[data-kind]', root).forEach((x) => x.setAttribute('aria-pressed', x === b)); ta.placeholder = HINT[d.kind];
    $('#pdisc', root).textContent = d.kind === 'prayer' ? 'Prayer requests are visible to everyone in this circle. Your leader receives an email saying you posted one; the email does not include what you wrote.' : 'Posts are visible to everyone in this circle. You can remove your own posts at any time.'; });
  $$('[data-f]', root).forEach((b) => b.onclick = () => { filter = b.dataset.f; $$('[data-f]', root).forEach((x) => x.setAttribute('aria-pressed', x === b)); posts = null; paint(root); load(root); });
  $('#psend', root).onclick = async () => {
    const b = $('#psend', root); if (b.disabled) return; const d = draft(); d.text = ta.value.trim(); $('#perr', root).textContent = '';
    if (!d.text) { $('#perr', root).textContent = 'Write something first.'; ta.focus(); return; }
    if (!d.clientId) d.clientId = uid(); saveDraft(d); // same id on retry, so the server never posts it twice
    b.disabled = true; b.textContent = 'Sharing…';
    try {
      const res = await call('post', S.token, { kind: d.kind, text: d.text, day: planDay(), clientId: d.clientId });
      saveDraft({ kind: d.kind, text: '', clientId: '' }); ta.value = '';
      if (!filter || filter === d.kind) { posts = [res.post].concat((posts || []).filter((x) => x.id !== res.post.id)); paint(root); }
      toast(d.kind === 'prayer' ? 'Shared. The circle will pray with you.' : 'Shared with the circle.');
    } catch (e) { $('#perr', root).textContent = e.message + ' Your post is saved here; tap Share to try again.'; }
    b.disabled = false; b.textContent = 'Share with the circle';
  };
  $$('[data-cheer]', root).forEach((b) => b.onclick = () => {
    const s = sheet(`<h3>Encourage ${esc(b.dataset.name)}</h3><div class="stack-sm" style="margin-top:12px">${CHEERS.map((c, i) => `<button class="btn" data-c="${i}">${esc(c)}</button>`).join('')}</div>`, { label: 'Send encouragement' });
    $$('[data-c]', s).forEach((x) => x.onclick = async () => { x.disabled = true; try { await call('cheer', S.token, b.dataset.cheer, CHEERS[Number(x.dataset.c)]); closeSheet(); toast(`Sent to ${b.dataset.name}.`); } catch (e) { toast(e.message); x.disabled = false; } });
  });
  bindList(root);
  load(root);
}
export function onData() {}
void go;
