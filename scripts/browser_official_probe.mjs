import { launch } from 'puppeteer-core';
const sites=[
  ['RFEDH U15','https://www.hockey.fedhielo.com/league/3657'],
  ['FMP Infantil','https://www.hockeylinea.fmp.es/'],
  ['RFEP Oro Infantil','https://www.hockeylinea.fep.es/league/3609']
];
const browser=await launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
  for(const [label,url] of sites){
    const page=await browser.newPage();
    await page.setViewport({width:1280,height:900});
    const blocked=[];
    page.on('response',r=>{if(r.status()>=400&&(/sidgad|fmp.es|fep.es|fedhielo.com/.test(r.url())))blocked.push({status:r.status(),url:r.url().replace(/\?.*$/,'').slice(0,190)})});
    try{
      const r=await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});
      await new Promise(r=>setTimeout(r,6500));
      const d=await page.evaluate(()=>({title:document.title,length:document.body?.innerText?.length||0,teams:document.body?.innerText?.includes('LAS ROZAS')||false,fixtures:(document.body?.innerText?.match(/\b\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}\b/g)||[]).length,matchCards:document.querySelectorAll('.partido-card,.partido-link,.game_report,.cal_idc').length,preview:(document.body?.innerText||'').slice(-1000).replace(/\s+/g,' ')}));
      console.log(JSON.stringify({label,http:r?.status(),result:d,blocked:blocked.slice(0,15)}));
    }catch(e){console.log(JSON.stringify({label,error:String(e),blocked:blocked.slice(0,12)}))}
    finally{await page.close()}
  }
}finally{await browser.close()}
