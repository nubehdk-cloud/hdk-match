// Diagnostic for publicly published federation league pages (GET only).
const sources=[
  ['FMP', 'https://www.hockeylinea.fmp.es/league/4798'],
  ['RFEP', 'https://www.hockeylinea.fep.es/league/3609'],
  ['RFEDH', 'https://www.hockey.fedhielo.com/league/3657'],
  ['SIDGAD bare', 'https://server2.sidgad.es/fmp/fmp_cal_idc_4798_2.php']
];
for(const [label,url] of sources){
  try {
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),12000);
    let r;
    try{r=await fetch(url,{method:'GET',signal:ctrl.signal,headers:{accept:'text/html,application/xhtml+xml'}});}
    finally{clearTimeout(timer)}
    const html=await r.text();
    const scripts=[...html.matchAll(/<script[^>]*src=["']([^"']+)["']/gi)].slice(0,6).map(x=>x[1]);
    const forms=[...html.matchAll(/<form[^>]*action=["']([^"']+)["']/gi)].slice(0,3).map(x=>x[1]);
    const title=(html.match(/<title[^>]*>([^<]*)<\/title>/i)||[])[1]||'';
    const leagues=[...html.matchAll(/(calendar|calendario|sidgad|league|equipo)/gi)].length;
    console.log(JSON.stringify({label,status:r.status,url:r.url,bytes:html.length,title,rows:(html.match(/<tr\b/gi)||[]).length,leagues,scripts,forms,sample:html.slice(0,1000).replace(/\s+/g,' ')}));
  }catch(e){console.log(JSON.stringify({label,error:String(e)}))}
}

const inspection=[
  ['FMP ROOT','https://www.hockeylinea.fmp.es/'],
  ['FMP HTTP','http://www.hockeylinea.fmp.es/league/4798'],
  ['RFEP PAGE','https://www.hockeylinea.fep.es/league/3609'],
  ['RFEDH PAGE','https://www.hockey.fedhielo.com/league/3657']
];
for (const [label,url] of inspection){
  try {
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
    let res;try{res=await fetch(url,{signal:ctrl.signal})}finally{clearTimeout(timer)}
    const html=await res.text();
    console.log('INSPECT',label,res.status,res.url,'bytes',html.length);
    for(const needle of ['3609','4798','3657','JOKER FLOORS','PUMAS DEL NORTE','LA NEVERA','CALENDARIO','cal_idc','new_portal','api/','json','iframe']){
      const p=html.toUpperCase().indexOf(needle.toUpperCase());
      if(p>=0) console.log('MATCH',label,needle,p,html.slice(Math.max(0,p-250),p+500).replace(/\\s+/g,' ').slice(0,750));
    }
    const u=[...new Set([...html.matchAll(/https?:[^"'<> ]+/g)].map(m=>m[0]).filter(x=>/sidgad|api|league/i.test(x)))].slice(0,15);
    console.log('URLS',label,JSON.stringify(u));
  }catch(e){console.log('INSPECT ERROR',label,String(e))}
}


const newPortal='https://www.hockeylinea.fep.es/league/3609';
try{
  const html=await (await fetch(newPortal)).text();
  for(const needle of ['api.sidgad.com','apiBase','api_url','leagueId','"idc"','sidgad-league.js','window.__','__INITIAL','new_portal','match-card','league/3609']){
    let from=0,count=0;while(count<3){
      const p=html.toLowerCase().indexOf(needle.toLowerCase(),from);if(p<0)break;
      console.log('PORTAL CONTEXT',needle,p,JSON.stringify(html.slice(Math.max(0,p-330),p+550).replace(/\s+/g,' ')));
      from=p+needle.length;count++;
    }
  }
  const scripts=[...html.matchAll(/<script[^>]*src=["']([^"']+)["']/gi)].map(x=>x[1]).filter(x=>x.includes('sidgad'));
  console.log('PORTAL JS',JSON.stringify(scripts.slice(0,40)));
  const candidates=scripts.filter(x=>/core|router|league/i.test(x)).slice(0,4);
  for(const url of candidates){
    try{
      const r=await fetch(url),js=await r.text();console.log('JS FILE',url,r.status,js.length);
      for(const needle of ['api.sidgad.com','/api/','/v1/','league','fetch(','sidgad.cloud']){
        const p=js.toLowerCase().indexOf(needle.toLowerCase());
        if(p>=0)console.log('JS CONTEXT',needle,p,JSON.stringify(js.slice(Math.max(0,p-200),p+500).replace(/\s+/g,' ')));
      }
    }catch(e){console.log('JS ERROR',url,String(e))}
  }
}catch(e){console.log('PORTAL ERROR',String(e))}
