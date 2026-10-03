import fs from 'node:fs';

export function loadCachedGames(){
  const path=new URL('../../data/games.json',import.meta.url);
  return JSON.parse(fs.readFileSync(path,'utf8'));
}
