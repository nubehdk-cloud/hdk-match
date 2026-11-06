import test from 'node:test';
import assert from 'node:assert/strict';
import { SOURCES } from '../lib/config.js';
import { loadGames, parseCalendarRows } from '../lib/sidgad.js';
import { loadAppData } from '../lib/app-data.js';

const fmp=SOURCES.find(s=>s.id==='fmp_infantil');
// Same column structure as the official calendars, including the hidden round.
const row=(home,away,{date='14/11/2026',time='19:40',venue='CENTRO DE PATINAJE LAS ROZAS',score='-',round='JORNADA 4'}={})=>`<tr>
<td></td><td>${date}</td><td>${time}</td><td>${venue}</td>
<td class="jor_in_games">${round}</td><td><img></td>
<td><div class="no_mobile nombre_junto_logo">${home}</div></td>
<td><img></td><td><div class="no_mobile nombre_junto_logo">${away}</div></td>
<td class="web_link_td">${score}</td></tr>`;

test('keeps home and away columns even when the rink contains the away team name',()=>{
  const [game]=parseCalendarRows(fmp,row('PUMAS','LAS ROZAS'));
  assert.equal(game.home,'PUMAS');
  assert.equal(game.away,'LAS ROZAS');
  assert.equal(game.date,'2026-11-14');
  assert.equal(game.time,'19:40');
  assert.equal(game.venue,'CENTRO DE PATINAJE LAS ROZAS');
  assert.equal(game.round,'JORNADA 4');
});

test('keeps an unpublished time empty instead of reading a score as a time',()=>{
  const [game]=parseCalendarRows(fmp,row('LAS ROZAS','PUMAS',{time:'',score:'11:00'}));
  assert.equal(game.time,null);
  assert.equal(parseCalendarRows(fmp,row('LAS ROZAS','PUMAS',{date:''})).length,0);
  assert.equal(parseCalendarRows(fmp,row('','LAS ROZAS')).length,0);
});

test('reads the new RFEP calendar columns and round headings',()=>{
  const source=SOURCES.find(s=>s.id==='rfep_infantil_oro');
  const html=`<tr><td colspan="12">JORNADA 3</td></tr><tr>
  <td class="sidgad-col-dia">19/12/2026</td><td class="sidgad-col-hora">12:30</td>
  <td class="sidgad-col-pista">POLIDEPORTIVO MUNICIPAL MARCELO ESCUDERO</td>
  <td class="sidgad-col-equipo-home"><a>ESPANYA HOQUEI CLUB</a></td>
  <td class="sidgad-col-equipo-away"><a>JOKER FLOORS LAS ROZAS</a></td></tr>`;
  const [game]=parseCalendarRows(source,html);
  assert.equal(game.home,'ESPANYA HOQUEI CLUB');
  assert.equal(game.away,'JOKER FLOORS LAS ROZAS');
  assert.equal(game.time,'12:30');
  assert.equal(game.round,'JORNADA 3');
  assert.equal(game.venue,'POLIDEPORTIVO MUNICIPAL MARCELO ESCUDERO');
});

test('fetches three live calendars for five sources and never restores older league games',async()=>{
  const originalFetch=globalThis.fetch;
  const originalWindow=globalThis.window;
  const calls=[];
  let fail=false;
  globalThis.window={};
  globalThis.fetch=async(url,options)=>{
    calls.push({url,options});
    if(fail)return new Response('Forbidden',{status:403});
    const html=url.includes('/fmp/')?row('LAS ROZAS','PUMAS'):
      url.includes('/rfep/')?row('JOKER FLOORS LAS ROZAS','PUMAS DEL NORTE'):
      row('LA NEVERA','CH JACA');
    return new Response(html);
  };
  const extra={id:'arok',sourceId:'calendar',special:true,calendarEventId:'calendar-arok',date:'2026-12-26'};
  const calendar=async()=>({events:[extra,{...extra,id:'calendar-league',special:false}]});
  try{
    const first=await loadAppData(loadGames,calendar);
    assert.equal(calls.length,3);
    assert.equal(first.status.filter(s=>s.ok).length,5);
    assert.equal(first.games.filter(g=>g.official).length,5);
    assert.equal(first.games.filter(g=>g.special).length,1);
    for(const {options} of calls){
      assert.equal(options.method,'POST');
      assert.equal(options.cache,'no-store');
      assert.deepEqual(Object.keys(options.headers),['content-type']);
    }
    fail=true;
    const second=await loadAppData(loadGames,calendar);
    assert.equal(second.status.filter(s=>s.ok).length,0);
    assert.deepEqual(second.games,[extra]);
    assert.equal(second.calendarStatus.ok,true);
  }finally{
    globalThis.fetch=originalFetch;
    if(originalWindow===undefined)delete globalThis.window;
    else globalThis.window=originalWindow;
  }
});

test('keeps live federation games available if the special-event request fails',async()=>{
  const game={id:'official',sourceId:fmp.id,official:true,date:'2026-11-14'};
  const data=await loadAppData(async()=>({games:[game],status:[{id:fmp.id,ok:true}]}),async()=>{throw new Error('offline')});
  assert.deepEqual(data.games,[game]);
  assert.equal(data.calendarStatus.ok,false);
});
