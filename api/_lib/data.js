import fs from 'node:fs';
import { CALENDAR_EXTRAS, MANUAL_GAMES } from './config.js';

const normalize = (s='') => String(s).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z0-9]+/g,' ').trim();

export function loadGames(){
  const path=new URL('../../data/official-games.json',import.meta.url);
  const official=JSON.parse(fs.readFileSync(path,'utf8'));
  const all=[...(official.games||[]),...CALENDAR_EXTRAS.map(g=>({...g,calendar:true})),...MANUAL_GAMES.map((g,i)=>({...g,id:g.id||`manual:${i}`,manual:true,source:g.source||'Manual'}))];
  const key=g=>g.special?`special|${g.id}`:`${g.sourceId||g.source}|${g.date}|${normalize(g.home||g.title||'')}|${normalize(g.away||'')}`;
  const merged=new Map();
  for(const g of all){const k=key(g);if(!merged.has(k))merged.set(k,g);}
  const games=[...merged.values()].sort((a,b)=>`${a.date}T${a.time||'23:59'}`.localeCompare(`${b.date}T${b.time||'23:59'}`));
  return {generatedAt:official.updatedAt||null,timezone:'Europe/Madrid',games,status:official.status||[]};
}
