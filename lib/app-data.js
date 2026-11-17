import {mergeCalendarGames} from './merge.js';
async function readSnapshot(url){
  const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  return response.json();
}
export async function loadAppData(officialLoader=()=>readSnapshot('/data/games.json'),calendarLoader=()=>readSnapshot('/data/calendar-events.json')){
  const [official,calendar]=await Promise.allSettled([officialLoader(),calendarLoader()]);
  if(official.status==='rejected'&&calendar.status==='rejected')throw new Error('No se pudieron cargar los datos guardados');
  return {...mergeCalendarGames(official.status==='fulfilled'?official.value:{games:[],status:[]},calendar.status==='fulfilled'?calendar.value:{}),officialStatus:{ok:official.status==='fulfilled'},calendarStatus:{ok:calendar.status==='fulfilled'}};
}
