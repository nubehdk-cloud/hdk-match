import { SOURCES, OFFICIAL_HINTS, CALENDAR_EXTRAS, MANUAL_GAMES } from './config.js';

const pad2 = v => String(v).padStart(2, '0');
const normalize = (s='') => String(s).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z0-9]+/g,' ').trim();
const escapeRe = s => String(s).replace(/[.*+?^\${}()|[\]\\]/g, '\\$&');
const decodeHtml = (s='') => String(s)
  .replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"')
  .replace(/&#39;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
  .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)));

function htmlToText(html='') {
  return decodeHtml(String(html)
    .replace(/<script[\s\S]*?<\/script>/gi,' ')
    .replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<br\s*\/?\s*>/gi,'\n')
    .replace(/<\/(?:div|p|li|section|article|h[1-6]|tr)>/gi,'\n')
    .replace(/<[^>]+>/g,' ')
    .replace(/[ \t]+/g,' ')
    .replace(/\n\s+/g,'\n')
    .replace(/\n{2,}/g,'\n')
  ).trim();
}

function upcomingSection(text) {
  const start = text.search(/Pr[oó]ximos Partidos/i);
  if (start < 0) return text;
  const tail = text.slice(start);
  const endMatch = tail.search(/\n(?:Clasificaci[oó]n|Resultados)\b/i);
  return endMatch > 0 ? tail.slice(0,endMatch) : tail;
}

function seasonDate(ddmm) {
  const [d,m] = ddmm.split('/').map(Number);
  const y = m >= 8 ? 2026 : 2027;
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function isTarget(home, away, aliases) {
  const h=normalize(home), a=normalize(away);
  return aliases.some(x=>{
    const n=normalize(x);
    return h.includes(n)||a.includes(n)||n.includes(h)||n.includes(a);
  });
}

function findVenue(after, venues=[]) {
  const n=normalize(after);
  const hit = venues.find(v=>n.startsWith(normalize(v)) || n.includes(normalize(v)));
  return hit || null;
}

function applyHint(game) {
  const hint = OFFICIAL_HINTS.find(h=>
    h.sourceId===game.sourceId && h.date===game.date &&
    normalize(h.home)===normalize(game.home) && normalize(h.away)===normalize(game.away)
  );
  if (!hint) return game;
  return {
    ...game,
    time: game.time || hint.time || null,
    venue: game.venue || hint.venue || null,
    hintApplied: !game.time && !!hint.time
  };
}

async function fetchText(url, timeoutMs=15000) {
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),timeoutMs);
  try {
    const r=await fetch(url,{signal:ctrl.signal,headers:{'user-agent':'Mozilla/5.0 (compatible; HdKMatch/0.6; family-schedule)','accept':'text/html,application/xhtml+xml'}});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally { clearTimeout(timer); }
}

async function fetchSource(source) {
  const html=await fetchText(source.mirrorUrl);
  const text=upcomingSection(htmlToText(html));
  const teams=[...new Set(source.teams)].sort((a,b)=>b.length-a.length);
  const alt=teams.map(escapeRe).join('|');
  const re=new RegExp(`(${alt})\\s+(${alt})\\s+(\\d{1,2}\\/\\d{1,2})(?:\\s+(\\d{1,2}:\\d{2}))?`,'gi');
  const games=[]; let m;
  while((m=re.exec(text))){
    const home=m[1].trim(), away=m[2].trim();
    if(!isTarget(home,away,source.aliases)) continue;
    const date=seasonDate(m[3]);
    const prefix=text.slice(Math.max(0,m.index-120),m.index);
    const rm=[...prefix.matchAll(/(?:JORNADA|G\s*J)\s*(\d+)/gi)].pop();
    const after=text.slice(re.lastIndex,Math.min(text.length,re.lastIndex+160));
    const game=applyHint({
      id:`${source.id}:${date}:${normalize(home)}:${normalize(away)}`,
      sourceId:source.id,
      source:source.source,
      sourceUrl:source.officialUrl,
      competition:source.competition,
      sport:source.sport,
      players:source.players,
      date,
      time:m[4]?m[4].padStart(5,'0'):null,
      home,
      away,
      venue:findVenue(after,source.venues||[]),
      round:rm?`Jornada ${rm[1]}`:null,
      official:true,
      mirrorUrl:source.mirrorUrl
    });
    games.push(game);
  }
  const unique=[...new Map(games.map(g=>[g.id,g])).values()];
  if(!unique.length) throw new Error('No se pudieron interpretar próximos partidos');
  return unique;
}

function naturalKey(g){
  if(g.special) return `special|${g.id}`;
  return `${g.sourceId||g.source}|${g.date}|${normalize(g.home||g.title||'')}|${normalize(g.away||'')}`;
}

export async function loadGames() {
  const status=[]; const all=[];
  await Promise.all(SOURCES.map(async source=>{
    try {
      const games=await fetchSource(source);
      all.push(...games);
      status.push({id:source.id,label:source.label,ok:true,games:games.length,upcoming:games.length});
    } catch(e){
      status.push({id:source.id,label:source.label,ok:false,error:String(e?.message||e)});
    }
  }));
  all.push(...CALENDAR_EXTRAS.map(g=>({...g,calendar:true})));
  all.push(...MANUAL_GAMES.map((g,i)=>({...g,id:g.id||`manual:${i}`,manual:true,source:g.source||'Manual'})));
  const merged=new Map();
  for(const g of all){ const k=naturalKey(g); if(!merged.has(k)) merged.set(k,g); }
  const unique=[...merged.values()].sort((a,b)=>`${a.date}T${a.time||'23:59'}`.localeCompare(`${b.date}T${b.time||'23:59'}`));
  return {generatedAt:new Date().toISOString(),timezone:'Europe/Madrid',games:unique,status};
}
