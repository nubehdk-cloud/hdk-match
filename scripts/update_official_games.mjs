// Official federation-only updater
import fs from 'node:fs';
import path from 'node:path';
import { loadGames } from '../api/_lib/sidgad.js';

const outPath=path.resolve('data/games.json');
async function probeFmp(){
  const url='https://www.server2.sidgad.es/fmp/fmp_cal_idc_4798_2.php';
  const res=await fetch(url,{
    method:'POST',
    headers:{
      'content-type':'application/x-www-form-urlencoded;charset=UTF-8',
      'origin':'http://www.hockeylinea.fmp.es',
      'referer':'https://www.hockeylinea.fmp.es/league/4798',
      'user-agent':'Mozilla/5.0 (compatible; HdKMatchProbe/1.0)'
    },
    body:new URLSearchParams({idc:'4798',site_lang:'es'})
  });
  const raw=await res.text();
  const plain=raw
    .replace(/<script[\s\S]*?<\/script>/gi,' ')
    .replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<br\s*\/?\s*>/gi,' | ')
    .replace(/<\/t[dh]>/gi,' | ')
    .replace(/<\/tr>/gi,' || ')
    .replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;/gi,' ')
    .replace(/\s+/g,' ');
  for(const needle of ['MAMUTS A','LAS ROZAS']){
    let i=0,count=0;
    while((i=plain.toUpperCase().indexOf(needle,i))>=0 && count<12){
      console.log('FMP_CONTEXT',plain.slice(Math.max(0,i-220),Math.min(plain.length,i+420)));
      i+=needle.length; count++;
    }
  }
}
await probeFmp();

const data=await loadGames();

fs.mkdirSync(path.dirname(outPath),{recursive:true});
let old=null;
try{ old=JSON.parse(fs.readFileSync(outPath,'utf8')); }catch{}

const comparable=x=>({
  timezone:x?.timezone||'Europe/Madrid',
  games:x?.games||[],
  status:x?.status||[]
});

if(JSON.stringify(comparable(old))!==JSON.stringify(comparable(data))){
  fs.writeFileSync(outPath,JSON.stringify(data,null,2)+'\n');
  console.log('UPDATED');
}else{
  console.log('NO_CHANGE');
}

for(const s of data.status||[]){
  console.log(s.id, s.ok?'OK':'ERROR', s.games??'', s.error??'');
}
for(const g of data.games||[]){
  if(!g.calendar) console.log('GAME',g.sourceId,g.date,g.time||'--:--',g.home,'vs',g.away);
}
