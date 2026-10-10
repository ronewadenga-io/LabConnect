# LabConnect

A static browser prototype for reporting and managing computer laboratory faults, aligned
with the COM2301 Part B feasibility study (Student, Lecturer, Technician, Administrator).
Create an account, set up a head node and compute nodes, and use the dashboard and
reporting pages.

## Prototype limitations (read before demoing or grading)

This is a functional demonstration, not a production system:

- **No shared database.** All accounts, laboratories, computers and fault reports are
  stored in this browser's `localStorage` only. Nothing is shared between browsers,
  devices, or people — two people testing on different machines will not see each
  other's data.
- **No server-side authentication or permissions.** Passwords are hashed client-side
  with the Web Crypto API before being saved to `localStorage`; there is no server to
  verify identity or enforce access control. Role checks (Student/Lecturer/
  Technician/Admin) run in the browser and can be bypassed by anyone editing the page's
  JavaScript.
- **No live health checks.** "Cluster conditions", network status and storage figures
  on the dashboard are static/sample values from onboarding, not real telemetry from any
  computer.
- **No email, SMS or push notifications.** Status changes are only visible when a user
  is signed in and viewing the relevant page.
- **Single workspace only.** The "Cluster group" / laboratory list only contains the
  labs created during onboarding or by an Administrator; there is no multi-department
  or multi-campus support.
- **No photo upload** on fault reports yet, despite the doc listing it as optional.
- **SQL migrations are schema-only.** [db/migrations](db/migrations) defines the tables
  a real backend would use, but nothing in `src/` reads from or writes to a database —
  see [db/README.md](db/README.md).

## Run locally

Requires Java 17 or newer. From the project root, run:

```text
java LabConnectServer.java
```

Open http://127.0.0.1:8765. The JDK's built-in HTTP server serves the existing HTML, CSS and JavaScript files; there are no package installations, build tools, or third-party Java libraries. Pass a port number after the filename to use a different port. Use localhost for browser cryptography used by account creation.

## Project structure

```text
index.html                 Shared HTML shell and ordered script entry points
LabConnectServer.java      JDK-only local web server for the prototype
assets/
  css/main.css             Base layout, theme, and shared styles
  css/agent.css            Workspace and authentication styles
  images/                  Image assets
  icons/                   Local icon assets
  fonts/                   Local font assets
src/
  app.js                   Startup and global UI listeners
  router.js                Page navigation and titles
  config/                  Status definitions, storage keys, ticket status transitions
  state/                   Shared workspace and view state
  services/                Browser persistence, authentication, report/ticket lifecycle
  utils/                   Formatting and HTML escaping
  components/              Navigation, status badges, computer details
  pages/                   One file per application view
archive/
  old.html                 Original prototype, preserved unchanged
db/
  README.md                 How to run the migrations, and what they map to in src/
  migrations/                Numbered SQL schema migrations (not yet wired to the app)
docs/                     Architecture and conversion notes
tests/
  check-browser.cjs        Current workflow smoke check
  legacy/check-browser.cjs Historical demo check (not the current app)
```

## Ticket workflow

Fault reports ("tickets") move through: `Open → Acknowledged → In Progress → Resolved →
Closed`, with `Reopened` available from `Resolved` if a repair fails (which routes back
through `Acknowledged`). Invalid jumps (e.g. Open straight to Resolved) are rejected.
Every status change is recorded with the actor, timestamp and an optional/required note,
viewable from the "View" action in the technician fault queue.

Before a student can create a new ticket, the system checks for a matching unresolved
report on the same computer and fault type (from any student) and offers a "Confirm this
is still happening" action instead of creating a duplicate. Reports for different fault
types on the same computer are always kept as separate tickets.

Pages include dashboard, monitoring, laboratories, report submission, my reports, fault management, computers, users, analytics, authentication, and onboarding. These are JavaScript-rendered views inside the shared shell, not separate HTML documents. Existing navigation and visibility rules are preserved.

External Inter fonts and Font Awesome icons still load from their existing CDNs. The local asset folders are ready for replacements or additional assets.

## Verification

Requires Node.js 22+, the local HTTP server, and a **disposable** Chrome profile with remote debugging on port 9223. Run:

```sh
node tests/check-browser.cjs
```

Optional environment variables: `APP_URL` (default `http://127.0.0.1:8765/index.html`) and `DEBUG_URL` (default `http://127.0.0.1:9223`). The check creates a local test account and workspace, so do not attach it to a profile containing real workspace data. It checks signup, onboarding, all nine workspace views, searching, fault submission and resolution, session persistence, mobile navigation, and logout.

See [architecture and conversion notes](docs/architecture.md) for the migration boundaries.
