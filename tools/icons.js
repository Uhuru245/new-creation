const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const svg=fs.readFileSync(__dirname+'/../app/icons/icon.svg','utf8');
for(const [n,s,pad] of [['icon-192',192,0],['icon-512',512,0],['maskable-512',512,0.12]]){
 await p.setViewportSize({width:s,height:s});
 await p.setContent(`<html><body style="margin:0;background:#FBF8F1;display:grid;place-items:center;width:${s}px;height:${s}px">${svg.replace('<svg ','<svg width="'+Math.round(s*(1-pad*2))+'" height="'+Math.round(s*(1-pad*2))+'" ')}</body></html>`);
 await p.screenshot({path:__dirname+'/../app/icons/'+n+'.png'});}
await b.close();console.log('icons ok');})();
