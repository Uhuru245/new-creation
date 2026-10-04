# Download each narrated chapter once, record its pauses (silence gaps), and delete the audio. Output: gaps per chapter.
import json, os, re, subprocess, sys, tempfile, concurrent.futures as cf
META = json.load(open('/tmp/claude-0/nc2/app/data/meta.json'))
AB = ['Gen','Exo','Lev','Num','Deu','Jos','Jdg','Rut','1Sa','2Sa','1Ki','2Ki','1Ch','2Ch','Ezr','Neh','Est','Job','Psa','Pro','Ecc','Sng','Isa','Jer','Lam','Ezk','Dan','Hos','Jol','Amo','Oba','Jon','Mic','Nam','Hab','Zep','Hag','Zec','Mal','Mat','Mrk','Luk','Jhn','Act','Rom','1Co','2Co','Gal','Eph','Php','Col','1Th','2Th','1Ti','2Ti','Tts','Phm','Heb','Jas','1Pe','2Pe','1Jn','2Jn','3Jn','Jud','Rev']
N = {'souer': ('souer', ''), 'hays': ('hays', '_H'), 'gilbert': ('gilbert', '_G')}
narr = sys.argv[1]; d, suf = N[narr]
out_path = f'/tmp/claude-0/nc2/timing/gaps_{narr}.json'
done = json.load(open(out_path)) if os.path.exists(out_path) else {}
jobs = [(i, c) for i in range(66) for c in range(1, META['chapters'][i] + 1) if f"{META['codes'][i]}.{c}" not in done]
def work(job):
    i, c = job; key = f"{META['codes'][i]}.{c}"
    url = f"https://openbible.com/audio/{d}/BSB_{i+1:02d}_{AB[i]}_{c:03d}{suf}.mp3"
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=True) as f:
        for attempt in range(3):
            r = subprocess.run(['curl', '-sf', '-A', 'Mozilla/5.0', '--max-time', '120', '-o', f.name, url])
            if r.returncode == 0: break
        else: return key, None
        p = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f.name, '-af', 'silencedetect=n=-35dB:d=0.3', '-f', 'null', '-'], capture_output=True, text=True)
    dur = re.search(r'Duration: (\d+):(\d+):([\d.]+)', p.stderr); dur = int(dur[1]) * 3600 + int(dur[2]) * 60 + float(dur[3])
    s = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', p.stderr)]; e = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', p.stderr)]
    return key, {'d': round(dur, 2), 'g': [[round(a, 2), round(b, 2)] for a, b in zip(s, e)]}
with cf.ThreadPoolExecutor(6) as ex:
    for n, (key, val) in enumerate(ex.map(work, jobs), 1):
        if val: done[key] = val
        if n % 50 == 0: json.dump(done, open(out_path, 'w')); print(narr, len(done), flush=True)
json.dump(done, open(out_path, 'w')); print(narr, 'finished', len(done), flush=True)
