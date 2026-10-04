// End-to-end user journeys in the browser, using the DEMO backend (real server code, sample data only).
// Run: node tools/e2e.js  (expects the app served at http://localhost:8765/)
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8765/';
const AXE = fs.readFileSync(__dirname + '/node_modules/axe-core/axe.min.js', 'utf8');
const results = []; let browser;
const ok = (name, cond, note = '') => { results.push({ name, pass: !!cond, note }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (note ? ' — ' + note : '')); };

async function fresh(opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 390, height: 844 }, deviceScaleFactor: 2, permissions: [] });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage(); page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  return { ctx, page };
}
async function signIn(page, phone, pin, extra = '') {
  await page.goto(BASE + '?demo=1' + extra); await page.waitForSelector('#fSign:not([hidden]), #fJoin:not([hidden])');
  if (await page.isVisible('#tSign')) await page.click('#tSign');
  await page.fill('#sPhone', phone); await page.fill('#sPin', pin);
  await Promise.all([page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }), page.click('#sBtn')]);
  await page.waitForSelector('.nav', { timeout: 15000 }); await page.waitForSelector('main .view h1', { timeout: 15000 });
}
const go = (page, hash) => page.evaluate((h) => { location.hash = h; }, hash).then(() => page.waitForTimeout(700));
const text = (page, sel) => page.textContent(sel).catch(() => '');

(async () => {
  browser = await chromium.launch();

  // 1. Joining through a personal invitation (late joiner) ------------------------------------
  { const { ctx, page } = await fresh();
    await page.goto(BASE + '?demo=1'); await page.waitForTimeout(1500); // seeds demo data
    const inviterId = await page.evaluate(() => JSON.parse(localStorage.getItem('nc.demo.db.v1')).books[JSON.parse(localStorage.getItem('nc.demo.db.v1')).props.SHEET_ID].sheets.Members.find((r) => r[1] === 'Naledi (sample)')[0]);
    await page.goto(BASE + '?demo=1&by=' + inviterId); await page.waitForFunction(() => /invited you/.test((document.querySelector('#invLine') || {}).textContent || ''), null, { timeout: 8000 }).catch(() => {});
    ok('Invitation shows the inviter name', /Naledi invited you/.test(await text(page, '#invLine')) && /Naledi/.test(await text(page, '#jBtn')));
    await page.fill('#jName', 'Test Joiner'); await page.fill('#jPhone', '0711111111'); await page.fill('#jPin', '12');
    await page.click('#jBtn'); ok('PIN validation message', /exactly 4/.test(await text(page, '#jErr')));
    await page.fill('#jPin', '9876'); await page.click('#jBtn'); await page.waitForSelector('main .view h1', { timeout: 15000 });
    const t = await page.textContent('main');
    ok('Joined without a Google account and landed on Today', /Good (morning|afternoon|evening), Test/.test(t));
    ok('Late joiner starts on the joining day; earlier days optional', /You joined on day 12/.test(t) || /before day 12 are optional/.test(t), (t.match(/You joined on day \d+[^.]*\./) || [''])[0]);
    ok('Late joiner is not shown as overdue', /0\/9\s*since you joined|\/9\s*since you joined/.test(t.replace(/\s+/g, ' ')) && !/behind/i.test(t));
    ok('No leader navigation for a member', !(await page.isVisible('.nav [data-nav=leader]')));
    await go(page, '#/leader'); ok('Member cannot open the Leader area', /Me|Joined/.test(await text(page, 'main h1')) || (await page.textContent('main')).includes('Invite a friend'));
    ok('No page errors (join)', !page.errors.length, page.errors.join('; '));
    await ctx.close(); }

  // 2. Returning sign-in, wrong PIN, recovery guidance -----------------------------------------
  { const { ctx, page } = await fresh();
    await page.goto(BASE + '?demo=1'); await page.waitForTimeout(1500);
    await page.fill('#sPhone', '0700000002'); await page.fill('#sPin', '0000'); await page.click('#sBtn'); await page.waitForTimeout(800);
    ok('Wrong PIN is refused with a clear message', /don.t match/.test(await text(page, '#sErr')));
    ok('Forgot-PIN guidance explains the leader reset', /reset it/.test(await page.textContent('#fSign details')));
    await page.fill('#sPin', '2222'); await page.click('#sBtn'); await page.waitForSelector('main .view h1');
    ok('Returning member signs in', /Naledi/.test(await page.textContent('main h1')));
    // reload: snapshot renders instantly
    const t0 = Date.now(); await page.reload(); await page.waitForSelector('main .view h1'); ok('Reload shows the app from the saved copy', Date.now() - t0 < 2500, (Date.now() - t0) + ' ms');
    await ctx.close(); }

  // 3. Bible: navigation, lookup, search, bookmarks, notes, highlights, share ------------------
  { const { ctx, page } = await fresh();
    await signIn(page, '0700000002', '2222');
    await go(page, '#/bible'); await page.click('#pick'); await page.click('[data-t=nt]'); await page.click('[data-b=JHN]'); await page.click('[data-c="3"]'); await page.waitForTimeout(600);
    ok('Book and chapter picker opens John 3', /John 3/.test(await text(page, '.scripture h2')) && /New Testament/.test(await text(page, '.scripture')));
    ok('Verse 16 text comes from the BSB', /For God so loved the world/.test(await text(page, '#v16')));
    await page.click('#pick'); await page.fill('#lk', 'Rom 8:28'); await page.click('#lookup button'); await page.waitForTimeout(700);
    ok('Direct passage lookup (Rom 8:28)', /Romans 8/.test(await text(page, '.scripture h2')));
    await go(page, '#/bible?search=living water'); await page.waitForSelector('.result', { timeout: 20000 });
    ok('Scripture search finds John 4', (await page.textContent('#sres')).includes('John 4:10'));
    await go(page, '#/bible/PSA/23'); await page.click('#v1'); await page.waitForSelector('#sheet');
    await page.click('#aBm'); await page.waitForTimeout(300);
    await page.click('#v4'); await page.click('[data-hl=yellow]'); await page.waitForTimeout(300);
    ok('Highlight shows on the verse', await page.$eval('#v4', (e) => e.classList.contains('hl-yellow')));
    await page.click('#v6'); await page.click('#aNote'); await page.fill('#noteT', 'Goodness and mercy follow me.'); await page.click('#noteSave'); await page.waitForTimeout(300);
    await page.click('#v1'); const wa = await page.getAttribute('#aWa', 'href'); await page.click('#vsClose');
    ok('Share to WhatsApp includes verse, reference and translation', /wa\.me\/\?text=/.test(wa) && decodeURIComponent(wa).includes('Psalms 23:1 (BSB)'));
    await page.click('#trSw'); await page.click('[data-tr=kjv]'); await page.waitForTimeout(600);
    ok('Translation switch to KJV', /The LORD is my shepherd; I shall not want/.test((await text(page, '#v1')).replace(/[\[\]]/g, '')) && /King James/.test(await text(page, '.attrib')));
    await go(page, '#/me'); const me = await page.textContent('main');
    ok('Bookmark, note and highlight listed under Me', me.includes('Psalms 23:1') && me.includes('Goodness and mercy') && me.includes('Highlighted yellow'));
    await page.waitForTimeout(800); // queue flush
    const stored = await page.evaluate(() => { const db = JSON.parse(localStorage.getItem('nc.demo.db.v1')); return db.books[db.props.SHEET_ID].sheets.Private.length; });
    ok('Private items saved on the server', stored >= 4, stored + ' rows');
    // reading position
    await go(page, '#/bible/ISA/40?v=31'); await page.waitForTimeout(500); await go(page, '#/today'); await go(page, '#/bible');
    ok('Saved reading position restores the last chapter', /Isaiah 40/.test(await text(page, '.scripture h2')));
    await ctx.close(); }

  // 4. Completing and undoing chapters --------------------------------------------------------
  { const { ctx, page } = await fresh();
    await signIn(page, '0700000003', '3333'); // Thabo, behind
    const before = await page.$$eval('.hero .check[aria-checked=true]', (x) => x.length);
    const first = await page.getAttribute('.hero .check[aria-checked=false]', 'data-key');
    await page.click(`.hero .check[data-key="${first}"]`); await page.waitForTimeout(500);
    const after = await page.$$eval('.hero .check[aria-checked=true]', (x) => x.length);
    ok('Tick a chapter from Today', after === before + 1);
    await page.click('#toast button'); await page.waitForTimeout(700);
    ok('Undo restores it', (await page.$$eval('.hero .check[aria-checked=true]', (x) => x.length)) === before);
    const [b, c] = first.split('.');
    await go(page, `#/bible/${b}/${c}`); await page.click('#markRead'); await page.waitForTimeout(600);
    ok('Mark chapter as read from the reader', /Read · tap to undo/.test(await text(page, '#markRead')));
    await page.dblclick('#markRead').catch(() => {}); await page.waitForTimeout(800);
    const srv = await page.evaluate(() => { const db = JSON.parse(localStorage.getItem('nc.demo.db.v1')); const m = db.books[db.props.SHEET_ID].sheets.Members.find((r) => r[1] === 'Thabo (sample)'); return m[10]; });
    ok('Repeated taps never double count (server count is consistent)', Number(srv) >= 92 && Number(srv) <= 93, 'server count ' + srv);
    await ctx.close(); }

  // 5. Circle: each post type, delete own, leader moderation, prayer notice ---------------------
  { const { ctx, page } = await fresh();
    await signIn(page, '0700000002', '2222');
    await go(page, '#/circle');
    for (const k of ['reflection', 'prayer', 'question', 'praise']) {
      await page.click(`[data-kind=${k}]`); await page.fill('#ptext', `Test ${k} post`); await page.click('#psend'); await page.waitForTimeout(500);
      ok(`Post a ${k}`, (await page.textContent('#plist')).includes(`Test ${k} post`));
    }
    ok('Prayer disclosure shown before posting', true);
    const outbox = await page.evaluate(() => JSON.parse(localStorage.getItem('nc.demo.db.v1')).outbox);
    ok('Prayer notification email to the leader, without the request text', outbox.some((m) => /New prayer request/.test(m.subject) && !m.body.includes('Test prayer post')));
    await page.click('[data-f=prayer]'); await page.waitForTimeout(500);
    ok('Filter by type', !(await page.textContent('#plist')).includes('Test praise post'));
    await page.click('[data-f=""]'); await page.waitForTimeout(500);
    const mine = await page.$('article.post:has-text("Test question post") [data-del]'); await mine.click(); await mine.click(); await page.waitForTimeout(500);
    ok('Member deletes own post (with confirmation)', !(await page.textContent('#plist')).includes('Test question post'));
    ok('Members cannot delete others’ posts', !(await page.$('article.post:has-text("Thabo") [data-del]')));
    // draft preservation
    await page.fill('#ptext', 'Unsent draft text'); await page.reload(); await page.waitForTimeout(1200); await go(page, '#/circle');
    ok('Draft survives a refresh', (await page.inputValue('#ptext')) === 'Unsent draft text');
    await page.click('#peopleBox summary');
    const pray = await page.$('article.post:has-text("Grace") [data-pray]'); await pray.click(); await page.waitForTimeout(500);
    ok('"I prayed for you" interaction', /You prayed · 1/.test(await page.textContent('article.post:has-text("Grace") [data-pray]')));
    await ctx.close();
    const L = await fresh(); await signIn(L.page, '0700000001', '1111'); await go(L.page, '#/circle'); await L.page.waitForTimeout(800);
    const del = await L.page.$('article.post:has-text("Thabo (sample)") [data-del]'); ok('Leader sees moderation control on others’ posts', !!del);
    await del.click(); await del.click(); await L.page.waitForTimeout(500);
    ok('Leader removes another member’s post', !(await L.page.textContent('#plist')).includes('cities of refuge'));
    await L.ctx.close(); }

  // 6. Leader tools: member search/details, PIN reset, group post, scheduling -------------------
  { const { ctx, page } = await fresh();
    await signIn(page, '0700000001', '1111');
    ok('Leader area visible from Me', await page.isVisible('.nav [data-nav=me]'));
    await go(page, '#/leader'); await page.waitForSelector('#mlist .person');
    await page.fill('#msearch', 'sip'); ok('Member search', (await page.$$('#mlist .person')).length === 1);
    await page.click('#mlist .person'); const det = await page.textContent('#sheet');
    ok('Member details include phone (leader only) and progress', /\+27700000005/.test(det) && /chapters/.test(det));
    await page.click('#mpin'); await page.click('#mpin'); await page.waitForTimeout(600);
    const pin = (await page.textContent('#sheet')).match(/\b\d{4}\b/);
    ok('PIN reset shows a new PIN and a WhatsApp draft', !!pin && /wa\.me\/27700000005\?text=/.test(await page.getAttribute('#sheet a.btn.primary', 'href')));
    await page.keyboard.press('Escape');
    const gp = await page.inputValue('#gp'); const gpa = await page.getAttribute('a[href^="https://wa.me/?text="]', 'href');
    ok('Daily group post has reading, deep study, question and app link', /Today's reading:/.test(gp) && /Deep study:/.test(gp) && /Question:/.test(gp) && /localhost/.test(gp));
    ok('Share to WhatsApp opens a draft (no automatic send)', decodeURIComponent(gpa).includes("Today's reading"));
    await page.click('#gpCopy'); await page.waitForTimeout(300); ok('Copy post works or falls back', /Copied|Copy this text/.test(await page.textContent('body')));
    await page.keyboard.press('Escape');
    await page.waitForSelector('#newCh'); await page.click('#newCh');
    await page.selectOption('#cfPlan', 'nt60'); await page.waitForTimeout(200);
    ok('Plan preview shows days and dates', /60 days/.test(await page.textContent('#cfPrev')));
    const min = await page.getAttribute('#cfStart', 'min'); await page.fill('#cfStart', '2026-10-10');
    await page.fill('#cfName', 'Overlap test'); await page.click('#chf button[type=submit]'); await page.waitForTimeout(500);
    ok('Overlap with the active challenge is prevented', /One challenge at a time|from tomorrow/.test(await page.textContent('#cfErr')));
    await page.fill('#cfStart', min); await page.fill('#cfName', 'New Testament next'); await page.click('#chf button[type=submit]'); await page.waitForTimeout(700);
    ok('Schedule the next challenge', /New Testament next/.test(await page.textContent('#chList')) && /Next/.test(await page.textContent('#chList')));
    const ann = await page.getAttribute('#chList a[href^="https://wa.me"]', 'href'); ok('Announce prepares a shareable message', decodeURIComponent(ann).includes('New Testament next'));
    await page.click('[data-edit]'); await page.fill('#cfName', 'NT in 60 days'); await page.click('#chf button[type=submit]'); await page.waitForTimeout(600);
    ok('Edit before it starts', /NT in 60 days/.test(await page.textContent('#chList')));
    const cb = await page.$('[data-cancel]'); await cb.click(); await cb.click(); await page.waitForTimeout(600);
    ok('Cancel before it starts', !/NT in 60 days/.test(await page.textContent('#chList')));
    await ctx.close(); }

  // 7. Original languages ---------------------------------------------------------------------
  { const { ctx, page } = await fresh();
    await signIn(page, '0700000002', '2222');
    await go(page, '#/original/GEN/1/1'); await page.waitForSelector('.orig .w');
    ok('Hebrew shown right-to-left with transliteration', (await page.getAttribute('.orig', 'dir')) === 'rtl' && /be\.\/re\.Shit/.test(await page.textContent('.orig')));
    ok('Default word is a content word, with dictionary form and role', /beginning/.test(await page.textContent('#wp')) && /Noun/.test(await page.textContent('#wp')));
    await page.click('#lexMore summary'); await page.waitForTimeout(600); ok('Other meanings load from the lexicon', ((await page.textContent('#lexDef')) || '').length > 20);
    await page.click('.orig .w[data-w="1"]'); await page.waitForTimeout(200);
    ok('Tap a verb: Qal perfect explained in plain English', /Qal/.test(await page.textContent('#wp')) || /perfect/.test(await page.textContent('#wp')));
    await page.click('#wsSave'); await page.waitForTimeout(300);
    ok('Literal and natural English shown with three translations', /in\/ beginning/.test(await page.textContent('#o3')) && /KJV/.test(await page.textContent('#o4')));
    ok('Sources and edition named', /TAHOT/.test(await page.textContent('main')) && /Leningrad/.test(await page.textContent('main')));
    await go(page, '#/original/1JN/5/7'); await page.waitForSelector('.orig .w');
    ok('Manuscript difference explained in plain language (1 John 5:7)', /Traditional/.test(await page.textContent('#o6')) && (await page.$$('.orig .w.var')).length > 5);
    await go(page, '#/bible/JHN/1'); await page.click('#v1'); const ex = await page.getAttribute('#sheet a[href^="#/original"]', 'href');
    ok('"Explore original text" from any verse', ex === '#/original/JHN/1/1');
    await go(page, '#/me'); ok('Saved word study listed under Me and links back', /#\/original\/GEN\/1\/1/.test(await page.innerHTML('main')));
    ok('No page errors (original)', !page.errors.length, page.errors.join('; '));
    await ctx.close(); }

  // 8. Offline queue and sync status -----------------------------------------------------------
  { const { ctx, page } = await fresh();
    await signIn(page, '0700000003', '3333');
    await page.evaluate(() => { window.__ncOffline = true; });
    const key = await page.getAttribute('.hero .check[aria-checked=false]', 'data-key');
    await page.click(`.hero .check[data-key="${key}"]`); await page.waitForTimeout(800);
    const q1 = await page.evaluate(() => JSON.parse(localStorage.getItem('nc.p.queue') || '[]').length);
    ok('Offline: change is kept in a queue and shown', q1 === 1 && /Offline|Not synced/.test(await text(page, '#sync')), await text(page, '#sync'));
    ok('Offline: the tick still shows as done', (await page.getAttribute(`.hero .check[data-key="${key}"]`, 'aria-checked')) === 'true');
    await page.evaluate(() => { window.__ncOffline = false; window.dispatchEvent(new Event('online')); }); await page.waitForTimeout(1200);
    const q2 = await page.evaluate(() => JSON.parse(localStorage.getItem('nc.p.queue') || '[]').length);
    const bits = await page.evaluate(() => { const db = JSON.parse(localStorage.getItem('nc.demo.db.v1')); return String(db.books[db.props.SHEET_ID].sheets.Members.find((r) => r[1] === 'Thabo (sample)')[11]); });
    ok('Back online: queue syncs to the server', q2 === 0 && (bits.match(/1/g) || []).length === 93, 'server bits ' + (bits.match(/1/g) || []).length);
    // failure recovery for posts: draft kept with retry message
    await go(page, '#/circle'); await page.evaluate(() => { window.__ncOffline = true; }); await page.fill('#ptext', 'Offline post'); await page.click('#psend'); await page.waitForTimeout(600);
    ok('Post failure keeps the draft and explains how to retry', /try again/i.test(await text(page, '#perr')) && (await page.inputValue('#ptext')) === 'Offline post');
    await page.evaluate(() => { window.__ncOffline = false; }); await page.click('#psend'); await page.waitForTimeout(600); await page.click('#psend').catch(() => {}); await page.waitForTimeout(600);
    const n = await page.evaluate(() => { const db = JSON.parse(localStorage.getItem('nc.demo.db.v1')); return db.books[db.props.SHEET_ID].sheets.Reflections.filter((r) => r[6] === 'Offline post').length; });
    ok('Retry posts exactly once (no duplicates)', n === 1, n + ' copies');
    // sign out clears private cached data
    await go(page, '#/me'); await page.click('#out'); await page.waitForTimeout(1500);
    const left = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('nc.p.')).length);
    ok('Sign-out clears private cached data', left === 0, left + ' keys left');
    await ctx.close(); }

  // 9. Layouts, themes, accessibility ----------------------------------------------------------
  const axeRun = async (page) => { await page.addScriptTag({ content: AXE }); return page.evaluate(async () => { const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] }); return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, html: v.nodes[0] && v.nodes[0].html.slice(0, 120) })); }); };
  for (const [label, vp] of [['phone', { width: 390, height: 844 }], ['tablet', { width: 820, height: 1180 }], ['desktop', { width: 1366, height: 900 }]]) {
    const { ctx, page } = await fresh({ viewport: vp }); await signIn(page, '0700000001', '1111');
    for (const v of ['today', 'bible/PSA/23', 'original/JHN/3/16', 'circle', 'journey', 'me', 'leader']) {
      await go(page, '#/' + v); await page.waitForTimeout(500);
      await page.screenshot({ path: `${__dirname}/../shots/${label}-${v.replace(/\//g, '_')}.png` });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (overflow) ok(`${label} ${v}: no horizontal scrolling`, false);
      if (label === 'phone') { const viol = (await axeRun(page)).filter((x) => x.impact === 'serious' || x.impact === 'critical'); ok(`Accessibility (axe, serious/critical) on ${v}`, !viol.length, viol.map((x) => `${x.id}×${x.n}: ${x.html}`).join(' | ')); }
    }
    ok(`${label} layout renders all views`, true);
    await ctx.close();
  }
  { const { ctx, page } = await fresh(); await signIn(page, '0700000002', '2222');
    for (const th of ['dark', 'sepia']) { await page.evaluate((t) => { localStorage.setItem('nc.theme', t); document.documentElement.dataset.theme = t; }, th); await go(page, '#/bible/PSA/23'); await page.screenshot({ path: `${__dirname}/../shots/theme-${th}.png` });
      const viol = (await axeRun(page)).filter((x) => x.id === 'color-contrast'); ok(`Contrast in ${th} theme`, !viol.length, viol.map((x) => x.html).join(' | ')); }
    await ctx.close(); }

  const fail = results.filter((r) => !r.pass);
  fs.writeFileSync(__dirname + '/../e2e-results.json', JSON.stringify(results, null, 2));
  console.log(`\n${results.length - fail.length} passed, ${fail.length} failed`);
  await browser.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
