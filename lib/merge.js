export function mergeCalendarGames(official,calendarSnapshot={}){
  const verified=new Set((official.status||[]).filter(s=>s.ok||s.lastSuccessAt).map(s=>s.id));
  const fixtures=(official.games||[]).filter(g=>g.official===true&&g.sourceId!=='calendar'&&!g.calendar&&verified.has(g.sourceId));
  const extras=(calendarSnapshot.events||[]).filter(g=>g.sourceId==='calendar'&&g.special===true&&g.calendarEventId&&g.date&&!g.cancelled);
  const games=[...new Map([...fixtures,...extras].map(g=>[g.id,g])).values()].sort((a,b)=>`${a.date||'9999'}T${a.time||'23:59'}`.localeCompare(`${b.date||'9999'}T${b.time||'23:59'}`));
  return {...official,status:official.status||[],games,calendarEvents:extras.length,calendarGeneratedAt:calendarSnapshot.generatedAt||null};
}
