# Database migrations

SQL schema for a future LabConnect backend, modelled on the ER diagram in the Part B
document and on the record shapes the browser prototype already uses in
`src/config/constants.js` and `src/services/reports.js`.

**Status: not connected to the running app.** The prototype in `index.html`/`src/`
still stores everything in browser `localStorage` (see the Prototype limitations
section of the root [README](../README.md)). These migrations are schema-only
groundwork for the server-backed version described in `docs/architecture.md`; running
them creates empty tables but does not change how the current prototype behaves.

## Target engine

Written for PostgreSQL (uses `gen_random_uuid()` from the `pgcrypto`/`pgcrypto`-less
`uuid-ossp`-free `gen_random_uuid()` built into PostgreSQL 13+, `SERIAL`, `TIMESTAMPTZ`
and `CHECK` constraints). Adjust ID generation and identity columns if you target
MySQL or SQLite.

## Running the migrations

Apply the files in `migrations/` in numeric order, e.g.:

```sh
for f in db/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
```

Or point any SQL migration runner (Flyway, node-pg-migrate, `psql \i`, etc.) at the
`db/migrations/` folder — file names are zero-padded and sort correctly.

## Schema overview

| Table | Mirrors |
|---|---|
| `users` | `src/services/auth.js` account records (role: STUDENT/LECTURER/TECHNICIAN/ADMIN) |
| `laboratories` | `LABS` in `src/state/store.js` |
| `computers` | `computers` in `src/state/store.js` |
| `fault_types` | `FAULT_TYPES` in `src/config/constants.js` |
| `fault_reports` | fault objects created by `createFault()` in `src/services/reports.js` |
| `fault_confirmations` | the `confirmations` array on a fault (duplicate-report "confirm" action) |
| `fault_history` | the `history` array on a fault (actor, timestamp, note, per `changeFaultStatus()`) |

Ticket status values (`fault_reports.status` and `fault_history.status`) match
`FAULT_STATUSES`/`FAULT_TRANSITIONS` in `src/config/constants.js`:
`OPEN → ACKNOWLEDGED → IN_PROGRESS → RESOLVED → CLOSED`, with `REOPENED` reachable
from `RESOLVED` and looping back to `ACKNOWLEDGED`. The database only constrains the
*set* of valid values with `CHECK`; enforcing the *transition* rules is left to the
application layer (as it is today in `changeFaultStatus()`), the same way a real
backend would validate a request before writing a row.
