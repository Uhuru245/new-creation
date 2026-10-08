// Leader only: present a lesson as story slides with hand-drawn illustrations.
// Slides come from lesson.slides; each may name an illustration from ART.
import { esc, icon } from '../util.js';

// ---------- illustrations (line drawings that draw themselves in) ----------
// .ln = ink line, .ac = gold accent line, .fs = soft fill, .fa = accent fill. viewBox 0 0 400 260.
const ground = (y = 222) => `<path class="ln" d="M20 ${y}H380"/>`;
const person = (x, y, s = 1, extra = '') => `<g transform="translate(${x} ${y}) scale(${s})"><circle class="ln" cx="0" cy="-58" r="11"/><path class="ln" d="M0-46v40M0-6l-13 32M0-6l13 32${extra}"/></g>`;
const stalk = (x, h) => `<path class="ln" d="M${x} 222v-${h}"/><path class="ac" d="M${x} ${222 - h + 4}c-7-5-7-12 0-17 7 5 7 12 0 17zM${x} ${222 - h + 20}c-7-5-7-12 0-17 7 5 7 12 0 17z"/>`;
const cloud = (x, y, s = 1) => `<path class="ln" transform="translate(${x} ${y}) scale(${s})" d="M-40 10a18 18 0 0 1 8-30 24 24 0 0 1 44-6 18 18 0 0 1 28 16 14 14 0 0 1 0 20z"/>`;
const rain = (x, y, n = 5) => Array.from({ length: n }, (_, i) => `<path class="ac" d="M${x + i * 14} ${y + (i % 2) * 8}l-5 16"/>`).join('');

export const ART = {
  sunrise: () => `${ground(200)}<path class="ac" d="M130 200a70 70 0 0 1 140 0"/>${[-60, -30, 0, 30, 60].map((a) => { const r = Math.PI * (90 + a) / 180; return `<path class="ac" d="M${200 + Math.cos(r) * 88} ${200 - Math.sin(r) * 88}L${200 + Math.cos(r) * 112} ${200 - Math.sin(r) * 112}"/>`; }).join('')}
    <path class="ln" d="M200 200v-46"/><path class="ln" d="M200 172c-18-2-26-14-24-28 16 0 24 12 24 28zM200 162c16-4 24-16 22-30-16 2-22 14-22 30z"/><path class="ln" d="M60 230h280M100 244h200"/>`,
  hourglass: () => `<path class="ln" d="M140 30h120M140 230h120M155 30c0 62 90 66 90 100s-90 38-90 100M245 30c0 62-90 66-90 100s90 38 90 100"/>
    <path class="fa" d="M172 70h56l-28 44z"/><path class="fa" d="M170 228c8-30 52-30 60 0z"/><path class="ac" d="M200 132v60"/><circle class="ln" cx="320" cy="90" r="34"/><path class="ln" d="M320 66v24l16 10"/>`,
  field: () => `${ground()}${[50, 78, 106, 134, 162, 190, 218].map((x, i) => stalk(x, 70 + (i % 3) * 14)).join('')}
    <circle class="ac" cx="330" cy="58" r="22"/>${person(300, 222, 1)}<path class="ln" d="M313 170q26 4 40-14"/><path class="ln" d="M352 156l10 18"/>
    <path class="ln" d="M250 200c-6-18 4-30 18-30s24 12 18 30z"/><path class="ln" d="M262 170l6-8 6 8"/><path class="ac" d="M244 132l46 46M290 132l-46 46"/>`,
  scales: () => `${ground(232)}<path class="ln" d="M200 232V54M168 232h64M90 76h220"/><circle class="ac" cx="200" cy="50" r="8"/>
    <path class="ln" d="M110 76l-30 70M110 76l30 70M290 76l-30 52M290 76l30 52"/><path class="ln" d="M70 146h80a40 22 0 0 1-80 0zM250 128h80a40 22 0 0 1-80 0z"/>
    <path class="fa" d="M95 140h30v6H95zM88 132h44v8H88z"/>`,
  farmer: () => `${ground(214)}<path class="ln" d="M20 228h360M20 242h360"/>${[60, 100, 140, 180, 220].map((x) => `<path class="ac" d="M${x} 214v-14M${x} 204c-7-1-10-6-9-12 6 1 9 6 9 12zM${x} 202c6-2 9-7 8-13-6 1-8 6-8 13z"/>`).join('')}
    ${person(300, 214, 1.05)}<path class="ln" d="M282 140h36M288 140c2-12 22-12 24 0"/><path class="ln" d="M300 176l-26 12M266 120l20 94M286 214l14-4"/>
    ${cloud(110, 70)}${cloud(230, 52, 0.85)}${rain(84, 92)}${rain(210, 72, 4)}`,
  twowords: () => `${ground()}${person(70, 222)}${person(150, 222)}<path class="ac" d="M110 130c-8-10-24 0-12 14l12 10 12-10c12-14-4-24-12-14z"/>
    <path class="ln" d="M200 40v200" stroke-dasharray="4 8"/>
    ${person(300, 222)}<path class="ln" d="M256 126h88M300 184l-22-14-8-44M300 184l22-14 8-44"/><path class="fa" d="M244 114h18v24h-18zM338 114h18v24h-18z"/>`,
  mountain: () => `${ground()}<path class="ln" d="M40 222l110-150 50 60 40-40 120 130"/><path class="ln" d="M126 104l24 16 18-12 14 14"/>
    ${cloud(170, 70, 1.2)}<path class="ac" d="M150 40l-10-20M180 34v-22M210 40l12-18"/><path class="fa" d="M272 186h22v30h-22zM300 186h22v30h-22z"/>`,
  door: () => `${ground()}<path class="ln" d="M140 222V40h120v182"/><path class="ln" d="M140 40l70 18v178l-70-14"/><circle class="ac" cx="198" cy="140" r="4"/>
    <path class="fa" d="M210 58l50-18v182h-50z"/><path class="ac" d="M260 222l90 0M250 190l90 20M245 160l95 30"/>${person(320, 222, 0.9)}`,
  circle: () => `${ground()}${[90, 170, 250, 330].map((x) => person(x, 222, 0.85)).join('')}
    <path class="ln" d="M60 72h70a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8H84l-14 12v-12H60a8 8 0 0 1-8-8V80a8 8 0 0 1 8-8z"/><path class="ac" d="M66 90q10-8 20 0t20 0t20 0"/>
    <path class="ln" d="M270 60h70a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8h-10v12l-14-12h-46a8 8 0 0 1-8-8V68a8 8 0 0 1 8-8z"/><path class="ac" d="M286 74l38 20M324 74l-38 20"/>
    <path class="ln" d="M170 40h60a8 8 0 0 1 8 8v20a8 8 0 0 1-8 8h-24l-6 10-6-10h-24a8 8 0 0 1-8-8V48a8 8 0 0 1 8-8z"/><path class="ac" d="M190 58c-5-6-14 0-7 8l7 6 7-6c7-8-2-14-7-8z"/>`,
  tree: () => `${ground(176)}<path class="ln" d="M196 176V100M204 176V100"/><circle class="ln" cx="200" cy="74" r="44"/><circle class="ln" cx="160" cy="96" r="28"/><circle class="ln" cx="242" cy="96" r="28"/>
    <path class="ac" d="M198 176c-10 20-40 30-70 40M202 176c10 20 44 28 76 36M200 176v62M196 180c-24 30-60 38-96 56M204 180c26 30 60 36 92 52"/>
    <path class="ln" d="M330 50q-20 6-40 0M340 70q-24 6-48 0M326 90q-16 4-32 0"/>`,
  cross: () => `${ground(214)}<path class="ln" d="M60 214c60-50 220-50 280 0"/><path class="ln" d="M196 196V40h8v156M160 78h80v8h-80z"/>
    ${[-70, -40, -14, 14, 40, 70].map((a) => { const r = Math.PI * (90 + a) / 180; return `<path class="ac" d="M${200 + Math.cos(r) * 92} ${120 - Math.sin(r) * 92}L${200 + Math.cos(r) * 124} ${120 - Math.sin(r) * 124}"/>`; }).join('')}`,
  eagle: () => `<path class="ln" d="M20 236l70-70 40 34 60-74 70 64 50-40 70 86"/>
    <path class="ln" d="M200 104c-30-36-80-50-140-44 34 14 58 32 74 54 22 0 44-4 66-10zM200 104c30-36 80-50 140-44-34 14-58 32-74 54-22 0-44-4-66-10z"/>
    <path class="ac" d="M200 92c-6 0-10 6-10 12s4 18 10 26c6-8 10-20 10-26s-4-12-10-12zM196 130l4 14 4-14"/><path class="ac" d="M90 70q30 10 52 30M310 70q-30 10-52 30"/>`,
  candle: () => `${ground()}<path class="ln" d="M176 222V130h48v92M160 222h80"/><path class="fa" d="M200 84c-12 16-14 28 0 40 14-12 12-24 0-40z"/><path class="ln" d="M200 130v-8"/>
    <path class="ac" d="M200 60v-14M240 74l10-10M160 74l-10-10M256 104h14M130 104h14"/>`,
  notebook: () => `<path class="ln" d="M110 30h170a10 10 0 0 1 10 10v190a10 10 0 0 1-10 10H110z"/><path class="ln" d="M110 30v200M96 56h28M96 96h28M96 136h28M96 176h28M96 216h28"/>
    ${[70, 100, 130, 160, 190].map((y, i) => `<circle class="ac" cx="140" cy="${y}" r="5"/><path class="ln" d="M154 ${y}h${90 - (i % 2) * 24}"/>`).join('')}
    <path class="ln" d="M300 220l50-120 14 6-50 120-18 10z"/>`,
  balance: () => `${ground()}${person(110, 222)}<path class="ac" d="M80 120l60 60M140 120l-60 60"/><path class="ln" d="M90 140h40"/>
    ${person(290, 222)}<path class="ln" d="M250 120a40 40 0 0 1 80 0"/><path class="ac" d="M262 112h56"/>`,
};

function draw(svg) {
  const els = svg.querySelectorAll('.ln,.ac'); let i = 0;
  els.forEach((el) => { el.setAttribute('pathLength', '1'); el.style.setProperty('--d', `${Math.min(i++ * 0.09, 2.2)}s`); });
}

const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .05 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
const CSS = `<style id="deckCss">
.deck{position:fixed;inset:0;z-index:200;color:#f4efe4;display:flex;flex-direction:column;font-family:var(--ui);--g:#e4c47e;--g2:#f7e6b8;--soft:rgba(228,196,126,.16);--ink:#f4efe4;
  background:radial-gradient(120% 90% at 78% 30%,#1d3a2e 0%,#10221b 42%,#09130f 100%);overflow:hidden}
.deck::before{content:"";position:absolute;inset:0;background-image:${GRAIN};opacity:.9;pointer-events:none;mix-blend-mode:overlay}
.deck::after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 180px rgba(0,0,0,.55)}
.deck>*{position:relative;z-index:1}
.deck .dk-bar{display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 10px) 16px 6px;transition:opacity .4s}
.deck .dk-sp{flex:1}.deck .dk-count{font:600 12px var(--ui);letter-spacing:.14em;color:rgba(244,239,228,.6);font-variant-numeric:tabular-nums;text-transform:uppercase}
.deck .dk-brand{font:600 12px var(--ui);letter-spacing:.2em;text-transform:uppercase;color:var(--g)}
.deck .dk-b{min-width:40px;height:40px;border-radius:999px;border:1px solid rgba(244,239,228,.16);background:rgba(244,239,228,.05);color:var(--ink);display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 14px;font:600 13px var(--ui);letter-spacing:.02em;cursor:pointer;backdrop-filter:blur(6px);transition:background .2s,border-color .2s}
.deck .dk-b:hover{border-color:rgba(228,196,126,.6)}.deck .dk-b:disabled{opacity:.35;cursor:default}
.deck .dk-b:focus-visible{outline:2px solid var(--g);outline-offset:2px}.deck .dk-b[aria-pressed="true"]{background:var(--g);color:#1a1405;border-color:var(--g)}
.deck .dk-b svg{width:18px;height:18px;fill:currentColor}
.deck .dk-b.go{background:linear-gradient(180deg,#f0d593,#d2ad5f);color:#1a1405;border:0;padding:0 20px;box-shadow:0 6px 24px -8px rgba(228,196,126,.6)}
.deck .dk-stage{flex:1;display:grid;place-items:center;padding:8px clamp(18px,5vw,72px);min-height:0;touch-action:pan-y}
.deck .dk-slide{width:min(1240px,100%);max-height:100%;display:grid;grid-template-columns:1.08fr .92fr;gap:clamp(20px,5vw,72px);align-items:center}
.deck .dk-slide.dk-noart{grid-template-columns:1fr;max-width:920px}
.deck .dk-slide.dk-title{grid-template-columns:1fr;justify-items:center;text-align:center;max-width:980px}
.deck .dk-title .dk-figure{order:-1;width:min(340px,60vw)}
.deck .dk-title h2{font-size:clamp(40px,6.4vw,92px)}
.deck .dk-title .dk-kick{justify-content:center}.deck .dk-title .dk-kick::after{content:"";width:34px;height:1px;background:var(--g);opacity:.7}
@media (max-width:760px),(max-aspect-ratio:1/1){.deck .dk-slide{grid-template-columns:1fr;gap:12px}.deck .dk-figure{order:-1;max-width:min(360px,80%);justify-self:center}}
.deck .dk-kick{display:flex;align-items:center;gap:12px;font:700 clamp(11px,1.15vw,14px) var(--ui);letter-spacing:.22em;text-transform:uppercase;color:var(--g)}
.deck .dk-kick::before{content:"";width:34px;height:1px;background:var(--g);opacity:.7}
.deck h2{font:600 clamp(30px,4.8vw,66px)/1.04 var(--serif);letter-spacing:-.01em;margin:.32em 0 .36em;text-wrap:balance;color:#fffaf0}
.deck h2 em{font-style:italic;color:var(--g2)}
.deck .dk-body{font:400 clamp(17px,1.9vw,25px)/1.5 var(--serif);color:rgba(244,239,228,.86);max-width:36ch}
.deck .dk-noart .dk-body,.deck .dk-title .dk-body{max-width:46ch;margin-inline:auto}
.deck .dk-noart .dk-body{margin-inline:0}
.deck .dk-body p{margin:0 0 .6em}.deck .dk-body ul,.deck .dk-body ol{margin:.2em 0;padding-left:1.15em;display:grid;gap:.45em}
.deck .dk-body li::marker{color:var(--g);font-family:var(--ui);font-weight:700}
.deck .dk-verse{position:relative;margin:.2em 0 .8em;padding:.1em 0 .1em 1.1em;border-left:1px solid rgba(228,196,126,.55);font-style:italic;color:#fffaf0;font-size:1.06em}
.deck .dk-ref{display:block;font:700 .56em var(--ui);font-style:normal;letter-spacing:.18em;color:var(--g);margin-top:.7em;text-transform:uppercase}
.deck .gk{font-family:var(--greek);color:var(--g2)}.deck .he{font-family:var(--hebrew);color:var(--g2)}
.deck .dk-two{display:grid;grid-template-columns:1fr 1fr;gap:.8em;max-width:none}
.deck .dk-two>div{background:linear-gradient(180deg,rgba(244,239,228,.07),rgba(244,239,228,.02));border:1px solid rgba(228,196,126,.22);border-radius:18px;padding:.85em .95em;font-size:.92em}
.deck .dk-two b{display:block;color:var(--g);font:700 .62em var(--ui);letter-spacing:.18em;text-transform:uppercase;margin-bottom:.45em}
.deck .dk-figure{position:relative;width:100%;aspect-ratio:400/300;display:grid;place-items:center}
.deck .dk-figure::before{content:"";position:absolute;inset:4% 8%;border-radius:999px 999px 26px 26px;background:radial-gradient(70% 60% at 50% 38%,rgba(228,196,126,.20),rgba(228,196,126,.04) 60%,transparent 75%),linear-gradient(180deg,rgba(244,239,228,.05),rgba(244,239,228,.01));border:1px solid rgba(228,196,126,.28)}
.deck .dk-figure::after{content:"";position:absolute;inset:7% 11%;border-radius:999px 999px 20px 20px;border:1px solid rgba(228,196,126,.10)}
.deck .dk-art{position:relative;z-index:1;width:84%;height:auto;max-height:52vh;filter:drop-shadow(0 0 14px rgba(228,196,126,.18))}
.deck .dk-art .ln{fill:none;stroke:#f6efe0;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
.deck .dk-art .ac{fill:none;stroke:var(--g);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
.deck .dk-art .fa{fill:var(--soft);stroke:none}
.deck .dk-slide{opacity:0;transform:translateY(8px) scale(.995);transition:opacity .55s ease,transform .7s cubic-bezier(.2,.7,.2,1)}
.deck .dk-slide.dk-on{opacity:1;transform:none}
.deck .dk-on .dk-art .ln,.deck .dk-on .dk-art .ac{stroke-dasharray:1;stroke-dashoffset:1;animation:deckDraw 1.2s cubic-bezier(.4,0,.2,1) forwards;animation-delay:calc(var(--d,0s) + .25s)}
.deck .dk-on .dk-art .fa{opacity:0;animation:deckFade .9s ease forwards;animation-delay:1.6s}
.deck .dk-on .dk-txt>*{animation:deckUp .7s cubic-bezier(.2,.7,.2,1) both}.deck .dk-on .dk-txt>*:nth-child(2){animation-delay:.1s}.deck .dk-on .dk-txt>*:nth-child(3){animation-delay:.2s}
@keyframes deckDraw{to{stroke-dashoffset:0}}@keyframes deckFade{to{opacity:1}}@keyframes deckUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.deck .dk-slide{transition:none}.deck .dk-on .dk-art .ln,.deck .dk-on .dk-art .ac{animation:none;stroke-dasharray:none;stroke-dashoffset:0}.deck .dk-on .dk-art .fa{animation:none;opacity:1}.deck .dk-on .dk-txt>*{animation:none}}
.deck .dk-notes{max-height:26vh;overflow:auto;background:rgba(6,12,9,.82);backdrop-filter:blur(8px);border-top:1px solid rgba(228,196,126,.25);padding:12px 20px;font:15px/1.55 var(--ui);color:rgba(244,239,228,.85)}
.deck .dk-notes b{color:var(--g);letter-spacing:.08em;text-transform:uppercase;font-size:12px;margin-right:6px}
.deck .dk-prog{display:flex;gap:4px;padding:0 16px}.deck .dk-prog i{flex:1;height:2px;border-radius:2px;background:rgba(244,239,228,.12);transition:background .4s}.deck .dk-prog i.done{background:var(--g)}
.deck .dk-navs{display:flex;justify-content:center;align-items:center;gap:12px;padding:8px 16px calc(env(safe-area-inset-bottom,0px) + 14px)}
.deck .dk-foot{position:absolute;left:20px;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);font:600 11px var(--ui);letter-spacing:.2em;text-transform:uppercase;color:rgba(244,239,228,.4)}
@media (max-width:640px){.deck .dk-foot,.deck .dk-brand{display:none}.deck .dk-b{padding:0 11px}}
:fullscreen .deck .dk-navs,.deck:fullscreen .dk-navs{opacity:.25;transition:opacity .3s}.deck:fullscreen .dk-navs:hover{opacity:1}
</style>`;

const slideHtml = (s) => {
  const fig = s.art && ART[s.art] ? `<div class="dk-figure"><svg class="dk-art" viewBox="0 0 400 260" role="img" aria-label="${esc(s.alt || '')}">${ART[s.art]()}</svg></div>` : '';
  const cls = s.layout === 'title' ? 'dk-title' : (fig ? '' : 'dk-noart');
  return `<div class="dk-slide ${cls}"><div class="dk-txt">${s.kicker ? `<div class="dk-kick">${esc(s.kicker)}</div>` : ''}<h2>${s.titleHtml || esc(s.title)}</h2>${s.body ? `<div class="dk-body">${s.body}</div>` : ''}</div>${fig}</div>`;
};

export function present(lesson, start = 0) {
  const slides = lesson.slides || []; if (!slides.length) return;
  if (!document.getElementById('deckCss')) document.head.insertAdjacentHTML('beforeend', CSS);
  let i = Math.max(0, Math.min(start, slides.length - 1)), notes = false;
  const el = document.createElement('div'); el.className = 'deck'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', `${lesson.title} slides`);
  el.innerHTML = `<div class="dk-bar"><button class="dk-b" data-a="close" aria-label="Close slides">${icon('close')}</button><span class="dk-brand">New Creation</span><span class="dk-count" aria-live="polite"></span><span class="dk-sp"></span>
    <button class="dk-b" data-a="notes" aria-pressed="false">Notes</button><button class="dk-b" data-a="full" aria-label="Full screen">Full screen</button></div>
    <div class="dk-prog"></div><div class="dk-stage" tabindex="-1"></div><div class="dk-notes" hidden></div>
    <div class="dk-navs"><button class="dk-b" data-a="prev" aria-label="Previous slide">${icon('back')}</button><button class="dk-b go" data-a="next" aria-label="Next slide">${icon('next')} Next</button></div><div class="dk-foot"></div>`;
  document.body.appendChild(el); document.documentElement.style.overflow = 'hidden';
  const stage = el.querySelector('.dk-stage'), notesEl = el.querySelector('.dk-notes');
  el.querySelector('.dk-prog').innerHTML = slides.map(() => '<i></i>').join(''); el.querySelector('.dk-foot').textContent = `${lesson.title} · ${lesson.passage}`;
  function show() {
    const s = slides[i]; stage.innerHTML = slideHtml(s); const sl = stage.firstElementChild; const svg = sl.querySelector('svg'); if (svg) draw(svg);
    requestAnimationFrame(() => requestAnimationFrame(() => sl.classList.add('dk-on')));
    el.querySelector('.dk-count').textContent = `${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`; el.querySelectorAll('.dk-prog i').forEach((d, k) => d.classList.toggle('done', k <= i));
    notesEl.innerHTML = `<b>Leader notes</b>${s.notes || 'No notes for this slide.'}`; notesEl.hidden = !notes;
    el.querySelector('[data-a="prev"]').disabled = i === 0; const nx = el.querySelector('[data-a="next"]'); nx.lastChild.textContent = i === slides.length - 1 ? ' Finish' : ' Next';
  }
  const go = (d) => { if (i + d < 0) return; if (i + d >= slides.length) { close(); return; } i += d; show(); };
  function close() { document.removeEventListener('keydown', key); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); document.documentElement.style.overflow = ''; el.remove(); }
  function key(e) { if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); } else if (e.key === 'Escape' && !document.fullscreenElement) close(); else if (e.key === 'n' || e.key === 'N') toggleNotes(); }
  function toggleNotes() { notes = !notes; notesEl.hidden = !notes; el.querySelector('[data-a="notes"]').setAttribute('aria-pressed', String(notes)); }
  el.addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
    if (a === 'close') close(); else if (a === 'next') go(1); else if (a === 'prev') go(-1); else if (a === 'notes') toggleNotes();
    else if (a === 'full') { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else if (el.requestFullscreen) el.requestFullscreen().catch(() => {}); } });
  let x0 = null; stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; }); stage.addEventListener('pointerup', (e) => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); });
  document.addEventListener('keydown', key); show(); el.querySelector('[data-a="next"]').focus();
}
