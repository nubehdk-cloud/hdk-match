import { SOURCES, CALENDAR_EXTRAS } from './config.js';

const pad2 = v => String(v).padStart(2, '0');
const normalize = (s='') => String(s).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z0-9]+/g,' ').trim();
const decodeHtml = (s='') => String(s).replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)));
const cleanText = (html='') => decodeHtml(String(html).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<br\s*\/?\s*>/gi,' | ').replace(/<\/t[dh]>/gi,' | ').replace(/<\/tr>/gi,' || ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')).trim();
const calUrl = (c,id) => `https://www.server2.sidgad.es/${c.folder}/${c.prefix}_cal_idc_${id}_${c.idm}.php`;
const gameUrl = (c,idp) => `https://www.server2.sidgad.es/${c.folder}/${c.prefix}_gr_${idp}_${c.idm}.php`;

async function postForm(url, source, body, timeoutMs=15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method:'POST', redirect:'follow', signal:ctrl.signal,
      headers:{
        'content-type':'application/x-www-form-urlencoded;charset=UTF-8',
        'origin':source.origin,
        'referer':`${source.website}/league/${source.leagueId}`,
        'user-agent':'Mozilla/5.0 (compatible; HdKMatch/0.5; family-schedule)'
      },
      body:new URLSearchParams(body)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return text;
  } finally { clearTimeout(timer); }
}

function looksLikeCalendar(html) {
  return /game_report/i.test(html) && /\bidp=["']?\d+/i.test(html);
}
function rowAround(html,index){
  const start=html.lastIndexOf('<tr',index);
  const end=html.indexOf('</tr>',index);
  if(start>=0 && end>start) return html.slice(start,end+5);
  return html.slice(Math.max(0,index-1400),Math.min(html.length,index+1400));
}
function refsFromCalendar(html) {
  const refs=[], seen=new Set();
  const patterns=[
    /game_report[^>]*\bidp=["']?(\d+)["']?[^>]*\bidc=["']?(\d+)["']?[^>]*\bidm=["']?(\d+)/ig,
    /\bidp=["']?(\d+)["']?[^>]*\bidc=["']?(\d+)["']?[^>]*\bidm=["']?(\d+)["']?[^>]*game_report/ig
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html))) {
      const key=`${m[1]}:${m[2]}:${m[3]}`;
      if (!seen.has(key)) {
        seen.add(key);
        const rowHtml=rowAround(html,m.index);
        refs.push({idp:m[1],idc:m[2],idm:Number(m[3]),rowHtml,calendarText:cleanText(rowHtml)});
      }
    }
  }
  return refs;
}
function teamNames(html) {
  const names=[]; let m;
  const re=/nombre_equipo_thickbox_stats[^>]*>([\s\S]*?)<\/div>/ig;
  while ((m=re.exec(html))) {
    const n=cleanText(m[1]);
    if (n && !names.includes(n)) names.push(n);
  }
  return names.slice(0,2);
}
function extractDate(text) {
  let m=text.match(/\b([0-3]?\d)[\/-]([01]?\d)[\/-](20\d{2}|\d{2})\b/);
  if(m){
    const y=m[3].length===2?2000+Number(m[3]):Number(m[3]);
    return `${y}-${pad2(m[2])}-${pad2(m[1])}`;
  }
  m=text.match(/\b([0-3]?\d)[\/-]([01]?\d)\b/);
  if(!m) return null;
  const month=Number(m[2]);
  const year=month>=8?2026:2027;
  return `${year}-${pad2(month)}-${pad2(m[1])}`;
}
function extractTime(text) {
  const m=text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  return m?`${pad2(m[1])}:${m[2]}`:null;
}
function extractRound(text) {
  const m=text.match(/\b(G\s*J\s*\d+|JORNADA\s+\d+|JOR\.?\s*\d+|OCTAVOS[^|]*|CUARTOS[^|]*|SEMIFINAL[^|]*|FINAL[^|]*)/i);
  return m?m[1].trim():null;
}
function extractVenue(text) {
  for (const label of ['PISTA','PABELLON','PABELLÓN','INSTALACION','INSTALACIÓN','LUGAR']) {
    const m=text.match(new RegExp(`${label}\\s*[:|-]?\\s*([^|]{3,100})`,'i'));
    if (m) {
      const v=m[1].trim().replace(/\s{2,}/g,' ');
      if (v && !/^[-–—]$/.test(v)) return v;
    }
  }
  return null;
}
function belongs(g,aliases){
  const h=normalize(g.home),a=normalize(g.away);
  return aliases.some(x=>{
    const n=normalize(x);
    return h.includes(n)||a.includes(n)||n.includes(h)||n.includes(a);
  });
}
function isNoise(s){
  const n=normalize(s);
  if(!n || n.length<2) return true;
  if(/^\d+$/.test(n)) return true;
  if(/^\d{1,2}\s*[:\/-]\s*\d{1,2}/.test(n)) return true;
  if(/^(SIN COMENZAR|FINAL|FINALIZADO|APLAZADO|SUSPENDIDO|EN JUEGO|JORNADA|JOR |G J |RESULTADO|ACTA|VER|DETALLE|CRONICA|PABELLON|PISTA|LUGAR|INSTALACION)/.test(n)) return true;
  if(/\bJORNADA\b/.test(n) || /\bSIN COMENZAR\b/.test(n) || /\bFINAL\b/.test(n)) return true;
  return !/[A-ZÁÉÍÓÚÜÑ]/i.test(s);
}
function cellsFromRow(rowHtml){
  const cells=[]; let m;
  const re=/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/ig;
  while((m=re.exec(rowHtml))){
    const text=cleanText(m[1]).replace(/^\|\s*|\s*\|$/g,'').trim();
    if(text) cells.push(text);
  }
  return cells;
}
function taggedTeamCandidates(rowHtml){
  const out=[]; let m;
  const re=/<(?:div|span|a)[^>]*class=["'][^"']*(?:equipo|team|nombre)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span|a)>/ig;
  while((m=re.exec(rowHtml))){
    const x=cleanText(m[1]).trim();
    if(x && !isNoise(x) && !out.includes(x)) out.push(x);
  }
  return out;
}
function attrCandidates(rowHtml){
  const out=[]; let m;
  const re=/\b(?:alt|title)=["']([^"']{2,80})["']/ig;
  while((m=re.exec(rowHtml))){
    const x=decodeHtml(m[1]).trim();
    if(x && !isNoise(x) && !out.includes(x)) out.push(x);
  }
  return out;
}
function calendarTeams(rowHtml, aliases){
  const cells=cellsFromRow(rowHtml);
  const aliasNorms=aliases.map(normalize);
  const hasAlias=s=>aliasNorms.some(a=>normalize(s).includes(a)||a.includes(normalize(s)));
  const tagged=taggedTeamCandidates(rowHtml);
  const attrs=attrCandidates(rowHtml);
  const pool=[...tagged,...cells,...attrs].filter((x,i,a)=>!isNoise(x)&&a.indexOf(x)===i);
  let mine=pool.find(hasAlias);
  if(!mine){
    const text=cleanText(rowHtml);
    const a=aliases.find(x=>normalize(text).includes(normalize(x)));
    if(a) mine=a;
  }
  if(!mine) return null;

  const mineCellIndex=cells.findIndex(hasAlias);
  const cellCandidates=cells.map((x,i)=>({x,i})).filter(o=>!isNoise(o.x)&&!hasAlias(o.x));
  let opp=null;
  if(mineCellIndex>=0 && cellCandidates.length){
    cellCandidates.sort((a,b)=>Math.abs(a.i-mineCellIndex)-Math.abs(b.i-mineCellIndex));
    opp=cellCandidates[0];
    if(opp){
      if(opp.i < mineCellIndex) return {home:opp.x,away:mine};
      if(opp.i > mineCellIndex) return {home:mine,away:opp.x};
    }
  }
  const other=pool.find(x=>!hasAlias(x));
  return other?{home:mine,away:other}:null;
}
async function probe(source) {
  const errors=[];
  for (const c of source.candidates) {
    const url=calUrl(c,source.leagueId);
    try {
      const html=await postForm(url,source,{idc:source.leagueId,site_lang:'es'});
      if (looksLikeCalendar(html)) return {connection:c,calendarUrl:url,html};
      errors.push(`${c.folder}/${c.prefix}/${c.idm}: formato no reconocido (${html.length} bytes)`);
    } catch (e) {
      errors.push(`${c.folder}/${c.prefix}/${c.idm}: ${e?.message||e}`);
    }
  }
  throw new Error(errors.join(' | '));
}
async function mapLimit(items,limit,fn){
  const out=new Array(items.length); let i=0;
  async function w(){
    while(true){
      const idx=i++;
      if(idx>=items.length)return;
      out[idx]=await fn(items[idx],idx);
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},w));
  return out;
}
async function fetchSource(source) {
  const p=await probe(source);
  const refs=refsFromCalendar(p.html);
  if (!refs.length) throw new Error('Calendario sin referencias de partido');

  const parsed=await mapLimit(refs,6,async ref=>{
    const date=extractDate(ref.calendarText);
    const time=extractTime(ref.calendarText);
    const calTeams=calendarTeams(ref.rowHtml,source.aliases);

    let detailText='', detailTeams=[], venue=null, round=null;
    try {
      const detail=await postForm(gameUrl(p.connection,ref.idp),source,{idm:String(ref.idm),idc:ref.idc,idp:ref.idp,tab:'tab_ficha_resumen',site_lang:'es'});
      detailText=cleanText(detail);
      detailTeams=teamNames(detail);
      venue=extractVenue(`${ref.calendarText} | ${detailText}`);
      round=extractRound(`${ref.calendarText} | ${detailText}`);
    } catch {}

    const teams=detailTeams.length>=2?{home:detailTeams[0],away:detailTeams[1]}:calTeams;
    const finalDate=date||extractDate(detailText);
    if(!teams || !finalDate) return null;

    const g={
      id:`${source.id}:${ref.idp}`,sourceId:source.id,
      source:source.sport==='ice'?'RFEDH':source.id.startsWith('fmp_')?'FMP':'RFEP',
      sourceUrl:`${source.website}/league/${source.leagueId}`,
      competition:source.competition,sport:source.sport,players:source.players,
      date:finalDate,time:time||extractTime(detailText),
      home:teams.home,away:teams.away,venue,round,
      idp:ref.idp,leagueId:source.leagueId,manual:false
    };
    return belongs(g,source.aliases)?g:null;
  });

  const games=parsed.filter(Boolean);
  if (!games.length) throw new Error(`No se localizaron partidos de ${source.label}; referencias encontradas: ${refs.length}`);
  const now=new Date();
  const upcoming=games.filter(g=>new Date(`${g.date}T${g.time||'23:59'}:00`)>=now).length;
  return {games,endpoint:p.calendarUrl,refs:refs.length,upcoming};
}
export async function loadGames() {
  const status=[]; const all=[];
  await Promise.all(SOURCES.map(async source=>{
    try {
      const r=await fetchSource(source);
      all.push(...r.games);
      status.push({id:source.id,label:source.label,ok:true,games:r.games.length,upcoming:r.upcoming,refs:r.refs,endpoint:r.endpoint});
    } catch(e) {
      status.push({id:source.id,label:source.label,ok:false,error:String(e?.message||e)});
    }
  }));
  all.push(...CALENDAR_EXTRAS.map(g=>({...g,calendar:true})));
  const unique=[...new Map(all.map(g=>[g.id,g])).values()].sort((a,b)=>`${a.date}T${a.time||'23:59'}`.localeCompare(`${b.date}T${b.time||'23:59'}`));
  return {generatedAt:new Date().toISOString(),timezone:'Europe/Madrid',games:unique,status};
}
