// The calendar snapshot is generated from the private Google Calendar by the scheduled sync.
// A static JSON import ensures Vercel includes this file in the serverless bundle.
import calendarSnapshot from '../../data/calendar-events.json' with { type: 'json' };
import officialSnapshot from '../../data/games.json' with { type: 'json' };

export function mergeCalendarGames(official) {
  const federationGames = (official.games || []).filter(g => g.sourceId !== 'calendar' && !g.calendar);
  // If an official federation feed is temporarily blocked, retain the last
  // verified official fixtures rather than silently hiding every match.
  // Never substitute cached results for a source that is currently working.
  const workingSources = new Set((official.status || []).filter(s => s.ok).map(s => s.id));
  const cachedGames = (officialSnapshot.games || [])
    .filter(g => g.sourceId !== 'calendar' && !g.calendar && !workingSources.has(g.sourceId))
    .map(g => ({ ...g, cached: true, cachedAt: officialSnapshot.generatedAt }));
  const statuses = (official.status || []).map(s => {
    if (s.ok) return s;
    const cachedCount = cachedGames.filter(g => g.sourceId === s.id).length;
    return { ...s, cachedGames: cachedCount, cachedAt: cachedCount ? officialSnapshot.generatedAt : null };
  });
  // The latest complete snapshot is authoritative: deleted/cancelled events are absent.
  const extras = (calendarSnapshot.events || []).filter(
    g => g.sourceId === 'calendar' && g.special === true &&
      !!g.calendarEventId && !!g.date && !g.cancelled
  );
  const byId = new Map([...cachedGames, ...federationGames, ...extras].map(g => [g.id, g]));
  const games = [...byId.values()].sort((a, b) =>
    `${a.date}T${a.time || '23:59'}`.localeCompare(`${b.date}T${b.time || '23:59'}`)
  );
  return {
    ...official,
    status: statuses,
    games,
    calendarGeneratedAt: calendarSnapshot.generatedAt || null,
    calendarEvents: extras.length
  };
}

export function loadCachedGames() {
  return mergeCalendarGames(officialSnapshot);
}
