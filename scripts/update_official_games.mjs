// Official federation-only updater
import fs from 'node:fs';
import path from 'node:path';
import { loadGames } from '../api/_lib/sidgad.js';

const outPath=path.resolve('data/games.json');
async function probeRfedh(){
  const urls=[
    'https://www.hockey.fedhielo.com/league/3657',
    'https://www.hockey.fedhielo.com/'
  ];
  for(const url of urls){
    try{
      const res=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 (compatible; HdKMatchProbe/1.0)'}});
      const raw=await res.text();
      console.log('RFEDH_PAGE',url,res.status,raw.length);
      const found=[...raw.matchAll(/https?:\\/\\/[^"'<>\\s]+|(?:src|href|action)=["']([^"']+)["']/gi)]
        .map(m=>m[1]||m[0])
        .filter(x=>/sidgad|server|php|league|calendar|cal_/i.test(x))
        .slice(0,100);
      for(const x of found) console.log('RFEDH_LINK',x);
      for(const needle of ['3657','server2','sidgad','cal_idc','game_report']){
        const i=raw.toLowerCase().indexOf(needle.toLowerCase());
        if(i>=0) console.log('RFEDH_CONTEXT',needle,raw.slice(Math.max(0,i-300),Math.min(raw.length,i+700)).replace(/\\s+/g,' '));
      }
    }catch(e){console.log('RFEDH_PROBE_ERROR',url,String(e));}
  }
}
await probeRfedh();

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
