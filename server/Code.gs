/**
 * New Creation — Bible reading challenges, one at a time (starting with the 93-day Genesis-to-Revelation circle)
 * Google Apps Script web app (one link for everyone, leader tab only for Uhuru).
 *
 * SETUP (once):
 *  1. The leader is set securely: run setLeaderByPhone('0821234567') once from the editor (or set LEADER_PHONE below).
 *  2. Run setup() from the editor and approve the permissions.
 *  3. Deploy > New deployment > Web app: Execute as "Me", Who has access "Anyone".
 */

// ===== Settings you can change =====
const LEADER_PHONE = '';   // optional. Otherwise the leader is stored in Script Properties by setLeaderByPhone().
const LEADER_NAME  = 'Uhuru';
const NOTIFY_ON_JOIN = true;        // email you when someone joins
const NOTIFY_ON_OPEN = true;        // email you the first time each person opens the app each day
const DIGEST_HOUR = 20;             // evening summary email, 24h Johannesburg time
const GROUP_LINK = 'https://chat.whatsapp.com/SAMPLE-DEMO-LINK-DEMO-LINK';
const TZ = 'Africa/Johannesburg';
// Study content lives in two Google Sheets you can edit. Set a row's status to "approved" to show it to everyone.
const STUDY_SHEET_ID = 'demo-studies';
const BOOK_SHEET_ID = 'demo-books';
// ===================================

const START = '2026-09-23';
const S = {"books":["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Songs","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"],"codes":["GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG","ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON","MIC","NAM","HAB","ZEP","HAG","ZEC","MAL","MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD","REV"],"counts":[50,40,27,36,34,24,21,4,31,24,22,25,29,36,10,13,10,42,150,31,12,8,66,52,5,48,12,14,3,9,1,4,7,3,3,3,2,14,4,28,16,24,21,28,16,16,13,6,6,4,4,5,3,6,4,3,1,13,5,5,3,5,1,1,1,22],"dayCh":[11,11,12,16,12,12,16,16,11,14,13,9,11,15,8,12,12,12,13,12,12,12,11,8,11,11,13,12,13,16,14,14,8,17,16,14,14,14,16,16,13,15,15,14,17,13,31,15,16,20,12,15,12,11,16,10,10,9,9,14,12,11,12,9,9,12,14,17,16,20,13,12,11,8,9,9,10,8,9,9,10,9,8,8,16,13,20,22,13,18,8,11,6],"sections":["Creation, Fall and the Human Problem","Promise: Abraham and the Patriarchs","Redemption and Presence: the Exodus","Holiness, Law and the Wilderness","The Land, and Israel's Rebellion in It","Kingdom: Saul and David","Division, Decline and Exile","Return and Preservation","Wisdom and Worship","The Prophets: Judgment, Hope, New Covenant","The King Arrives: the Gospels","Spirit and Mission: Acts","The Gospel Explained and Lived: the Letters","Consummation: Revelation"],"secStart":[1,2,5,8,16,20,25,34,36,51,71,80,83,91],"deep":["Genesis 1:26–31; 3:1–24","Genesis 12:1–3; 15:1–21","Genesis 28:10–22","Genesis 49:8–12; 50:15–21","Exodus 12:1–28","Exodus 19:1–6; 20:1–17","Exodus 33:12–34:9","Leviticus 16","Leviticus 19:1–18","Numbers 13:25–14:24","Numbers 21:4–9","Numbers 35:9–34","Deuteronomy 6:1–25","Deuteronomy 18:15–22","Deuteronomy 30:1–20","Joshua 1:1–9","Joshua 24:1–28","Judges 2:6–23","Ruth 4:1–22","1 Samuel 8:1–22","1 Samuel 16:1–13","2 Samuel 5:1–12","2 Samuel 7:1–29","2 Samuel 23:1–7","1 Kings 8:22–53","1 Kings 18:20–40","2 Kings 5:1–19","2 Kings 17:7–23","1 Chronicles 1:1–4; 9:1–3","1 Chronicles 17:1–27","2 Chronicles 7:1–22","2 Chronicles 20:1–30","2 Chronicles 36:11–23","Ezra 3:8–13","Nehemiah 9:5–31","Job 1:1–2:10","Job 19:23–27; 28:12–28","Job 38:1–18; 42:1–6","Psalms 1–2","Psalm 22","Psalm 40","Psalm 51","Psalm 72","Psalm 89:19–52","Psalm 103","Psalm 110","Psalm 132","Proverbs 1:1–7; 8:22–31","Proverbs 16:1–9","Ecclesiastes 12:1–14","Isaiah 6:1–13","Isaiah 25:1–9","Isaiah 35:1–10","Isaiah 40:1–11","Isaiah 52:13–53:12","Jeremiah 2:1–13","Jeremiah 17:1–10","Jeremiah 29:1–14","Jeremiah 31:27–40","Jeremiah 39:1–10","Lamentations 3:19–33","Ezekiel 10:18–19; 11:14–25","Ezekiel 28:11–19","Ezekiel 36:22–32; 37:1–14","Ezekiel 43:1–7; 47:1–12","Daniel 7:1–28","Hosea 11:1–11","Joel 2:12–32","Micah 5:1–5; 6:6–8","Malachi 3:1–4; 4:1–6","Matthew 1:1–23","Matthew 16:13–28","Matthew 28:16–20","Mark 10:35–45","Luke 4:14–30","Luke 15:1–32","Luke 24:25–49","John 11:17–44","John 19:16–30; 20:19–29","Acts 2:1–21, 36–41","Acts 10:34–48","Acts 26:12–29","Romans 3:21–26; 5:12–21","Romans 11:25–36; 12:1–2","1 Corinthians 15:1–28","2 Corinthians 5:11–21","Ephesians 2:1–22","1 Thessalonians 4:13–5:11","Hebrews 9:11–28","1 Peter 2:1–12","Revelation 5:1–14","Revelation 12:1–17","Revelation 21:1–22:5"],"ms":{"1":[1,"Genesis 1–11: creation, the Fall and humanity's problem"],"3":[2,"Abraham: covenant and promise"],"7":[3,"Exodus: redemption, Passover and God's presence"],"9":[4,"Sinai and Leviticus: law, holiness and sacrifice"],"24":[5,"David: kingdom and messianic expectation"],"28":[6,"Exile: judgment and covenant failure"],"70":[7,"Prophets: coming king, servant, new covenant, Spirit"],"72":[8,"Jesus: the promises begin to be fulfilled"],"79":[9,"Cross and resurrection: the centre of redemption"],"80":[10,"Pentecost: Spirit and mission"],"84":[11,"Romans: the gospel explained"],"93":[12,"Revelation 21–22: new creation"]},"dense":[8,29,30,34,36,37,38,47,52,62,63,65,66,83,84,89,92]};
const MAIN_ID = 'nc93';   // the original Genesis-to-Revelation challenge
const TOTAL = 1189;
const CUM = (function(){ const c=[0]; S.dayCh.forEach(function(n){ c.push(c[c.length-1]+n); }); return c; })();
const CH = (function(){ const a=[]; S.counts.forEach(function(n,b){ for(let c=1;c<=n;c++) a.push([b,c]); }); return a; })();
const COLS = ['id','name','phone','salt','pinHash','token','joined','lastSeen','lastReadDate','streak','ch','bits','notifiedOpen','nudged','fresh','inMain','pinV','settings'];

// ---------- reading plans (each new challenge uses one) ----------
const PLAN_DEFS = {
  bible93:   { name: 'Whole Bible in 93 days', blurb: 'Genesis to Revelation, with a daily study card.' },
  gospels30: { name: 'The Gospels in 30 days', blurb: 'Matthew, Mark, Luke and John, about 3 chapters a day.', books: ['MAT','MRK','LUK','JHN'], days: 30,
               groups: [['Matthew','MAT'],['Mark','MRK'],['Luke','LUK'],['John','JHN']] },
  nt60:      { name: 'New Testament in 60 days', blurb: 'Matthew to Revelation, about 4 or 5 chapters a day.', fromBook: 'MAT', toBook: 'REV', days: 60,
               groups: [['The Gospels','MAT'],['Acts','ACT'],["Paul's letters",'ROM'],['Hebrews to Revelation','HEB']] },
  pp31:      { name: 'Psalms & Proverbs in 31 days', blurb: 'Five psalms and one chapter of Proverbs a day.' },
  advent24:  { name: 'Advent: 24 days to Christmas', blurb: 'The promises, the prophets and the birth of Jesus. Best started on 1 December.',
               list: ['GEN 3','GEN 12;GEN 22','2SA 7','ISA 7;ISA 9','ISA 11','ISA 40','PSA 2;PSA 110','ISA 42','ISA 52;ISA 53','ISA 60;ISA 61','JER 23;JER 33','EZK 34',
                      'MIC 5;ZEC 9','MAL 3;MAL 4','JHN 1','PHP 2','COL 1','HEB 1;HEB 2','GAL 4;TIT 2','ISA 35;PSA 98','REV 21;REV 22','LUK 1','MAT 1;MAT 2','LUK 2'],
               sections: [['The promise',1],['The prophets',8],['The Word made flesh',15],['The birth',22]] }
};
const PLANS_ = {};
function bookIdx_(code) { const i = S.codes.indexOf(code); if (i < 0) throw new Error('Unknown book ' + code); return i; }
function segsOf_(chapters) { // [[b,c],...] -> [[b,from,to],...]
  const out = []; chapters.forEach(function(x){ const l = out[out.length-1]; if (l && l[0] === x[0] && l[2] === x[1]-1) l[2] = x[1]; else out.push([x[0], x[1], x[1]]); }); return out;
}
function plan_(id) {
  if (PLANS_[id]) return PLANS_[id];
  const d = PLAN_DEFS[id]; if (!d) throw new Error('Unknown reading plan.');
  let days = [], sections = [];
  if (id === 'bible93') {
    let k = 0; S.dayCh.forEach(function(n){ days.push(segsOf_(CH.slice(k, k + n))); k += n; });
    sections = S.sections.map(function(t, i){ return [t, S.secStart[i]]; });
  } else if (d.list) {
    days = d.list.map(function(s){ return s.split(';').map(function(p){ const m = p.trim().split(' '); const b = bookIdx_(m[0]); const r = (m[1]||'1').split('-');
      return [b, Number(r[0]), Number(r[1]||r[0])]; }); });
    sections = d.sections;
  } else if (id === 'pp31') {
    const ps = bookIdx_('PSA'), pr = bookIdx_('PRO');
    for (let n = 1; n <= 31; n++) { const day = [];
      if (n <= 30) [0,30,60,90,120].forEach(function(o){ day.push([ps, n + o, n + o]); });
      day.push([pr, n, n]); days.push(day); }
    sections = [['Week 1',1],['Week 2',8],['Week 3',15],['Week 4',22],['Final days',29]];
  } else {
    let books = d.books ? d.books.map(bookIdx_) : []; if (!d.books) { for (let b = bookIdx_(d.fromBook); b <= bookIdx_(d.toBook); b++) books.push(b); }
    const chs = []; books.forEach(function(b){ for (let c = 1; c <= S.counts[b]; c++) chs.push([b, c]); });
    const T = chs.length; let prev = 0;
    for (let k = 1; k <= d.days; k++) { const upto = Math.round(k * T / d.days); days.push(segsOf_(chs.slice(prev, upto))); prev = upto; }
    sections = (d.groups || []).map(function(g){ const b = bookIdx_(g[1]); let day = 1;
      for (let i = 0; i < days.length; i++) if (days[i].some(function(s){ return s[0] === b && s[1] === 1; })) { day = i + 1; break; } return [g[0], day]; });
  }
  const dayCh = days.map(function(dd){ return dd.reduce(function(a, s){ return a + s[2] - s[1] + 1; }, 0); });
  const cum = [0]; dayCh.forEach(function(n){ cum.push(cum[cum.length-1] + n); });
  const keys = []; days.forEach(function(dd){ dd.forEach(function(sg){ for (let c = sg[1]; c <= sg[2]; c++) keys.push(sg[0] + '.' + c); }); });
  PLANS_[id] = { id: id, name: d.name, blurb: d.blurb, days: days, sections: sections, dayCh: dayCh, cum: cum, total: cum[cum.length-1], n: days.length, keys: keys };
  return PLANS_[id];
}
function dataJson_() {
  const plans = {}; Object.keys(PLAN_DEFS).forEach(function(id){ const p = plan_(id); plans[id] = { name: p.name, blurb: p.blurb, days: p.days, sections: p.sections }; });
  return JSON.stringify(Object.assign({}, S, { plans: plans }));
}

function doGet(e) {
  const q = (e && e.parameter) || {};
  if (q.ics) return ics_(q.ics, q.from, q.until);
  const t = HtmlService.createTemplateFromFile('Index'); t.by = '';
  if (q.by) { try { const m = readMembers_().filter(function(x){ return x.id === String(q.by); })[0]; if (m) t.by = String(m.name).split(' ')[0]; } catch (err) {} }
  return t.evaluate()
    .setTitle('New Creation')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ---------- setup ----------
function setup() {
  const ss = getSS_();
  const mem = sheet_('Members', COLS); mem.getRange(1,1,mem.getMaxRows(),COLS.length).setNumberFormat('@');
  sheet_('Cheers', ['time','fromId','fromName','toId','message']);
  sheet_('Reflections', RCOLS);
  sheet_('Progress', PCOLS); challenges_();
  sheet_('Log', ['time','name','event','detail']);
  ScriptApp.getProjectTriggers().forEach(function(t){ if (t.getHandlerFunction()==='dailyDigest') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('dailyDigest').timeBased().atHour(DIGEST_HOUR).everyDays(1).inTimezone(TZ).create();
  Logger.log('Ready. Sheet: ' + ss.getUrl());
}
let SS_ = null, SH_ = {};   // opened once per request (speed)
let ENV_ = 'prod';          // 'test' routes every read/write to the separate test spreadsheet
function prop_(k) { return PropertiesService.getScriptProperties().getProperty((ENV_ === 'test' ? 'TEST_' : '') + k); }
function setProp_(k, v) { PropertiesService.getScriptProperties().setProperty((ENV_ === 'test' ? 'TEST_' : '') + k, v); }
function getSS_() {
  if (SS_) return SS_;
  const p = PropertiesService.getScriptProperties();
  if (ENV_ === 'test') { const tid = p.getProperty('TEST_SHEET_ID'); if (!tid) throw new Error('Test environment is not set up. Run setupTest() in the editor.'); SS_ = SpreadsheetApp.openById(tid); return SS_; }
  let id = p.getProperty('SHEET_ID');
  if (id) { try { SS_ = SpreadsheetApp.openById(id); return SS_; } catch (e) {} }
  const ss = SpreadsheetApp.create('New Creation — reading circle (data)');
  p.setProperty('SHEET_ID', ss.getId());
  return ss;
}
function sheet_(name, header) {
  if (SH_[name]) return SH_[name];
  const ss = getSS_();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.getRange(1,1,sh.getMaxRows(),Math.max(header.length,15)).setNumberFormat('@'); sh.appendRow(header); sh.setFrozenRows(1); const s1 = ss.getSheetByName('Sheet1'); if (s1 && ss.getSheets().length>1) ss.deleteSheet(s1); }
  SH_[name] = sh; return sh;
}

// ---------- helpers ----------
function today_() { if (ENV_ === 'test') { const f = prop_('TODAY'); if (f) return f; } return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
function daysBetween_(a, b) { return Math.round((new Date(b+'T12:00:00Z') - new Date(a+'T12:00:00Z')) / 864e5); }
function normPhone_(p) { p = String(p||'').replace(/\D/g,''); if (p.indexOf('00')===0) p = p.slice(2); if (p.charAt(0)==='0') p = '27' + p.slice(1); return p; }
function hash_(salt, pin) { return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ':' + pin)); }
// v2: salted, peppered (secret kept in Script Properties, never in the Sheet) and stretched.
function pepper_() { const p = PropertiesService.getScriptProperties(); let v = p.getProperty('PIN_PEPPER'); if (!v) { v = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('PIN_PEPPER', v); } return v; }
function hash2_(salt, pin) { let h = pepper_() + ':' + salt + ':' + pin; for (let i = 0; i < 150; i++) h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + ':' + salt)); return h; }
function setPin_(m, pin) { m.salt = uuid_(); m.pinHash = hash2_(m.salt, pin); m.pinV = '2'; }
function pinOk_(m, pin) { return String(m.pinV) === '2' ? hash2_(m.salt, pin) === m.pinHash : hash_(m.salt, pin) === m.pinHash; }
function uuid_() { return Utilities.getUuid(); }
function clean_(s, n) { return String(s||'').replace(/[<>]/g,'').trim().slice(0, n); }
function log_(name, event, detail) { sheet_('Log',['time','name','event','detail']).appendRow([new Date(), name, event, detail||'']); }
function leaderEmail_() { return Session.getEffectiveUser().getEmail(); }
function isLeader_(m) {
  const lp = normPhone_(LEADER_PHONE);
  if (lp.length >= 9) return normPhone_(m.phone) === lp;
  const id = prop_('LEADER_ID');   // set by setLeaderByPhone(), never by joining
  return !!id && String(m.id) === String(id);
}

function readMembers_() {
  const sh = sheet_('Members', COLS); const v = sh.getDataRange().getValues(); const out = [];
  for (let i = 1; i < v.length; i++) { const m = {}; COLS.forEach(function(c,j){ m[c] = v[i][j]; }); m._row = i + 1;
    ['joined','lastSeen','lastReadDate','notifiedOpen','nudged'].forEach(function(k){ if (m[k] instanceof Date) m[k] = Utilities.formatDate(m[k], TZ, 'yyyy-MM-dd'); });
    m.id = String(m.id); m.token = String(m.token||''); m.ch = Number(m.ch)||0; m.streak = Number(m.streak)||0; m.bits = String(m.bits||'').replace(/^b/,''); m.phone = String(m.phone||''); m.settings = settingsOf_(m); out.push(m); }
  return out;
}
function writeMember_(m) {
  const sh = sheet_('Members', COLS);
  const row = COLS.map(function(c){ let v = m[c] === undefined ? '' : m[c]; if (c === 'settings' && typeof v === 'object') v = JSON.stringify(v); return c === 'bits' ? 'b' + String(v).replace(/^b/,'') : v; });
  if (m._row) sh.getRange(m._row, 1, 1, COLS.length).setValues([row]); else sh.appendRow(row);
}
function byToken_(token) {
  if (!token) throw new Error('Please sign in again.');
  const m = readMembers_().filter(function(x){ return x.token === token; })[0];
  if (!m) throw new Error('Please sign in again.');
  return m;
}
function withLock_(fn) { const l = LockService.getScriptLock(); l.waitLock(20000); try { return fn(); } finally { l.releaseLock(); } }

function addDays_(iso, n) { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd'); }

// ---------- challenges ----------
const CCOLS = ['id','name','plan','start','status','created','link'];
const PCOLS = ['challenge','memberId','bits','ch','streak','lastReadDate','fresh','joined','startDay','nudged'];
function challenges_() {
  const sh = sheet_('Challenges', CCOLS); const v = sh.getDataRange().getValues(); const out = [];
  for (let i = 1; i < v.length; i++) { const c = {}; CCOLS.forEach(function(k, j){ const x = v[i][j]; c[k] = x instanceof Date ? Utilities.formatDate(x, TZ, 'yyyy-MM-dd') : String(x == null ? '' : x); });
    if (c.id && PLAN_DEFS[c.plan]) { c._row = i + 1; out.push(c); } }
  if (!out.some(function(c){ return c.id === MAIN_ID; })) {
    const c = { id: MAIN_ID, name: 'New Creation', plan: 'bible93', start: START, status: 'open', created: START, link: GROUP_LINK };
    sh.appendRow(CCOLS.map(function(k){ return c[k]; })); c._row = sh.getLastRow(); out.unshift(c);
  }
  return out.map(function(c){ const p = plan_(c.plan); c.n = p.n; c.total = p.total; c.cum = p.cum; c.planName = p.name; c.end = addDays_(c.start, p.n - 1); return c; });
}
function challenge_(id, list) { return (list || challenges_()).filter(function(c){ return c.id === id; })[0]; }
function pubCh_(c) { return { id: c.id, name: c.name, plan: c.plan, planName: c.planName, start: c.start, end: c.end, n: c.n, total: c.total, status: c.status, link: c.link || '' }; }
function dayIndexFor_(c) { const d = daysBetween_(c.start, today_()); return d < 0 ? 0 : (d > c.n - 1 ? c.n + 1 : d + 1); }
function dayIndex_() { return dayIndexFor_(challenge_(MAIN_ID)); }

function progressRows_() {
  const v = sheet_('Progress', PCOLS).getDataRange().getValues(); const out = [];
  for (let i = 1; i < v.length; i++) { const r = {}; PCOLS.forEach(function(k, j){ const x = v[i][j]; r[k] = x instanceof Date ? Utilities.formatDate(x, TZ, 'yyyy-MM-dd') : String(x == null ? '' : x); });
    r.bits = r.bits.replace(/^b/, ''); r.ch = Number(r.ch) || 0; r.streak = Number(r.streak) || 0; r.startDay = Number(r.startDay) || 1; r._row = i + 1; out.push(r); }
  return out;
}
function startDayMain_(m) {
  // Late joiners start on the day they joined; earlier chapters become optional catch-up.
  if (isLeader_(m)) return 1;
  const j = m.joined ? daysBetween_(START, m.joined) + 1 : 1;
  return Math.max(1, Math.min(93, j));
}
function progressOf_(m, c, rows) {
  if (c.id === MAIN_ID) {
    if (m.inMain === 'no') return null;
    return { main: true, bits: m.bits, ch: m.ch, streak: m.streak, lastReadDate: m.lastReadDate, fresh: m.fresh, nudged: m.nudged, joined: m.joined, startDay: startDayMain_(m) };
  }
  const r = (rows || progressRows_()).filter(function(r){ return r.challenge === c.id && r.memberId === m.id; })[0];
  if (r) return r;
  // One challenge at a time: every member is in it. Members who joined before it began start on Day 1.
  const joined = m.joined > c.start ? m.joined : c.start;
  const d = daysBetween_(c.start, joined);
  const sd = isLeader_(m) ? 1 : Math.max(1, Math.min(c.n, d + 1));
  return { bits: '', ch: 0, streak: 0, lastReadDate: '', fresh: '', joined: joined, startDay: sd, nudged: '' };
}
function saveProgress_(m, c, p) {
  if (c.id === MAIN_ID) { ['bits','ch','streak','lastReadDate','fresh','nudged'].forEach(function(k){ m[k] = p[k]; }); writeMember_(m); return; }
  const row = PCOLS.map(function(k){ const v = p[k] === undefined ? '' : p[k]; return k === 'bits' ? 'b' + String(v).replace(/^b/, '') : (k === 'challenge' ? c.id : (k === 'memberId' ? m.id : v)); });
  const sh = sheet_('Progress', PCOLS);
  if (p._row) sh.getRange(p._row, 1, 1, PCOLS.length).setValues([row]); else sh.appendRow(row);
}
function joinChallenge_(m, c) {
  if (c.id === MAIN_ID) { m.inMain = ''; writeMember_(m); return; }
  if (progressOf_(m, c)) return;
  const sd = isLeader_(m) ? 1 : Math.max(1, Math.min(c.n, dayIndexFor_(c) || 1));
  saveProgress_(m, c, { bits: '', ch: 0, streak: 0, lastReadDate: '', fresh: '', joined: today_(), startDay: sd, nudged: '' });
}
function firstUnread_(p, from, total) { for (let i = from; i < total; i++) if (p.bits.charAt(i) !== '1') return i; return total; }
function assess_(m, p, c) {
  if (!c) { c = challenge_(MAIN_ID); p = progressOf_(m, c) || { ch: 0, bits: '', startDay: 1 }; }
  const n = c.n, cum = c.cum; const t = dayIndexFor_(c); const sd = p.startDay || 1; const s0 = cum[sd-1];
  const e = t === 0 ? 0 : Math.max(s0, cum[Math.min(t-1, n)]);
  // Any chapter read counts, so a late joiner who reads from the beginning is never penalised.
  const behind = Math.max(0, (e - s0) - p.ch);
  let reached = sd - 1; while (reached < n && cum[reached+1] - s0 <= p.ch) reached++;
  const daysBehind = (t <= 1 || behind <= 4) ? 0 : Math.max(1, (Math.min(t, n+1)-1) - reached);
  const quiet = m.lastSeen ? daysBetween_(m.lastSeen, today_()) : null;
  let s = 'ok', label = 'On track';
  if (daysBehind === 1) { s = 'slip'; label = 'A day behind'; }
  else if (daysBehind >= 2 && daysBehind <= 3) { s = 'behind'; label = daysBehind + ' days behind'; }
  else if (daysBehind > 3) { s = 'call'; label = daysBehind + ' days behind'; }
  if (quiet !== null && quiet >= 4 && t > 1 && s !== 'call') { s = s==='ok'?'slip':s==='slip'?'behind':'call'; label += ' · away ' + quiet + ' days'; }
  if (sd > 1) label += ' · joined Day ' + sd;
  return { s: s, label: label, behind: behind, daysBehind: daysBehind, expected: e - s0, quiet: quiet, reached: reached, startDay: sd };
}
function publicOf_(m, p, c) {
  const a = assess_(m, p, c);
  const at = firstUnread_(p, c.cum[a.startDay-1], c.total);
  return { id: m.id, name: m.name, ch: p.ch, at: at, pct: Math.round(p.ch / c.total * 1000) / 10, streak: p.streak,
           readToday: p.lastReadDate === today_(), onPace: a.behind <= 4, leader: isLeader_(m), startDay: a.startDay };
}

function rangeLabel_(from, to) {
  const parts = []; let i = from;
  while (i < to) { const b = CH[i][0]; let j = i; while (j+1 < to && CH[j+1][0] === b) j++;
    parts.push(CH[i][1] === CH[j][1] ? S.books[b]+' '+CH[i][1] : S.books[b]+' '+CH[i][1]+'–'+CH[j][1]); i = j+1; }
  return parts.join('; ');
}

// ---------- API (called from the app) ----------
function current_(list) {
  const t = today_(); const live = list.filter(function(c){ return c.status === 'open' && c.start <= t; });
  live.sort(function(a, b){ return a.start < b.start ? 1 : (a.start > b.start ? -1 : (a.created < b.created ? 1 : -1)); });
  return live[0] || challenge_(MAIN_ID, list);
}
function upcoming_(list) {
  const t = today_(); return list.filter(function(c){ return c.status === 'open' && c.start > t; }).sort(function(a, b){ return a.start < b.start ? -1 : 1; })[0] || null;
}
function apiPing() {
  const ss = getSS_(); sheet_('Members', COLS); const list = challenges_();
  return { ok: true, leaderSet: normPhone_(LEADER_PHONE).length >= 9, members: readMembers_().length, owner: leaderEmail_() ? true : false, current: (function(x){ delete x.link; return x; })(pubCh_(current_(list))) };
}
function apiJoin(name, phone, pin) {
  return withLock_(function(){
    name = clean_(name, 40); phone = normPhone_(phone); pin = String(pin||'').replace(/\s/g,'');
    if (!name) throw new Error('Please enter your name.');
    if (phone.length < 9) throw new Error('Please enter your WhatsApp number.');
    if (!/^\d{4}$/.test(pin)) throw new Error('Choose a 4-digit PIN.');
    if (readMembers_().some(function(x){ return normPhone_(x.phone) === phone; })) throw new Error('This number has already joined. Sign in with your PIN instead.');
    const c = current_(challenges_());
    const salt = uuid_(), token = uuid_(), t = today_();
    const m = { id: uuid_().slice(0,8), name: name, phone: phone, salt: salt, pinHash: hash2_(salt, pin), pinV: '2', settings: '', token: token,
      joined: t, lastSeen: t, lastReadDate: '', streak: 0, ch: 0, bits: '', notifiedOpen: t, nudged: '', fresh: '', inMain: '' };
    writeMember_(m); if (c.id !== MAIN_ID) joinChallenge_(m, c); log_(name, 'joined', phone + ' · ' + c.name);
    if (NOTIFY_ON_JOIN && !isLeader_(m)) notify_('New member: ' + name, name + ' has joined ' + c.name + '.\nWhatsApp: +' + phone + '\n\nSay welcome: https://wa.me/' + phone);
    return { token: token };
  });
}
function apiLogin(phone, pin) {
  phone = normPhone_(phone);
  const cache = CacheService.getScriptCache(), key = 'fail_' + phone, fails = Number(cache.get(key)||0);
  if (fails >= 5) throw new Error('Too many attempts. Try again in 15 minutes.');
  return withLock_(function(){
    const m = readMembers_().filter(function(x){ return normPhone_(x.phone) === phone; })[0];
    pin = String(pin).replace(/\s/g,'');
    if (!m || !pinOk_(m, pin)) { cache.put(key, String(fails+1), 900); throw new Error('That number and PIN don\'t match.'); }
    if (String(m.pinV) !== '2') setPin_(m, pin);   // upgrade older PIN hashes on successful sign-in
    m.token = uuid_(); writeMember_(m); cache.remove(key); log_(m.name, 'signed in', '');
    return { token: m.token };
  });
}
function apiState(token, opts) {
  return (function(){
    const all = readMembers_(); const me = all.filter(function(x){ return x.token === token; })[0];
    if (!me) throw new Error('Please sign in again.');
    const t = today_();
    if (me.lastSeen !== t) {
      // First open today: record it under the lock, re-reading the row so no progress is overwritten.
      const l = LockService.getScriptLock();
      if (l.tryLock(5000)) { try {
        const fresh = readMembers_().filter(function(x){ return x.id === me.id; })[0];
        if (fresh && fresh.lastSeen !== t) {
          fresh.lastSeen = t;
          if (NOTIFY_ON_OPEN && fresh.notifiedOpen !== t && !isLeader_(fresh)) { fresh.notifiedOpen = t; notify_(fresh.name + ' opened the app', fresh.name + ' opened New Creation today.'); }
          writeMember_(fresh); Object.assign(me, fresh);
        }
      } finally { l.releaseLock(); } }
    }
    // One challenge at a time: everyone takes part in the current one automatically.
    const list = challenges_(), c = current_(list), rows = progressRows_();
    const p = progressOf_(me, c, rows);
    const lead = isLeader_(me), next = upcoming_(list);
    const past = list.filter(function(x){ return x.id !== c.id && x.start <= t && x.status !== 'cancelled'; }).map(function(x){ const q = progressOf_(me, x, rows);
      return q && (q.main || q._row) && q.ch > 0 ? Object.assign(pubCh_(x), { ch: q.ch, pct: Math.round(q.ch / x.total * 1000) / 10 }) : null; }).filter(Boolean);
    const cheers = sheet_('Cheers',['time','fromId','fromName','toId','message']).getDataRange().getValues().slice(1)
      .filter(function(r){ return String(r[3]) === me.id && daysBetween_(Utilities.formatDate(new Date(r[0]),TZ,'yyyy-MM-dd'), t) <= 3; })
      .slice(-8).reverse().map(function(r){ return { from: r[2], message: r[4], when: Utilities.formatDate(new Date(r[0]),TZ,'yyyy-MM-dd') }; });
    opts = opts || {};
    const circle = all.map(function(m){ const q = progressOf_(m, c, rows); if (!q) return null; const o = publicOf_(m, q, c);
        // Members can hide their progress from the group (the leader still sees it).
        if (m.settings.hideProgress && m.id !== me.id && !lead) return { id: o.id, name: o.name, hidden: true, ch: 0, pct: 0, leader: o.leader };
        return o; }).filter(Boolean)
      .sort(function(a,b){ return b.ch - a.ch || a.name.localeCompare(b.name); });
    let appUrl = ''; try { appUrl = ScriptApp.getService().getUrl(); } catch (e) {}
    return {
      me: { id: me.id, name: me.name, bits: p.bits, ch: p.ch, streak: p.streak, joined: p.joined || me.joined, fresh: p.fresh, leader: lead, startDay: assess_(me, p, c).startDay, lastReadDate: p.lastReadDate, settings: me.settings },
      challenge: pubCh_(c), next: next ? Object.assign(pubCh_(next), { blurb: PLAN_DEFS[next.plan].blurb }) : null, past: past,
      plans: lead ? Object.keys(PLAN_DEFS).map(function(id){ const q = plan_(id); return { id: id, name: q.name, blurb: q.blurb, n: q.n }; }) : [],
      circle: circle, cheers: cheers, reflections: opts.lite ? [] : recentPosts_(me.id, c.id), content: contentFor_(me, c), groupLink: c.link || GROUP_LINK, appUrl: appUrl, today: t };
  })();
}
function apiSave(token, bits, fresh, cid) {
  return withLock_(function(){
    const me = byToken_(token); const c = challenge_(cid || MAIN_ID); if (!c) throw new Error('Challenge not found.');
    const p = progressOf_(me, c); if (!p) throw new Error('Please refresh the app.');
    bits = String(bits||'').replace(/[^01]/g,'').slice(0, c.total);
    const ch = uniqueCount_(bits, c), t = today_();
    if (ch > p.ch) {
      if (p.lastReadDate !== t) { p.streak = (p.lastReadDate && daysBetween_(p.lastReadDate, t) === 1) ? p.streak + 1 : 1; p.lastReadDate = t; }
    }
    p.bits = bits; p.ch = ch; me.lastSeen = t; if (fresh !== undefined) p.fresh = fresh ? t : '';
    saveProgress_(me, c, p); if (c.id !== MAIN_ID) writeMember_(me);
    return { ch: ch, streak: p.streak };
  });
}
function apiCheer(token, toId, message) {
  return withLock_(function(){
    const me = byToken_(token); message = clean_(message, 140); if (!message) throw new Error('Write a short message.');
    const sh = sheet_('Cheers',['time','fromId','fromName','toId','message']); const t = today_();
    const sentToday = sh.getDataRange().getValues().slice(1).filter(function(r){ return r[1]===me.id && r[3]===toId && Utilities.formatDate(new Date(r[0]),TZ,'yyyy-MM-dd')===t; }).length;
    if (sentToday >= 3) throw new Error('You\'ve encouraged them three times today. Try again tomorrow.');
    sh.appendRow([new Date(), me.id, me.name, toId, message]);
    return true;
  });
}
function apiLeader(token, cid) {
  const me = byToken_(token); if (!isLeader_(me)) throw new Error('Leader only.');
  const c = challenge_(cid || MAIN_ID); const rows = progressRows_();
  return readMembers_().map(function(m){ const p = progressOf_(m, c, rows); if (!p) return null; const a = assess_(m, p, c);
    return { id: m.id, name: m.name, phone: m.phone, ch: p.ch, joined: p.joined || m.joined, lastSeen: m.lastSeen, lastReadDate: p.lastReadDate,
             streak: p.streak, nudged: p.nudged, fresh: p.fresh, email: settingsOf_(m).email || '', status: a.s, label: a.label, behind: a.behind, daysBehind: a.daysBehind, expected: a.expected }; }).filter(Boolean);
}
// Personal emails to members who chose to receive them. {first} and {name} become each person's own name.
function apiMail(token, msg) {
  const me = byToken_(token); if (!isLeader_(me)) throw new Error('Only the app owner can send emails.');
  msg = msg || {}; const subject = String(msg.subject || '').trim().slice(0, 150), body = String(msg.body || '').trim().slice(0, 20000);
  if (!subject || !body) throw new Error('Add a subject and a message.');
  const ids = Array.isArray(msg.ids) ? msg.ids.map(String) : null;
  const list = readMembers_().filter(function(m){ return settingsOf_(m).email && (!ids || ids.indexOf(m.id) >= 0); });
  if (!list.length) throw new Error('No one selected has an email address.');
  const quota = MailApp.getRemainingDailyQuota();
  if (list.length > quota) throw new Error('Google allows ' + quota + ' more emails today. Choose fewer people or send the rest tomorrow.');
  const h = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  const foot = 'You are receiving this because you added your email in the New Creation app. To stop, open the app, tap Me, then Email updates.'; let sent = 0; const failed = [];
  list.forEach(function(m){
    const first = String(m.name).split(' ')[0];
    const fill = function(s){ return s.replace(/\{first\}/gi, first).replace(/\{name\}/gi, m.name); };
    const html = '<div style="font-family:Georgia,serif;font-size:16px;line-height:1.65;color:#1d2a24">' + h(fill(body)).replace(/\n/g, '<br>') + '</div><p style="font-family:Arial,sans-serif;font-size:12px;color:#888;margin-top:28px">' + foot + '</p>';
    try { MailApp.sendEmail({ to: settingsOf_(m).email, subject: fill(subject), body: fill(body) + '\n\n--\n' + foot, htmlBody: html, name: 'New Creation' }); sent++; } catch (e) { failed.push(m.name); }
  });
  log_(me.name, 'emailed', sent + ' · ' + subject);
  return { sent: sent, failed: failed, remaining: MailApp.getRemainingDailyQuota() };
}
function apiMarkNudged(token, id, cid) {
  return withLock_(function(){
    const me = byToken_(token); if (!isLeader_(me)) throw new Error('Leader only.');
    const m = readMembers_().filter(function(x){ return x.id === id; })[0]; if (!m) return false;
    const c = challenge_(cid || MAIN_ID); const p = progressOf_(m, c); if (!p) return false;
    p.nudged = today_(); saveProgress_(m, c, p); log_(me.name, 'nudged', m.name + ' · ' + c.name); return true;
  });
}
function apiRemove(token, id) {
  return withLock_(function(){
    const me = byToken_(token); if (!isLeader_(me)) throw new Error('Leader only.');
    const m = readMembers_().filter(function(x){ return x.id === id; })[0]; if (!m || isLeader_(m)) return false;
    const psh = sheet_('Progress', PCOLS); progressRows_().filter(function(r){ return r.memberId === id; }).reverse().forEach(function(r){ psh.deleteRow(r._row); });
    sheet_('Members', COLS).deleteRow(m._row); log_(me.name, 'removed', m.name); return true;
  });
}
function apiChallenges(token) {
  const me = byToken_(token); if (!isLeader_(me)) throw new Error('Leader only.');
  const list = challenges_(), rows = progressRows_(), members = readMembers_(), cur = current_(list), next = upcoming_(list), t = today_();
  return list.filter(function(c){ return c.status === 'open' || c.start <= t; }).map(function(c){
    return Object.assign(pubCh_(c), { role: c.id === cur.id ? 'current' : (next && c.id === next.id ? 'next' : (c.start > t ? 'later' : 'past')),
      day: dayIndexFor_(c), members: members.filter(function(m){ return !!progressOf_(m, c, rows); }).length }); })
    .sort(function(a, b){ return a.start < b.start ? 1 : -1; });
}
function apiCreateChallenge(token, o) {
  return withLock_(function(){
    const me = byToken_(token); if (!isLeader_(me)) throw new Error('Leader only.');
    o = o || {}; const plan = String(o.plan || ''); if (!PLAN_DEFS[plan]) throw new Error('Choose a reading plan.');
    const name = clean_(o.name, 60) || PLAN_DEFS[plan].name;
    const start = String(o.start || ''); if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) throw new Error('Choose a start date.');
    const list = challenges_(), cur = current_(list), t = today_();
    if (start <= t) throw new Error('Choose a start date from tomorrow onwards.');
    if (upcoming_(list)) throw new Error('A next challenge is already scheduled. Cancel it first to schedule a different one.');
    if (cur.end >= t && start <= cur.end) throw new Error('One challenge at a time: ' + cur.name + ' runs until ' + cur.end + '. Choose a start date after that.');
    const link = String(o.link || '').trim(); if (link && !/^https:\/\/chat\.whatsapp\.com\/\S+$/.test(link)) throw new Error('The WhatsApp link should start with https://chat.whatsapp.com/');
    const id = (plan.replace(/\d+/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 6)).toLowerCase();
    sheet_('Challenges', CCOLS).appendRow([id, name, plan, start, 'open', t, link]);
    log_(me.name, 'scheduled challenge', name + ' · ' + plan + ' · ' + start);
    return apiChallenges(token);
  });
}
function apiCancelChallenge(token, cid) {
  return withLock_(function(){
    const me = byToken_(token); if (!isLeader_(me)) throw new Error('Leader only.');
    const c = challenge_(cid); if (!c || c.id === MAIN_ID) throw new Error('Challenge not found.');
    if (c.start <= today_()) throw new Error('This challenge has already started.');
    sheet_('Challenges', CCOLS).getRange(c._row, CCOLS.indexOf('status') + 1).setValue('cancelled');
    log_(me.name, 'cancelled challenge', c.name);
    return apiChallenges(token);
  });
}
function apiSetPin(token, pin) {
  return withLock_(function(){ const me = byToken_(token); if (!/^\d{4}$/.test(String(pin))) throw new Error('Choose a 4-digit PIN.');
    setPin_(me, String(pin)); writeMember_(me); return true; });
}

function apiResetPin(token, id) {
  return withLock_(function(){
    const me = byToken_(token); if (!isLeader_(me)) throw new Error('Leader only.');
    const m = readMembers_().filter(function(x){ return x.id === String(id); })[0]; if (!m) throw new Error('Member not found.');
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    setPin_(m, pin); m.token = uuid_(); writeMember_(m); log_(me.name, 'reset PIN', m.name);
    return { pin: pin, name: m.name, phone: m.phone };
  });
}

// ---------- reflections wall ----------
const RCOLS = ['time','id','memberId','name','day','kind','text','pray','challenge'];
const KINDS = ['reflection','prayer','question','praise'];
function recentPosts_(meId, cid) {
  cid = cid || MAIN_ID;
  const v = sheet_('Reflections', RCOLS).getDataRange().getValues().slice(1)
    .filter(function(r){ return (String(r[8] || '') || MAIN_ID) === cid; });
  return v.slice(-40).reverse().map(function(r){
    const when = r[0] instanceof Date ? Utilities.formatDate(r[0], TZ, 'yyyy-MM-dd HH:mm') : String(r[0]);
    const pray = String(r[7]||'').split(',').filter(String);
    return { when: when, id: String(r[1]), by: String(r[2]), name: String(r[3]), day: Number(r[4])||0, kind: String(r[5]), text: String(r[6]),
             prayers: pray.length, iPray: !!meId && pray.indexOf(meId) >= 0 }; });
}
function reflSheet_() {
  const sh = sheet_('Reflections', RCOLS); const head = sh.getRange(1, 1, 1, RCOLS.length).getValues()[0];
  if (String(head[7]||'') !== 'pray' || String(head[8]||'') !== 'challenge') sh.getRange(1, 8, 1, 2).setValues([['pray', 'challenge']]);
  return sh;
}
function apiPray(token, id, cid) {
  return withLock_(function(){
    const me = byToken_(token); const sh = reflSheet_(); const v = sh.getDataRange().getValues();
    for (let i = 1; i < v.length; i++) if (String(v[i][1]) === id) {
      const list = String(v[i][7]||'').split(',').filter(String); const k = list.indexOf(me.id);
      if (k >= 0) list.splice(k, 1); else list.push(me.id);
      sh.getRange(i + 1, 8).setValue(list.join(',')); break;
    }
    return recentPosts_(me.id, cid);
  });
}
function apiPost(token, kind, text, day, cid) {
  return withLock_(function(){
    const me = byToken_(token); text = clean_(text, 500); if (!text) throw new Error('Write something first.');
    kind = KINDS.indexOf(kind) >= 0 ? kind : 'reflection';
    const c = challenge_(cid || MAIN_ID) || challenge_(MAIN_ID);
    const sh = reflSheet_(); const t = today_();
    const mineToday = sh.getDataRange().getValues().slice(1).filter(function(r){ return String(r[2]) === me.id && String(r[0]).slice(0,10) === t; }).length;
    if (mineToday >= 6) throw new Error('That\'s six posts today. Come back tomorrow.');
    sh.appendRow([Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm'), uuid_().slice(0,8), me.id, me.name, Number(day) || Math.min(Math.max(dayIndexFor_(c),1),c.n), kind, text, '', c.id]);
    if (kind === 'prayer' && !isLeader_(me)) notify_('New prayer request', String(me.name).split(' ')[0] + ' posted a prayer request in ' + c.name + '. Open the Circle in the app to read it and pray.\n\n(The request text is not included in this email, to keep it private.)');
    return recentPosts_(me.id, c.id);
  });
}
function apiDeletePost(token, id, cid) {
  return withLock_(function(){
    const me = byToken_(token); const sh = sheet_('Reflections', RCOLS); const v = sh.getDataRange().getValues();
    for (let i = 1; i < v.length; i++) if (String(v[i][1]) === id) {
      if (String(v[i][2]) !== me.id && !isLeader_(me)) throw new Error('You can only remove your own posts.');
      sh.deleteRow(i + 1); break;
    }
    return recentPosts_(me.id, cid);
  });
}

// ---------- study content (daily cards + book introductions) ----------
function readContent_(id, keyCol) {
  const v = SpreadsheetApp.openById(id).getSheets()[0].getDataRange().getValues();
  const head = v[0].map(function(h){ return String(h).trim().toLowerCase(); }); const out = {};
  for (let i = 1; i < v.length; i++) { const o = {};
    head.forEach(function(h, j){ if (h) o[h] = String(v[i][j] == null ? '' : v[i][j]).trim(); });
    const k = o[keyCol]; if (!k) continue; o.status = (o.status || '').toLowerCase(); out[k] = o; }
  return out;
}
function content_() {
  const cache = CacheService.getScriptCache(); const out = {};
  [['studies', STUDY_SHEET_ID, 'day'], ['books', BOOK_SHEET_ID, 'book']].forEach(function(c){
    const hit = cache.get('nc_' + c[0]);
    if (hit) { try { out[c[0]] = JSON.parse(hit); return; } catch (e) {} }
    try { out[c[0]] = readContent_(c[1], c[2]); cache.put('nc_' + c[0], JSON.stringify(out[c[0]]), 600); }
    catch (e) { out[c[0]] = {}; log_('system', 'content read failed', String(e)); }
  });
  return out;
}
function contentFor_(me, ch) {
  ch = ch || challenge_(MAIN_ID);
  const c = content_(), lead = isLeader_(me), t = Math.min(Math.max(dayIndexFor_(ch), 1), ch.n);
  if (ch.plan !== 'bible93') c.studies = {};
  const ok = function(r){ return r.status === 'approved' || lead; };
  const clean = function(r){ const o = {}; Object.keys(r).forEach(function(k){ if (lead || k !== 'reviewer_note') o[k] = r[k]; }); return o; };
  const studies = {}, books = {};
  Object.keys(c.studies).forEach(function(k){ const n = Number(k); if (n >= 1 && n <= t + 1 && ok(c.studies[k])) studies[n] = clean(c.studies[k]); });
  Object.keys(c.books).forEach(function(k){ if (ok(c.books[k])) books[k] = clean(c.books[k]); });
  const res = { studies: studies, books: books };
  if (lead) {
    const count = function(o){ const a = Object.keys(o).map(function(k){ return o[k]; }); return { approved: a.filter(function(r){ return r.status === 'approved'; }).length, total: a.length }; };
    res.review = { studies: count(c.studies), books: count(c.books),
      studyUrl: 'https://docs.google.com/spreadsheets/d/' + STUDY_SHEET_ID + '/edit', bookUrl: 'https://docs.google.com/spreadsheets/d/' + BOOK_SHEET_ID + '/edit' };
  }
  return res;
}
function apiApprove(token, kind, key, cid) {
  return withLock_(function(){
    const me = byToken_(token); if (!isLeader_(me)) throw new Error('Leader only.');
    const id = kind === 'book' ? BOOK_SHEET_ID : STUDY_SHEET_ID;
    const sh = SpreadsheetApp.openById(id).getSheets()[0]; const v = sh.getDataRange().getValues();
    const head = v[0].map(function(h){ return String(h).trim().toLowerCase(); }); const sc = head.indexOf('status');
    for (let i = 1; i < v.length; i++) if (String(v[i][0]).trim() === String(key)) { sh.getRange(i + 1, sc + 1).setValue('approved'); break; }
    CacheService.getScriptCache().removeAll(['nc_studies', 'nc_books']);
    return contentFor_(me, challenge_(cid || MAIN_ID));
  });
}

// ---------- calendar reminder (.ics) ----------
function ics_(hhmm, from, until) {
  hhmm = String(hhmm).replace(/\D/g, ''); if (!/^\d{4}$/.test(hhmm)) hhmm = '0600';
  from = /^\d{4}-\d{2}-\d{2}$/.test(String(from||'')) ? from : START;
  until = /^\d{4}-\d{2}-\d{2}$/.test(String(until||'')) ? until : '2026-12-24';
  const h = Math.min(23, Number(hhmm.slice(0, 2))), m = Math.min(59, Number(hhmm.slice(2)));
  const startDay = today_() > from ? today_() : from; const p = startDay.split('-').map(Number);
  const start = new Date(Date.UTC(p[0], p[1] - 1, p[2], h - 2, m)); // Johannesburg is UTC+2 all year
  const z = function(d){ return Utilities.formatDate(d, 'UTC', "yyyyMMdd'T'HHmmss'Z'"); };
  let url = ''; try { url = ScriptApp.getService().getUrl(); } catch (e) {}
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//New Creation//Reading circle//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'BEGIN:VEVENT','UID:new-creation-reading-' + hhmm + '-' + from + '@newcreation','DTSTAMP:' + z(new Date()),'DTSTART:' + z(start),'DURATION:PT20M',
    'RRULE:FREQ=DAILY;UNTIL=' + until.replace(/-/g, '') + 'T215959Z','SUMMARY:New Creation: today\'s reading',
    'DESCRIPTION:Open the app for today\'s chapters and study:\\n' + url, 'URL:' + url,
    'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Time for today\'s reading','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  return ContentService.createTextOutput(ics).setMimeType(ContentService.MimeType.ICAL).downloadAsFile('new-creation-reminder.ics');
}

// ---------- notifications to the leader ----------
function notify_(subject, body) {
  if (ENV_ === 'test') { sheet_('Outbox', ['time','subject','body']).appendRow([new Date(), subject, body]); return; }
  try { MailApp.sendEmail(leaderEmail_(), '[New Creation] ' + subject, body); } catch (e) { log_('system', 'email failed', String(e)); }
}
function dailyDigest() {
  const c = current_(challenges_()); const t = dayIndexFor_(c); if (t < 1 || t > c.n) return;
  const rows = progressRows_(), today = today_();
  const ppl = readMembers_().filter(function(m){ return !isLeader_(m); }).map(function(m){ const p = progressOf_(m, c, rows); return p ? { m: m, p: p, a: assess_(m, p, c) } : null; }).filter(Boolean);
  if (!ppl.length) return;
  const readToday = ppl.filter(function(r){ return r.p.lastReadDate === today; });
  const need = ppl.filter(function(r){ return r.a.s !== 'ok'; }).sort(function(x,y){ return y.a.behind - x.a.behind; });
  let body = c.name + ' · Day ' + t + ' of ' + c.n + '\n\n';
  body += readToday.length + ' of ' + ppl.length + ' read today: ' + (readToday.map(function(r){ return r.m.name; }).join(', ') || 'no one yet') + '\n\n';
  if (need.length) {
    body += 'Needs encouragement:\n';
    need.forEach(function(r){ body += '- ' + r.m.name + ': ' + r.a.label + ', ' + r.p.ch + ' chapters (' + Math.round(r.p.ch/c.total*100) + '%)' + (r.p.nudged ? ', last nudged ' + r.p.nudged : '') + '\n'; });
    body += '\nOpen the Leader tab in the app for ready-made catch-up messages.\n';
  } else body += 'Everyone is on track. Thank God for a faithful circle.\n';
  notify_('Evening summary · ' + c.name + ' · Day ' + t, body);
}

// =====================================================================
// v13: JSON API for the New Creation web app (PWA), privacy, admin tools
// The original page (doGet / Index.html) keeps working as a fallback.
// =====================================================================
function settingsOf_(m) { if (m.settings && typeof m.settings === 'object') return m.settings; try { return JSON.parse(m.settings || '{}') || {}; } catch (e) { return {}; } }
function uniqueCount_(bits, c) { const keys = plan_(c.plan).keys, seen = {}; let n = 0;
  for (let i = 0; i < bits.length && i < keys.length; i++) if (bits.charAt(i) === '1' && !seen[keys[i]]) { seen[keys[i]] = 1; n++; } return n; }

// Tick or untick specific chapters (by position in the plan). Safe to repeat: the same request twice has no extra effect.
function apiTick(token, cid, idxs, on) {
  return withLock_(function(){
    const me = byToken_(token); const c = challenge_(cid || current_(challenges_()).id); if (!c) throw new Error('Challenge not found.');
    const p = progressOf_(me, c); const t = today_();
    const arr = String(p.bits || '').split(''); while (arr.length < c.total) arr.push('0');
    (idxs || []).forEach(function(i){ i = Number(i); if (i >= 0 && i < c.total) arr[i] = on ? '1' : '0'; });
    const bits = arr.join('').replace(/0+$/, ''); const ch = uniqueCount_(bits, c);
    if (on && ch > p.ch && p.lastReadDate !== t) { p.streak = (p.lastReadDate && daysBetween_(p.lastReadDate, t) === 1) ? p.streak + 1 : 1; p.lastReadDate = t; }
    p.bits = bits; p.ch = ch; saveProgress_(me, c, p);
    return { bits: bits, ch: ch, streak: p.streak, lastReadDate: p.lastReadDate };
  });
}

// Circle posts, newest first, 20 at a time. `before` is the id of the last post already shown.
function postRow_(r, meId) {
  const when = r[0] instanceof Date ? Utilities.formatDate(r[0], TZ, 'yyyy-MM-dd HH:mm') : String(r[0]);
  const pray = String(r[7]||'').split(',').filter(String);
  return { when: when, id: String(r[1]), by: String(r[2]), name: String(r[3]), day: Number(r[4])||0, kind: String(r[5]), text: String(r[6]), prayers: pray.length, iPray: !!meId && pray.indexOf(meId) >= 0 };
}
function apiPosts(token, opts) {
  const me = byToken_(token); opts = opts || {};
  const cid = opts.cid || current_(challenges_()).id, kind = KINDS.indexOf(opts.kind) >= 0 ? opts.kind : '';
  let v = sheet_('Reflections', RCOLS).getDataRange().getValues().slice(1)
    .filter(function(r){ return (String(r[8] || '') || MAIN_ID) === cid && (!kind || String(r[5]) === kind); }).reverse();
  if (opts.before) { const k = v.map(function(r){ return String(r[1]); }).indexOf(String(opts.before)); if (k >= 0) v = v.slice(k + 1); }
  const lim = Math.min(Number(opts.limit) || 20, 50);
  return { posts: v.slice(0, lim).map(function(r){ return postRow_(r, me.id); }), more: v.length > lim };
}
// Post with a client-generated id so a repeated tap or a retry never creates a duplicate.
function apiPost2(token, o) {
  return withLock_(function(){
    const me = byToken_(token); o = o || {}; const text = clean_(o.text, 1000); if (!text) throw new Error('Write something first.');
    const kind = KINDS.indexOf(o.kind) >= 0 ? o.kind : 'reflection'; const c = current_(challenges_());
    const sh = reflSheet_(); const v = sh.getDataRange().getValues().slice(1); const t = today_();
    const cidKey = String(o.clientId || '').replace(/[^\w-]/g, '').slice(0, 12);
    const dup = cidKey && v.filter(function(r){ return String(r[1]) === cidKey; })[0];
    if (dup) return { post: postRow_(dup, me.id), duplicate: true };
    if (v.filter(function(r){ return String(r[2]) === me.id && String(r[0]).slice(0,10) === t; }).length >= 10) throw new Error('That\'s ten posts today. Come back tomorrow.');
    const id = cidKey || uuid_().slice(0, 8);
    const row = [Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm'), id, me.id, me.name, Number(o.day) || Math.min(Math.max(dayIndexFor_(c),1),c.n), kind, text, '', c.id];
    sh.appendRow(row);
    if (kind === 'prayer' && !isLeader_(me)) notify_('New prayer request', String(me.name).split(' ')[0] + ' posted a prayer request in ' + c.name + '. Open the Circle in the app to read it and pray.\n\n(The request text is not included in this email, to keep it private.)');
    return { post: postRow_(row, me.id) };
  });
}
function apiPray2(token, id) {
  return withLock_(function(){
    const me = byToken_(token); const sh = reflSheet_(); const v = sh.getDataRange().getValues();
    for (let i = 1; i < v.length; i++) if (String(v[i][1]) === String(id)) {
      const list = String(v[i][7]||'').split(',').filter(String); const k = list.indexOf(me.id);
      if (k >= 0) list.splice(k, 1); else list.push(me.id);
      sh.getRange(i + 1, 8).setValue(list.join(',')); v[i][7] = list.join(','); return postRow_(v[i], me.id);
    }
    throw new Error('That post was removed.');
  });
}
function apiDeletePost2(token, id) {
  return withLock_(function(){
    const me = byToken_(token); const sh = sheet_('Reflections', RCOLS); const v = sh.getDataRange().getValues();
    for (let i = 1; i < v.length; i++) if (String(v[i][1]) === String(id)) {
      if (String(v[i][2]) !== me.id && !isLeader_(me)) throw new Error('You can only remove your own posts.');
      sh.deleteRow(i + 1); if (String(v[i][2]) !== me.id) log_(me.name, 'moderated post', String(v[i][3]) + ' · ' + String(v[i][5]));
      return true;
    }
    return true;
  });
}

// Private items (bookmarks, highlights, notes, word studies): only ever returned to their owner.
const XCOLS = ['memberId','kind','key','data','updated'];
const XKINDS = ['bookmark','highlight','note','word','pos'];
function apiPrivate(token) {
  const me = byToken_(token);
  return sheet_('Private', XCOLS).getDataRange().getValues().slice(1).filter(function(r){ return String(r[0]) === me.id; })
    .map(function(r){ let d = null; try { d = JSON.parse(r[3]); } catch (e) {} return { kind: String(r[1]), key: String(r[2]), data: d, updated: String(r[4]) }; });
}
function apiPrivateSet(token, kind, key, data) {
  return withLock_(function(){
    const me = byToken_(token); if (XKINDS.indexOf(kind) < 0) throw new Error('Unknown item.');
    key = String(key || '').slice(0, 80); if (!key) throw new Error('Missing key.');
    const json = data == null ? '' : JSON.stringify(data); if (json.length > 4000) throw new Error('That note is too long.');
    const sh = sheet_('Private', XCOLS); const v = sh.getDataRange().getValues();
    for (let i = v.length - 1; i >= 1; i--) if (String(v[i][0]) === me.id && String(v[i][1]) === kind && String(v[i][2]) === key) {
      if (data == null) sh.deleteRow(i + 1); else sh.getRange(i + 1, 4, 1, 2).setValues([[json, new Date().toISOString()]]);
      return true;
    }
    if (data != null) sh.appendRow([me.id, kind, key, json, new Date().toISOString()]);
    return true;
  });
}

function apiSettings(token, patch) {
  return withLock_(function(){
    const me = byToken_(token); const st = settingsOf_(me); patch = patch || {};
    ['hideProgress','emailPrayer'].forEach(function(k){ if (k in patch) st[k] = !!patch[k]; });
    if ('name' in patch) { const n = clean_(patch.name, 40); if (n) me.name = n; }
    if ('email' in patch) { const e = String(patch.email || '').trim().toLowerCase().slice(0, 120);
      if (e && !/^[^\s@,;<>]+@[^\s@,;<>]+\.[a-z]{2,}$/.test(e)) throw new Error('That email address does not look right. Please check it.');
      if (e) { st.email = e; st.emailAt = new Date().toISOString(); delete st.emailAsk; } else { delete st.email; delete st.emailAt; st.emailAsk = 'no'; } }
    if ('emailAsk' in patch) { if (patch.emailAsk === 'no') st.emailAsk = 'no'; else delete st.emailAsk; }
    me.settings = st; writeMember_(me); return { settings: st, name: me.name };
  });
}
function apiSignOut(token) { return withLock_(function(){ try { const me = byToken_(token); me.token = uuid_(); writeMember_(me); } catch (e) {} return true; }); }

// A copy of everything the app holds about the signed-in member.
function apiExport(token) {
  const me = byToken_(token); const list = challenges_(), rows = progressRows_();
  return {
    exported: new Date().toISOString(),
    profile: { name: me.name, phone: me.phone, joined: me.joined, lastSeen: me.lastSeen, settings: me.settings },
    progress: list.map(function(c){ const p = progressOf_(me, c, rows); return p && (p.main || p._row) ? { challenge: c.name, plan: c.planName, start: c.start, chaptersRead: p.ch, streak: p.streak, bits: p.bits } : null; }).filter(Boolean),
    posts: sheet_('Reflections', RCOLS).getDataRange().getValues().slice(1).filter(function(r){ return String(r[2]) === me.id; }).map(function(r){ const o = postRow_(r, me.id); delete o.iPray; return o; }),
    encouragementsReceived: sheet_('Cheers',['time','fromId','fromName','toId','message']).getDataRange().getValues().slice(1).filter(function(r){ return String(r[3]) === me.id; }).map(function(r){ return { from: String(r[2]), message: String(r[4]), when: String(r[0]) }; }),
    private: apiPrivate(token)
  };
}
// Permanently removes the member's account, progress, posts, encouragements and private items. Requires their PIN.
function apiDeleteAccount(token, pin) {
  return withLock_(function(){
    const me = byToken_(token); if (!pinOk_(me, String(pin || ''))) throw new Error('That PIN is not correct.');
    if (isLeader_(me)) throw new Error('The leader account can\'t be deleted from the app. Hand over leadership first.');
    const del = function(name, cols, col){ const sh = sheet_(name, cols); const v = sh.getDataRange().getValues();
      for (let i = v.length - 1; i >= 1; i--) if (String(v[i][col]) === me.id) sh.deleteRow(i + 1); };
    del('Progress', PCOLS, 1); del('Private', XCOLS, 0); del('Reflections', RCOLS, 2);
    const ch = sheet_('Cheers',['time','fromId','fromName','toId','message']); const cv = ch.getDataRange().getValues();
    for (let i = cv.length - 1; i >= 1; i--) if (String(cv[i][1]) === me.id || String(cv[i][3]) === me.id) ch.deleteRow(i + 1);
    sheet_('Members', COLS).deleteRow(me._row); log_('system', 'account deleted', 'member ' + me.id);
    return true;
  });
}

// Edit a scheduled challenge before it starts.
function apiUpdateChallenge(token, cid, o) {
  return withLock_(function(){
    const me = byToken_(token); if (!isLeader_(me)) throw new Error('Leader only.');
    const list = challenges_(); const c = challenge_(cid, list); if (!c || c.id === MAIN_ID) throw new Error('Challenge not found.');
    const t = today_(); if (c.start <= t) throw new Error('This challenge has already started and can no longer be edited.');
    o = o || {}; const plan = o.plan && PLAN_DEFS[o.plan] ? o.plan : c.plan; const name = clean_(o.name, 60) || c.name;
    const start = /^\d{4}-\d{2}-\d{2}$/.test(String(o.start || '')) ? String(o.start) : c.start;
    if (start <= t) throw new Error('Choose a start date from tomorrow onwards.');
    const cur = current_(list); if (cur.id !== c.id && cur.end >= t && start <= cur.end) throw new Error('One challenge at a time: ' + cur.name + ' runs until ' + cur.end + '. Choose a start date after that.');
    const link = o.link === undefined ? c.link : String(o.link || '').trim();
    if (link && !/^https:\/\/chat\.whatsapp\.com\/\S+$/.test(link)) throw new Error('The WhatsApp link should start with https://chat.whatsapp.com/');
    sheet_('Challenges', CCOLS).getRange(c._row, 1, 1, CCOLS.length).setValues([[c.id, name, plan, start, c.status, c.created, link]]);
    log_(me.name, 'edited challenge', name + ' · ' + plan + ' · ' + start);
    return apiChallenges(token);
  });
}
// Preview the days of any plan from a given start date (for the leader's schedule preview).
function apiPlanPreview(token, plan, start) {
  const me = byToken_(token); if (!isLeader_(me)) throw new Error('Leader only.');
  const p = plan_(plan); return { name: p.name, n: p.n, total: p.total, end: addDays_(start, p.n - 1), sections: p.sections };
}

function apiFresh(token, on) {
  return withLock_(function(){ const me = byToken_(token); const c = current_(challenges_()); const p = progressOf_(me, c); p.fresh = on ? today_() : ''; saveProgress_(me, c, p); return { fresh: p.fresh }; });
}
function apiInviter(by) { try { const m = readMembers_().filter(function(x){ return x.id === String(by); })[0]; return m ? String(m.name).split(' ')[0] : ''; } catch (e) { return ''; } }

// ---------- the API entry point used by the web app ----------
function apiMap_() { return {
  ping: apiPing, join: apiJoin, login: apiLogin, inviter: apiInviter,
  // One round trip instead of two: sign in (or join) and return the app state together.
  loginState: function(phone, pin){ const r = apiLogin(phone, pin); return { token: r.token, state: apiState(r.token, { lite: true }) }; },
  joinState: function(name, phone, pin){ const r = apiJoin(name, phone, pin); return { token: r.token, state: apiState(r.token, { lite: true }) }; },
  state: apiState, tick: apiTick, save: apiSave, fresh: apiFresh,
  posts: apiPosts, post: apiPost2, pray: apiPray2, deletePost: apiDeletePost2, cheer: apiCheer,
  private: apiPrivate, privateSet: apiPrivateSet, settings: apiSettings, setPin: apiSetPin, signOut: apiSignOut,
  exportMe: apiExport, deleteAccount: apiDeleteAccount,
  leader: apiLeader, mail: apiMail, markNudged: apiMarkNudged, remove: apiRemove, resetPin: apiResetPin, approve: apiApprove,
  challenges: apiChallenges, createChallenge: apiCreateChallenge, updateChallenge: apiUpdateChallenge, cancelChallenge: apiCancelChallenge, planPreview: apiPlanPreview,
  testSetDate: apiTestSetDate
}; }
function doPost(e) {
  let out;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    ENV_ = req.env === 'test' ? 'test' : 'prod'; SS_ = null; SH_ = {};
    const fn = apiMap_()[req.fn]; if (!fn) throw new Error('Unknown request.');
    out = { ok: true, data: fn.apply(null, Array.isArray(req.args) ? req.args : []) };
  } catch (err) {
    out = { ok: false, error: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

// Test environment clock (test spreadsheet only; needs the TEST_ADMIN_KEY from Script Properties).
function apiTestSetDate(key, date) {
  if (ENV_ !== 'test') throw new Error('Only available in the test environment.');
  if (!key || key !== PropertiesService.getScriptProperties().getProperty('TEST_ADMIN_KEY')) throw new Error('Not allowed.');
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Use YYYY-MM-DD.');
  if (date) setProp_('TODAY', date); else PropertiesService.getScriptProperties().deleteProperty('TEST_TODAY');
  return today_();
}

// ---------- admin tools: run these from the Apps Script editor ----------
// 1. Make a dated copy of the data spreadsheet (run before every upgrade).
function backupData() {
  const ss = getSS_(); const copy = ss.copy('New Creation backup ' + Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HHmm'));
  Logger.log('Backup created: ' + copy.getUrl()); return copy.getUrl();
}
// 2. Bring sheet headers up to date. Safe to run more than once; never changes member data.
function migrate() {
  const mem = sheet_('Members', COLS); mem.getRange(1, 1, 1, COLS.length).setValues([COLS]);
  mem.getRange(1, 1, mem.getMaxRows(), COLS.length).setNumberFormat('@');
  reflSheet_(); sheet_('Progress', PCOLS); sheet_('Private', XCOLS); challenges_();
  Logger.log('Migration complete. Members: ' + readMembers_().length);
}
// 3. Set the leader securely by WhatsApp number (the member must have joined already).
function setLeaderByPhone(phone) {
  const m = readMembers_().filter(function(x){ return normPhone_(x.phone) === normPhone_(phone); })[0];
  if (!m) throw new Error('No member with that number.');
  setProp_('LEADER_ID', m.id); Logger.log('Leader is now ' + m.name);
}
// 4. Create the separate test environment with clearly labelled sample members.
function setupTest() {
  ENV_ = 'test'; const p = PropertiesService.getScriptProperties();
  let ss = null; const tid = p.getProperty('TEST_SHEET_ID'); if (tid) { try { ss = SpreadsheetApp.openById(tid); } catch (e) {} }
  if (!ss) { ss = SpreadsheetApp.create('New Creation — TEST data (sample members only)'); p.setProperty('TEST_SHEET_ID', ss.getId()); }
  SS_ = ss; SH_ = {};
  sheet_('Members', COLS); sheet_('Cheers', ['time','fromId','fromName','toId','message']); reflSheet_(); sheet_('Progress', PCOLS); sheet_('Private', XCOLS); sheet_('Log', ['time','name','event','detail']); sheet_('Outbox', ['time','subject','body']); challenges_();
  if (!p.getProperty('TEST_ADMIN_KEY')) p.setProperty('TEST_ADMIN_KEY', Utilities.getUuid());
  let lead = readMembers_().filter(function(m){ return m.name === 'Test Leader'; })[0];
  if (!lead) { apiJoin('Test Leader', '0700000001', '1357'); lead = readMembers_().filter(function(m){ return m.name === 'Test Leader'; })[0]; }
  p.setProperty('TEST_LEADER_ID', lead.id);
  Logger.log('Test sheet: ' + ss.getUrl() + '\nTest leader: 070 000 0001 / PIN 1357\nTEST_ADMIN_KEY is in Script Properties.');
}
