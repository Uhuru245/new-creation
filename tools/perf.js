// Measures loading time on a throttled "typical mobile" connection (4 Mbps down, 1.5 Mbps up, 150 ms latency, 4x slower CPU).
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 4e6 / 8, uploadThroughput: 1.5e6 / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const fcp = () => p.evaluate(() => (performance.getEntriesByName('first-contentful-paint')[0] || {}).startTime || -1);
  let t = Date.now(); await p.goto(BASE + '?demo=1', { waitUntil: 'commit' }); await p.waitForSelector('.boot, .auth'); const ident = Date.now() - t;
  await p.waitForSelector('#sPhone'); const authReady = Date.now() - t; const f1 = await fcp();
  await p.fill('#sPhone', '0700000002'); await p.fill('#sPin', '2222'); t = Date.now(); await p.click('#sBtn'); await p.waitForSelector('.hero h2', { timeout: 60000 }); const signIn = Date.now() - t;
  await p.waitForTimeout(3000);
  await p.goto('about:blank'); t = Date.now(); await p.goto(BASE + '?demo=1#/today', { waitUntil: 'commit' }); await p.waitForSelector('.hero h2'); const returning = Date.now() - t; const f2 = await fcp();
  t = Date.now(); await p.evaluate(() => { location.hash = '#/bible/ROM/8'; }); await p.waitForSelector('#v28'); const chapter = Date.now() - t;
  t = Date.now(); await p.evaluate(() => { location.hash = '#/original/ROM/8/28'; }); await p.waitForSelector('.orig .w'); const orig = Date.now() - t;
  const out = { connection: '4 Mbps / 150 ms / CPU x4', firstVisit_identityShown_ms: ident, firstVisit_firstContentfulPaint_ms: Math.round(f1), firstVisit_signInFormReady_ms: authReady, signIn_toTodayContent_ms: signIn,
    returning_todayContent_ms: returning, returning_firstContentfulPaint_ms: Math.round(f2), openChapter_ms: chapter, openOriginalLanguages_ms: orig };
  console.log(JSON.stringify(out, null, 2)); require('fs').writeFileSync(__dirname + '/../perf-demo.json', JSON.stringify(out, null, 2)); await b.close();
})();
