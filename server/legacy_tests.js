const fs=require('fs'),crypto=require('crypto');
let sheets={}, mails=[], props={}, cache={}; let NOW="2026-10-04";
function mkSheet(name){ const rows=[]; return {name,rows,appendRow(r){rows.push(r.slice())},setFrozenRows(){},getLastRow(){return rows.length},
  getDataRange(){return{getValues:()=>rows.map(r=>r.slice())}},getMaxRows(){return 1000},
  getRange(row,col,nr,nc){return{setValues(v){v.forEach((rr,i)=>{rows[row-1+i]=rows[row-1+i]||[];rr.forEach((x,j)=>rows[row-1+i][col-1+j]=x);})},setValue(x){(rows[row-1]=rows[row-1]||[])[col-1]=x},
    getValues(){const out=[];for(let i=0;i<(nr||1);i++){const r=rows[row-1+i]||[];out.push(Array.from({length:nc||1},(_,j)=>r[col-1+j]===undefined?'':r[col-1+j]));}return out;},setNumberFormat(){}}},
  deleteRow(i){rows.splice(i-1,1)}};}
const ss={getId:()=>"S1",getUrl:()=>"url",getSheetByName:n=>sheets[n]||null,insertSheet:n=>(sheets[n]=mkSheet(n)),getSheets:()=>Object.values(sheets),deleteSheet(){}};
global.SpreadsheetApp={create:()=>ss,openById:(id)=>id==='S1'?ss:{getSheets:()=>[mkSheet('x')]}};
global.PropertiesService={getScriptProperties:()=>({getProperty:k=>props[k],setProperty:(k,v)=>props[k]=v,deleteProperty:k=>{delete props[k]}})};
global.CacheService={getScriptCache:()=>({get:k=>cache[k],put:(k,v)=>cache[k]=v,removeAll:ks=>ks.forEach(k=>delete cache[k]),remove:k=>delete cache[k]})};
global.ContentService={MimeType:{ICAL:'ical'},createTextOutput:t=>({t,setMimeType(){return this},downloadAsFile(){return this}})};
global.LockService={getScriptLock:()=>({waitLock(){},tryLock(){return true},releaseLock(){}})};
global.MailApp={sendEmail:(to,s,b)=>mails.push([s,b])};
global.Session={getEffectiveUser:()=>({getEmail:()=>"u@x"})};
global.Logger={log(){}};
global.ScriptApp={getService:()=>({getUrl:()=>'https://x/exec'}),getProjectTriggers:()=>[],newTrigger:()=>({timeBased:()=>({atHour:()=>({everyDays:()=>({inTimezone:()=>({create(){}})})})})})};
global.Utilities={formatDate:(d,tz,f)=>tz==='UTC'?(f==='yyyy-MM-dd'?d.toISOString().slice(0,10):d.toISOString().replace(/[-:]/g,'').slice(0,15)+'Z'):(f.indexOf('HH')>=0?NOW+' 10:00':NOW),
  computeDigest:(a,s)=>[...crypto.createHash('sha256').update(s).digest()],base64Encode:b=>Buffer.from(b).toString('base64'),getUuid:()=>crypto.randomUUID(),DigestAlgorithm:{SHA_256:1}};
global.HtmlService={};
let src=fs.readFileSync('/tmp/claude-0/nc2/server/Code.gs','utf8');
eval(src.replace(/^const /gm,'var ').replace(/^function (\w+)/gm,'global.$1 = function $1'));
const A=(c,m)=>{ if(!c) throw new Error('ASSERT '+m); console.log('ok -',m); };
setup();
['bible93','gospels30','nt60','pp31','advent24'].forEach(id=>{const p=plan_(id);console.log(id,'days',p.n,'total',p.total,'sections',JSON.stringify(p.sections))});
A(plan_('bible93').total===1189&&plan_('bible93').n===93,'bible93 1189/93');
A(plan_('gospels30').total===89,'gospels 89');A(plan_('nt60').total===260,'nt 260');A(plan_('pp31').total===181,'pp 181');
NOW='2026-09-23';
NOW='2026-10-04';
const u=apiJoin("Uhuru","0820000000","1111").token; const t=apiJoin("Thandi","0821234567","2222").token; setLeaderByPhone("0820000000");
let su=apiState(u); A(su.challenge.id==='nc93'&&su.circle.length===2&&su.next===null,'nc93 current, 2 members');
A(apiPing().current.id==='nc93'&&apiPing().current.link===undefined,'ping current without link');
try{apiCreateChallenge(t,{plan:'gospels30',start:'2027-01-05'});A(false,'')}catch(e){A(/Leader/.test(e.message),'member cannot create')}
try{apiCreateChallenge(u,{plan:'gospels30',start:'2026-11-01'});A(false,'')}catch(e){A(/One challenge at a time/.test(e.message),'cannot overlap current: '+e.message)}
let list=apiCreateChallenge(u,{plan:'gospels30',name:'Gospels in January',start:'2027-01-04'});
const g=list.find(c=>c.plan==='gospels30'); A(g.role==='next'&&g.end==='2027-02-02','scheduled next, ends 2 Feb');
try{apiCreateChallenge(u,{plan:'nt60',start:'2027-03-01'});A(false,'')}catch(e){A(/already scheduled/.test(e.message),'only one scheduled')}
let st=apiState(t); A(st.next&&st.next.id===g.id&&st.challenge.id==='nc93','member sees next card');
apiSave(t,'1'.repeat(30),undefined,'nc93'); A(apiState(t).me.ch===30,'nc93 save');
// time passes: Christmas, then Gospels begin
NOW='2026-12-30'; st=apiState(t); A(st.challenge.id==='nc93'&&st.next.id===g.id,'gap: nc93 still shown with next');
NOW='2027-01-04'; st=apiState(t); A(st.challenge.id===g.id&&st.me.ch===0&&st.circle.length===2,'auto moved into gospels, fresh progress, circle 2');
A(st.past.length===1&&st.past[0].id==='nc93'&&st.past[0].pct>0,'past shows nc93 pct');
const n=apiJoin("Sipho","0831112222","3333").token; A(apiState(n).challenge.id===g.id&&apiState(u).circle.length===3,'new joiner lands in gospels');
let r=apiSave(n,'1'.repeat(3),undefined,g.id); A(r.ch===3,'save in gospels');
A(apiLeader(u,g.id).length===3,'leader sees 3');
apiPost(t,'reflection','Gospel thought',1,g.id); A(apiState(t).reflections.length===1,'reflection in current');
const sid=apiState(n).me.id; apiMarkNudged(u,sid,g.id); A(apiLeader(u,g.id).find(m=>m.name==='Sipho').nudged==='2027-01-04','nudge');
list=apiCreateChallenge(u,{plan:'pp31',start:'2027-02-10'}); const pp=list.find(c=>c.plan==='pp31'); A(pp.role==='next','schedule after gospels');
list=apiCancelChallenge(u,pp.id); A(!list.find(c=>c.id===pp.id),'cancelled hidden');
apiRemove(u,sid); A(apiLeader(u,g.id).length===2,'removed');
dailyDigest(); console.log(mails.slice(-1)[0][0]);
global.HtmlService={createTemplateFromFile:()=>({evaluate(){ return {by:this.by,setTitle(){return this},addMetaTag(){return this},setXFrameOptionsMode(){return this}}; }}),XFrameOptionsMode:{ALLOWALL:1}};
const tid=apiState(t).me.id; A(doGet({parameter:{by:tid}}).by==='Thandi'&&doGet({parameter:{by:'zzz'}}).by==='','doGet inviter name');
console.log('ALL OK');
