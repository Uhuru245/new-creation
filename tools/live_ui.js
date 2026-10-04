// The real PWA (served locally) talking to the DEPLOYED API in the TEST environment. Measures real timings.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  const cdp = await ctx.newCDPSession(p); await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 4e6 / 8, uploadThroughput: 1.5e6 / 8 });
  const out = {}; let t = Date.now();
  await p.goto('http://localhost:8765/?env=test', { waitUntil: 'commit' }); await p.waitForSelector('.boot, .auth'); out.identity_ms = Date.now() - t;
  await p.waitForSelector('#jName'); out.signInForm_ms = Date.now() - t;
  await p.click('#tSign').catch(() => {}); await p.fill('#sPhone', '0700000001'); await p.fill('#sPin', '1357');
  t = Date.now(); await p.click('#sBtn'); await p.waitForSelector('.hero h2, main .view h1', { timeout: 60000 }).catch(async (e) => { console.log('URL', p.url(), (await p.textContent('body')).slice(0, 300)); await p.screenshot({ path: 'shots/live-fail.png' }); throw e; }); out.signIn_toToday_ms = Date.now() - t;
  out.leaderNav = await p.isVisible('#topbar'); await p.waitForTimeout(6000);
  await p.goto('about:blank'); t = Date.now(); await p.goto('http://localhost:8765/?env=test#/today', { waitUntil: 'commit' }); await p.waitForSelector('main .view h1'); out.returning_todayFromSavedCopy_ms = Date.now() - t;
  await p.waitForFunction(() => !/Updating/.test((document.querySelector('#sync') || {}).textContent || ''), null, { timeout: 30000 }); out.returning_freshDataFromServer_ms = Date.now() - t;
  t = Date.now(); await p.evaluate(() => { location.hash = '#/circle'; }); await p.waitForSelector('#plist .post, #plist .empty', { timeout: 30000 }); out.circlePosts_ms = Date.now() - t;
  t = Date.now(); await p.evaluate(() => { location.hash = '#/bible/JHN/3'; }); await p.waitForSelector('#v16'); out.openChapter_ms = Date.now() - t;
  await p.evaluate(() => { location.hash = '#/leader'; }); await p.waitForSelector('#mlist .person', { timeout: 30000 }); out.leaderMembersLoaded = true;
  await p.screenshot({ path: 'shots/live-test-leader.png' });
  await p.evaluate(() => { location.hash = '#/me'; }); await p.waitForTimeout(500); await p.click('#out'); await p.waitForTimeout(3000);
  out.signOutClearedPrivate = await p.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('nc.p.')).length === 0);
  out.errors = errs; console.log(JSON.stringify(out, null, 2)); require('fs').writeFileSync('perf-live.json', JSON.stringify(out, null, 2)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
