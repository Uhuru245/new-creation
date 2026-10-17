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
const XKINDS = ['bookmark','highlight','note','word','pos','lang'];
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
    private: apiPrivate(token),
    wordsLearned: learnedRows_(me.id),
    teacherConversations: sheet_('TutorChats', TC_COLS).getDataRange().getValues().slice(1).filter(function(r){ return String(r[0]) === me.id; }).map(function(r){ return { conversation: String(r[1]), when: String(r[2]), role: String(r[3]), message: String(r[4]), day: String(r[5]), word: String(r[6]) }; })
  };
}
// Permanently removes the member's account, progress, posts, encouragements and private items. Requires their PIN.
function apiDeleteAccount(token, pin) {
  return withLock_(function(){
    const me = byToken_(token); if (!pinOk_(me, String(pin || ''))) throw new Error('That PIN is not correct.');
    if (isLeader_(me)) throw new Error('The leader account can\'t be deleted from the app. Hand over leadership first.');
    const del = function(name, cols, col){ const sh = sheet_(name, cols); const v = sh.getDataRange().getValues();
      for (let i = v.length - 1; i >= 1; i--) if (String(v[i][col]) === me.id) sh.deleteRow(i + 1); };
    del('Progress', PCOLS, 1); del('Private', XCOLS, 0); del('Reflections', RCOLS, 2); del('WordProgress', WP_COLS, 0); del('TutorChats', TC_COLS, 0);
    PropertiesService.getScriptProperties().deleteProperty((ENV_ === 'test' ? 'TEST_' : '') + 'TUTOR_' + me.id);
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
  ping: apiPing, join: apiJoin, login: apiLogin, inviter: apiInviter, track: apiTrack,
  // One round trip instead of two: sign in (or join) and return the app state together.
  loginState: function(phone, pin){ const r = apiLogin(phone, pin); return { token: r.token, state: apiState(r.token, { lite: true }) }; },
  joinState: function(name, phone, pin){ const r = apiJoin(name, phone, pin); return { token: r.token, state: apiState(r.token, { lite: true }) }; },
  state: apiState, tick: apiTick, save: apiSave, fresh: apiFresh,
  posts: apiPosts, post: apiPost2, pray: apiPray2, deletePost: apiDeletePost2, cheer: apiCheer,
  private: apiPrivate, privateSet: apiPrivateSet, settings: apiSettings, setPin: apiSetPin, signOut: apiSignOut,
  exportMe: apiExport, deleteAccount: apiDeleteAccount,
  leader: apiLeader, mail: apiMail, markNudged: apiMarkNudged, remove: apiRemove, resetPin: apiResetPin, approve: apiApprove,
  challenges: apiChallenges, createChallenge: apiCreateChallenge, updateChallenge: apiUpdateChallenge, cancelChallenge: apiCancelChallenge, planPreview: apiPlanPreview,
  words: apiWords, wordLearn: apiWordLearn, wordApprove: apiWordApprove, teacher: apiTeacher,
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

// ===================== www.mret.co.za site activity (anonymous visit counts for the owner) =====================
// The home page sends small anonymous events here (a page view, which space was chosen, how). No names, numbers,
// emails or IP addresses are received or stored. Rows go to a separate spreadsheet that only the owner can open.
const SITE_SHEET_ID = '1F0YEDvU49tnMtBoVcdbBox54tnlyNCeRhULcWJezr7M';
const SITE_EVENTS = ['view', 'choose', 'open', 'swipe', 'list', 'soon'];
const SITE_SPACES = ['', 'new-creation', 'smart-agent', 'support', 'coaching'];
const SITE_HOW = ['', 'drag', 'tap', 'button', 'list', 'arrow', 'swipe'];
const SITE_DEVICES = ['phone', 'tablet', 'desktop', 'other'];
function siteBook_() {
  const ss = SpreadsheetApp.openById(SITE_SHEET_ID), tab = ENV_ === 'test' ? 'Test events' : 'Events';
  let sh = ss.getSheetByName(tab);
  if (!sh) {
    sh = ss.insertSheet(tab); sh.appendRow(['Time (SAST)', 'Date', 'Visitor', 'Visit', 'Event', 'Space', 'How', 'Device', 'Came from', 'Screen']);
    sh.setFrozenRows(1); sh.getRange('A1:J1').setFontWeight('bold'); sh.getRange('B:B').setNumberFormat('yyyy-mm-dd');
    if (tab === 'Events') siteSummary_(ss);
    const s1 = ss.getSheetByName('Sheet1'); if (s1 && s1.getLastRow() === 0) ss.deleteSheet(s1);
  }
  return sh;
}
function siteSummary_(ss) {
  const sh = ss.getSheetByName('Dashboard') || ss.insertSheet('Dashboard', 0); sh.clear();
  const rows = [
    ['www.mret.co.za: who is using the home page', ''],
    ['Anonymous counts only. Updates by itself as people visit.', ''],
    ['', ''],
    ['Visits today', '=COUNTIFS(Events!E:E,"view",Events!B:B,TODAY())'],
    ['Visits in the last 7 days', '=COUNTIFS(Events!E:E,"view",Events!B:B,">="&(TODAY()-6))'],
    ['Visits in the last 30 days', '=COUNTIFS(Events!E:E,"view",Events!B:B,">="&(TODAY()-29))'],
    ['Different visitors (last 7 days)', '=IFERROR(COUNTUNIQUE(FILTER(Events!C2:C,Events!E2:E="view",Events!B2:B>=TODAY()-6)),0)'],
    ['Spaces opened (last 30 days)', '=COUNTIFS(Events!E:E,"open",Events!B:B,">="&(TODAY()-29))'],
    ['', ''],
    ['Which spaces people open (last 30 days)', ''],
    ['=IFERROR(QUERY(Events!A:J,"select F, count(E) where E = \'open\' and B >= date \'"&TEXT(TODAY()-29,"yyyy-mm-dd")&"\' group by F order by count(E) desc label F \'Space\', count(E) \'Opens\'",1),"No opens yet")', ''],
  ];
  sh.getRange(1, 1, rows.length, 2).setValues(rows);
  sh.getRange('D1').setValue('Visits per day (last 30 days)');
  sh.getRange('D2').setFormula('=IFERROR(QUERY(Events!A:J,"select B, count(E) where E = \'view\' and B >= date \'"&TEXT(TODAY()-29,"yyyy-mm-dd")&"\' group by B order by B label B \'Day\', count(E) \'Visits\'",1),"No visits yet")');
  sh.getRange('G1').setValue('How people open a space');
  sh.getRange('G2').setFormula('=IFERROR(QUERY(Events!A:J,"select G, count(E) where E = \'open\' group by G order by count(E) desc label G \'How\', count(E) \'Times\'",1),"No opens yet")');
  sh.getRange('G10').setValue('Devices (visits)');
  sh.getRange('G11').setFormula('=IFERROR(QUERY(Events!A:J,"select H, count(E) where E = \'view\' group by H order by count(E) desc label H \'Device\', count(E) \'Visits\'",1),"No visits yet")');
  sh.getRange('G18').setValue('Where visitors came from');
  sh.getRange('G19').setFormula('=IFERROR(QUERY(Events!A:J,"select I, count(E) where E = \'view\' group by I order by count(E) desc limit 10 label I \'Came from\', count(E) \'Visits\'",1),"No visits yet")');
  sh.getRange('A20').setValue('Latest activity');
  sh.getRange('A21').setFormula('=IFERROR(QUERY(Events!A:J,"select A, E, F, G, H where A is not null order by A desc limit 40 label A \'When\', E \'What\', F \'Space\', G \'How\', H \'Device\'",1),"")');
  sh.getRange('A1').setFontSize(16).setFontWeight('bold'); sh.getRange('A2').setFontColor('#666666');
  ['A10', 'D1', 'G1', 'G10', 'G18', 'A20'].forEach(function (a) { sh.getRange(a).setFontWeight('bold'); });
  sh.getRange('A4:A8').setFontWeight('bold'); sh.getRange('B4:B8').setFontSize(14);
  sh.setColumnWidth(1, 260); sh.setColumnWidth(2, 110); sh.setColumnWidth(4, 120); sh.setColumnWidth(5, 80); sh.setColumnWidth(7, 140);
  const chart = sh.newChart().asColumnChart().addRange(sh.getRange('D2:E32')).setPosition(4, 4, 0, 0).setOption('title', 'Visits per day').setOption('legend', { position: 'none' }).setOption('colors', ['#C9A04A']).build();
  sh.insertChart(chart);
}
function apiTrack(ev) {
  ev = ev || {};
  const pick = function (v, list) { v = String(v == null ? '' : v); return list.indexOf(v) >= 0 ? v : null; };
  const event = pick(ev.e, SITE_EVENTS); if (!event) throw new Error('Unknown event.');
  const visitor = String(ev.v || '').replace(/[^a-z0-9]/gi, '').slice(0, 16), visit = String(ev.s || '').replace(/[^a-z0-9]/gi, '').slice(0, 16);
  if (!visitor) throw new Error('Missing visitor.');
  // Simple abuse guard: at most 40 events a minute from one browser.
  const cache = CacheService.getScriptCache(), ck = 'trk:' + ENV_ + ':' + visitor, n = Number(cache.get(ck) || 0);
  if (n >= 40) return { ok: true, limited: true }; cache.put(ck, String(n + 1), 60);
  const space = pick(ev.sp, SITE_SPACES) || '', how = pick(ev.h, SITE_HOW) || '', device = pick(ev.d, SITE_DEVICES) || 'other';
  let from = String(ev.r || '').toLowerCase().replace(/[^a-z0-9.\-]/g, '').slice(0, 60) || 'direct';
  const screen = String(ev.w || '').replace(/[^0-9x]/g, '').slice(0, 11);
  const now = new Date(), tz = 'Africa/Johannesburg';
  const row = [Utilities.formatDate(now, tz, 'yyyy-MM-dd HH:mm:ss'), Utilities.formatDate(now, tz, 'yyyy-MM-dd'), visitor, visit, event, space, how, device, from, screen];
  withLock_(function () { siteBook_().appendRow(row); });
  return { ok: true };
}


// ===================== The Word Behind the Word: daily word study, alphabet practice and the teacher =====================
// Word studies live in the "WordStudies" tab. Only rows with Status "Approved" are shown to members (you see drafts too).
// The teacher calls the Claude API from here, never from the browser. The key is kept in Script Properties as CLAUDE_API_KEY.
const WS_COLS = ['Day','Testament','Language','Word','Transliteration','EnglishTranslations','Meaning','VerseRef','StrongsNumber','Status'];
const WP_COLS = ['MemberID','Day','Word','Learned','DateLearned'];
const TC_COLS = ['MemberID','ConversationID','Timestamp','Role','Message','Day','Word'];
const LOGS_COLS = ['Time','Where','Member','Detail'];
const TEACHER_DAILY_LIMIT = 30;   // teacher messages per member per day
const TEACHER_MAX_TOKENS = 700;
const TEACHER_HISTORY = 10;       // earlier messages sent with each question
const TEACHER_DEFAULT_MODEL = 'claude-sonnet-5-5';
const TEACHER_DOWN = 'The teacher is unavailable right now. Please try again in a few minutes.';
const TEACHER_PROMPT = "You are the teacher inside New Creation, a guided Bible reading journey. You help people understand the Bible by explaining the original Hebrew and Greek words behind English translations.\n\nHow you teach:\n- Speak like a patient, warm teacher sitting beside the person, not like a lecturer or a textbook.\n- Explain simply first, then go deeper only if the person wants more.\n- Use everyday examples and comparisons to make ideas clear.\n- Teach in small steps. Keep replies short enough to read on a phone, usually under 180 words.\n- When it helps, end with one question that checks understanding or invites reflection. Ask only one question at a time.\n- If the person seems confused, explain it a different way rather than repeating yourself.\n- When asked to quiz, ask one question at a time, wait for the answer, then explain why it is right or wrong.\n- Encourage the person, but correct mistakes honestly and kindly.\n\nHow you handle the original languages:\n- Always show a word in its original script, then the transliteration, then the meaning. Example: חֶסֶד (chesed), meaning loyal, covenant love.\n- Base meanings on standard scholarly lexicons. Do not invent etymologies or repeat popular myths.\n- When scholars disagree, say so plainly and briefly explain the main views.\n- Show how different English translations handle a word when that helps understanding.\n- Say \"I'm not certain\" when you are not, and suggest checking an interlinear such as Bible Hub or STEP Bible.\n\nHow you handle faith and doctrine:\n- Treat Scripture with reverence and the person's faith with respect.\n- On questions where Christian traditions genuinely differ, explain the main positions fairly rather than taking a side.\n- Point people back to the text itself and encourage them to discuss what they learn with their reading group.\n- If someone shares something personal or painful, respond with care, and encourage them to speak with a trusted person or pastor where appropriate.\n\nStyle rules:\n- No emojis.\n- Plain language; explain any technical term the first time you use it.\n- Never describe the app's creator as the members' leader. If asked, refer to \"the New Creation team\".\n- Stay focused on Bible understanding. If asked about unrelated topics, gently bring the conversation back.\n\nToday's context: Day {day}, reading {passage}, featured word {word} ({language}).";
const WORD_SEED = [
  [1, "Old", "Hebrew", "בְּרֵאשִׁית", "bereshit", "In the beginning (BSB, KJV, WEB)", "Made of be- (\"in\") and reshit (\"beginning, first part\"), a word related to rosh, \"head\". It marks the starting point of everything God made, and it became the Hebrew name of the book of Genesis, taken from its first word. Scholars discuss whether to read the verse as \"In the beginning God created\" or \"When God began to create\"; most English Bibles keep the first.", "Genesis 1:1", "H7225", "Draft"],
  [5, "Old", "Hebrew", "יְהוָה", "YHWH (usually said \"Yahweh\")", "the LORD (BSB, KJV); Yahweh (WEB)", "God's personal name, revealed to Moses at the burning bush and linked in Exodus 3:14 to the verb \"to be\" (\"I AM WHO I AM\"). Out of reverence, Jewish readers stopped saying it aloud and read Adonai (\"Lord\") instead, which is why many English Bibles print it as \"the LORD\" in small capitals. The original pronunciation is not certain; \"Yahweh\" is the most widely accepted scholarly suggestion.", "Exodus 3:15", "H3068", "Draft"],
  [7, "Old", "Hebrew", "חֶסֶד", "chesed", "loving devotion (BSB), goodness (KJV), loving kindness (WEB); elsewhere also mercy, steadfast love, faithful love", "Loyal, committed love that keeps its promises, especially within a covenant relationship. It joins kindness and faithfulness: not a passing feeling, but love that keeps showing up. Because no single English word carries all of this, translations vary widely.", "Exodus 34:6", "H2617", "Draft"],
  [9, "Old", "Hebrew", "קָדוֹשׁ", "qadosh", "holy (BSB, KJV, WEB)", "Set apart: belonging to God and different from the ordinary. God is holy in His perfect purity and greatness, and people, places and things become holy when they are set apart for Him. The exact root meaning of the word is debated, so it is best understood from how the Bible uses it.", "Leviticus 19:2", "H6918", "Draft"],
  [10, "Old", "Hebrew", "שָׁלוֹם", "shalom", "peace (BSB, KJV, WEB); elsewhere also welfare, well-being, safety", "More than the absence of conflict: wholeness, well-being and everything being as it should be, for a person, a family or a nation. It is also an everyday greeting that asks after someone's welfare. In the priestly blessing it is the last gift God gives His people.", "Numbers 6:26", "H7965", "Draft"],
  [13, "Old", "Hebrew", "שְׁמַע", "shema", "Hear (BSB, KJV, WEB); elsewhere also listen, obey", "The command form of shama, \"to hear\". In Hebrew, hearing often includes paying attention and responding, so the same verb can be translated \"obey\". This verse begins the Shema, the confession of faith Jewish people recite every day, and Jesus quoted it as the first and greatest commandment (Mark 12:29).", "Deuteronomy 6:4", "H8085", "Draft"],
  [35, "Old", "Hebrew", "אָמֵן", "amen", "Amen (BSB, KJV, WEB); elsewhere also \"truly\", \"so be it\"", "From a root meaning firm, reliable or true, the same family of words as faithfulness and believing. Saying \"Amen\" means \"It is true, let it be so\", agreeing with what has been said to God or about Him. Jesus used it in a new way at the start of His sayings: \"Truly I tell you\".", "Nehemiah 8:6", "H543", "Draft"],
  [39, "Old", "Hebrew", "תּוֹרָה", "torah", "the Law, His law (BSB); law (KJV, WEB); elsewhere also instruction, teaching", "Usually translated \"law\", but its basic meaning is instruction or teaching, the kind a parent gives a child (Proverbs 1:8). It can mean God's commands, the five books of Moses, or God's teaching more broadly. Psalm 1 pictures it not as a burden but as something to delight in and think about day and night.", "Psalm 1:2", "H8451", "Draft"],
  [42, "Old", "Hebrew", "אֱלֹהִים", "elohim", "God (BSB, KJV, WEB); elsewhere also gods, and sometimes judges or rulers", "The most common Hebrew word for God, used more than 2,500 times. Its form is plural, but when it refers to the God of Israel it takes singular verbs; many scholars explain this as a plural of majesty, expressing fullness and greatness rather than many gods. The same word can mean \"gods\" when it speaks of the nations' idols, so context decides.", "Psalm 46:1", "H430", "Draft"],
  [45, "Old", "Hebrew", "נֶפֶשׁ", "nefesh", "soul (BSB, KJV, WEB); elsewhere also life, self, living being", "Often translated \"soul\", but it usually means the whole living person, not a separate inner part. It can also mean life, self, breath or appetite; in Genesis 2:7 the man became \"a living nefesh\", a living being. \"Bless the LORD, O my soul\" means \"with all that I am, bless the LORD\".", "Psalm 103:1", "H5315", "Draft"],
  [51, "Old", "Hebrew", "כָּבוֹד", "kavod", "glory (BSB, KJV, WEB); elsewhere also honour, splendour, wealth", "From a root meaning heavy or weighty. Something with kavod carries weight: importance, honour, splendour, and sometimes riches. God's glory is the visible weight of His presence and greatness, and Isaiah hears that it fills the whole earth.", "Isaiah 6:3", "H3519", "Draft"],
  [59, "Old", "Hebrew", "בְּרִית", "berit", "covenant (BSB, KJV, WEB)", "A binding agreement that creates a committed relationship, with promises and obligations, often confirmed by an oath or a sacrifice. God's covenants with Noah, Abraham, Israel and David shape the whole Old Testament story. Jeremiah promises a new covenant, which Jesus speaks of at the Last Supper (Luke 22:20).", "Jeremiah 31:31", "H1285", "Draft"],
  [64, "Old", "Hebrew", "רוּחַ", "ruach", "Spirit (BSB, WEB), spirit (KJV); elsewhere also wind, breath", "Can mean wind, breath or spirit, and Ezekiel 37 uses it in all three senses. What connects them is invisible, moving, life-giving power. Used of God, it describes the Spirit of God who gives life, as in the valley of dry bones.", "Ezekiel 37:14", "H7307", "Draft"],
  [71, "New", "Greek", "σῴζω", "sōzō", "save (BSB, KJV, WEB); elsewhere also heal, make well, rescue", "To rescue, or keep safe from danger. In the Gospels it is used both for healing (\"your faith has made you well\", Mark 5:34) and for rescue from sin and death. Here the angel ties it to the name Jesus (Yeshua), which means \"the LORD saves\".", "Matthew 1:21", "G4982", "Draft"],
  [72, "New", "Greek", "ἐκκλησία", "ekklēsia", "church (BSB, KJV); assembly (WEB)", "In everyday Greek it meant an assembly: citizens gathered together. The Greek Old Testament used it for the assembly of Israel gathered before God, and Jesus uses it for the community He will build: people, not a building. It is often explained as \"called-out ones\" from its parts (ek, \"out\" + kaleo, \"call\"), but in real use it simply meant \"assembly\".", "Matthew 16:18", "G1577", "Draft"],
  [76, "New", "Greek", "μετάνοια", "metanoia", "repent (BSB); repentance (KJV, WEB)", "A change of mind that leads to a change of direction. In the Bible it is more than feeling sorry: it means turning from sin back to God, like the Old Testament call to \"turn\" or \"return\". In Luke 15, one person's repentance brings joy in heaven, like a lost sheep that is found.", "Luke 15:7", "G3341", "Draft"],
  [77, "New", "Greek", "λόγος", "logos", "Word (BSB, KJV, WEB); elsewhere also message, saying, account", "Usually \"word\", \"message\" or \"statement\". John uses it as a title for Jesus: God's Word, who was with God and was God. Readers who knew the Old Testament would think of God creating by His word in Genesis 1, while Greek thinkers used logos for the reason that orders the world; scholars discuss how much each background shaped John's meaning.", "John 1:1", "G3056", "Draft"],
  [78, "New", "Greek", "φιλέω", "phileō", "love (BSB, KJV); have great affection for (WEB)", "To love as a friend, with warm affection; it is related to philos, \"friend\", and can also mean to kiss. Here it describes Jesus' love for Lazarus, and two verses later John uses agapao for the same family. Scholars disagree on how different the two verbs are in John: many think they overlap almost completely, while others see a real difference, especially in John 21.", "John 11:3", "G5368", "Draft"],
  [79, "New", "Greek", "τετέλεσται", "tetelestai", "It is finished (BSB, KJV, WEB)", "A form of teleo, \"to finish, complete, carry out\". Its tense describes something completed with lasting results: Jesus' work was done and stays done. Some say tetelestai was written on receipts to mean \"paid in full\"; the evidence for that is thin, so treat it as an illustration rather than the meaning of the word here.", "John 19:30", "G5055", "Draft"],
  [80, "New", "Greek", "πνεῦμα", "pneuma", "Holy Spirit, Spirit (BSB, WEB); Holy Ghost, Spirit (KJV); elsewhere also wind, breath", "Like the Hebrew ruach, it can mean wind, breath or spirit (Jesus plays on this in John 3:8). In Acts 2 it refers to the Holy Spirit, poured out at Pentecost as the prophets promised. The KJV often says \"Holy Ghost\", which meant the same as \"Holy Spirit\" in older English.", "Acts 2:4", "G4151", "Draft"],
  [83, "New", "Greek", "εὐαγγέλιον", "euangelion", "gospel (BSB, KJV); Good News (WEB)", "Literally \"good news\" (eu, \"good\" + angelia, \"message\"). In the Roman world it could announce a victory or the birth or rule of an emperor; Christians used it for the news about Jesus. The English word \"gospel\" comes from Old English godspel, \"good news\".", "Romans 1:16", "G2098", "Draft"],
  [84, "New", "Greek", "κύριος", "kyrios", "Lord (BSB, WEB); \"the Lord Jesus\" (KJV)", "Can mean \"sir\", \"master\" or \"owner\", depending on who is speaking. The Greek Old Testament used kyrios in place of God's name, YHWH, so confessing \"Jesus is Lord\" was a bold claim. Notice the KJV reads \"the Lord Jesus\" here while the BSB and WEB read \"Jesus is Lord\": the Greek allows both, and translators decide from context.", "Romans 10:9", "G2962", "Draft"],
  [85, "New", "Greek", "ἀγάπη", "agapē", "love (BSB, WEB); charity (KJV)", "The main New Testament word for love, especially God's love and the love believers show one another, defined here by how it acts: patient, kind and not self-seeking. The KJV's \"charity\" comes from the Latin caritas, meaning love, not giving money. Agape is often called a uniquely divine love, but the word itself is ordinary Greek; its depth comes from how the Bible uses it.", "1 Corinthians 13:4", "G26", "Draft"],
  [86, "New", "Greek", "καινός", "kainos", "new (BSB, KJV, WEB)", "New, often in the sense of fresh or a new kind, not only recent. Paul uses it for the \"new creation\" that begins when someone is in Christ, the idea behind the name of this reading journey. Some teachers sharply contrast kainos (\"new in kind\") with neos (\"new in time\"); the difference is real in some places, but the two words often overlap.", "2 Corinthians 5:17", "G2537", "Draft"],
  [87, "New", "Greek", "χάρις", "charis", "grace (BSB, KJV, WEB); elsewhere also favour, kindness, thanks", "Undeserved favour and kindness, freely given. In everyday Greek it could mean a favour or gift and also the gratitude it creates; it is the word for \"thanks\" too. Paul uses it for God's free gift of salvation, received through faith and not earned.", "Ephesians 2:8", "G5485", "Draft"],
  [89, "New", "Greek", "πίστις", "pistis", "faith (BSB, KJV, WEB); elsewhere also faithfulness, trust, belief", "Trust, confidence and reliance on someone, and it can also mean faithfulness or loyalty. Biblical faith is not wishful thinking but trusting God because of who He is. Hebrews 11 describes it, then shows it in action through people who trusted God's promises.", "Hebrews 11:1", "G4102", "Draft"],
  [90, "New", "Greek", "παράκλητος", "paraklētos", "advocate (BSB, KJV); Counselor (WEB); in John 14 also Helper, Comforter", "Literally \"one called alongside\": someone who stands with you, especially to speak on your behalf. Jesus uses it for the Holy Spirit (John 14:16), and here John uses it for Jesus Himself, who speaks for us before the Father. Translations vary (Advocate, Helper, Comforter, Counselor) because no single English word covers it.", "1 John 2:1", "G3875", "Draft"]
];

function wbLog_(where, memberId, detail) {
  try { sheet_('Logs', LOGS_COLS).appendRow([Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'), where, memberId || '', String(detail || '').slice(0, 1500)]); } catch (e) {}
}
// Text written to the sheet: a leading = + - @ would be read as a formula, so it is stored as plain text.
function sheetText_(s) { s = String(s == null ? '' : s); return /^[=+\-@]/.test(s) ? "'" + s : s; }
function wordStudies_() {
  const cache = CacheService.getScriptCache(), ck = 'nc_words_' + ENV_; const hit = cache.get(ck);
  if (hit) { try { return JSON.parse(hit); } catch (e) {} }
  const v = sheet_('WordStudies', WS_COLS).getDataRange().getValues(); const out = [];
  for (let i = 1; i < v.length; i++) {
    const o = {}; WS_COLS.forEach(function(k, j){ const x = v[i][j]; o[k] = String(x == null ? '' : x).trim(); });
    o.Day = Math.round(Number(o.Day)) || 0; if (!o.Day || !o.Word) continue;
    o.Status = /^approved$/i.test(o.Status) ? 'Approved' : 'Draft'; out.push(o);
  }
  out.sort(function(a, b){ return a.Day - b.Day; });
  try { cache.put(ck, JSON.stringify(out), 300); } catch (e) {}
  return out;
}
function pubWord_(w, lead) {
  const o = { day: w.Day, testament: w.Testament, language: w.Language, lang: /greek/i.test(w.Language) ? 'grc' : 'he', word: w.Word, translit: w.Transliteration,
    english: w.EnglishTranslations, meaning: w.Meaning, ref: w.VerseRef, strongs: w.StrongsNumber };
  if (lead) o.status = w.Status;
  return o;
}
function dayLang_(day) { const p = plan_('bible93'); const d = p.days[Math.min(Math.max(day, 1), p.n) - 1]; return d && d[0][0] >= 39 ? 'Greek' : 'Hebrew'; }
// One small record per member: today's teacher messages and how many conversations they have started.
function tutorUse_(memberId) {
  let u = {}; try { u = JSON.parse(prop_('TUTOR_' + memberId) || '{}') || {}; } catch (e) {}
  if (u.d !== today_()) { u.d = today_(); u.n = 0; }
  u.n = Number(u.n) || 0; u.c = Number(u.c) || 0; return u;
}
function saveTutorUse_(memberId, u) { setProp_('TUTOR_' + memberId, JSON.stringify(u)); }
function learnedRows_(memberId) {
  return sheet_('WordProgress', WP_COLS).getDataRange().getValues().slice(1)
    .filter(function(r){ return String(r[0]) === memberId && (r[3] === true || String(r[3]).toUpperCase() === 'TRUE'); })
    .map(function(r){ const dl = r[4] instanceof Date ? Utilities.formatDate(r[4], TZ, 'yyyy-MM-dd') : String(r[4] || ''); return { day: Number(r[1]) || 0, word: String(r[2]), date: dl }; });
}

// Today's word, the words so far, and the member's progress.
function apiWords(token) {
  const me = byToken_(token), lead = isLeader_(me), ch = challenge_(MAIN_ID), t = Math.min(dayIndexFor_(ch), ch.n);
  const words = wordStudies_().filter(function(w){ return lead || (w.Status === 'Approved' && w.Day <= t); }).map(function(w){ return pubWord_(w, lead); });
  const u = tutorUse_(me.id);
  return { day: t, words: words, learned: learnedRows_(me.id), convs: u.c, used: u.n, limit: TEACHER_DAILY_LIMIT,
    teacher: !!PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY') };
}
function apiWordLearn(token, day, word, on) {
  return withLock_(function(){
    const me = byToken_(token); day = Math.round(Number(day)) || 0; word = clean_(word, 60);
    const w = wordStudies_().filter(function(x){ return x.Day === day && x.Word === word; })[0];
    if (!w || (w.Status !== 'Approved' && !isLeader_(me))) throw new Error('That word is not available.');
    const sh = sheet_('WordProgress', WP_COLS); const v = sh.getDataRange().getValues(); const when = on ? today_() : '';
    for (let i = 1; i < v.length; i++) if (String(v[i][0]) === me.id && Number(v[i][1]) === day && String(v[i][2]) === word) {
      sh.getRange(i + 1, 4, 1, 2).setValues([[on ? 'TRUE' : 'FALSE', when]]); return { learned: learnedRows_(me.id) };
    }
    if (on) sh.appendRow([me.id, String(day), word, 'TRUE', when]);
    return { learned: learnedRows_(me.id) };
  });
}
// You (and only you) can approve a draft word from the app; you can also type "Approved" in the Status column.
function apiWordApprove(token, day) {
  withLock_(function(){
    const me = byToken_(token); if (!isLeader_(me)) throw new Error('Only the New Creation team can approve word studies.');
    const sh = sheet_('WordStudies', WS_COLS); const v = sh.getDataRange().getValues(); const st = WS_COLS.indexOf('Status') + 1;
    for (let i = 1; i < v.length; i++) if (Math.round(Number(v[i][0])) === Math.round(Number(day))) sh.getRange(i + 1, st).setValue('Approved');
    CacheService.getScriptCache().remove('nc_words_' + ENV_);
  });
  return apiWords(token);
}

// ---------- the teacher ----------
function tutorHistory_(memberId, conv) {
  const ck = 'tc:' + ENV_ + ':' + memberId + ':' + conv; const hit = CacheService.getScriptCache().get(ck);
  if (hit) { try { return JSON.parse(hit); } catch (e) {} }
  const sh = sheet_('TutorChats', TC_COLS); const last = sh.getLastRow(); if (last < 2) return [];
  const from = Math.max(2, last - 1999); const v = sh.getRange(from, 1, last - from + 1, TC_COLS.length).getValues(); const out = [];
  v.forEach(function(r){ if (String(r[0]) === memberId && String(r[1]) === conv) out.push({ role: String(r[3]) === 'assistant' ? 'assistant' : 'user', content: String(r[4]) }); });
  return out.slice(-TEACHER_HISTORY);
}
function claude_(system, messages) {
  const P = PropertiesService.getScriptProperties(); const key = P.getProperty('CLAUDE_API_KEY');
  if (!key) throw new Error('CLAUDE_API_KEY is not set in Script Properties.');
  const model = (P.getProperty('CLAUDE_MODEL') || TEACHER_DEFAULT_MODEL).trim();
  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({ model: model, max_tokens: TEACHER_MAX_TOKENS, system: system, messages: messages })
  });
  const code = res.getResponseCode(), body = res.getContentText();
  if (code !== 200) throw new Error('Claude API ' + code + ' (model ' + model + '): ' + body.slice(0, 500));
  const j = JSON.parse(body);
  const text = (j.content || []).filter(function(c){ return c.type === 'text'; }).map(function(c){ return c.text; }).join('\n').trim();
  if (!text) throw new Error('Claude API returned no text (stop reason ' + j.stop_reason + ').');
  return { text: text, cut: j.stop_reason === 'max_tokens' };
}
// o = { conv, text, day, word, lang }. Day and word only describe what the member is looking at; the passage is worked out here.
function apiTeacher(token, o) {
  o = o || {}; const me = byToken_(token);
  const text = String(o.text || '').replace(/[<>]/g, '').trim().slice(0, 1200); if (!text) throw new Error('Please type a question first.');
  const conv = String(o.conv || '').replace(/[^a-z0-9]/gi, '').slice(0, 24); if (conv.length < 6) throw new Error('Please start a new conversation.');
  const ch = challenge_(MAIN_ID), today = Math.min(Math.max(dayIndexFor_(ch), 1), ch.n);
  let day = Math.round(Number(o.day)) || today; if (day < 1 || day > ch.n) day = today;
  const ws = wordStudies_().filter(function(w){ return w.Day === day && (w.Status === 'Approved' || isLeader_(me)); })[0];
  const word = clean_(o.word, 80) || (ws ? ws.Word + ' (' + ws.Transliteration + ')' : 'none chosen yet');
  const language = o.lang === 'grc' ? 'Greek' : o.lang === 'he' ? 'Hebrew' : (ws ? ws.Language : dayLang_(day));
  const system = TEACHER_PROMPT.replace('{day}', day).replace('{passage}', rangeLabel_(CUM[day - 1], CUM[day])).replace('{word}', word).replace('{language}', language);
  // Reserve one of today's messages first, so two quick taps cannot go over the limit.
  const before = withLock_(function(){ const u = tutorUse_(me.id); if (u.n >= TEACHER_DAILY_LIMIT) return null; u.n++; saveTutorUse_(me.id, u); return u; });
  if (!before) return { limited: true, used: TEACHER_DAILY_LIMIT, limit: TEACHER_DAILY_LIMIT };
  let history = tutorHistory_(me.id, conv); while (history.length && history[0].role !== 'user') history.shift();
  let r;
  try { r = claude_(system, history.concat([{ role: 'user', content: text }])); }
  catch (err) {
    wbLog_('teacher', me.id, String(err && err.message || err));
    withLock_(function(){ const u = tutorUse_(me.id); u.n = Math.max(0, u.n - 1); saveTutorUse_(me.id, u); });
    throw new Error(TEACHER_DOWN);
  }
  const reply = r.text + (r.cut ? '\n\n(My answer was cut short. Ask me to continue if you would like the rest.)' : '');
  const stamp = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'), wcol = ws ? ws.Word : clean_(o.word, 80);
  const u = withLock_(function(){
    const sh = sheet_('TutorChats', TC_COLS);
    sh.appendRow([me.id, conv, stamp, 'user', sheetText_(text), String(day), sheetText_(wcol)]);
    sh.appendRow([me.id, conv, stamp, 'assistant', sheetText_(reply), String(day), sheetText_(wcol)]);
    const x = tutorUse_(me.id); if (!history.length) x.c++; saveTutorUse_(me.id, x); return x;
  });
  const next = history.concat([{ role: 'user', content: text }, { role: 'assistant', content: reply }]).slice(-TEACHER_HISTORY);
  try { CacheService.getScriptCache().put('tc:' + ENV_ + ':' + me.id + ':' + conv, JSON.stringify(next), 21600); } catch (e) {}
  return { reply: reply, used: u.n, limit: TEACHER_DAILY_LIMIT, convs: u.c };
}

// ---------- run these from the Apps Script editor ----------
// 1. Create the four new tabs and add the 27 starter words as Draft. Never overwrites: does nothing if words already exist.
function seedWordStudies() {
  sheet_('WordProgress', WP_COLS); sheet_('TutorChats', TC_COLS); sheet_('Logs', LOGS_COLS);
  const sh = sheet_('WordStudies', WS_COLS);
  if (sh.getLastRow() > 1) { Logger.log('WordStudies already has ' + (sh.getLastRow() - 1) + ' rows. Nothing was changed.'); return; }
  sh.getRange(2, 1, WORD_SEED.length, WS_COLS.length).setValues(WORD_SEED.map(function(r){ return r.map(String); }));
  CacheService.getScriptCache().remove('nc_words_' + ENV_);
  Logger.log('Added ' + WORD_SEED.length + ' word studies as Draft. Review each row, then set Status to Approved.');
}
// 2. Approves Google's request for internet access (needed once) and checks the Claude key and model. Prints no secrets.
function teacherCheck() {
  try { const r = claude_('Reply with exactly: The teacher is ready.', [{ role: 'user', content: 'Are you ready?' }]); Logger.log('OK: ' + r.text); }
  catch (e) { Logger.log('Problem: ' + e.message); }
}
