"""Builds New Creation Bible data from verified public sources.
Sources (downloaded unmodified into ../raw):
  BSB  - bereanbible.com/bsb.txt (dedicated to the public domain)
  KJV  - ebible.org eng-kjv2006 (public domain; Crown patent applies only in the UK)
  WEB  - ebible.org eng-web (public domain; "World English Bible" is a trademark of eBible.org)
  TAHOT/TAGNT/TBESH/TBESG - STEPBible.org / Tyndale House, CC BY 4.0 (reformatted, data not changed)
"""
import json, os, re, sys, collections, html
RAW = os.path.join(os.path.dirname(__file__), '..', 'raw')
OUT = os.path.join(os.path.dirname(__file__), '..', 'app', 'data')
CODES = "GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV".split()
NAMES = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Songs","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"]
EBIBLE = "GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SOL ISA JER LAM EZE DAN HOS JOE AMO OBA JON MIC NAH HAB ZEP HAG ZEC MAL MAT MAR LUK JOH ACT ROM 1CO 2CO GAL EPH PHI COL 1TH 2TH 1TI 2TI TIT PHM HEB JAM 1PE 2PE 1JO 2JO 3JO JUD REV".split()
STEP = "Gen Exo Lev Num Deu Jos Jdg Rut 1Sa 2Sa 1Ki 2Ki 1Ch 2Ch Ezr Neh Est Job Psa Pro Ecc Sng Isa Jer Lam Ezk Dan Hos Jol Amo Oba Jon Mic Nam Hab Zep Hag Zec Mal Mat Mrk Luk Jhn Act Rom 1Co 2Co Gal Eph Php Col 1Th 2Th 1Ti 2Ti Tit Phm Heb Jas 1Pe 2Pe 1Jn 2Jn 3Jn Jud Rev".split()
BSBN = dict((n, CODES[i]) for i, n in enumerate(["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalm","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"]))

def put(book, ch, v, text, store):
    b = store.setdefault(book, {})
    b.setdefault(ch, {})[v] = text

def write_tr(tr, store):
    os.makedirs(os.path.join(OUT, 'text', tr), exist_ok=True)
    counts = {}
    for code in CODES:
        chs = store[code]; n = max(chs)
        arr = []
        for c in range(1, n + 1):
            vs = chs.get(c, {}); m = max(vs) if vs else 0
            arr.append([vs.get(v, '') for v in range(1, m + 1)])
        counts[code] = [len(x) for x in arr]
        json.dump({'b': code, 'c': arr}, open(os.path.join(OUT, 'text', tr, code + '.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    return counts

def bsb():
    st = {}
    for line in open(os.path.join(RAW, 'bsb.txt'), encoding='utf-8-sig'):
        m = re.match(r'^(.+?) (\d+):(\d+)\t(.*)$', line.rstrip('\n'))
        if not m or m.group(1) not in BSBN: continue
        put(BSBN[m.group(1)], int(m.group(2)), int(m.group(3)), m.group(4).strip(), st)
    return st

def ebible(path):
    st = {}; mp = dict(zip(EBIBLE, CODES))
    for line in open(path, encoding='utf-8-sig'):
        m = re.match(r'^(\S+) (\d+):(\d+) (.*)$', line.rstrip('\n'))
        if not m or m.group(1) not in mp: continue
        t = re.sub(r'\s+', ' ', m.group(4)).strip()
        put(mp[m.group(1)], int(m.group(2)), int(m.group(3)), t, st)
    return st

def lexicon(path):
    lex = {}
    for line in open(path, encoding='utf-8'):
        f = line.rstrip('\n').split('\t')
        if len(f) < 8 or not re.match(r'^[HG]\d', f[0]): continue
        key = f[1].split('=')[0].strip()
        if not re.match(r'^[HG]\d+[A-Za-z]?$', key): continue
        d = f[7]
        d = re.sub(r"<ref='[^']*'>([^<]*)</ref>", r'\1', d)
        d = re.sub(r'(?i)<br\s*/?>', '\n', d); d = re.sub(r'<[^>]+>', '', d); d = html.unescape(d).strip()
        lex[key] = [f[3], f[4], f[6], d[:900]]
    return lex

def step_rows(files):
    mp = dict(zip(STEP, CODES))
    for fn in files:
        for line in open(os.path.join(RAW, fn), encoding='utf-8-sig'):
            f = line.rstrip('\n').split('\t')
            m = re.match(r'^([1-3]?[A-Za-z]{2,3})\.(\d+)\.(\d+)(?:\([^)]*\)|\[[^\]]*\]|\{[^}]*\})?#(\d+)=(\S+)', f[0])
            if not m or m.group(1) not in mp: continue
            yield mp[m.group(1)], int(m.group(2)), int(m.group(3)), m.group(5), f

def hebrew(lex):
    out = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(list)))
    for code, c, v, typ, f in step_rows(['TAHOT_Gen-Deu.txt', 'TAHOT_Jos-Est.txt', 'TAHOT_Job-Sng.txt', 'TAHOT_Isa-Mal.txt']):
        if typ.startswith('K') and not typ.startswith('KQ'): continue  # Ketiv recorded as variant; keep reading text (L/Q)
        strongs = re.findall(r'H\d+[A-Za-z]?', f[4])
        main = re.findall(r'\{(H\d+[A-Za-z]?)\}', f[4])
        out[code][c][v].append({'t': f[1], 'x': f[2], 'g': f[3], 's': strongs, 'm': main[0] if main else (strongs[-1] if strongs else ''), 'p': f[5], 'k': typ,
                                'var': (f[6] + (' ' + f[7] if len(f) > 7 and f[7] else '')).strip()})
    return out

def greek(lex):
    out = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(list)))
    for code, c, v, typ, f in step_rows(['TAGNT_Mat-Jhn.txt', 'TAGNT_Act-Rev.txt']):
        gm = re.match(r'^(.*?)\s*\((.*)\)$', f[1]); word, tr = (gm.group(1), gm.group(2)) if gm else (f[1], '')
        sp = f[3].split('='); strong = sp[0]; morph = sp[1] if len(sp) > 1 else ''
        out[code][c][v].append({'t': word, 'x': tr, 'g': f[2], 's': [strong], 'm': strong, 'p': morph, 'k': typ, 'ed': f[5] if len(f) > 5 else '',
                                'var': ' '.join(x for x in f[6:8] if x).strip() if len(f) > 7 else ''})
    return out

def write_orig(data, lex, lang):
    n = 0
    for code, chs in data.items():
        d = os.path.join(OUT, 'orig', code); os.makedirs(d, exist_ok=True)
        for c, vs in chs.items():
            used = {}
            verses = []
            for v in range(1, max(vs) + 1):
                ws = vs.get(v, [])
                for w in ws:
                    for s in w['s']:
                        k = s if s in lex else re.sub(r'[A-Za-z]$', '', s)
                        if k in lex: used[k] = lex[k][:3]
                verses.append([[w['t'], w['x'], w['g'], w['s'], w['m'], w['p'], w['k'], w.get('ed', ''), w['var']] for w in ws])
            json.dump({'lang': lang, 'b': code, 'c': c, 'v': verses, 'lex': used}, open(os.path.join(d, '%d.json' % c), 'w'), ensure_ascii=False, separators=(',', ':'))
            n += 1
    return n

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    b, k, w = bsb(), ebible(os.path.join(RAW, 'kjv', 'eng-kjv2006_vpl.txt')), ebible(os.path.join(RAW, 'web', 'eng-web_vpl.txt'))
    cb, ck, cw = write_tr('bsb', b), write_tr('kjv', k), write_tr('web', w)
    meta = {'codes': CODES, 'names': NAMES, 'chapters': [len(cb[c]) for c in CODES], 'verses': cb}
    json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'), separators=(',', ':'))
    tot = lambda cc: sum(sum(x) for x in cc.values())
    print('verses bsb', tot(cb), 'kjv', tot(ck), 'web', tot(cw), 'chapters', sum(meta['chapters']))
    mism = [c for c in CODES if len(cb[c]) != len(ck[c]) or len(cb[c]) != len(cw[c])]
    print('chapter-count mismatches', mism)
    lh, lg = lexicon(os.path.join(RAW, 'TBESH.txt')), lexicon(os.path.join(RAW, 'TBESG.txt'))
    print('lexicon', len(lh), len(lg))
    print('hebrew chapters', write_orig(hebrew(lh), lh, 'he'))
    print('greek chapters', write_orig(greek(lg), lg, 'grc'))
    # full lexicon definitions, bucketed by Strong's number (loaded only when a word is tapped)
    import shutil
    ld = os.path.join(OUT, 'lex'); shutil.rmtree(ld, ignore_errors=True); os.makedirs(ld)
    buckets = collections.defaultdict(dict)
    for lx in (lh, lg):
        for k, v in lx.items():
            n = int(re.match(r'[HG](\d+)', k).group(1)); buckets['%s%02d' % (k[0], n // 100)][k] = v
    for b, d in buckets.items(): json.dump(d, open(os.path.join(ld, b + '.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    print('lexicon buckets', len(buckets))
