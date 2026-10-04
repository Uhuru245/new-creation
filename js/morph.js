// Turns the grammar codes in the STEPBible data into plain English.
// Greek: Robinson morphology codes (as used in TAGNT). Hebrew/Aramaic: OpenScriptures morphology (as used in TAHOT).

const G_CASE = { N: 'subject form (nominative)', G: 'of/from form (genitive)', D: 'to/for form (dative)', A: 'object form (accusative)', V: 'calling form (vocative)' };
const G_NUM = { S: 'singular', P: 'plural' };
const G_GEN = { M: 'masculine', F: 'feminine', N: 'neuter' };
const G_TENSE = { P: 'present', I: 'imperfect', F: 'future', A: 'aorist', R: 'perfect', L: 'pluperfect', X: 'no tense stated' };
const G_TENSE_HELP = { P: 'ongoing or present action', I: 'ongoing action in the past', F: 'future action', A: 'action viewed as a single whole, usually past', R: 'completed action with lasting results', L: 'completed action in the past with results then' };
const G_VOICE = { A: 'active', M: 'middle', P: 'passive', E: 'middle or passive', D: 'middle (deponent)', O: 'passive (deponent)', N: 'middle or passive (deponent)', Q: 'impersonal active', X: 'no voice stated' };
const G_MOOD = { I: 'indicative (a statement)', S: 'subjunctive (a possibility)', O: 'optative (a wish)', M: 'imperative (a command)', N: 'infinitive ("to ...")', P: 'participle ("-ing" or "one who ...")' };
const G_POS = { N: 'Noun', A: 'Adjective', T: 'Article ("the")', V: 'Verb', P: 'Personal pronoun', R: 'Relative pronoun ("who, which")', C: 'Reciprocal pronoun', D: 'Demonstrative pronoun ("this, that")', K: 'Correlative pronoun', I: 'Interrogative pronoun ("who? what?")', X: 'Indefinite pronoun ("someone")', Q: 'Correlative or interrogative pronoun', F: 'Reflexive pronoun ("himself")', S: 'Possessive pronoun ("my, your")' };
const G_WORD = { ADV: 'Adverb', CONJ: 'Conjunction (joining word)', COND: 'Conditional ("if")', PRT: 'Particle', PREP: 'Preposition', INJ: 'Interjection', ARAM: 'Aramaic word', HEB: 'Hebrew word', 'N-PRI': 'Proper name (does not change form)', 'A-NUI': 'Number (does not change form)', 'N-LI': 'Letter', 'N-OI': 'Noun (does not change form)' };
const PERSON = { 1: 'I/we (first person)', 2: 'you (second person)', 3: 'he/she/it/they (third person)' };

export function greek(code) {
  if (!code) return { role: '', parts: [] };
  const c = code.replace(/-(T|C|S|K|ATT|ABB|I|N|P)$/, '');
  if (G_WORD[c]) return { role: G_WORD[c], parts: [] };
  const s = c.split('-'); const pos = s[0];
  if (G_WORD[pos]) return { role: G_WORD[pos] + (s[1] === 'N' ? ' (negative)' : s[1] === 'I' ? ' (question)' : ''), parts: [] };
  if (pos === 'V') {
    const tvm = (s[1] || '').replace(/^2/, ''); const t = tvm[0], v = tvm[1], m = tvm[2]; const parts = [];
    if (G_TENSE[t]) parts.push(['Tense', G_TENSE[t] + (G_TENSE_HELP[t] ? ' — ' + G_TENSE_HELP[t] : '')]);
    if (G_VOICE[v]) parts.push(['Voice', G_VOICE[v]]);
    if (G_MOOD[m]) parts.push(['Mood', G_MOOD[m]]);
    const pn = s[2] || '';
    if (/^[123][SP]$/.test(pn)) parts.push(['Person', PERSON[pn[0]] + ', ' + G_NUM[pn[1]]]);
    else if (/^[NGDAV][SP][MFN]$/.test(pn)) parts.push(['Form', `${G_CASE[pn[0]]}, ${G_NUM[pn[1]]}, ${G_GEN[pn[2]]}`]);
    return { role: 'Verb' + (m === 'P' ? ' (participle)' : m === 'N' ? ' (infinitive)' : ''), parts };
  }
  const parts = []; let rest = s.slice(1).join('');
  const pm = /^([123])?([NGDAV])([SP])([MFN])?$/.exec(rest);
  if (pm) {
    if (pm[1]) parts.push(['Person', PERSON[pm[1]]]);
    parts.push(['Case', G_CASE[pm[2]]]); parts.push(['Number', G_NUM[pm[3]]]); if (pm[4]) parts.push(['Gender', G_GEN[pm[4]]]);
  }
  return { role: G_POS[pos] || pos, parts };
}

const H_POS = { A: 'Adjective', C: 'Conjunction ("and, but")', D: 'Adverb', N: 'Noun', P: 'Pronoun', R: 'Preposition', S: 'Suffix', T: 'Particle', V: 'Verb' };
const H_STEM = { q: 'Qal (simple action)', N: 'Niphal (passive or reflexive)', p: 'Piel (intensive action)', P: 'Pual (intensive passive)', h: 'Hiphil (causing action)', H: 'Hophal (caused, passive)', t: 'Hithpael (reflexive: oneself)', o: 'Polel', O: 'Polal', r: 'Hithpolel', m: 'Poel', M: 'Poal', k: 'Palel', K: 'Pulal', Q: 'Qal passive', l: 'Pilpel', L: 'Polpal', f: 'Hithpalpel', D: 'Nithpael', j: 'Pealal', i: 'Pilel', u: 'Hothpaal', c: 'Tiphil', v: 'Hishtaphel', w: 'Nithpalel', y: 'Nithpoel', z: 'Hithpoel' };
const A_STEM = { q: 'Peal (simple action)', Q: 'Peil (passive)', u: 'Hithpeel (passive or reflexive)', p: 'Pael (intensive)', P: 'Ithpaal', M: 'Hithpaal', a: 'Aphel (causing action)', h: 'Haphel (causing action)', s: 'Saphel', e: 'Shaphel', H: 'Hophal', i: 'Ithpeel', t: 'Hishtaphel', v: 'Ishtaphel', w: 'Hithaphel', o: 'Polel', z: 'Ithpoel', r: 'Hithpolel', f: 'Hithpalpel', b: 'Hephal', c: 'Tiphel', m: 'Poel', l: 'Shafel' };
const H_ASPECT = { p: 'perfect (qatal) — usually completed action', q: 'sequential perfect (weqatal) — "and he will ..."', i: 'imperfect (yiqtol) — usually ongoing or future action', w: 'sequential imperfect (wayyiqtol) — the usual "and he ..." of storytelling', h: 'cohortative — "let me / let us ..."', j: 'jussive — "let him / may it ..."', v: 'imperative — a command', r: 'participle (active) — "one who ..." or "-ing"', s: 'participle (passive)', a: 'infinitive absolute — often adds emphasis', c: 'infinitive construct — "to ..." or "when ..."' };
const H_GEN = { m: 'masculine', f: 'feminine', b: 'masculine or feminine', c: 'common' };
const H_NUM = { s: 'singular', p: 'plural', d: 'dual (a pair)' };
const H_STATE = { a: 'absolute', c: 'construct ("X of ...")', d: 'determined' };
const H_PER = { 1: 'first person (I/we)', 2: 'second person (you)', 3: 'third person (he/she/they)' };
const T_TYPE = { a: 'affirmation', d: 'definite article ("the")', e: 'exhortation', i: 'question marker', j: 'interjection', m: 'demonstrative', n: 'negative ("not")', o: 'object marker (shows the object of the verb; not translated)', r: 'relative ("who, which")' };
const P_TYPE = { d: 'demonstrative ("this, that")', f: 'indefinite', i: 'interrogative ("who? what?")', p: 'personal', r: 'relative' };
const S_TYPE = { d: 'directional ending ("toward")', h: 'paragogic he', n: 'paragogic nun', p: 'pronoun ending' };

function hebPart(p, aram) {
  const pos = p[0]; const r = p.slice(1); const out = { role: H_POS[pos] || pos, parts: [] };
  const pgn = (s) => { const k = []; if (H_PER[s[0]]) k.push(H_PER[s[0]]); if (H_GEN[s[1]]) k.push(H_GEN[s[1]]); if (H_NUM[s[2]]) k.push(H_NUM[s[2]]); return k.join(', '); };
  if (pos === 'V') {
    const stem = (aram ? A_STEM : H_STEM)[r[0]], asp = H_ASPECT[r[1]]; if (stem) out.parts.push(['Stem', stem]); if (asp) out.parts.push(['Form', asp]);
    const tail = r.slice(2);
    if (/^[rs]$/.test(r[1]) && tail) { const k = []; if (H_GEN[tail[0]]) k.push(H_GEN[tail[0]]); if (H_NUM[tail[1]]) k.push(H_NUM[tail[1]]); if (H_STATE[tail[2]]) k.push(H_STATE[tail[2]]); if (k.length) out.parts.push(['Agreement', k.join(', ')]); }
    else if (tail) { const v = pgn(tail); if (v) out.parts.push(['Person', v]); }
  } else if (pos === 'N') {
    const t = { c: 'common noun', g: 'nationality or people', p: 'proper name' }[r[0]]; if (t) out.role = 'Noun (' + t + ')';
    const k = []; if (H_GEN[r[1]]) k.push(H_GEN[r[1]]); if (H_NUM[r[2]]) k.push(H_NUM[r[2]]); if (H_STATE[r[3]]) k.push(H_STATE[r[3]]); if (k.length) out.parts.push(['Form', k.join(', ')]);
  } else if (pos === 'A') {
    out.role = { a: 'Adjective', c: 'Number', g: 'Adjective (nationality)', o: 'Ordinal number ("first, second")' }[r[0]] || 'Adjective';
    const k = []; if (H_GEN[r[1]]) k.push(H_GEN[r[1]]); if (H_NUM[r[2]]) k.push(H_NUM[r[2]]); if (H_STATE[r[3]]) k.push(H_STATE[r[3]]); if (k.length) out.parts.push(['Form', k.join(', ')]);
  } else if (pos === 'T') { out.role = 'Particle: ' + (T_TYPE[r[0]] || 'particle'); }
  else if (pos === 'P') { out.role = 'Pronoun: ' + (P_TYPE[r[0]] || 'pronoun'); const v = pgn(r.slice(1)); if (v) out.parts.push(['Person', v]); }
  else if (pos === 'S') { out.role = 'Ending: ' + (S_TYPE[r[0]] || 'suffix'); const v = pgn(r.slice(1)); if (v) out.parts.push(['Refers to', v]); }
  else if (pos === 'R') { out.role = r[0] === 'd' ? 'Preposition with "the"' : 'Preposition ("in, to, from ...")'; }
  return out;
}
export function hebrew(code) {
  if (!code) return { role: '', parts: [], lang: 'Hebrew', pieces: [] };
  const lang = code[0] === 'A' ? 'Aramaic' : 'Hebrew';
  const pieces = code.slice(1).split('/').filter(Boolean).map((p) => hebPart(p, lang === 'Aramaic'));
  const main = pieces.find((p) => /^(Verb|Noun|Adjective|Number|Ordinal|Adverb)/.test(p.role)) || pieces[pieces.length - 1] || { role: '', parts: [] };
  return { role: main.role, parts: main.parts, lang, pieces };
}
