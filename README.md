# HDK Match

The app reads the RFEDH, FMP and RFEP calendars directly from the browser,
on opening, returning to the app, and pressing **Actualizar federaciones**.
SIDGAD currently returns HTTP 403 to hosting-server requests while allowing
the browser's cross-origin form requests. The browser reader makes one request
per league, shared between both players.

League games must come from a successful current official response. Neither
`data/games.json`, Calendar league entries nor offline caches supply fixtures.
Special events remain in `data/calendar-events.json`, independently of leagues.
The existing server API and updater remain available for compatibility; the
app does not depend on their access to SIDGAD.

Run `npm test` for calendar parsing, team order, missing times, shared requests
and failure handling.
