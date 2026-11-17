import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SOURCES} from '../lib/config.js';
import {parseOfficialRows,buildSnapshot} from '../lib/sidgad.js';
import {loadAppData} from '../lib/app-data.js';
import {mergeCalendarGames} from '../lib/merge.js';
import {weeklySlot,nextUpdate,isPast} from '../lib/schedule.js';
import gamesApi from '../api/games.js';
import refreshApi from '../api/refresh.js';
const fmp=SOURCES.find(s=>s.id==='fmp_infantil');
const row={date:'22/11/2026',time:'10:30',home:'CPLM A',away:'LAS ROZAS',venue:'CENTRO DE PATINAJE LAS ROZAS',round:'ROUND 5'};
const capture=(rows=[row])=>({calendarKey:fmp.calendarKey,url:fmp.url,heading:'LIGA INFANTIL 1 | 2026/2027',complete:true,rows});

test('uses team columns, keeps missing times and stable identity when a fixture moves',()=>{
  const a=parseOfficialRows(fmp,[row])[0];
  const b=parseOfficialRows(fmp,[{...row,date:'23/11/2026',time:null}])[0];
  assert.equal(a.home,'CPLM A');assert.equal(a.away,'LAS ROZAS');
  assert.equal(b.time,null);assert.equal(b.id,a.id);assert.equal(b.date,'2026-11-23');
  assert.equal(parseOfficialRows(fmp,[{...row,date:''}])[0].date,null);
  assert.throws(()=>parseOfficialRows(fmp,[{...row,date:'31/02/2027'}]));
});
test('excludes the Jaca U18 fixture by identity even if it is moved',()=>{
  const source=SOURCES.find(s=>s.id==='rfedh_u18');
  assert.equal(parseOfficialRows(source,[{...row,home:'CH JACA',away:'LA NEVERA',matchId:'837',date:'22/11/2026'}]).length,0);
  assert.equal(parseOfficialRows(source,[{...row,home:'CH JACA',away:'LA NEVERA',matchId:'849'}]).length,1);
});
test('failed and incomplete updates preserve verified matches and dates, never counterfeit freshness',()=>{
  const first=buildSnapshot({},[capture()],'2026-11-17T11:00:00Z');
  const failed=buildSnapshot(first,[],'2026-11-19T11:10:00Z');
  assert.deepEqual(failed.games,first.games);
  assert.equal(failed.generatedAt,first.generatedAt);
  assert.equal(failed.status.find(s=>s.id===fmp.id).lastSuccessAt,first.generatedAt);
  assert.equal(failed.status.find(s=>s.id===fmp.id).ok,false);
  assert.deepEqual(buildSnapshot(first,[capture([])],'2026-11-19T11:10:00Z').games,first.games);
  assert.deepEqual(buildSnapshot(first,[{...capture(),heading:'LIGA JUVENIL | 2026/2027'}]).games,first.games);
  assert.deepEqual(buildSnapshot(first,[{...capture(),heading:'LIGA INFANTIL 1 | 2025/2026'}]).games,first.games);
  const moved=buildSnapshot(first,[capture([{...row,date:'23/11/2026'}])],'2026-11-19T11:10:00Z');
  assert.equal(moved.games.length,1);assert.equal(moved.games[0].date,'2026-11-23');
});
test('Calendar supplies only special events and never unverified league fixtures',()=>{
  const first=buildSnapshot({},[capture()]);
  const extra={id:'arok',sourceId:'calendar',special:true,calendarEventId:'arok',date:'2026-12-26'};
  const merged=mergeCalendarGames(first,{events:[extra,{...extra,id:'league',special:false},{...extra,id:'deleted',cancelled:true}]});
  assert.equal(merged.calendarEvents,1);assert.equal(merged.games.length,2);
  const failed=buildSnapshot(first,[]);
  assert.equal(mergeCalendarGames(failed,{events:[extra]}).games.length,2);
});
test('opening and repeated reloads request only two same-origin snapshots; both APIs make no network calls',async()=>{
  const original=globalThis.fetch,calls=[];
  const snapshot=buildSnapshot({},[capture()]);
  globalThis.fetch=async url=>{
    calls.push(url);
    assert.ok(['/data/games.json','/data/calendar-events.json'].includes(url));
    return new Response(JSON.stringify(url.includes('calendar-')?{events:[]}:snapshot));
  };
  try{
    await loadAppData();await loadAppData();
    assert.deepEqual(calls,['/data/games.json','/data/calendar-events.json','/data/games.json','/data/calendar-events.json']);
    globalThis.fetch=()=>{throw new Error('Unexpected network request')};
    for(const handler of [gamesApi,refreshApi]){
      const response={setHeader(){},status(code){assert.equal(code,200);return this},json(data){assert.ok(data.games.length);return data}};
      await handler({},response);
    }
  }finally{globalThis.fetch=original}
});
test('special events remain visible when the saved official file is unavailable',async()=>{
  const event={id:'arok',sourceId:'calendar',special:true,calendarEventId:'arok',date:'2026-12-26'};
  const data=await loadAppData(async()=>{throw new Error('offline')},async()=>({events:[event]}));
  assert.deepEqual(data.games,[event]);assert.equal(data.officialStatus.ok,false);
});
test('Thursday noon uses Madrid time in winter and summer, including the boundary',()=>{
  assert.equal(weeklySlot(new Date('2026-11-19T10:59:59Z')),null);
  assert.equal(weeklySlot(new Date('2026-11-19T11:00:00Z')),'2026-11-19');
  assert.equal(weeklySlot(new Date('2027-04-01T09:59:59Z')),null);
  assert.equal(weeklySlot(new Date('2027-04-01T10:00:00Z')),'2027-04-01');
  assert.equal(weeklySlot(new Date('2026-11-18T14:00:00Z')),null);
  assert.equal(nextUpdate(new Date('2026-11-17T12:00:00Z')),'2026-11-19T12:00');
  assert.equal(nextUpdate(new Date('2026-11-19T11:00:00Z')),'2026-11-26T12:00');
  assert.equal(isPast({date:'2026-11-21',time:'14:35'},new Date('2026-11-21T13:34:00Z')),false);
  assert.equal(isPast({date:'2026-11-21',time:'14:35'},new Date('2026-11-21T13:36:00Z')),true);
});
test('initial persisted data has all seven sources and keeps the calendar file intact',()=>{
  const saved=JSON.parse(fs.readFileSync(new URL('../data/games.json',import.meta.url)));
  assert.deepEqual(new Set(saved.status.map(s=>s.id)),new Set(SOURCES.map(s=>s.id)));
  assert.ok(saved.status.every(s=>s.ok&&s.lastSuccessAt));
  assert.ok(!saved.games.some(g=>g.sourceId==='rfedh_u18'&&g.matchId==='837'));
  const calendar=JSON.parse(fs.readFileSync(new URL('../data/calendar-events.json',import.meta.url)));
  assert.ok(calendar.events.some(e=>/AROK/i.test(e.title||e.competition||'')));
});
