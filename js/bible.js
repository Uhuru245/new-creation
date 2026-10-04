// Bible text (public-domain translations), references, search and reading plans.
export const TRANSLATIONS = {
  bsb: { id: 'bsb', short: 'BSB', name: 'Berean Standard Bible', notice: 'Berean Standard Bible (BSB). The BSB text has been dedicated to the public domain by its translators. BereanBible.com' },
  kjv: { id: 'kjv', short: 'KJV', name: 'King James Version', notice: 'King James Version (1769 text, eBible.org edition). Public domain outside the United Kingdom, where the Crown holds printing rights.' },
  web: { id: 'web', short: 'WEB', name: 'World English Bible', notice: 'World English Bible (WEB), eBible.org. Public domain. "World English Bible" is a trademark of eBible.org.' },
};
const base = new URL('../data/', import.meta.url);
const memo = new Map();
async function getJson(path) {
  if (memo.has(path)) return memo.get(path);
  const p = fetch(new URL(path, base)).then((r) => { if (!r.ok) throw new Error('Could not load ' + path); return r.json(); });
  memo.set(path, p); p.catch(() => memo.delete(path));
  return p;
}
export let META = null, PLANS = null;
export async function loadMeta() { [META, PLANS] = await Promise.all([getJson('meta.json'), getJson('plans.json')]); return META; }
export const bookIndex = (code) => META.codes.indexOf(code);
export const bookName = (code) => META.names[bookIndex(code)];
export const isNT = (code) => bookIndex(code) >= 39;
export const chapterCount = (code) => META.chapters[bookIndex(code)];
export async function loadBook(tr, code) { return getJson(`text/${tr}/${code}.json`); }
export async function loadChapter(tr, code, c) { const b = await loadBook(tr, code); return b.c[c - 1] || []; }
export async function loadOriginal(code, c) { return getJson(`orig/${code}/${c}.json`); }
export async function loadLexEntry(strong) {
  const m = /^([HG])(\d+)/.exec(strong); if (!m) return null;
  const bucket = await getJson(`lex/${m[1]}${String(Math.floor(Number(m[2]) / 100)).padStart(2, '0')}.json`);
  return bucket[strong] || bucket[strong.replace(/[A-Za-z]$/, '')] || null;
}

// ---------- references ----------
const ALIASES = {
  gen: 'GEN', ge: 'GEN', gn: 'GEN', exo: 'EXO', ex: 'EXO', exod: 'EXO', lev: 'LEV', lv: 'LEV', num: 'NUM', nm: 'NUM', deut: 'DEU', deu: 'DEU', dt: 'DEU',
  josh: 'JOS', jos: 'JOS', judg: 'JDG', jdg: 'JDG', ruth: 'RUT', rut: 'RUT', '1sam': '1SA', '1sa': '1SA', '2sam': '2SA', '2sa': '2SA', '1kgs': '1KI', '1ki': '1KI', '1kings': '1KI', '2kgs': '2KI', '2ki': '2KI', '2kings': '2KI',
  '1chr': '1CH', '1ch': '1CH', '2chr': '2CH', '2ch': '2CH', ezra: 'EZR', ezr: 'EZR', neh: 'NEH', esth: 'EST', est: 'EST', job: 'JOB', ps: 'PSA', psa: 'PSA', psalm: 'PSA', psalms: 'PSA', prov: 'PRO', pro: 'PRO', pr: 'PRO',
  eccl: 'ECC', ecc: 'ECC', eccles: 'ECC', song: 'SNG', sng: 'SNG', sos: 'SNG', songofsolomon: 'SNG', songofsongs: 'SNG', isa: 'ISA', is: 'ISA', jer: 'JER', lam: 'LAM', ezek: 'EZK', ezk: 'EZK', eze: 'EZK', dan: 'DAN', dn: 'DAN',
  hos: 'HOS', joel: 'JOL', jol: 'JOL', amos: 'AMO', amo: 'AMO', obad: 'OBA', oba: 'OBA', jonah: 'JON', jon: 'JON', mic: 'MIC', nah: 'NAM', nam: 'NAM', hab: 'HAB', zeph: 'ZEP', zep: 'ZEP', hag: 'HAG', zech: 'ZEC', zec: 'ZEC', mal: 'MAL',
  matt: 'MAT', mat: 'MAT', mt: 'MAT', mark: 'MRK', mrk: 'MRK', mk: 'MRK', mar: 'MRK', luke: 'LUK', luk: 'LUK', lk: 'LUK', john: 'JHN', jhn: 'JHN', jn: 'JHN', joh: 'JHN', acts: 'ACT', act: 'ACT', rom: 'ROM', ro: 'ROM',
  '1cor': '1CO', '1co': '1CO', '2cor': '2CO', '2co': '2CO', gal: 'GAL', eph: 'EPH', phil: 'PHP', php: 'PHP', col: 'COL', '1thess': '1TH', '1th': '1TH', '2thess': '2TH', '2th': '2TH', '1tim': '1TI', '1ti': '1TI', '2tim': '2TI', '2ti': '2TI',
  titus: 'TIT', tit: 'TIT', philem: 'PHM', phm: 'PHM', heb: 'HEB', jas: 'JAS', james: 'JAS', '1pet': '1PE', '1pe': '1PE', '2pet': '2PE', '2pe': '2PE', '1john': '1JN', '1jn': '1JN', '2john': '2JN', '2jn': '2JN', '3john': '3JN', '3jn': '3JN', jude: 'JUD', jud: 'JUD', rev: 'REV', re: 'REV', revelation: 'REV',
};
export function parseRef(text) {
  const t = String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const m = /^((?:[1-3]\s?)?[a-z][a-z .]*?)\s*(\d+)?(?:[:.](\d+)(?:\s*[-–]\s*(\d+))?)?$/.exec(t);
  if (!m) return null;
  const key = m[1].replace(/[\s.]/g, '').replace(/^first/, '1').replace(/^second/, '2').replace(/^third/, '3');
  let code = ALIASES[key];
  if (!code) { const i = META.names.findIndex((n) => n.toLowerCase().replace(/\s/g, '') === key || n.toLowerCase().replace(/\s/g, '').startsWith(key)); if (i >= 0 && key.length >= 2) code = META.codes[i]; }
  if (!code) return null;
  const c = Math.min(Math.max(Number(m[2] || 1), 1), chapterCount(code));
  return { b: code, c, v: m[3] ? Number(m[3]) : null, v2: m[4] ? Number(m[4]) : null };
}
export const refLabel = (b, c, v, v2) => `${bookName(b)} ${c}${v ? ':' + v + (v2 && v2 !== v ? '–' + v2 : '') : ''}`;

// ---------- search (downloads the chosen translation once, then searches on the device) ----------
export async function search(tr, query, onProgress = () => {}, limit = 200) {
  const words = String(query).toLowerCase().replace(/[^\p{L}\p{N}' ]/gu, ' ').split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return [];
  const out = []; let done = 0;
  const books = await Promise.all(META.codes.map((code) => loadBook(tr, code).then((b) => { onProgress(++done / 66); return b; })));
  const phrase = String(query).toLowerCase().trim();
  books.forEach((bk) => bk.c.forEach((vs, ci) => vs.forEach((txt, vi) => {
    const low = txt.toLowerCase();
    if (words.every((w) => low.includes(w))) out.push({ b: bk.b, c: ci + 1, v: vi + 1, text: txt, exact: low.includes(phrase) });
  })));
  out.sort((a, b) => (b.exact - a.exact));
  return { total: out.length, results: out.slice(0, limit), words };
}

// ---------- reading plans (definitions come from the server's PLAN_DEFS, exported to plans.json) ----------
export function buildPlan(planId, startISO) {
  const P = PLANS.plans[planId] || PLANS.plans.bible93, isBible = planId === 'bible93';
  const CH = [], days = [], firstPos = {};
  P.days.forEach((segs, k) => {
    const n = k + 1, first = CH.length;
    segs.forEach(([b, x, y]) => { for (let c = x; c <= y; c++) { const key = META.codes[b] + '.' + c; if (!(key in firstPos)) firstPos[key] = CH.length; CH.push({ b: META.codes[b], c, key, day: n }); } });
    const date = new Date(startISO + 'T12:00:00Z'); date.setUTCDate(date.getUTCDate() + k);
    let sec = 0; P.sections.forEach(([, st], i) => { if (n >= st) sec = i; });
    days.push({ n, date: date.toISOString().slice(0, 10), first, last: CH.length, sec, deep: isBible ? PLANS.deep[k] : '', ms: isBible && PLANS.ms[n] ? PLANS.ms[n][1] : '', week: n % 7 === 0 ? n / 7 : 0 });
  });
  const cum = [0]; days.forEach((d) => cum.push(d.last));
  const positions = {}; CH.forEach((x, i) => { (positions[x.key] = positions[x.key] || []).push(i); });
  const uniq = Object.keys(positions).length;
  days.forEach((d) => { d.read = readLabel(CH.slice(d.first, d.last)); });
  return { id: planId, name: P.name, blurb: P.blurb, days, CH, cum, positions, total: CH.length, unique: uniq, sections: P.sections.map((s) => s[0]), sectionStarts: P.sections.map((s) => s[1]) };
}
export function readLabel(chs) {
  const parts = []; let i = 0;
  while (i < chs.length) {
    let j = i; while (j + 1 < chs.length && chs[j + 1].b === chs[i].b && chs[j + 1].c === chs[j].c + 1) j++;
    const a = chs[i], z = chs[j], whole = a.c === 1 && z.c === chapterCount(a.b) && chapterCount(a.b) > 1;
    parts.push(whole ? bookName(a.b) : a.c === z.c ? `${bookName(a.b)} ${a.c}` : `${bookName(a.b)} ${a.c}–${z.c}`); i = j + 1;
  }
  return parts.join('; ');
}
// Unique chapters read: a chapter that appears twice in a schedule counts once.
export function progressOf(plan, bits) {
  const read = new Set(); for (let i = 0; i < plan.CH.length; i++) if (bits[i] === '1') read.add(plan.CH[i].key);
  return { read, count: read.size };
}
export function isRead(plan, bits, key) { return (plan.positions[key] || []).some((i) => bits[i] === '1'); }
