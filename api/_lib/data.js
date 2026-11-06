import calendarSnapshot from '../../data/calendar-events.json' with { type: 'json' };
import { mergeCalendarGames as merge } from '../../lib/merge.js';

export function mergeCalendarGames(official) {
  return merge(official, calendarSnapshot);
}
