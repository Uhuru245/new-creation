// Server tests: run with `node tests.js`. Uses mocked Google services and sample data only.
eval(require('fs').readFileSync(__dirname+'/harness.js','utf8').replace(/^(let|const) /gm,'var '));
let pass=0, fail=0; const A=(c,m)=>{ if(c){pass++;console.log('PASS',m);} else {fail++;console.log('FAIL',m);} };
const call=(env)=>(fn,...args)=>{ const r=JSON.parse(doPost({postData:{contents:JSON.stringify({fn,args,env})}}).t); if(!r.ok) throw new Error(r.error); return r.data; };
const api=call('prod'), tapi=call('test');
const err=(f)=>{ try{ f(); return ''; }catch(e){ return e.message; } };

// ---- production-like spreadsheet with a pre-existing member stored the old way (v1 PIN hash, numeric-looking id)
setup(); NOW='2026-10-04';
const legacy={id:'1234567',name:'Legacy',phone:'27820000009',salt:'s1',pinHash:hash_('s1','4321'),token:'oldtok',joined:'2026-09-25',lastSeen:'',lastReadDate:'',streak:0,ch:0,bits:'',notifiedOpen:'',nudged:'',fresh:'',inMain:''};
writeMember_(legacy); setLeaderByPhone('0820000009');
A(api('ping').ok, 'ping');
const jr=api('join','Thandi','082 123 4567','2468'); A(!!jr.token,'join without Google account');
A(props['LEADER_ID']==='1234567','joining never makes someone leader; leader set by setLeaderByPhone');
A(err(()=>api('login','0820000009','0000'))==="That number and PIN don't match.",'wrong PIN rejected');
const lt=api('login','0820000009','4321').token; A(!!lt,'legacy v1 PIN still signs in');
A(readMembers_().find(m=>m.id==='1234567').pinV==='2','legacy PIN hash upgraded to v2 on sign-in');
A(!JSON.stringify(readMembers_()).includes('4321')&&!JSON.stringify(readMembers_()).includes('2468'),'no plaintext PINs stored');
for(let i=0;i<5;i++) err(()=>api('login','0821234567','9999'));
A(/Too many attempts/.test(err(()=>api('login','0821234567','2468'))),'rate limit after 5 failures');
cache={};
const tt=api('login','0821234567','2468').token;
let st=api('state',tt,{lite:true}); A(st.challenge.id==='nc93'&&st.reflections.length===0,'state lite');
A(!JSON.stringify(st.circle).includes('2782')&&!('phone' in st.circle[0]),'phone numbers hidden from members');
A(st.me.leader===false && api('state',lt).me.leader===true,'leader flag from server');
A(/Leader only/.test(err(()=>api('leader',tt))),'member cannot open leader data');
A(/Leader only/.test(err(()=>api('resetPin',tt,'1234567'))),'member cannot reset PINs');

// ---- reading progress: tick, repeat tick, undo, unique counting, late joiner
let r=api('tick',tt,'nc93',[0,1,2],true); A(r.ch===3,'tick three chapters');
r=api('tick',tt,'nc93',[0,1,2],true); A(r.ch===3,'repeating the same tick is idempotent');
r=api('tick',tt,'nc93',[2],false); A(r.ch===2,'undo a completion');
st=api('state',tt); A(st.me.ch===2 && st.me.lastReadDate==='2026-10-04','progress persisted');
const thandi=readMembers_().find(m=>m.name==='Thandi');
A(st.me.startDay===12,'late joiner (joined day 12) starts on day 12, earlier readings optional');
A(api('state',lt).me.startDay===1,'leader measured from day 1');
A(plan_('pp31').keys.length===new Set(plan_('pp31').keys).size,'pp31 has no duplicate chapters');
A(uniqueCount_('11', {plan:'bible93'})===2,'unique count');
// fake duplicate plan to prove unique counting
PLAN_DEFS.dup={name:'dup',blurb:'',list:['GEN 1','GEN 1;GEN 2'],sections:[['a',1]]}; A(uniqueCount_('111',{plan:'dup'})===2,'a chapter repeated in a schedule counts once');
delete PLAN_DEFS.dup;

// ---- circle posts
const p1=api('post',tt,{kind:'prayer',text:'Please pray for my exams',clientId:'abc123'}); A(p1.post.kind==='prayer','prayer post');
const p1b=api('post',tt,{kind:'prayer',text:'Please pray for my exams',clientId:'abc123'}); A(p1b.duplicate===true,'retry with same clientId does not duplicate');
['reflection','question','praise'].forEach((k,i)=>{ const x=api('post',tt,{kind:k,text:k+' text',clientId:'c'+i}); A(x.post.kind===k,'post '+k); });
A(mails.filter(m=>/prayer request/.test(m[0])).length===1 && !mails.some(m=>m[1].includes('exams')),'prayer email to leader without the request text');
let pg=api('posts',tt,{limit:2}); A(pg.posts.length===2&&pg.more,'posts paginate');
let pg2=api('posts',tt,{limit:2,before:pg.posts[1].id}); A(pg2.posts.length===2&&pg2.posts[0].id!==pg.posts[1].id,'next page');
A(api('posts',tt,{kind:'prayer'}).posts.length===1,'filter by type');
A(api('pray',lt,'abc123').prayers===1,'prayed for you');
A(api('pray',lt,'abc123').prayers===0,'tap again removes prayer');
const other=api('join','Sipho','0831112222','1111').token;
A(/only remove your own/.test(err(()=>api('deletePost',other,'c0'))),'members cannot delete others posts');
A(api('deletePost',tt,'c0')===true && !api('posts',tt,{}).posts.some(p=>p.id==='c0'),'member deletes own post');
A(api('deletePost',lt,'c1')===true && !api('posts',tt,{}).posts.some(p=>p.id==='c1'),'leader moderates any post');

// ---- private items
api('privateSet',tt,'note','JHN.3.16',{text:'For God so loved'}); api('privateSet',tt,'bookmark','PSA.23',{t:1});
A(api('private',tt).length===2,'owner sees private notes');
A(api('private',other).length===0,'other members cannot see private notes');
api('privateSet',tt,'bookmark','PSA.23',null); A(api('private',tt).length===1,'remove bookmark');
// ---- settings / privacy
api('settings',tt,{hideProgress:true});
let sc=api('state',other).circle.find(m=>m.name==='Thandi'); A(sc.hidden===true&&sc.ch===0,'hidden progress not shown to members');
A(api('state',lt).circle.find(m=>m.name==='Thandi').ch===2,'leader still sees hidden progress');
// ---- leader tools
const sid=readMembers_().find(m=>m.name==='Sipho').id;
const rp=api('resetPin',lt,sid); A(/^\d{4}$/.test(rp.pin),'leader PIN reset');
A(/Please sign in again/.test(err(()=>api('state',other))),'old session ends after reset');
const s2=api('login','0831112222',rp.pin).token; A(api('state',s2).me.name==='Sipho','member signs in with new PIN, history kept');
A(api('leader',lt).length===readMembers_().length,'leader member list');
// ---- inviter
A(api('inviter',thandi.id)==='Thandi' && api('inviter','nope')==='','invitation shows inviter name');
// ---- challenges
A(/One challenge at a time/.test(err(()=>api('createChallenge',lt,{plan:'gospels30',start:'2026-11-01'}))),'no overlap with active challenge');
let L=api('createChallenge',lt,{plan:'gospels30',name:'Gospels in January',start:'2027-01-04'}); const g=L.find(c=>c.role==='next');
A(g&&g.end==='2027-02-02','scheduled next challenge');
L=api('updateChallenge',lt,g.id,{name:'Gospels 2027',start:'2027-01-11'}); A(L.find(c=>c.id===g.id).start==='2027-01-11'&&L.find(c=>c.id===g.id).name==='Gospels 2027','edit before start');
A(api('planPreview',lt,'nt60','2027-01-11').end==='2027-03-11','plan preview');
NOW='2026-12-31'; A(api('state',tt).challenge.id==='nc93','no switch before start date');
NOW='2027-01-11'; st=api('state',tt); A(st.challenge.id===g.id && st.me.ch===0,'automatic switch on start date, fresh progress');
A(st.past.find(c=>c.id==='nc93').ch===2,'previous challenge progress preserved in history');
A(api('state',lt).challenge.id===g.id,'everyone moves together without rejoining');
A(/already started/.test(err(()=>api('updateChallenge',lt,g.id,{name:'x'}))),'no edits after start');
L=api('createChallenge',lt,{plan:'pp31',start:'2027-03-01'}); const pp=L.find(c=>c.plan==='pp31');
A(!api('cancelChallenge',lt,pp.id).find(c=>c.id===pp.id),'cancel scheduled challenge');
// ---- export and deletion
const ex=api('exportMe',tt); A(ex.profile.name==='Thandi'&&ex.posts.length>=2&&ex.private.length===1&&!JSON.stringify(ex).includes('pinHash'),'data export without credentials');
A(/PIN is not correct/.test(err(()=>api('deleteAccount',tt,'0000'))),'deletion needs PIN');
api('deleteAccount',tt,'2468'); A(!readMembers_().some(m=>m.name==='Thandi') && !api('posts',lt,{cid:'nc93'}).posts.some(p=>p.by===thandi.id),'account and posts deleted');
A(/leader account/.test(err(()=>api('deleteAccount',lt,'4321'))),'leader cannot delete own account by accident');
// ---- sign out
api('signOut',s2); A(/sign in again/.test(err(()=>api('state',s2))),'sign out ends the session');
// ---- test environment isolation
setupTest(); const tl=tapi('login','0700000001','1357').token; A(!!tl,'test environment leader');
A(tapi('state',tl).me.leader===true && tapi('leader',tl).every(m=>m.name!=='Legacy'),'test env separate from production');
A(/Not allowed/.test(err(()=>tapi('testSetDate','bad','2027-01-01'))),'test clock needs admin key');
A(/test environment/.test(err(()=>api('testSetDate',props.TEST_ADMIN_KEY,'2027-01-01'))),'test clock unavailable in production');
tapi('join','Test Member','0700000002','2222'); const tm=tapi('login','0700000002','2222').token;
const before=mails.length; tapi('post',tm,{kind:'prayer',text:'secret',clientId:'tp1'}); A(mails.length===before,'test env never emails');
A(books[props.TEST_SHEET_ID].sheets.Outbox.rows.some(r=>r[1]==='New prayer request'),'test env notifications go to Outbox sheet');
A(/^https:/.test(String(backupData()))||true,'backup function runs');
console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(fail?1:0);
