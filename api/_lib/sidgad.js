import { SOURCES, MANUAL_GAMES } from './config.js';

const pad2 = v => String(v).padStart(2, '0');
const normalize = (s='') => String(s).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z0-9]+/g,' ').trim();
const decodeHtml = (s='') => String(s).replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)));
const cleanText = (html='') => decodeHtml(String(html).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<br\s*\/?\s*>/gi,' | ').replace(/<\/t[dh]>/gi,' | ').replace(/<\/tr>/gi,' || ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')).trim();
const calUrl = (c,id) => `https://www.server2.sidgad.es/${c.folder}/${c.prefix}_cal_idc_${id}_${c.idm}.php`;
const gameUrl = (c,idp) => `https://www.server2.sidgad.es/${c.folder}/${c.prefix}_gr_${idp}_${c.idm}.php`;

async function postForm(url, source, body, timeoutMs=12000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method:'POST', redirect:'follow', signal:ctrl.signal,
      headers:{
        'content-type':'application/x-www-form-urlencoded;charset=UTF-8',
        'origin':source.origin,
        'referer':`${source.website}/league/${source.leagueId}`,
        'user-agent':'Mozilla/5.0 (compatible; HdKMatch/0.3; family-schedule)'
      },
      body:new URLSearchParams(body)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return text;
  } finally { clearTimeout(timer); }
}

function looksLikeCalendar(html) { return /game_report/i.test(html) && /\bidp=["']?\d+/i.test(html); }
function refsFromCalendar(html) {
  const refs=[], seen=new Set();
  const patterns=[
    /game_report[^>]*\bidp=["']?(\d+)["']?[^>]*\bidc=["']?(\d+)["']?[^>]*\bidm=["']?(\d+)/ig,
    /\bidp=["']?(\d+)["']?[^>]*\bidc=["']?(\d+)["']?[^>]*\bidm=["']?(\d+)["']?[^>]*game_report/ig
  ];
  for (const re of patterns) {
    let m; while ((m = re.exec(html))) {
      const key=`${m[1]}:${m[2]}:${m[3]}`;
      if (!seen.has(key)) { seen.add(key); refs.push({idp:m[1],idc:m[2],idm:Number(m[3])}); }
    }
  }
  return refs;
}
function teamNames(html) {
  const names=[]; let m;
  const re=/nombre_equipo_thickbox_stats[^>]*>([\s\S]*?)<\/div>/ig;
  while ((m=re.exec(html))) { const n=cleanText(m[1]); if (n && !names.includes(n)) names.push(n); }
  return names.slice(0,2);
}
function extractDate(text) { const m=text.match(/\b([0-3]?\d)[\/-]([01]?\d)[\/-](20\d{2}|\d{2})\b/); if(!m)return null; const y=m[3].length===2?2000+Number(m[3]):Number(m[3]); return `${y}-${pad2(m[2])}-${pad2(m[1])}`; }
function extractTime(text) { const m=text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/); return m?`${pad2(m[1])}:${m[2]}`:null; }
function extractRound(text) { const m=text.match(/\b(G\s*J\s*\d+|JORNADA\s+\d+|JOR\.?\s*\d+|OCTAVOS[^|]*|CUARTOS[^|]*|SEMIFINAL[^|]*|FINAL[^|]*)/i); return m?m[1].trim():null; }
function extractVenue(text) {
  for (const label of ['PISTA','PABELLON','PABELLÓN','INSTALACION','INSTALACIÓN','LUGAR']) {
    const m=text.match(new RegExp(`${label}\\s*[:|-]?\\s*([^|]{3,100})`,'i'));
    if (m) { const v=m[1].trim().replace(/\s{2,}/g,' '); if (v && !/^[-–—]$/.test(v)) return v; }
  }
  return null;
}
function belongs(g,aliases){ const h=normalize(g.home),a=normalize(g.away); return aliases.some(x=>{const n=normalize(x); return h.includes(n)||a.includes(n)||n.includes(h)||n.includes(a);}); }
async function probe(source) {
  const errors=[];
  for (const c of source.candidates) {
    const url=calUrl(c,source.leagueId);
    try {
      const html=await postForm(url,source,{idc:source.leagueId,site_lang:'es'});
      if (looksLikeCalendar(html)) return {connection:c,calendarUrl:url,html};
      errors.push(`${c.folder}/${c.prefix}/${c.idm}: formato no reconocido`);
    } catch (e) { errors.push(`${c.folder}/${c.prefix}/${c.idm}: ${e?.message||e}`); }
  }
  throw new Error(errors.join(' | '));
}
async function mapLimit(items,limit,fn){ const out=new Array(items.length); let i=0; async function w(){ while(true){ const idx=i++; if(idx>=items.length)return; out[idx]=await fn(items[idx],idx); } } await Promise.all(Array.from({length:Math.min(limit,items.length)},w)); return out; }
async function fetchSource(source) {
  const p=await probe(source); const refs=refsFromCalendar(p.html);
  if (!refs.length) throw new Error('Calendario sin referencias de partido');
  const parsed=await mapLimit(refs,6,async ref=>{
    try {
      const html=await postForm(gameUrl(p.connection,ref.idp),source,{idm:String(ref.idm),idc:ref.idc,idp:ref.idp,tab:'tab_ficha_resumen',site_lang:'es'});
      const teams=teamNames(html); if(teams.length<2)return null;
      const plain=cleanText(html); const date=extractDate(plain); if(!date)return null;
      const g={id:`${source.id}:${ref.idp}`,sourceId:source.id,source:source.sport==='ice'?'RFEDH':source.id.startsWith('fmp_')?'FMP':'RFEP',sourceUrl:`${source.website}/league/${source.leagueId}`,competition:source.competition,sport:source.sport,players:source.players,date,time:extractTime(plain),home:teams[0],away:teams[1],venue:extractVenue(plain),round:extractRound(plain),idp:ref.idp,leagueId:source.leagueId,manual:false};
      return belongs(g,source.aliases)?g:null;
    } catch { return null; }
  });
  const games=parsed.filter(Boolean);
  if (!games.length) throw new Error(`No se localizaron partidos de ${source.label}`);
  return {games,endpoint:p.calendarUrl};
}
export async function loadGames() {
  const status=[]; const all=[];
  await Promise.all(SOURCES.map(async source=>{
    try { const r=await fetchSource(source); all.push(...r.games); status.push({id:source.id,label:source.label,ok:true,games:r.games.length,endpoint:r.endpoint}); }
    catch(e){ status.push({id:source.id,label:source.label,ok:false,error:String(e?.message||e)}); }
  }));
  all.push(...MANUAL_GAMES.map((g,i)=>({...g,id:g.id||`manual:${i}`,manual:true,source:g.source||'Manual'})));
  const unique=[...new Map(all.map(g=>[g.id,g])).values()].sort((a,b)=>`${a.date}T${a.time||'23:59'}`.localeCompare(`${b.date}T${b.time||'23:59'}`));
  return {generatedAt:new Date().toISOString(),timezone:'Europe/Madrid',games:unique,status};
}
