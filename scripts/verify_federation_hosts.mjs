// Single diagnostic request to each federation's OWN public domain.
// No alternate/nonofficial sources and no stored personal data.
const sites=[
  ["RFEDH","https://www.hockey.fedhielo.com/fedhielo/fedhielo_cal_idc_3657_31.php","https://www.hockey.fedhielo.com/league/3657",3657],
  ["FMP","https://www.hockeylinea.fmp.es/fmp/fmp_cal_idc_4798_2.php","https://www.hockeylinea.fmp.es/",4798],
  ["RFEP","https://www.hockeylinea.fep.es/rfep/rfep_cal_idc_3609_2.php","https://www.hockeylinea.fep.es/league/3609",3609]
];
for(const [label,url,referrer,idc] of sites){
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),10000);
  try{
    const r=await fetch(url,{
      method:"POST",redirect:"follow",signal:ctrl.signal,
      headers:{
        "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
        "Accept":"text/html,*/*",
        "Referer":referrer
      },
      body:new URLSearchParams({idc:String(idc),site_lang:"es"})
    });
    const body=await r.text();
    console.log(JSON.stringify({source:label,status:r.status,url:r.url,length:body.length,rows:(body.match(/<tr\b/gi)||[]).length,preview:body.slice(0,180).replace(/\s+/g," ")}));
  }catch(e){console.log(JSON.stringify({source:label,error:String(e).slice(0,130)}))}
  finally{clearTimeout(timer)}
}
