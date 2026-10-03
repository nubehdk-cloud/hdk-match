import fs from 'node:fs';

function readJson(relativePath,fallback){
  try{
    const url=new URL(relativePath,import.meta.url);
    return JSON.parse(fs.readFileSync(url,'utf8'));
  }catch{
    return fallback;
  }
}

export function loadCachedGames(){
  const official=readJson('../../data/games.json',{generatedAt:null,timezone:'Europe/Madrid',games:[],status:[]});
  const calendar=readJson('../../data/calendar-events.json',{generatedAt:null,events:[]});
  const games=[...(official.games||[]),...(calendar.events||[])]
    .sort((a,b)=>`${a.date}T${a.time||'23:59'}`.localeCompare(`${b.date}T${b.time||'23:59'}`));
  return {
    ...official,
    games,
    calendarGeneratedAt:calendar.generatedAt||null
  };
}
