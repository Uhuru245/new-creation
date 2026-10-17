// Ask the Teacher: a conversation about the Bible's original words, answered by Claude through the New Creation server.
import { $, $$, esc, icon, toast, sheet, closeSheet, store, uid } from '../util.js';
import { callLong } from '../api.js';
import { S, planDay } from '../state.js';
import * as WB from '../words.js';

export const title = 'Ask the Teacher';
const KEY = 'tutor'; // the current conversation, kept on this device (private: removed on sign-out)
const STARTERS = [
  ["Explain today's word simply", (c) => (c.word ? `Explain ${c.word} simply, please.` : "Explain today's word simply, please.")],
  ['Why do translations differ here?', (c) => `Why do English translations differ ${c.word ? `on ${c.word}` : 'in this passage'}?`],
  ["Quiz me on this week's words", () => "Quiz me on this week's words, one question at a time."],
  ['How does this apply to my life?', (c) => `How does ${c.word || "today's reading"} apply to my life?`],
];
let conv = null, busy = false, rec = null;

// What the member is looking at: a day of the plan and, optionally, a word (from a word card or the Original page).
function contextFrom(r) {
  const words = (WB.cached() && WB.cached().words) || [];
  const day = Number(r.q.get('day')) || (S.data.challenge.plan === 'bible93' ? planDay() : 0);
  const w = words.find((x) => x.day === day);
  const word = r.q.get('word') || (w ? `${w.word} (${w.translit})` : '');
  const lang = r.q.get('lang') || (w ? w.lang : '');
  return { day, word, lang, label: [day ? `Day ${day}` : '', w && !r.q.get('word') ? w.ref : ''].filter(Boolean).join(' · ') };
}
const sameCtx = (a, b) => a && b && a.day === b.day && a.word === b.word;
function newConv(ctx) { conv = { id: uid() + uid().slice(0, 4), ctx, msgs: [], started: Date.now() }; store.pset(KEY, conv); }

export async function render(r) {
  WB.wordFonts();
  const ctx = contextFrom(r); const saved = store.pget(KEY, null);
  conv = saved && saved.id && (sameCtx(saved.ctx, ctx) || (!r.q.has('day') && !r.q.has('word'))) ? saved : null;
  if (!conv) newConv(ctx);
  const W = WB.cached(); const left = W ? Math.max(0, W.limit - W.used) : null;
  return `<div class="teacher">
    <div class="stack-sm"><p class="eyebrow">The Word Behind the Word</p><h1>Ask the Teacher</h1>
      <p class="muted small">Ask about any verse, word, or why translations differ. The teacher explains, and you can keep the conversation going.</p></div>
    ${conv.ctx.word || conv.ctx.label ? `<p class="ctxline"><span class="pill">${esc(conv.ctx.label || 'Your question')}</span>${conv.ctx.word ? ` <span>${WB.richText(conv.ctx.word).replace(/^<p>|<\/p>$/g, '')}</span>` : ''}</p>` : ''}
    <p class="notice small" role="note">Your questions and the teacher's answers are saved to help improve the study. Please don't include private details such as phone numbers or other people's names.</p>
    <div class="chat" id="chat" aria-live="polite" aria-label="Conversation">${conv.msgs.map(bubble).join('') || intro()}</div>
    <div class="chips" id="starters" role="group" aria-label="Suggested questions">${STARTERS.map(([l], i) => `<button class="chip" data-s="${i}">${esc(l)}</button>`).join('')}</div>
    <form class="composer" id="ask"><label class="sr" for="q">Your question</label>
      <textarea class="input" id="q" rows="2" maxlength="1200" placeholder="Type your question…"></textarea>
      ${WB.micOK() ? `<button type="button" class="icon-btn" id="mic" aria-label="Speak your question" aria-pressed="false">${micIcon}</button>` : ''}
      <button class="btn primary" id="send" aria-label="Send">${icon('next')}</button></form>
    <div class="row wrap small"><span class="faint" id="quota">${left == null ? '' : quotaText(left)}</span><span class="spacer"></span>
      ${WB.ttsOK() ? `<button class="link" id="voiceAuto" aria-pressed="${WB.ttsPrefs().auto}">${voiceLabel()}</button><button class="link" id="voiceSet">Voice settings</button>` : ''}<button class="link" id="newConv">Start a new conversation</button></div>
  </div>`;
}
const micIcon = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="3" width="7" height="11.5" rx="3.5"/><path opacity=".5" d="M5.5 11a6.5 6.5 0 0 0 13 0h2a8.5 8.5 0 0 1-7.5 8.4V22h-2v-2.6A8.5 8.5 0 0 1 3.5 11Z"/></svg>';
const voiceLabel = () => (WB.ttsPrefs().auto ? 'Voice replies: on' : 'Voice replies: off');
const quotaText = (left) => (left > 0 ? `${left} question${left === 1 ? '' : 's'} left today` : 'No questions left today');
const intro = () => `<div class="msg teacher"><div class="body"><p>Hello. I'm here to help you understand what you read, one word at a time. Ask me anything about ${conv.ctx.word ? 'this word' : "today's reading"}, or tap one of the suggestions below.</p></div></div>`;
function bubble(m, i) {
  if (m.role === 'user') return `<div class="msg me"><div class="body"><p>${esc(m.text)}</p></div></div>`;
  if (m.role === 'note') return `<div class="msg note"><div class="body"><p>${esc(m.text)}</p></div></div>`;
  return `<div class="msg teacher"><div class="body">${WB.richText(m.text)}</div>
    ${WB.ttsOK() ? `<button class="readaloud" data-read="${i}" aria-pressed="${WB.speaking() === 'm' + i}">${icon(WB.speaking() === 'm' + i ? 'pause' : 'listen', 'ico sm')} ${WB.speaking() === 'm' + i ? 'Stop reading' : 'Read aloud'}</button>` : ''}</div>`;
}
function paint(root) {
  const chat = $('#chat', root); if (!chat) return;
  chat.innerHTML = conv.msgs.map(bubble).join('') || intro();
  if (busy) chat.insertAdjacentHTML('beforeend', '<div class="msg teacher typing"><div class="body"><span></span><span></span><span></span><span class="sr">The teacher is writing</span></div></div>');
  $$('[data-read]', chat).forEach((b) => b.onclick = () => {
    const i = Number(b.dataset.read), id = 'm' + i;
    if (WB.speaking() === id) { WB.stopSpeaking(); paint(root); return; }
    if (!WB.speak(conv.msgs[i].text, id, () => paint(root))) toast('Read aloud is not available in this browser.');
    paint(root);
  });
  const last = chat.lastElementChild; if (last) last.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
async function ask(root, text) {
  text = String(text || '').trim(); if (!text || busy) return;
  const voice = WB.ttsOK() && WB.ttsPrefs().auto; if (voice) { WB.stopSpeaking(); WB.primeSpeech(); }
  conv.msgs.push({ role: 'user', text }); store.pset(KEY, conv); busy = true; paint(root);
  const send = $('#send', root); if (send) send.disabled = true;
  try {
    const r = await callLong('teacher', S.token, { conv: conv.id, text, day: conv.ctx.day, word: conv.ctx.word, lang: conv.ctx.lang });
    if (r.limited) {
      conv.msgs.pop(); // nothing was sent, so the question can be asked again tomorrow
      conv.msgs.push({ role: 'note', text: `You've asked ${r.limit} questions today, which is a lot of good study. The teacher will be ready again tomorrow. In the meantime, try the flashcards, or talk it over with your reading group.` });
    } else conv.msgs.push({ role: 'assistant', text: r.reply });
    const W = WB.cached(); if (W) { W.used = r.used; if (r.convs != null) W.convs = r.convs; store.pset('words', W); const qt = $('#quota', root); if (qt) qt.textContent = quotaText(Math.max(0, W.limit - W.used)); }
  } catch (e) {
    conv.msgs.pop(); const box = $('#q', root); if (box && !box.value) box.value = text;
    conv.msgs.push({ role: 'note', text: e.network ? e.message : /Unknown request/.test(e.message) ? 'The teacher is not switched on yet. Please check back soon.' : (e.message || 'The teacher is unavailable right now. Please try again in a few minutes.') });
  } finally {
    busy = false; store.pset(KEY, conv); if (send) send.disabled = false;
    // Voice replies: the teacher answers out loud (English; Hebrew and Greek are read by their English spelling).
    const i = conv.msgs.length - 1; const m = conv.msgs[i];
    if (voice && m && m.role === 'assistant' && document.contains(root)) WB.speak(m.text, 'm' + i, () => paint(root));
    paint(root);
  }
}

export function mount(root, r) {
  paint(root);
  const q = $('#q', root);
  $('#ask', root).onsubmit = (e) => { e.preventDefault(); const t = q.value; q.value = ''; ask(root, t); };
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) { e.preventDefault(); $('#ask', root).requestSubmit(); } });
  $$('[data-s]', root).forEach((b) => b.onclick = () => ask(root, STARTERS[Number(b.dataset.s)][1](conv.ctx)));
  $('#newConv', root).onclick = () => { WB.stopSpeaking(); newConv(conv.ctx); paint(root); toast('New conversation started.'); q.focus(); };
  const mic = $('#mic', root);
  if (mic) mic.onclick = () => {
    if (rec) { try { rec.stop(); } catch (e) {} return; }
    if (WB.ttsPrefs().auto) WB.primeSpeech();
    // Speak a question and it is sent straight away, so the conversation can happen by voice.
    rec = WB.listenOnce((t) => { const full = (q.value ? q.value + ' ' : '') + t; q.value = ''; ask(root, full); }, (st, err) => {
      mic.setAttribute('aria-pressed', st === 'start'); mic.classList.toggle('live', st === 'start');
      if (st !== 'start') rec = null;
      if (st === 'error' && err && err !== 'no-speech' && err !== 'aborted') toast(err === 'not-allowed' ? 'Microphone access was not allowed.' : 'Voice input did not work. Please type instead.');
    });
  };
  const vs = $('#voiceSet', root); if (vs) vs.onclick = voiceSheet;
  const va = $('#voiceAuto', root);
  if (va) va.onclick = () => { const on = !WB.ttsPrefs().auto; WB.setTtsPrefs({ auto: on }); if (!on) WB.stopSpeaking(); va.textContent = voiceLabel(); va.setAttribute('aria-pressed', on); paint(root); toast(on ? 'The teacher will answer out loud.' : 'Voice replies are off. Tap Read aloud on any answer to hear it.'); };
  window.addEventListener('hashchange', () => WB.stopSpeaking(), { once: true });
  if (r.q.get('ask') === 'quiz' && !conv.msgs.length) ask(root, STARTERS[2][1](conv.ctx));
  // Keep the teacher's usage count fresh.
  if (!WB.cached() || WB.stale()) WB.loadWords().then((W) => { const qt = $('#quota', root); if (qt) qt.textContent = quotaText(Math.max(0, W.limit - W.used)); }).catch(() => {});
}
function voiceSheet() {
  const p = WB.ttsPrefs(); const voices = WB.englishVoices();
  const s = sheet(`<div class="card-head"><h3>Read-aloud voice</h3><button class="icon-btn" id="vClose" aria-label="Close">${icon('close')}</button></div>
    <label class="field">Voice<select class="input" id="vVoice">${voices.length ? voices.map((v) => `<option value="${esc(v.voiceURI)}" ${v.voiceURI === p.voice ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('') : '<option value="">Your device\'s default voice</option>'}</select></label>
    <label class="field">Speed <span id="vRateL">${Number(p.rate).toFixed(1)}x</span><input type="range" id="vRate" min="0.6" max="1.5" step="0.1" value="${p.rate}"></label>
    <p class="small faint">Voices come from your phone or computer. The teacher's Hebrew and Greek words are read using their English spelling (for example "chesed").</p>
    <button class="btn" id="vTest">${icon('listen')} Test the voice</button>`, { label: 'Read-aloud voice' });
  $('#vClose', s).onclick = closeSheet;
  $('#vVoice', s).onchange = (e) => WB.setTtsPrefs({ voice: e.target.value });
  $('#vRate', s).oninput = (e) => { WB.setTtsPrefs({ rate: Number(e.target.value) }); $('#vRateL', s).textContent = `${Number(e.target.value).toFixed(1)}x`; };
  $('#vTest', s).onclick = () => WB.speak('Here is how I will sound. The Hebrew word חֶסֶד (chesed) means loyal, covenant love.', 'test');
}
export function onData() {}
