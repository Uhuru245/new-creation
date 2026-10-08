// Leader only: Life Group teaching. The master prompt builder and prepared lessons.
import { $, $$, esc, icon, toast, copyText, store } from '../util.js';
import { S } from '../state.js';
import { PROMPTS } from './teach-prompt.js';
import { LESSONS } from './teach-lessons.js';
import { present } from './teach-slides.js';

export const title = (r) => { const l = r && r.parts[0] && LESSONS.find((x) => x.id === r.parts[0]); return l ? l.title : 'Teach'; };

const CSS = `<style id="teachCss">
.teach h1{margin-bottom:4px}.teach .lede{color:var(--ink-2)}
.teach .toc{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0}
.teach .toc button{font:500 13px var(--ui);border:1px solid var(--line-2);background:var(--surface);color:var(--ink-2);border-radius:999px;padding:6px 11px;cursor:pointer;min-height:34px}
.teach .toc button:hover{border-color:var(--forest);color:var(--ink)}
.teach .sec{scroll-margin-top:calc(var(--top-h) + 12px)}
.teach .sec h2{font:600 20px/1.25 var(--serif);margin:0 0 10px}
.teach .sec h4{font:600 16px/1.3 var(--ui);margin:18px 0 6px}
.teach .sec p,.teach .sec li,.teach .sec dd{line-height:1.6}
.teach .sec ul,.teach .sec ol{padding-left:1.2em;display:grid;gap:6px}
.teach .big{font:600 20px/1.35 var(--serif);color:var(--ink)}
.teach blockquote{margin:10px 0;padding:10px 14px;border-left:3px solid var(--gold-2);background:var(--surface-2);border-radius:0 var(--r-sm) var(--r-sm) 0;font-family:var(--serif);line-height:1.65}
.teach .say{border-left:3px solid var(--forest);padding:2px 0 2px 14px;margin:12px 0}
.teach .say p{font-family:var(--serif)}
.teach .note{background:var(--forest-soft);padding:10px 12px;border-radius:var(--r-sm)}
.teach .warn{background:var(--gold-soft);padding:10px 12px;border-radius:var(--r-sm);color:var(--ink)}
.teach .caution{background:var(--surface-2);padding:8px 12px;border-radius:var(--r-sm);font-size:14px}
.teach .word,.teach .point,.teach .mis{border-top:1px solid var(--line);padding-top:12px;margin-top:12px}
.teach .word .w{font-weight:600;font-size:17px}
.teach .gk{font-family:var(--greek);font-weight:600}.teach .he{font-family:var(--hebrew);font-size:1.15em}
.teach .tag{display:inline-block;font:600 11px var(--ui);letter-spacing:.04em;text-transform:uppercase;padding:1px 7px;border-radius:999px;margin-right:4px;vertical-align:1px;background:var(--surface-3);color:var(--ink-2)}
.teach .tag.fact{background:var(--forest-soft);color:var(--forest)}.teach .tag.prob{background:var(--gold-soft);color:var(--gold)}
.teach .kv2{display:grid;grid-template-columns:max-content 1fr;gap:6px 14px;margin:0}.teach .kv2 dt{font-weight:600}.teach .kv2 dd{margin:0}
@media (max-width:520px){.teach .kv2{grid-template-columns:1fr}.teach .kv2 dd{margin-bottom:6px}}
.teach .planwrap{overflow-x:auto}.teach table.plan{border-collapse:collapse;width:100%;min-width:520px;font-size:14px}
.teach .plan th,.teach .plan td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--line);vertical-align:top}.teach .plan th{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-3)}
.teach .copybox{white-space:pre-wrap;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r-sm);padding:12px;font-size:15px;line-height:1.55}
.teach .cpy{margin-top:8px}
.teach.large .sec p,.teach.large .sec li,.teach.large .sec dd,.teach.large blockquote{font-size:20px}
.teach .meta{display:grid;gap:2px;font-size:14px;color:var(--ink-2)}
</style>`;

let pk = 'lifegroup';
function promptCard() {
  const P = PROMPTS[pk]; const d = store.pget('teachDraft_' + pk, null) || (pk === 'lifegroup' ? store.pget('teachDraft', {}) : {}) || {};
  const field = (f) => f.type === 'select'
    ? `<label class="field">${esc(f.label)}<select class="input" data-f="${f.id}">${f.options.map((o) => `<option ${d[f.id] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`
    : f.rows ? `<label class="field">${esc(f.label)}<textarea class="input" data-f="${f.id}" rows="${f.rows}" placeholder="${esc(f.placeholder || '')}">${esc(d[f.id] || '')}</textarea></label>`
      : `<label class="field">${esc(f.label)}<input class="input" data-f="${f.id}" placeholder="${esc(f.placeholder || '')}" value="${esc(d[f.id] || '')}"></label>`;
  return `<section class="card" id="pcard"><div class="card-head"><h3>Master prompts</h3><span class="pill">${Object.keys(PROMPTS).length}</span></div>
    <div class="seg" role="group" aria-label="Choose a master prompt" style="margin-top:6px">${Object.entries(PROMPTS).map(([k, x]) => `<button type="button" data-pk="${k}" aria-pressed="${k === pk}">${esc(x.name)}</button>`).join('')}</div>
    <p class="small muted" style="margin-top:10px"><b>${esc(P.title)}.</b> ${esc(P.blurb)} Fill in your request, copy the full prompt, and paste it into Claude.</p>
    <form class="stack" id="pf" style="margin-top:10px" novalidate>${P.fields.map(field).join('')}
      <div class="btns"><button class="btn primary" type="button" id="pCopy">${icon('copy')} Copy full prompt</button><a class="btn" href="https://claude.ai/new" target="_blank" rel="noopener">${icon('link')} Open Claude</a><button class="btn" type="button" id="pClear">Clear</button></div>
      <p class="small faint" id="pInfo">Your request is kept on this device until you clear it.</p></form></section>`;
}
function mountPrompt(root) {
  const pf = $('#pf', root); if (!pf) return;
  const vals = () => Object.fromEntries($$('[data-f]', pf).map((e) => [e.dataset.f, e.value]));
  pf.addEventListener('input', () => store.pset('teachDraft_' + pk, vals()));
  $('#pCopy', pf).onclick = async () => { const v = vals(); if (!(v.topic || '').trim()) { toast('Add a passage, topic or question first.'); $('[data-f="topic"]', pf).focus(); return; } await copyText(PROMPTS[pk].build(v)); $('#pInfo', pf).textContent = 'Copied. Open Claude and paste it into a new chat.'; };
  $('#pClear', pf).onclick = () => { store.pdel('teachDraft_' + pk); if (pk === 'lifegroup') store.pdel('teachDraft'); $$('[data-f]', pf).forEach((e) => { if (e.tagName !== 'SELECT') e.value = ''; }); toast('Cleared.'); };
  $$('[data-pk]', root).forEach((b) => b.onclick = () => { pk = b.dataset.pk; const card = $('#pcard', root); card.outerHTML = promptCard(); mountPrompt(root); });
}

function lessonList() {
  return `<section class="card"><div class="card-head"><h3>Prepared lessons</h3><span class="pill">${LESSONS.length}</span></div>
    <div class="list-plain">${LESSONS.map((l) => `<a class="person itemlink" href="#/teach/${esc(l.id)}"><span class="info"><b>${esc(l.title)}</b><span>${esc(l.passage)} · ${esc(l.subtitle)}</span></span>${icon('next')}</a>`).join('')}</div></section>`;
}

function lessonView(l) {
  return `<div class="stack-sm"><a class="btn sm" href="#/teach" style="justify-self:start;align-self:flex-start;width:auto">${icon('back')} Teach</a>
    <p class="eyebrow">Life Group lesson · leader only</p><h1>${esc(l.title)}</h1><p class="lede">${esc(l.subtitle)}</p>
    <div class="meta"><span><b>Passage:</b> ${esc(l.passage)}</span><span><b>Also:</b> ${esc(l.support)}</span><span><b>Translation:</b> ${esc(l.translation)}</span><span><b>Length:</b> ${esc(l.minutes)}</span></div>
    <div class="btns"><button class="btn primary" id="tShow">${icon('play')} Present as slides</button><button class="btn" id="tBig" aria-pressed="false">${icon('textsize')} Teaching size</button><button class="btn" id="tAll">${icon('copy')} Copy whole lesson</button></div>
    <nav class="toc" aria-label="Lesson sections">${l.sections.map((s) => `<button data-jump="${esc(s.id)}">${esc(s.title.replace(/^\d+\.\s*/, ''))}</button>`).join('')}</nav></div>
    ${l.sections.map((s) => `<section class="card sec" id="sec-${esc(s.id)}"><h2>${esc(s.title)}</h2>${s.html.replace('<table class="plan">', '<div class="planwrap"><table class="plan">').replace('</table>', '</table></div>')}</section>`).join('')}`;
}

export async function render(r) {
  if (!S.data.me.leader) return '<p class="notice">This area is only available to the group leader.</p>';
  const l = r.parts[0] && LESSONS.find((x) => x.id === r.parts[0]);
  const body = l ? lessonView(l) : `<div class="stack-sm"><h1>Teach</h1><p class="muted">Life Group teaching tools. Only you can see this area.</p></div>${lessonList()}${promptCard()}`;
  return `${CSS}<div class="teach stack">${body}</div>`;
}

export function mount(root, r) {
  if (!S.data.me.leader) return;
  const t = $('.teach', root);
  mountPrompt(root);
  const l = r.parts[0] && LESSONS.find((x) => x.id === r.parts[0]);
  if (!l) return;
  $('#tShow', root).onclick = () => present(l);
  $$('[data-jump]', root).forEach((b) => b.onclick = () => { const s = $('#sec-' + b.dataset.jump, root); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  const big = $('#tBig', root); const on = store.json('nc.teachBig', false) === true;
  t.classList.toggle('large', on); big.setAttribute('aria-pressed', String(on));
  big.onclick = () => { const v = !t.classList.contains('large'); t.classList.toggle('large', v); big.setAttribute('aria-pressed', String(v)); store.setJson('nc.teachBig', v); };
  $('#tAll', root).onclick = () => copyText(`${l.title}\n${l.subtitle}\n${l.passage}\n\n` + $$('.sec', root).map((s) => s.innerText.trim()).join('\n\n'));
  $$('[data-copy]', root).forEach((el) => { const b = document.createElement('button'); b.className = 'btn sm cpy'; b.type = 'button'; b.innerHTML = `${icon('copy')} Copy`; b.onclick = () => copyText(el.innerText.trim()); el.after(b); });
}
