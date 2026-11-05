
export function mergeCalendarGames(official) {
  const federationGames = (official.games || []).filter(g => g.sourceId !== 'calendar' && !g.calendar);
  // Admit only fixtures obtained successfully from official federation feeds.
  // Never read, merge or display an older local fixture snapshot.
  const verifiedSources=new Set((official.status||[]).filter(s=>s.ok===true).map(s=>s.id));
  const freshFederationGames=federationGames.filter(g=>g.official===true&&verifiedSources.has(g.sourceId));
  // This view is strictly for live-verified official federation fixtures.
  // Independently scheduled calendar events are intentionally not displayed here.
  const byId = new Map(freshFederationGames.map(g=>[g.id,g]));
  const games = [...byId.values()].sort((a, b) =>
    `${a.date}T${a.time || '23:59'}`.localeCompare(`${b.date}T${b.time || '23:59'}`)
  );
  return {
    ...official,
    status: official.status || [],
    games,
    calendarEvents: 0
  };
}

