// Official federation-only updater
import fs from 'node:fs';
import path from 'node:path';
import { loadGames } from '../api/_lib/sidgad.js';

const outPath=path.resolve('data/games.json');
const data=await loadGames();

fs.mkdirSync(path.dirname(outPath),{recursive:true});
let old=null;
try{ old=JSON.parse(fs.readFileSync(outPath,'utf8')); }catch{}

// Preserve the most recent verified schedule when a federation temporarily
// rejects requests. In particular, a failed update must never erase fixtures.
const workingSources = new Set((data.status || []).filter(s => s.ok).map(s => s.id));
const retained = (old?.games || [])
  .filter(g => g.sourceId && !workingSources.has(g.sourceId))
  .map(g => {
    const prev = (old?.status || []).find(s => s.id === g.sourceId);
    return { ...g, cached: true, cachedAt: prev?.lastVerifiedAt || g.cachedAt || old.generatedAt };
  });
const newest = (data.games || []).map(g => {
  const { cached, cachedAt, ...verified } = g;
  return verified;
});
data.games = [...new Map([...retained, ...newest].map(g => [g.id, g])).values()]
  .sort((a,b) => `${a.date}T${a.time||'23:59'}`.localeCompare(`${b.date}T${b.time||'23:59'}`));
data.status = (data.status || []).map(s => {
  if (s.ok) return { ...s, lastVerifiedAt: data.generatedAt, cachedGames: 0 };
  const previous = (old?.status || []).find(x => x.id === s.id);
  return { ...s, cachedGames: retained.filter(g => g.sourceId === s.id).length,
    lastVerifiedAt: previous?.lastVerifiedAt || old?.generatedAt || null };
});
if (!workingSources.size && old?.generatedAt) data.generatedAt = old.generatedAt;

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
  console.log(s.id,s.ok?'OK':'ERROR',s.games??'',s.error??'');
}
