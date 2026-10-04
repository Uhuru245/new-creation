const fs=require('fs'),crypto=require('crypto');
let sheets={}, mails=[], props={}, cache={}; var NOW="2026-10-04";
function mkSheet(name){ const rows=[]; return {name,rows,appendRow(r){rows.push(r.slice())},setFrozenRows(){},getLastRow(){return rows.length},
  getDataRange(){return{getValues:()=>rows.map(r=>r.slice())}},getMaxRows(){return 1000},
  getRange(row,col,nr,nc){return{setValues(v){v.forEach((rr,i)=>{rows[row-1+i]=rows[row-1+i]||[];rr.forEach((x,j)=>rows[row-1+i][col-1+j]=x);})},setValue(x){(rows[row-1]=rows[row-1]||[])[col-1]=x},
    getValues(){const out=[];for(let i=0;i<(nr||1);i++){const r=rows[row-1+i]||[];out.push(Array.from({length:nc||1},(_,j)=>r[col-1+j]===undefined?'':r[col-1+j]));}return out;},setNumberFormat(){}}},
  deleteRow(i){rows.splice(i-1,1)}};}
const books={}; let bookN=0; function mkBook(name){ const id='S'+(++bookN); const sh={}; const b={name,sheets:sh,getId:()=>id,getUrl:()=>'url/'+id,getSheetByName:n=>sh[n]||null,insertSheet:n=>(sh[n]=mkSheet(n)),getSheets:()=>Object.values(sh),deleteSheet(){},copy:(nm)=>{const c=mkBook(nm); Object.keys(sh).forEach(k=>{const m=mkSheet(k); sh[k].rows.forEach(r=>m.rows.push(r.slice())); c.sheets[k]=m;}); return c;}}; books[id]=b; return b; }
global.SpreadsheetApp={create:(n)=>mkBook(n),openById:(id)=>{ if(books[id]) return books[id]; const b={getSheets:()=>[mkSheet('x')]}; return b; }};
global.PropertiesService={getScriptProperties:()=>({getProperty:k=>props[k],setProperty:(k,v)=>props[k]=v,deleteProperty:k=>{delete props[k]}})};
global.CacheService={getScriptCache:()=>({get:k=>cache[k],put:(k,v)=>cache[k]=v,removeAll:ks=>ks.forEach(k=>delete cache[k]),remove:k=>delete cache[k]})};
global.ContentService={MimeType:{ICAL:'ical',JSON:'json'},createTextOutput:t=>({t,setMimeType(){return this},downloadAsFile(){return this}})};
global.LockService={getScriptLock:()=>({waitLock(){},tryLock(){return true},releaseLock(){}})};
global.MailApp={sendEmail:(to,s,b)=>mails.push([s,b])};
global.Session={getEffectiveUser:()=>({getEmail:()=>"u@x"})};
global.Logger={log(){}};
global.ScriptApp={getService:()=>({getUrl:()=>'https://x/exec'}),getProjectTriggers:()=>[],newTrigger:()=>({timeBased:()=>({atHour:()=>({everyDays:()=>({inTimezone:()=>({create(){}})})})})})};
global.Utilities={formatDate:(d,tz,f)=>tz==='UTC'?(f==='yyyy-MM-dd'?d.toISOString().slice(0,10):d.toISOString().replace(/[-:]/g,'').slice(0,15)+'Z'):(f.indexOf('HH')>=0?NOW+' 10:00':NOW),
  computeDigest:(a,s)=>[...crypto.createHash('sha256').update(s).digest()],base64Encode:b=>Buffer.from(b).toString('base64'),getUuid:()=>crypto.randomUUID(),DigestAlgorithm:{SHA_256:1}};
global.HtmlService={};
let src=fs.readFileSync(''+__dirname+'/Code.gs','utf8');
eval(src.replace(/^const /gm,'var ').replace(/^function (\w+)/gm,'global.$1 = function $1'));
