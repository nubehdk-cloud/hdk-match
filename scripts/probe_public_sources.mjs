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
