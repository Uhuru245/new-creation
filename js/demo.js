// DEMONSTRATION BACKEND — runs the real server code (server/Code.gs) inside the browser,
// against an in-memory "spreadsheet" saved in this browser only, seeded with clearly labelled SAMPLE people.
// Nothing here touches the real New Creation data.
import { todayISO, addDays } from './util.js';

const KEY = 'nc.demo.db.v1';
function sha256Bytes(msg) {
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const bytes = new TextEncoder().encode(msg); const l = bytes.length; const withPad = new Uint8Array(((l + 9 + 63) >> 6) << 6); withPad.set(bytes); withPad[l] = 0x80;
  const dv = new DataView(withPad.buffer); dv.setUint32(withPad.length - 4, l * 8); dv.setUint32(withPad.length - 8, Math.floor(l / 0x20000000));
  let h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]; const w = new Uint32Array(64);
  const r = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < withPad.length; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) { const s0 = r(w[i-15],7) ^ r(w[i-15],18) ^ (w[i-15] >>> 3), s1 = r(w[i-2],17) ^ r(w[i-2],19) ^ (w[i-2] >>> 10); w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0; }
    let [a,b,c,d,e,f,g,hh] = h;
    for (let i = 0; i < 64; i++) { const t1 = (hh + (r(e,6) ^ r(e,11) ^ r(e,25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0, t2 = ((r(a,2) ^ r(a,13) ^ r(a,22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0; hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0; }
    h = [h[0]+a,h[1]+b,h[2]+c,h[3]+d,h[4]+e,h[5]+f,h[6]+g,h[7]+hh].map((x) => x | 0);
  }
  const out = []; h.forEach((x) => { out.push((x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255); }); return out;
}

function makeServices(db, save) {
  const mkSheet = (book, name) => {
    const rows = book.sheets[name] = book.sheets[name] || [];
    return {
      getName: () => name, appendRow(r) { rows.push(r.map(norm)); save(); }, setFrozenRows() {}, getLastRow: () => rows.length, getMaxRows: () => 1000,
      getDataRange: () => ({ getValues: () => rows.map((r) => r.slice()) }),
      getRange(row, col, nr = 1, nc = 1) { return {
        setValues(v) { v.forEach((rr, i) => { rows[row - 1 + i] = rows[row - 1 + i] || []; rr.forEach((x, j) => { rows[row - 1 + i][col - 1 + j] = norm(x); }); }); save(); },
        setValue(x) { (rows[row - 1] = rows[row - 1] || [])[col - 1] = norm(x); save(); },
        getValues() { const out = []; for (let i = 0; i < nr; i++) { const r = rows[row - 1 + i] || []; out.push(Array.from({ length: nc }, (_, j) => r[col - 1 + j] ?? '')); } return out; },
        setNumberFormat() { return this; } }; },
      deleteRow(i) { rows.splice(i - 1, 1); save(); },
    };
  };
  const norm = (x) => (x instanceof Date ? x.toISOString() : x);
  const book = (id) => { const b = db.books[id]; if (!b) throw new Error('Unknown sheet'); return {
    getId: () => id, getUrl: () => '#demo-sheet', getSheetByName: (n) => (b.sheets[n] ? mkSheet(b, n) : null), insertSheet: (n) => { b.sheets[n] = []; save(); return mkSheet(b, n); },
    getSheets: () => Object.keys(b.sheets).map((n) => mkSheet(b, n)), deleteSheet() {}, copy: (n) => book(create(n)) }; };
  const create = (name) => { const id = 'demo' + (Object.keys(db.books).length + 1); db.books[id] = { name, sheets: {} }; save(); return id; };
  const fmt = (d, tz, f) => {
    d = d instanceof Date ? d : new Date(d);
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz === 'UTC' ? 'UTC' : 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d).map((x) => [x.type, x.value]));
    const hh = p.hour === '24' ? '00' : p.hour;
    return f.replace('yyyy', p.year).replace('MM', p.month).replace('dd', p.day).replace('HH', hh).replace('mm', p.minute).replace('ss', p.second).replace(/'T'/, 'T').replace(/'Z'/, 'Z');
  };
  return {
    SpreadsheetApp: { create: (n) => book(create(n)), openById: (id) => book(id) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => db.props[k] ?? null, setProperty: (k, v) => { db.props[k] = String(v); save(); }, deleteProperty: (k) => { delete db.props[k]; save(); } }) },
    CacheService: { getScriptCache: () => ({ get: (k) => db.cache[k] ?? null, put: (k, v) => { db.cache[k] = v; }, remove: (k) => { delete db.cache[k]; }, removeAll: (ks) => ks.forEach((k) => delete db.cache[k]) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, tryLock: () => true, releaseLock() {} }) },
    MailApp: { sendEmail: (to, subject, body) => { db.outbox.push({ time: new Date().toISOString(), to, subject, body }); save(); } },
    Session: { getEffectiveUser: () => ({ getEmail: () => 'leader@example.org' }) },
    Logger: { log() {} },
    ScriptApp: { getService: () => ({ getUrl: () => location.origin + location.pathname }), getProjectTriggers: () => [], newTrigger: () => ({ timeBased: () => ({ atHour: () => ({ everyDays: () => ({ inTimezone: () => ({ create() {} }) }) }) }) }), deleteTrigger() {} },
    Utilities: { formatDate: fmt, computeDigest: (a, s) => sha256Bytes(s), base64Encode: (bytes) => btoa(String.fromCharCode(...bytes.map((b) => b & 255))), getUuid: () => crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now(), DigestAlgorithm: { SHA_256: 1 } },
    ContentService: { MimeType: { JSON: 'json', ICAL: 'ical' }, createTextOutput: (t) => ({ t, setMimeType() { return this; }, downloadAsFile() { return this; } }) },
    HtmlService: {},
  };
}

export async function createDemo() {
  const src = await fetch(new URL('../server/Code.gs', import.meta.url)).then((r) => r.text());
  let db = null; try { db = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  const fresh = !db; if (!db) db = { books: {}, props: {}, cache: {}, outbox: [] };
  db.cache = {};
  if (fresh) {
    // Sample study content (clearly labelled), stored under the same sheet ids the server reads.
    const sid = (/STUDY_SHEET_ID\s*=\s*'([^']+)'/.exec(src) || [])[1], bid = (/BOOK_SHEET_ID\s*=\s*'([^']+)'/.exec(src) || [])[1];
    if (sid) db.books[sid] = { name: 'sample studies', sheets: { Studies: [['day', 'status', 'title', 'happening', 'setting', 'jesus', 'live', 'prayer', 'reviewer_note'],
      ['12', 'approved', 'Sample study card', 'This is SAMPLE text for the demonstration. In the real app, each day shows a study card written for that day and approved by the leader.', 'Sample: the setting of the passage appears here.', 'Sample: how the passage points to Jesus appears here.', 'Sample: one way to live it out.', 'Sample prayer.', '']] } };
    if (bid) db.books[bid] = { name: 'sample books', sheets: { Books: [['book', 'status', 'written', 'purpose', 'look_for'],
      ['Numbers', 'approved', 'Sample book introduction: who wrote it and when appears here.', 'Sample: what the book is about.', 'Sample: what to look for while reading.']] } };
  }
  let seeding = fresh; const save = () => { if (seeding) return; try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} };
  const svc = makeServices(db, save);
  const names = Object.keys(svc);
  // eslint-disable-next-line no-new-func
  const server = new Function(...names, src + '\n;return { doPost, setup, setLeaderByPhone, apiJoin, apiLogin, apiTick, apiPost2, apiCheer, apiPray2, readMembers_, writeMember_ };')(...names.map((n) => svc[n]));
  const call = (fn, args) => { const r = JSON.parse(server.doPost({ postData: { contents: JSON.stringify({ fn, args, env: 'prod' }) } }).t); if (!r.ok) throw new Error(r.error); return r.data; };
  if (fresh) { seed(server, db, svc, call); seeding = false; save(); }
  return { call, outbox: () => db.outbox, reset: () => { localStorage.removeItem(KEY); location.reload(); } };
}

function seed(server, db, svc, call) {
  // Content sheets (sample study card + book introduction), referenced by the server's STUDY_SHEET_ID / BOOK_SHEET_ID.
  const src = String(server);
  const start = addDays(todayISO(), -11);   // the demo challenge is on day 12 today
  server.setup();
  const sheetId = db.props.SHEET_ID; const ch = db.books[sheetId].sheets.Challenges; ch[1][3] = start; ch[1][1] = 'New Creation (sample challenge)';
  db.books[sheetId].sheets.Members = [db.books[sheetId].sheets.Members[0]];
  const people = [['Demo Leader', '0700000001', '1111'], ['Naledi (sample)', '0700000002', '2222'], ['Thabo (sample)', '0700000003', '3333'], ['Grace (sample)', '0700000004', '4444'], ['Sipho (sample)', '0700000005', '5555']];
  const tokens = people.map(([n, p, pin]) => call('join', [n, p, pin]).token);
  server.setLeaderByPhone('0700000001');
  const M = server.readMembers_(); M.forEach((m, i) => { m.joined = i === 4 ? addDays(start, 6) : start; server.writeMember_(m); });
  const seq = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);
  call('tick', [tokens[0], 'nc93', seq(0, 150), true]); call('tick', [tokens[1], 'nc93', seq(0, 155), true]);
  call('tick', [tokens[2], 'nc93', seq(0, 92), true]); call('tick', [tokens[3], 'nc93', seq(0, 40), true]);
  call('tick', [tokens[4], 'nc93', seq(120, 135), true]);
  call('post', [tokens[1], { kind: 'reflection', text: 'Sample post: I noticed how patient God was with Israel in the wilderness, again and again.', clientId: 'demo1' }]);
  call('post', [tokens[3], { kind: 'prayer', text: 'Sample post: Please pray for my family this week.', clientId: 'demo2' }]);
  call('post', [tokens[2], { kind: 'question', text: 'Sample post: Why were the cities of refuge spread across the land?', clientId: 'demo3' }]);
  call('post', [tokens[4], { kind: 'praise', text: 'Sample post: I finished my first full week of reading!', clientId: 'demo4' }]);
  call('cheer', [tokens[1], server.readMembers_()[0].id, 'Keep going, you\'re doing so well!']);
  db.props.STUDY_SHEET_ID_DEMO = '1';
  db.outbox = [];
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {}
  void src; void svc;
}
export const DEMO_ACCOUNTS = [
  { name: 'Demo Leader', phone: '070 000 0001', pin: '1111', role: 'Leader' },
  { name: 'Naledi (sample)', phone: '070 000 0002', pin: '2222', role: 'Member' },
];
