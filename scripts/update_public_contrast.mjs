import fs from 'node:fs';
import { loadPublicContrast } from '../api/_lib/public-contrast.js';

const path='data/public-contrast.json';
let old={games:[],status:[]};
try{old=JSON.parse(fs.readFileSync(path,'utf8'))}catch{}
const data=await loadPublicContrast();
const ok=new Set(data.status.filter(s=>s.ok).map(s=>s.id));
const retained=(old.games||[]).filter(g=>!ok.has(g.sourceId)).map(g=>({...g,stale:true}));
data.games=[...retained,...data.games].sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
data.status=data.status.map(s=>s.ok?s:{
  ...s,lastSuccessfulAt:old.status?.find(p=>p.id===s.id&&p.ok)?.lastSuccessfulAt||old.generatedAt||null,
  retainedGames:retained.filter(g=>g.sourceId===s.id).length
});
if(!ok.size && old.generatedAt)data.generatedAt=old.generatedAt;
if(data.games.some(g=>g.official===true))throw Error('Contrast feed must never claim official status');
fs.writeFileSync(path,JSON.stringify(data,null,2)+'\n');
for(const s of data.status)console.log('CONTRAST',s.id,s.ok?'OK':'ERROR',s.games??0,s.error||'');
console.log('CONTRAST TOTAL',data.games.length,'LATEST',data.generatedAt);
