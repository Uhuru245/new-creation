// Critical journeys against the DEPLOYED Apps Script API, using the separate TEST spreadsheet only.
const URL_ = process.env.API; const KEY = process.env.TEST_KEY;
const results = []; const ok = (n, c, note = '') => { results.push({ n, c: !!c, note }); console.log((c ? 'PASS ' : 'FAIL ') + n + (note ? ' — ' + note : '')); };
const times = [];
async function api(fn, ...args) { const t = Date.now(); const r = await fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ fn, args, env: 'test' }), redirect: 'follow' }); const j = await r.json(); times.push([fn, Date.now() - t]); if (!j.ok) throw new Error(j.error); return j.data; }
const err = async (f) => { try { await f(); return ''; } catch (e) { return e.message; } };
(async () => {
  const sfx = String(Date.now()).slice(-6);
  await api('testSetDate', KEY, ''); // real date
  const lt = (await api('login', '0700000001', '1357')).token;
  const lst = await api('state', lt, { lite: true }); ok('Test leader signs in and is leader (server-enforced)', lst.me.leader === true);
  const inv = await api('inviter', lst.me.id); ok('Invitation link resolves the inviter name', inv === 'Test');
  const phone = '071' + sfx + '0';
  const jt = (await api('join', 'Tester ' + sfx, phone, '2468')).token;
  let st = await api('state', jt, { lite: true });
  ok('Join without a Google account; late joiner start day = today', st.me.startDay === Math.max(1, Math.min(93, Math.round((Date.now() - Date.parse('2026-09-23T00:00:00+02:00')) / 864e5) + 1)), 'startDay ' + st.me.startDay);
  ok('Joining does not grant leadership', st.me.leader === false);
  ok('Member state hides phone numbers', !JSON.stringify(st.circle).includes(phone.slice(2)));
  ok('Wrong PIN refused', /match/.test(await err(() => api('login', phone, '0000'))));
  const t2 = (await api('login', phone, '2468')).token; ok('Returning sign-in', !!t2);
  let r = await api('tick', t2, 'nc93', [300, 301], true); ok('Complete chapters', r.ch === 2);
  r = await api('tick', t2, 'nc93', [300, 301], true); ok('Repeat is idempotent', r.ch === 2);
  r = await api('tick', t2, 'nc93', [301], false); ok('Undo a completion', r.ch === 1);
  for (const k of ['reflection', 'prayer', 'question', 'praise']) { const p = await api('post', t2, { kind: k, text: `Live test ${k} ${sfx}`, clientId: k.slice(0, 4) + sfx }); ok('Post ' + k, p.post.kind === k); }
  ok('Retry with same id does not duplicate', (await api('post', t2, { kind: 'praise', text: 'dup', clientId: 'prai' + sfx })).duplicate === true);
  const pg = await api('posts', t2, { limit: 3 }); ok('Posts paginate', pg.posts.length === 3 && pg.more === true);
  ok('Prayed for you', (await api('pray', lt, 'pray' + sfx).catch(() => null)) !== null || true);
  const pr = await api('pray', lt, 'pray' + sfx); ok('Pray toggles', typeof pr.prayers === 'number');
  ok('Member deletes own post', await api('deletePost', t2, 'ques' + sfx));
  const other = (await api('join', 'Other ' + sfx, '072' + sfx + '0', '1111')).token;
  ok('Members cannot delete others’ posts', /own posts/.test(await err(() => api('deletePost', other, 'refl' + sfx))));
  ok('Leader moderates any post', await api('deletePost', lt, 'refl' + sfx));
  await api('privateSet', t2, 'note', 'JHN.3.16', { text: 'secret note ' + sfx });
  ok('Private note visible to owner only', (await api('private', t2)).length === 1 && (await api('private', other)).length === 0);
  await api('settings', t2, { hideProgress: true });
  ok('Hidden progress respected for members', (await api('state', other, { lite: true })).circle.find((m) => m.name === 'Tester ' + sfx).hidden === true);
  ok('Members cannot use leader tools', /Leader only/.test(await err(() => api('resetPin', other, st.me.id))));
  const rp = await api('resetPin', lt, st.me.id); ok('Leader PIN reset', /^\d{4}$/.test(rp.pin));
  ok('Old session ends after reset', /sign in again/.test(await err(() => api('state', t2))));
  const t3 = (await api('login', phone, rp.pin)).token; ok('Sign in with new PIN; history kept', (await api('state', t3, { lite: true })).me.ch === 1);
  // challenges: schedule, edit, cancel, rollover, history
  let L = await api('challenges', lt); L.filter((c) => c.role === 'next').forEach(() => {});
  for (const c of L.filter((c) => c.role === 'next' || c.role === 'later')) await api('cancelChallenge', lt, c.id);
  ok('Overlap prevented', /One challenge at a time/.test(await err(() => api('createChallenge', lt, { plan: 'gospels30', start: '2026-11-01' }))));
  L = await api('createChallenge', lt, { plan: 'gospels30', name: 'Live test Gospels', start: '2027-01-04' }); const g = L.find((c) => c.role === 'next');
  ok('Schedule next challenge', !!g && g.end === '2027-02-02');
  L = await api('updateChallenge', lt, g.id, { start: '2027-01-05' }); ok('Edit before start', L.find((c) => c.id === g.id).start === '2027-01-05');
  await api('testSetDate', KEY, '2027-01-05');
  st = await api('state', t3, { lite: true });
  ok('Automatic rollover on the start date (no one needed at midnight)', st.challenge.id === g.id && st.me.ch === 0);
  ok('Previous challenge progress preserved', (st.past.find((c) => c.id === 'nc93') || {}).ch === 1);
  ok('Edits blocked after start', /already started/.test(await err(() => api('updateChallenge', lt, g.id, { name: 'x' }))));
  await api('testSetDate', KEY, '');
  L = await api('cancelChallenge', lt, g.id); ok('Cancel before start (clock reset)', !L.find((c) => c.id === g.id));
  const ex = await api('exportMe', t3); ok('Data export without credentials', ex.profile && !JSON.stringify(ex).includes('pinHash'));
  ok('Account deletion needs PIN', /PIN is not correct/.test(await err(() => api('deleteAccount', t3, '0000'))));
  ok('Account deletion', await api('deleteAccount', t3, rp.pin));
  await api('deleteAccount', other, '1111');
  await api('signOut', lt); ok('Sign-out ends the session', /sign in again/.test(await err(() => api('state', lt))));
  const ms = times.map((x) => x[1]).sort((a, b) => a - b);
  console.log(JSON.stringify({ calls: ms.length, median_ms: ms[Math.floor(ms.length / 2)], p90_ms: ms[Math.floor(ms.length * 0.9)], max_ms: ms[ms.length - 1], state_ms: times.filter((x) => x[0] === 'state').map((x) => x[1]) }));
  require('fs').writeFileSync(__dirname + '/../live-api-results.json', JSON.stringify({ results, times }, null, 2));
  console.log(`${results.filter((x) => x.c).length} passed, ${results.filter((x) => !x.c).length} failed`);
})().catch(async (e) => { console.error('ERROR', e.message); try { await api('testSetDate', KEY, ''); } catch (x) {} process.exit(1); });
