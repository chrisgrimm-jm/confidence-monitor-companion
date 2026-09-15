# Confidence Monitor — Companion Module

A [Bitfocus Companion](https://bitfocus.io/companion) module for the teleprompter half of
[Confidence Monitor](https://github.com/chrisgrimm-jm/confidence-monitor). Trigger a read from a
physical button, and see which one is live reflected back onto your board.

It talks directly to the same Firebase Realtime Database Confidence Monitor already uses (open,
unauthenticated — same access model the app itself relies on). No server of its own to run.

## What it does
- **Action: Trigger read (pick from library)** — dropdown of read names, live-updated as the
  Script Library changes in Confidence Monitor.
- **Action: Trigger read (type exact name)** — a text-entry fallback, matched case-insensitively.
- **Feedback: Read is LIVE** — make a button turn a color while its read is the one on the prompter.
- **Variables:** `live_read_name`, `read_count`.

## Install as a developer module (not published to the module store)
1. `npm install` in this folder (pulls in `@companion-module/base` and `firebase`).
2. In Companion's launcher window, click the **cog** (top right) → **Advanced Settings**.
3. Under **Developer**, set the **Developer modules path** to the *parent* folder of this repo —
   not this folder itself. e.g. if this repo lives at `~/Claude/confidence-monitor-companion`, set
   the path to `~/Claude`, not `~/Claude/confidence-monitor-companion`.
4. Enable **Enable Developer Modules**, then reopen the Companion GUI.
5. Add a new connection — "Jomboy Confidence Monitor" should now show up (as a **dev** module if a
   store version of the same id ever exists too).
6. In the connection's config, set **Topic** to match the Topic field on the Teleprompter card in
   Confidence Monitor's Control page (`adread` by default — they have to match exactly).

Companion auto-restarts the connection whenever you save a file in this folder, so you can edit
and test live.

## Sanity-checking without Companion running
`node test-harness.js` exercises the action/feedback/variable logic against the real Firebase
project (read-only by default — it reads the live library and current content, and prints what
the module would show/do). It does **not** fire a live trigger unless you explicitly set
`RUN_LIVE_TRIGGER=1`, since that would actually change what's on the real prompter.

## Why Firebase directly, not a Companion → app HTTP round trip
Confidence Monitor's own Control page already listens on this same Firebase path for triggers
(originally built for Companion's generic HTTP action to PATCH). This module does the identical
write, just from a proper Companion connection instead of a raw HTTP action per button — which is
what makes the dropdown-of-live-read-names and the LIVE feedback possible, since the module can
also *read* the same data Confidence Monitor reads.

---
Jomboy Media
