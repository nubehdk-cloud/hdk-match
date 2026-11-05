import { SOURCES } from './config.js';

const FEEDS = [
  { leagueId: '3657', sourceIds: ['rfedh_u15'], url: 'https://hockeyapp.es/hockey-hielo/26-27/liga-nacional-hockey-hielo-u15/fedhielo_3657' },
  { leagueId: '4798', sourceIds: ['fmp_infantil','fmp_infantil_pumas'], url: 'https://hockeyapp.es/hockey-linea/26-27/liga-infantil-1/fmp_4798' },
  { leagueId: '3609', sourceIds: ['rfep_infantil_oro','rfep_infantil_oro_pumas'], url: 'https://hockeyapp.es/hockey-linea/26-27/liga-oro-infantil/rfep_3609' }
];
const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
const decode = value => String(value ?? '')
  .replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;/gi,"'")
  .replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
  .replace(/&#(\d+);/g, (_,n)=>String.fromCodePoint(+n))
  .replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
function isTeamMatch(home,away,source){
  return (source.aliases||[]).some(name => {
    const n=normalize(name),h=normalize(home),a=normalize(away);
    return n.length>2&&(h.includes(n)||a.includes(n));
  });
}
function leagueGames(html,feed,source){
  const matches=[],re=/<a\s+href="([^"]+)"\s+class="partido-link[^"]*">([\s\S]*?)<\/a>/gi;
  let match,last=0,round='';
  while((match=re.exec(html))){
    const before=html.slice(last,match.index);
    const rounds=[...before.matchAll(/<div class="jornada-sep">([^<]+)<\/div>/gi)];
    if(rounds.length)round=decode(rounds.at(-1)[1]);
    last=re.lastIndex;
    const body=match[2];
    const teams=[...body.matchAll(/class="partido-card__name">([\s\S]*?)<\/span>/gi)].map(m=>decode(m[1]));
    if(teams.length!==2||!isTeamMatch(teams[0],teams[1],source))continue;
    const d=body.match(/class="partido-card__date">\s*(\d{1,2})\/(\d{1,2})\s*<\/span>/i);
    if(!d)continue; // Results without dates are not upcoming fixtures.
    const day=+d[1],month=+d[2],year=month>=8?2026:2027;
    const date=new Date(Date.UTC(year,month-1,day));
    if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)continue;
    const iso=date.toISOString().slice(0,10);
    const t=body.match(/class="partido-card__time">\s*(\d{1,2}:\d{2})\s*<\/span>/i);
    const v=body.match(/class="partido-card__pista">([\s\S]*?)<\/div>/i);
    const idp=match[1].match(/\/(\d+)\/?$/)?.[1];
    if(!idp)continue;
    matches.push({
      id:source.id+':contrast:'+idp,
      sourceId:source.id,source:'HockeyApp · contraste',
      sourceUrl:feed.url,detailUrl:'https://hockeyapp.es'+match[1],
      competition:source.competition,sport:source.sport,players:source.players,
      date:iso,time:t?t[1].padStart(5,'0'):null,home:teams[0],away:teams[1],
      venue:v?decode(v[1]):null,round:round||null,
      official:false,provisional:true,leagueId:feed.leagueId
    });
  }
  return [...new Map(matches.map(g=>[g.id,g])).values()].sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
}
export async function loadPublicContrast(){
  const games=[],status=[];
  await Promise.all(FEEDS.map(async feed=>{
    const ctrl=new AbortController(),tm=setTimeout(()=>ctrl.abort(),15000);
    try{
      const r=await fetch(feed.url,{signal:ctrl.signal,headers:{accept:'text/html'}});
      if(!r.ok)throw Error('HTTP '+r.status);
      const html=await r.text();
      if(!html.includes('partido-card__name'))throw Error('Formato de calendario no reconocido');
      for(const id of feed.sourceIds){
        const source=SOURCES.find(s=>s.id===id);
        const found=leagueGames(html,feed,source);
        games.push(...found);
        status.push({id:source.id,label:source.label,ok:true,games:found.length,sourceUrl:feed.url});
      }
    }catch(e){
      for(const id of feed.sourceIds){
        const source=SOURCES.find(s=>s.id===id);
        status.push({id,label:source.label,ok:false,error:String(e?.message||e),sourceUrl:feed.url});
      }
    }finally{clearTimeout(tm)}
  }));
  return {generatedAt:new Date().toISOString(),sourceType:'third-party-contrast',games,status};
}