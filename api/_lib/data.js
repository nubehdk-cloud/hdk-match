import calendarSnapshot from '../../data/calendar-events.json' with { type: 'json' };

export function mergeCalendarGames(official) {
  const federationGames = (official.games || []).filter(g => g.sourceId !== 'calendar' && !g.calendar);
  // Admit only fixtures obtained successfully from official federation feeds.
  // Never read, merge or display an older local fixture snapshot.
  const verifiedSources=new Set((official.status||[]).filter(s=>s.ok===true).map(s=>s.id));
  const freshFederationGames=federationGames.filter(g=>g.official===true&&verifiedSources.has(g.sourceId));
  // Special events are deliberately maintained in Google Calendar, separately
  // from federation fixtures. They are not a fallback for stale league games.
  const extras=(calendarSnapshot.events||[]).filter(g=>
    g.sourceId==='calendar' && g.special===true &&
    !!g.calendarEventId && !!g.date && !g.cancelled
  );
  const byId = new Map([...freshFederationGames,...extras].map(g=>[g.id,g]));
  const games = [...byId.values()].sort((a, b) =>
    `${a.date}T${a.time || '23:59'}`.localeCompare(`${b.date}T${b.time || '23:59'}`)
  );
  return {
    ...official,
    status: official.status || [],
    games,
    calendarEvents: extras.length,
    calendarGeneratedAt: calendarSnapshot.generatedAt || null
  };
}

