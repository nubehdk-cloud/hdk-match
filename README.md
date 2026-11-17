# HDK Match

Private family fixture viewer at https://hdk-match.vercel.app/.

As requested on 17 November 2026, official federation updates run **only on
Thursdays at 12:00 Europe/Madrid**, through the single ChatGPT automation
«Actualizar HDK Match los jueves». There are no GitHub Actions schedules,
Vercel crons, browser polling or HTTP refresh endpoints that contact federations.
Opening the app and pressing **Recargar datos** read the same shared JSON files.

The official websites work in the browser; direct server HTTP requests currently
return 403. The weekly task reads the visible official calendar tables once per
competition and writes `data/games.json`. See [the update procedure](docs/weekly-update.md).
The importer makes no network requests. Las Rozas/Pumas share calendar reads.
A failure keeps the last verified data for that source, with its original date
and a visible warning. Missing dates and times remain pending.

Sources: Majadahonda U15 (both), Majadahonda U18 (Andrés, subject to call-up),
Las Rozas Infantil and Juvenil, Pumas Infantil, and Oro Infantil for both clubs.
Jaca U18 match 837 is excluded at the user's request. Calendar special events
(AROK/tecnificaciones) stay in `data/calendar-events.json` and are not overwritten
by the weekly federation task.

`npm test` checks snapshot-only reads, APIs, partial failures, fixture identity,
missing times, Jaca exclusion and Thursday timing across daylight saving changes.
