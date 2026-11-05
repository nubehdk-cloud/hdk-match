const urls=[
['ICE_LEAGUE','https://www.hockey.fedhielo.com/league/3657'],
['ICE_HUB','https://www.hockey.fedhielo.com/league/3628'],
['FMP_ROOT','https://www.hockeylinea.fmp.es/'],
['FMP_LEAGUE','https://www.hockeylinea.fmp.es/league/4798'],
['RFEP_LEAGUE','https://www.hockeylinea.fep.es/league/3609'],
['RFEP_OLD','https://www.hockeylinea.fep.es/index.php?option=com_php&competicion=3609']
];
for (const [name,url] of urls){
 const c=new AbortController(),timer=setTimeout(()=>c.abort(),10000);
 try{
  const r=await fetch(url,{signal:c.signal});
  const h=await r.text(),tags=['3657','4798','3609','LA NEVERA','SH MAJADAHONDA','PUMAS','JOKER FLOORS LAS ROZAS','<tr','partido-card','calendario','new_portal','api.sidgad.com','SIDGAD_API_CONFIG','fetch('];
  console.log('PAGE',name,'HTTP',r.status,'BYTES',h.length,'URL',r.url,'TITLE',h.match(/<title>([^<]+)<\/title>/)?.[1]||'-');
  for(const t of tags){
    const p=h.toUpperCase().indexOf(t.toUpperCase());
    if(p>=0)console.log('MATCH',name,t,p,JSON.stringify(h.slice(Math.max(0,p-160),Math.min(h.length,p+350)).replace(/\s+/g,' ')));
  }
  console.log('SCRIPT',name,JSON.stringify([...h.matchAll(/<script[^>]*src=["']([^"']+)["']/gi)].map(m=>m[1]).filter(s=>/sidgad|portales|api/i.test(s)).slice(0,15)));
 }catch(e){console.log('ERR',name,String(e))}
 finally{clearTimeout(timer)}
}
