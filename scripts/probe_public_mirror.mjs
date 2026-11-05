const pages=[
['rfedh_u15','https://hockeyapp.es/hockey-hielo/26-27/liga-nacional-hockey-hielo-u15/fedhielo_3657'],
['rfep_infantil_oro','https://hockeyapp.es/hockey-linea/26-27/liga-oro-infantil/rfep_3609'],
['fmp_infantil','https://hockeyapp.es/hockey-linea/26-27/liga-infantil-1/fmp_4798']
];
for(const [id,url] of pages){
  const ctrl=new AbortController(),tm=setTimeout(()=>ctrl.abort(),12000);
  try{
    const res=await fetch(url,{signal:ctrl.signal,headers:{accept:'text/html'}});
    const html=await res.text();
    const terms=['__NEXT_DATA__','__next_f','__NUXT_DATA__','application/ld+json','Próximos Partidos','JORNADA','LA NEVERA','LAS ROZAS','PUMAS'];
    console.log('MIRROR',id,res.status,html.length,res.url);
    for(const t of terms){let at=html.toLowerCase().indexOf(t.toLowerCase());if(at>=0)console.log('MIRROR-MATCH',id,t,at,html.slice(Math.max(0,at-130),at+320).replace(/\s+/g,' ').slice(0,400))}
    console.log('MIRROR-PREVIEW',id,html.slice(0,700).replace(/\s+/g,' '));
  }catch(e){console.log('MIRROR-ERROR',id,String(e))}
  finally{clearTimeout(tm)}
}