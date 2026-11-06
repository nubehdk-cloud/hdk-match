import { loadGames } from './sidgad.js';
import { mergeCalendarGames } from './merge.js';

async function loadCalendarEvents(){
  const response=await fetch('/data/calendar-events.json',{
    cache:'no-store',signal:AbortSignal.timeout(15000)
  });
  if(!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function loadAppData(officialLoader=loadGames,calendarLoader=loadCalendarEvents){
  // These requests are independent: Calendar never supplies league fixtures.
  const [officialResult,calendarResult]=await Promise.allSettled([
    officialLoader(),calendarLoader()
  ]);
  if(officialResult.status==='rejected') throw officialResult.reason;
  const calendar=calendarResult.status==='fulfilled'?calendarResult.value:{};
  return {
    ...mergeCalendarGames(officialResult.value,calendar),
    calendarStatus:calendarResult.status==='fulfilled'?{ok:true}:{ok:false,error:String(calendarResult.reason?.message||calendarResult.reason)}
  };
}
