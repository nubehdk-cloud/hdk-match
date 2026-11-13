import { loadGames } from './sidgad.js';
import { mergeCalendarGames } from './merge.js';
import { SOURCES } from './config.js';

async function loadCalendarEvents(){
  const response=await fetch('/data/calendar-events.json',{
    cache:'no-store',signal:AbortSignal.timeout(15000)
  });
  if(!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// Both channels must return successful *current* federation responses.
// An old data/games.json file and Calendar league matches are never fallbacks.
async function loadOfficialWithFallback(){
  let direct;
  try {
    direct=await loadGames();
  } catch(error) {
    direct={
      generatedAt:new Date().toISOString(),timezone:'Europe/Madrid',games:[],
      status:SOURCES.map(s=>({id:s.id,label:s.label,officialUrl:`${s.website}/league/${s.leagueId}`,ok:false,error:String(error?.message||error)}))
    };
  }
  if(direct.status?.some(s=>s.ok)) return direct;
  try {
    const response=await fetch('/api/games',{cache:'no-store',signal:AbortSignal.timeout(20000)});
    if(response.ok){
      const server=await response.json();
      if(server.status?.some(s=>s.ok)){
        return {...server,games:(server.games||[]).filter(g=>g.official===true)};
      }
    }
  }catch{/* The app remains usable when the federation API is unavailable. */}
  return direct;
}

export async function loadAppData(officialLoader=loadOfficialWithFallback,calendarLoader=loadCalendarEvents){
  const [officialResult,calendarResult]=await Promise.allSettled([
    officialLoader(),calendarLoader()
  ]);
  const official=officialResult.status==='fulfilled'?officialResult.value:{
    generatedAt:new Date().toISOString(),timezone:'Europe/Madrid',games:[],
    status:SOURCES.map(s=>({id:s.id,label:s.label,officialUrl:`${s.website}/league/${s.leagueId}`,ok:false,error:String(officialResult.reason?.message||officialResult.reason)}))
  };
  const calendar=calendarResult.status==='fulfilled'?calendarResult.value:{};
  return {
    ...mergeCalendarGames(official,calendar),
    calendarStatus:calendarResult.status==='fulfilled'?{ok:true}:{ok:false,error:String(calendarResult.reason?.message||calendarResult.reason)}
  };
}
