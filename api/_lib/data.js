// The calendar snapshot is generated from the private Google Calendar by the scheduled sync.
// A static JSON import ensures Vercel includes this file in the serverless bundle.
import calendarSnapshot from '../../data/calendar-events.json' with { type: 'json' };
import officialSnapshot from '../../data/games.json' with { type: 'json' };

export function mergeCalendarGames(official) {
  const federationGames = (official.games || []).filter(g => g.sourceId !== 'calendar' && !g.calendar);
  // The latest complete snapshot is authoritative: deleted/cancelled events are absent.
  const extras = (calendarSnapshot.events || []).filter(
    g => g.sourceId === 'calendar' && g.special === true &&
      !!g.calendarEventId && !!g.date && !g.cancelled
  );
  const byId = new Map([...federationGames, ...extras].map(g => [g.id, g]));
  const games = [...byId.values()].sort((a, b) =>
    `${a.date}T${a.time || '23:59'}`.localeCompare(`${b.date}T${b.time || '23:59'}`)
  );
  return {
    ...official,
    games,
    calendarGeneratedAt: calendarSnapshot.generatedAt || null,
    calendarEvents: extras.length
  };
}

export function loadCachedGames() {
  return mergeCalendarGames(officialSnapshot);
}
