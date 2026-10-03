import { SOURCES, CALENDAR_EXTRAS } from './config.js';

const pad2=v=>String(v).padStart(2,'0');
const normalize=(s='')=>String(s).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z0-9]+/g,' ').trim();
const decodeHtml=(s='')=>String(s)
  .replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"')
  .replace(/&#39;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
  .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)));
const cleanText=(html='')=>decodeHtml(String(html)
  .replace(/<script[\s\S]*?<\/script>/gi,' ')
  .replace(/<style[\s\S]*?<\/style>/gi,' ')
  .replace(/<br\s*\/?\s*>/gi,' | ')
  .replace(/<\/t[dh]>/gi,' | ')
  .replace(/<\/tr>/gi,' || ')
  .replace(/<[^>]+>/g,' ')
  .replace(/\s+/g,' ')
).trim();

const calUrl=(c,id)=>`https://www.server2.sidgad.es/${c.folder}/${c.prefix}_cal_idc_${id}_${c.idm}.php`;
const gameUrl=(c,idp)=>`https://www.server2.sidgad.es/${c.folder}/${c.prefix}_gr_${idp}_${c.idm}.php`;

function sourceName(source){
  return source.sport==='ice'?'RFEDH':source.id.startsWith('fmp_')?'FMP':'RFEP';
}

async function postForm(url,source,body,timeoutMs=15000){
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),timeoutMs);
  try{
    const res=await fetch(url,{
      method:'POST',redirect:'follow',signal:ctrl.signal,
      headers:{
        'content-type':'application/x-www-form-urlencoded;charset=UTF-8',
        'origin':source.origin,
        'referer':`${source.website}/league/${source.leagueId}`,
        'user-agent':'Mozilla/5.0 (compatible; HdKMatch/1.0; official-federations-only)'
      },
      body:new URLSearchParams(body)
    });
    const text=await res.text();
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return text;
  }finally{clearTimeout(timer);}
}

function extractDate(text){
  const m=String(text).match(/\b([0-3]?\d)[\/-]([01]?\d)[\/-](20\d{2}|\d{2})\b/);
  if(!m) return null;
  const y=m[3].length===2?2000+Number(m[3]):Number(m[3]);
  return `${y}-${pad2(m[2])}-${pad2(m[1])}`;
}
function extractTime(text){
  const m=String(text).match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  return m?`${pad2(m[1])}:${m[2]}`:null;
}
function extractRound(text){
  const m=String(text).match(/\b(G\s*J\s*\d+|JORNADA\s+\d+|JOR\.?\s*\d+|OCTAVOS[^|]*|CUARTOS[^|]*|SEMIFINAL[^|]*|FINAL[^|]*)/i);
  return m?m[1].trim():null;
}
function belongs(home,away,aliases){
  const h=normalize(home),a=normalize(away);
  return aliases.some(x=>{
    const n=normalize(x);
    return h.includes(n)||a.includes(n)||n.includes(h)||n.includes(a);
  });
}
function findTeams(text,teams=[]){
  const n=normalize(text);
  const hits=[];
  for(const team of [...teams].sort((a,b)=>normalize(b).length-normalize(a).length)){
    const t=normalize(team);
    let start=0;
    while(t && (start=n.indexOf(t,start))>=0){
      const end=start+t.length;
      if(!hits.some(h=>start<h.end&&end>h.start)) hits.push({start,end,team});
      start=end;
    }
  }
  hits.sort((a,b)=>a.start-b.start);
  const unique=[];
  for(const h of hits){
    if(!unique.some(x=>normalize(x.team)===normalize(h.team))) unique.push(h);
  }
  return unique.slice(0,2).map(x=>x.team);
}
function findVenue(text,venues=[]){
  const n=normalize(text);
  const hits=venues.map(v=>({v,pos:n.indexOf(normalize(v))})).filter(x=>x.pos>=0);
  return hits.length?hits.sort((a,b)=>a.pos-b.pos)[0].v:null;
}
function rowSegments(html){
  const rows=String(html).match(/<tr\b[\s\S]*?<\/tr>/gi)||[];
  if(rows.length) return rows.map(cleanText).filter(Boolean);
  return cleanText(html).split(/\s*\|\|\s*/).filter(Boolean);
}
function parseCalendarRows(source,html){
  const games=[];
  for(const text of rowSegments(html)){
    const date=extractDate(text);
    if(!date) continue;
    const teams=findTeams(text,source.teams||[]);
    if(teams.length<2) continue;
    const [home,away]=teams;
    if(!belongs(home,away,source.aliases)) continue;
    const time=extractTime(text);
    const g={
      id:`${source.id}:${date}:${normalize(home)}:${normalize(away)}`,
      sourceId:source.id,
      source:sourceName(source),
      sourceUrl:`${source.website}/league/${source.leagueId}`,
      competition:source.competition,
      sport:source.sport,
      players:source.players,
      date,time,home,away,
      venue:findVenue(text,source.venues||[]),
      round:extractRound(text),
      official:true,
      leagueId:source.leagueId
    };
    games.push(g);
  }
  return [...new Map(games.map(g=>[g.id,g])).values()];
}

function looksLikeCalendar(source,html){
  if(parseCalendarRows(source,html).length) return true;
  return /game_report/i.test(html)&&/\bidp=["']?\d+/i.test(html);
}
function rowAround(html,index){
  const start=html.lastIndexOf('<tr',index);
  const end=html.indexOf('</tr>',index);
  if(start>=0&&end>start) return html.slice(start,end+5);
  return html.slice(Math.max(0,index-1400),Math.min(html.length,index+1400));
}
function refsFromCalendar(html){
  const refs=[],seen=new Set();
  const patterns=[
    /game_report[^>]*\bidp=["']?(\d+)["']?[^>]*\bidc=["']?(\d+)["']?[^>]*\bidm=["']?(\d+)/ig,
    /\bidp=["']?(\d+)["']?[^>]*\bidc=["']?(\d+)["']?[^>]*\bidm=["']?(\d+)["']?[^>]*game_report/ig
  ];
  for(const re of patterns){
    let m;
    while((m=re.exec(html))){
      const key=`${m[1]}:${m[2]}:${m[3]}`;
      if(seen.has(key)) continue;
      seen.add(key);
      const rowHtml=rowAround(html,m.index);
      refs.push({idp:m[1],idc:m[2],idm:Number(m[3]),rowHtml,calendarText:cleanText(rowHtml)});
    }
  }
  return refs;
}
function teamNames(html){
  const names=[];let m;
  const re=/nombre_equipo_thickbox_stats[^>]*>([\s\S]*?)<\/div>/ig;
  while((m=re.exec(html))){
    const n=cleanText(m[1]);
    if(n&&!names.includes(n)) names.push(n);
  }
  return names.slice(0,2);
}

async function probe(source){
  const errors=[];
  for(const c of source.candidates||[]){
    const url=calUrl(c,source.leagueId);
    try{
      const html=await postForm(url,source,{idc:source.leagueId,site_lang:'es'});
      if(looksLikeCalendar(source,html)) return {connection:c,calendarUrl:url,html};
      errors.push(`${c.folder}/${c.prefix}/${c.idm}: formato no reconocido (${html.length} bytes)`);
    }catch(e){errors.push(`${c.folder}/${c.prefix}/${c.idm}: ${e?.message||e}`);}
  }
  throw new Error(errors.join(' | '));
}
async function mapLimit(items,limit,fn){
  const out=new Array(items.length);let i=0;
  async function worker(){
    while(true){
      const idx=i++;
      if(idx>=items.length) return;
      out[idx]=await fn(items[idx],idx);
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},worker));
  return out;
}

async function fetchSource(source){
  const p=await probe(source);

  const rowGames=parseCalendarRows(source,p.html);
  if(rowGames.length){
    const now=Date.now();
    const upcoming=rowGames.filter(g=>new Date(`${g.date}T${g.time||'23:59'}:00`).getTime()>=now).length;
    return {games:rowGames,endpoint:p.calendarUrl,upcoming,mode:'official-calendar'};
  }

  const refs=refsFromCalendar(p.html);
  const parsed=await mapLimit(refs,6,async ref=>{
    let detail='';
    try{
      detail=await postForm(gameUrl(p.connection,ref.idp),source,{
        idm:String(ref.idm),idc:ref.idc,idp:ref.idp,tab:'tab_ficha_resumen',site_lang:'es'
      });
    }catch{return null;}
    const detailText=cleanText(detail);
    const detailTeams=teamNames(detail);
    const fallbackTeams=findTeams(ref.calendarText,source.teams||[]);
    const teams=detailTeams.length>=2?detailTeams:fallbackTeams;
    const date=extractDate(ref.calendarText)||extractDate(detailText);
    if(teams.length<2||!date||!belongs(teams[0],teams[1],source.aliases)) return null;
    return {
      id:`${source.id}:${date}:${normalize(teams[0])}:${normalize(teams[1])}`,
      sourceId:source.id,source:sourceName(source),
      sourceUrl:`${source.website}/league/${source.leagueId}`,
      competition:source.competition,sport:source.sport,players:source.players,
      date,time:extractTime(ref.calendarText)||extractTime(detailText),
      home:teams[0],away:teams[1],
      venue:findVenue(`${ref.calendarText} | ${detailText}`,source.venues||[]),
      round:extractRound(`${ref.calendarText} | ${detailText}`),
      official:true,leagueId:source.leagueId
    };
  });
  const games=parsed.filter(Boolean);
  if(!games.length) throw new Error(`No se localizaron partidos de ${source.label}`);
  const now=Date.now();
  const upcoming=games.filter(g=>new Date(`${g.date}T${g.time||'23:59'}:00`).getTime()>=now).length;
  return {games,endpoint:p.calendarUrl,upcoming,mode:'official-detail'};
}

export async function loadGames(){
  const status=[],all=[];
  await Promise.all(SOURCES.map(async source=>{
    try{
      const r=await fetchSource(source);
      all.push(...r.games);
      status.push({id:source.id,label:source.label,ok:true,games:r.games.length,upcoming:r.upcoming,endpoint:r.endpoint,mode:r.mode});
    }catch(e){
      status.push({id:source.id,label:source.label,ok:false,error:String(e?.message||e)});
    }
  }));
  all.push(...CALENDAR_EXTRAS.map(g=>({...g,calendar:true})));
  const unique=[...new Map(all.map(g=>[g.id,g])).values()]
    .sort((a,b)=>`${a.date}T${a.time||'23:59'}`.localeCompare(`${b.date}T${b.time||'23:59'}`));
  return {generatedAt:new Date().toISOString(),timezone:'Europe/Madrid',games:unique,status};
}
