// Official federation-only updater
import fs from 'node:fs';
import path from 'node:path';
import { loadGames } from '../api/_lib/sidgad.js';

const outPath=path.resolve('data/games.json');
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
