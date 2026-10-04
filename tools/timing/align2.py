# Verse start times from pauses: choose one pause per verse boundary so that each verse's length in time
# matches its length in text, preferring long pauses (narrators pause longer between verses).
import json, sys
META = json.load(open('/tmp/claude-0/nc2/app/data/meta.json'))
_cache = {}
def chapter_text(code, c):
    if code not in _cache: _cache[code] = json.load(open(f'/tmp/claude-0/nc2/app/data/text/bsb/{code}.json'))
    return _cache[code]['c'][c - 1]
W1, W2, CAP, WIN = 5.0, 4.0, 1.4, 14
def align(code, c, rec):
    verses = chapter_text(code, c); name = META['names'][META['codes'].index(code)]
    units = [len(f'{name}, chapter {c}') + 6] + [len(v) + 6 for v in verses]
    d, gaps = rec['d'], [g for g in rec['g'] if g[1] - g[0] >= 0.3]
    start = gaps[0][1] if gaps and gaps[0][0] < 0.05 else 0.0
    end = gaps[-1][0] if gaps and gaps[-1][1] > d - 0.1 else d
    inner = [g for g in gaps if g[0] > start + 0.2 and g[1] < end - 0.2]
    K, G = len(units) - 1, len(inner)            # K boundaries to place among G pauses
    rate = (end - start) / sum(units)            # seconds per character
    if G < K or K == 0:
        out, cum = [round(start, 2)], 0
        for u in units[:-1]: cum += u; out.append(round(start + cum * rate, 2))
        return out
    T = [start] + [g[1] for g in inner]          # candidate verse starts: 0 = chapter start, i = after pause i-1
    L = [0] + [min(g[1] - g[0], CAP) for g in inner]
    INF = float('inf')
    # dp[k][j]: unit k (0 = announcement) ends at candidate j (its successor starts at T[j]), j in 1..G
    prev = {0: 0.0}; back = []
    for k in range(K):
        exp = units[k] * rate; cur = {}; bk = {}
        for i, base in prev.items():
            for j in range(i + 1, min(G, i + WIN) + 1):
                if G - j < K - 1 - k: break      # leave enough pauses for the rest
                dur = T[j] - T[i] - (inner[j - 1][1] - inner[j - 1][0])
                c = base + abs(dur - exp) / max(exp, 1.5) * W1 - L[j] * W2
                if c < cur.get(j, INF): cur[j] = c; bk[j] = i
        back.append(bk); prev = cur
    # last unit runs to the end
    best, bj = INF, None
    for j, base in prev.items():
        exp = units[K] * rate; dur = end - T[j]; c = base + abs(dur - exp) / max(exp, 1.5) * W1
        if c < best: best, bj = c, j
    picks = [bj]
    for k in range(K - 1, 0, -1): picks.append(back[k][picks[-1]])
    picks.reverse()
    return [round(start, 2)] + [round(T[j] - 0.05, 2) for j in picks]
