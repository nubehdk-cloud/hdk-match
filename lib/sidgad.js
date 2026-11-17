// Pure parser for rows read from the visible official federation calendars.
// No HTTP requests. Only the weekly task reads federation websites.
import {SOURCES,EXCLUSIONS} from './config.js';
export const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
export function officialDate(value){
  if(!value)return null;
  const m=String(value).trim().match(/^(\d{2})\/(\d{2})\/(20\d{2})$/);
  if(!m)throw new Error('Formato de fecha oficial no reconocido');
  const date=`${m[3]}-${m[2]}-${m[1]}`;
  if(new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)throw new Error('Fecha oficial no válida');
  return date;
}
export function parseOfficialRows(source,rows){
  if(!Array.isArray(rows))throw new Error('Faltan filas del calendario oficial');
  const games=[];
  for(const row of rows){
    const home=String(row.home||'').replace(/\s+/g,' ').trim();
    const away=String(row.away||'').replace(/\s+/g,' ').trim();
    if(!home||!away)throw new Error('Fila incompleta: faltan equipos');
    if(!source.aliases.some(a=>[home,away].some(t=>normalize(t).includes(normalize(a)))))continue;
    const date=officialDate(row.date);
    const time=row.time?String(row.time).trim():null;
    if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Hora oficial no válida');
    const round=String(row.round||'').replace(/\s+/g,' ').trim().replace(/^ROUND /,'JORNADA ').replace(/^G J /,'JORNADA ');
    if(!row.matchId&&!round)throw new Error('Falta la identidad del partido');
    const matchId=row.matchId?String(row.matchId):null;
    if(EXCLUSIONS.some(x=>x.sourceId===source.id&&((matchId&&x.matchId===matchId)||(x.date===date&&normalize(x.home)===normalize(home)&&normalize(x.away)===normalize(away)))))continue;
    games.push({id:`${source.id}:${matchId||`${round}:${normalize(home)}:${normalize(away)}`}`,sourceId:source.id,source:source.federation,sourceUrl:source.url,competition:source.competition,sport:source.sport,players:source.players,leagueId:source.leagueId,official:true,date,time,home,away,round,matchId,venue:row.venue||null,...(source.requiresCallup?{requiresCallup:true}:{})});
  }
  return [...new Map(games.map(g=>[g.id,g])).values()];
}
export function buildSnapshot(previous={},captures=[],checkedAt=new Date().toISOString()){
  const games=[],status=[];
  for(const source of SOURCES){
    const capture=captures.find(c=>c.calendarKey===source.calendarKey);
    const oldStatus=previous.status?.find(s=>s.id===source.id);
    try{
      if(!capture||capture.complete!==true)throw new Error(capture?.error||'No se pudo completar la lectura oficial');
      if(new URL(capture.url).hostname!==new URL(source.url).hostname||normalize(capture.heading).indexOf(normalize(source.heading))!==0)throw new Error('La fuente no corresponde a la competición');
      if(!/2026\s*\/\s*(2027|27)/.test(capture.heading))throw new Error('Temporada oficial no confirmada');
      const parsed=parseOfficialRows(source,capture.rows);
      if(!parsed.length&&!capture.confirmedEmpty)throw new Error('Calendario vacío o incompleto');
      games.push(...parsed);
      status.push({id:source.id,label:source.label,officialUrl:source.url,ok:true,games:parsed.length,lastSuccessAt:checkedAt,checkedAt,mode:'official-browser-calendar'});
    }catch(error){
      const oldGames=(previous.games||[]).filter(g=>g.sourceId===source.id&&g.official===true);
      const lastSuccessAt=oldStatus?.lastSuccessAt||(oldStatus?.ok?previous.generatedAt:null);
      if(lastSuccessAt)games.push(...oldGames);
      status.push({id:source.id,label:source.label,officialUrl:source.url,ok:false,games:lastSuccessAt?oldGames.length:0,lastSuccessAt:lastSuccessAt||null,checkedAt,error:error.message});
    }
  }
  games.sort((a,b)=>`${a.date||'9999'}T${a.time||'23:59'}`.localeCompare(`${b.date||'9999'}T${b.time||'23:59'}`));
  const successful=status.some(s=>s.ok);
  return {generatedAt:successful?checkedAt:previous.generatedAt||null,checkedAt,timezone:'Europe/Madrid',updatePolicy:{weekday:'TH',hour:12,timezone:'Europe/Madrid'},games,status};
}
