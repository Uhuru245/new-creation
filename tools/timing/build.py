# Write data/timing/<narrator>/<BOOK>.json: for each chapter, [title start, verse 1 start, verse 2 start, ...] in seconds.
import json, os, sys
sys.path.insert(0, '/tmp/claude-0/nc2/timing'); import align2 as A
META = json.load(open('/tmp/claude-0/nc2/app/data/meta.json'))
narr = sys.argv[1]; gaps = json.load(open(f'/tmp/claude-0/nc2/timing/gaps_{narr}.json'))
out = f'/tmp/claude-0/nc2/app/data/timing/{narr}'; os.makedirs(out, exist_ok=True); missing = 0
for i, code in enumerate(META['codes']):
    book = []
    for c in range(1, META['chapters'][i] + 1):
        rec = gaps.get(f'{code}.{c}')
        if not rec: book.append(None); missing += 1; continue
        book.append(A.align(code, c, rec))
    json.dump(book, open(f'{out}/{code}.json', 'w'), separators=(',', ':'))
print(narr, 'missing', missing)
