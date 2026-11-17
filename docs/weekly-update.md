# Single weekly official update

The owner authorized one update on Thursday at 12:00 Europe/Madrid. The one-off
initial repair ran on 17 November 2026. Do not add other scheduled jobs or live
browser/API fetching. No Calendar edits or messages to third parties.

## Before contacting federations

1. Retrieve the current main branch of `nubehdk-cloud/hdk-match` using connected
   GitHub access or Git. Read `data/games.json`, `lib/config.js`, this document,
   `lib/sidgad.js` and `scripts/update_official_games.mjs` from that revision.
2. Check Madrid local time. If not Thursday at/after 12:00, stop. If `weeklySlot`
   is today's Madrid date, stop before opening any federation page. A prior
   recorded attempt, even a failed one, must not be repeated this week.
3. Read each of the FIVE unique `calendarKey` entries once, sharing the Infantil
   FMP and Oro RFEP results between both clubs. Do not request player statistics,
   individual match sheets or other unrelated pages. Never retry denied feeds
   through alternate PHP endpoints, proxies, fingerprints or repeated polling.

## Read the official calendars

Use the available browser through its documented UI API. This route was verified
on 17 November with all five competitions. No federation login is required.
Do not use `fetch()` inside browser evaluation; read the rendered DOM only.
Read the full calendar (including missing dates) and verify heading and season.
If a title, season, table or completeness cannot be verified, record a failed
capture rather than an empty successful result. An explicit restriction or
verification challenge must be respected; leave that source unchanged.

- RFEDH U15: https://www.hockey.fedhielo.com/league/3657
- RFEDH U18: https://www.hockey.fedhielo.com/league/3646
- FMP Infantil: https://www.hockeylinea.fmp.es/league/4798?liga=4798&vista=calendar
- FMP Juvenil: https://www.hockeylinea.fmp.es/league/4798?liga=4799&vista=calendar
- RFEP Oro: https://www.hockeylinea.fep.es/league/3609?liga=3609&vista=calendar

For FMP/RFEP, if a landing page appears, select the named competition then
«CALENDARIO Y RESULTADOS». Verify the selected checkbox and the competition
heading before extracting. The complete season currently appears in one table.

Modern FMP/RFEP rows are under `#sidgad-liga-main tr`:
- A `.sidgad-calendario-jornada` row supplies the round for following matches.
- `.sidgad-col-dia`, `.sidgad-col-hora`, `.sidgad-col-pista`,
  `.sidgad-col-equipo-home`, `.sidgad-col-equipo-away` supply visible values.
- Keep rows involving LAS ROZAS or PUMAS as applicable. Do not use rink names to
  identify teams. Use null for an empty time. Keep an empty date as pending.
- Leave `matchId` absent: rounds + team names form a stable identity. Do not use
  details-button IDs only available after a match has been played.

RFEDH uses `#my_calendar_table tr.team_class` (multiple tables can share the ID).
Heading: `#titulo_competicion_header`. Within each row: `td` indices 0 = published
match number (`matchId`), 1 = DD/MM/YYYY, 2 = time, 3 = venue (usually empty),
4 = round. The two `.nombre_junto_logo` entries are home/away. Keep LA NEVERA or
MAJADAHONDA. Read the table itself; the blank team slots in unqualified playoffs
are not fixtures of Majadahonda. Do not invent qualification, dates or times.

Capture each successful result as:
```json
{"calendarKey":"fmp_infantil","url":"https://www.hockeylinea.fmp.es/league/4798?liga=4798&vista=calendar","heading":"LIGA INFANTIL 1 | 2026/2027","complete":true,"rows":[{"date":"22/11/2026","time":"10:30","home":"CPLM A","away":"LAS ROZAS","venue":"CENTRO DEP. MUN. FRANCISCO FDEZ. OCHOA","round":"JORNADA 5"}]}
```
The example is schema-only; never reuse example rows as current results.
For failure: `{ "calendarKey":"...", "complete":false, "error":"..." }`.
Collect all captures into `{ "captures": [...] }` in a temporary file.

## Save, deploy and verify

Run `node scripts/update_official_games.mjs < captures.json`. Do not use
`--initial` on a scheduled run. The importer enforces the Thursday window and
weeklySlot idempotency, replaces successfully verified source sets, preserves
failed source sets and their original timestamps, and applies user exclusions.
It never reads the network. `data/calendar-events.json` must remain byte-identical.

Publish **only data/games.json** to main using Git or GitHub update_file with the
latest file SHA. If main changed, reread and reconcile before writing; never
force-push. Writing the weekly check timestamp is intentional even if fixtures
are unchanged, so the app shows the actual successful verification date.

GitHub main is linked to the Vercel project `hdk-match`
(`prj_1FgPWgTYNSIBPXbc3zsPSSdgLmCx`, team `team_KbImI4JCjVuH3NrOaUwTyk9C`).
Check its matching production deployment. If no deployment was triggered, use
Vercel create_deployment from that exact Git commit; do not change protection,
visibility, pricing or other project settings. Verify the production
`https://hdk-match.vercel.app/data/games.json` using authenticated Vercel web fetch
and compare checkedAt/weeklySlot/status counts. This readback never contacts a
federation. On an uncertain commit/deployment, reconcile existing state before
retrying. Report actual failures without claiming an update succeeded.

Briefly report material changes or any failed source. If all sources succeeded
and only timestamps changed, no notification is needed. Do not schedule retries;
the next attempt is the following Thursday unless the user expressly asks.
