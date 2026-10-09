# Test report — New Creation 2.0 (4 October 2026)

All testing used sample data: the in-browser demo, mocked Google services, or the separate **test** spreadsheet on the deployed server. No real member's account was used, and no real member was emailed or posted as.

## Summary

| Suite | Where | Result |
|---|---|---|
| Server unit tests (`server/tests.js`) | Mocked Google services | **68 / 68 passed** |
| Earlier challenge tests (`server/legacy_tests.js`) | Mocked | **24 / 24 passed** |
| Browser journeys (`tools/e2e.js`) | Real app + demo backend, Chromium | **80 / 80 passed** |
| Deployed server journeys (`tools/live_api.js`) | **Live Apps Script v14, test sheet** | **38 / 38 passed** |
| Deployed app + server (`tools/live_ui.js`) | Real app → live API (test env), throttled | Passed, no page errors |
| Production checks | Live API, production env | `ping` OK (14 members); old Apps Script page still served (HTTP 200) |

## Covered journeys

| Requirement | Evidence |
|---|---|
| Join through a personal invitation | e2e: invite shows "Naledi invited you"; live: `inviter` resolves the name |
| Returning sign-in, wrong PIN, recovery guidance | e2e + live (rate limit after 5 failures: unit) |
| Leader PIN reset keeps reading history | live: reset → old session ends → new PIN signs in with chapter count intact |
| Bible navigation (OT/NT picker), passage lookup, search | e2e: John 3 via picker; "Rom 8:28"; "living water" → John 4:10 |
| Bookmarks, highlights, private notes; owner-only | e2e: listed under Me and stored on the server; live: other member sees 0 private items |
| Share verse with reference + translation; WhatsApp draft | e2e: link contains "Psalms 23:1 (BSB)" |
| Saved reading position | e2e: returns to Isaiah 40 |
| Complete and undo chapters; repeated taps | e2e + live: idempotent ticks; undo restores; server count consistent |
| Count a chapter once per challenge | unit: duplicated schedule entry counts once |
| Late joiner: starts on joining day; earlier days optional, never overdue | e2e: "You joined on day 12", no "behind" wording; live: startDay = today's day |
| Leader measured from day 1 | unit |
| Post each type; filter; delete own; leader moderation | e2e (all 4 types) + live |
| "I prayed for you" | e2e + live |
| Prayer notification to leader without the request text | live: test sheet Outbox shows "New prayer request" with no request text |
| Draft kept on refresh and on failure; no duplicate on retry | e2e: offline post kept with retry message; retry stored exactly once |
| Daily group post (reading, deep study, question, link), copy + WhatsApp | e2e |
| Challenge: schedule, overlap prevented, edit, cancel, preview, announce | e2e + live |
| Automatic rollover without anyone opening the app; history kept | live: test clock moved to the start date → everyone in the new challenge, fresh progress, previous chapters preserved. The current challenge is worked out from the date on every request, so there is no midnight job that could run twice or be missed. |
| Permission boundaries | unit + live: members cannot open leader data, reset PINs, delete others' posts; phone numbers not sent to members |
| Account export and deletion | unit + live: export has no credentials; deletion needs PIN and removes all rows |
| Sign-out clears private cached data | e2e + live UI |
| Offline queue and sync status | e2e: tick while offline → "Offline · 1 to sync" → syncs when back online |
| Original languages | e2e: Hebrew right-to-left with transliteration; verb explained ("Qal…"); lexicon loads; 1 John 5:7 manuscript note; "Explore original text" from a verse; word study saved |
| Layouts | e2e screenshots at 390 px (phone), 820 px (tablet), 1366 px (desktop); no horizontal scrolling |
| Accessibility | axe-core (WCAG 2 A/AA): no serious or critical issues on all seven main views; contrast checked in dark and sepia themes |

## Measured loading (Chromium, throttled to 4 Mbps down / 150 ms latency)

| Moment | Demo (local server code) | Live (real Apps Script, test sheet) |
|---|---|---|
| New Creation identity on screen | 0.49 s | 0.49 s |
| Sign-in form ready (first visit) | 1.4 s | 1.3 s |
| Sign in → Today with content | 1.0 s | **4.4 s** |
| Returning visit → Today with content | 0.39 s | **0.12 s** (saved copy) |
| Returning visit → fresh data from server | — | 4.3 s, in the background |
| Open a Bible chapter | 0.13 s | 0.05 s |
| Open Original languages | 0.31 s | — |
| Circle posts | — | 0.04 s (fetched in advance) |

Live API calls: median **2.3 s**, 90th percentile 3.5 s, slowest 5.4 s (48 calls). This is Google Apps Script's own start-up and Sheets access time. The app hides it by showing saved data immediately and syncing in the background. The two-second target is met for returning members, but **not for the very first sign-in** (about 4.4 s). Moving the server to a dedicated database would be the way to remove that.

## Not yet verified

- **Publishing on GitHub Pages and installing on real phones** (Android "Install app", iPhone "Add to Home Screen"). Waiting for the GitHub connection.
- **Real email delivery for the production prayer notice.** The test sheet's Outbox proved the content. Production uses the same code path with MailApp, which already sends your join and summary emails.
- **WhatsApp opening on a phone.** Link format checked; the app was not opened in the test browser.
- **Screen readers.** Checked automatically with axe and with keyboard focus order; not yet tried with VoiceOver or TalkBack.
- **Hebrew and Greek fonts on older Android phones** (they load from Google Fonts).
- **POPIA.** The privacy notice is a draft for your review, ideally with someone who knows POPIA.

## Published site check (2026-10-04)

Address: https://uhuru245.github.io/new-creation/ (GitHub Pages, repository Uhuru245/new-creation)

| Check | Result |
|---|---|
| Browser journeys and accessibility, sample data (`?demo=1`) | 80 passed, 0 failed |
| Sign-in and Leader tools against the live server's TEST data (`?env=test`) | Passed, no errors |
| Service worker active, install manifest found, 4 icons | Passed |

Timings on the published site: opening screen 0.57 s; returning member sees Today 0.08 s; first sign-in 6.9 s (Apps Script round trips); chapter opens 0.21 s.

## Listen feature (2026-10-04)

| Check | Result |
|---|---|
| All 3 × 1,189 narrated chapter files exist at the expected addresses | Passed (0 missing) |
| Player: start, narrator switch, pause, next chapter, stop, Today's reading queue | 11 passed |
| Accessibility with the player and listening options open (axe, serious/critical) | Passed |
| Full browser journey suite after the change | 80 passed, 0 failed |

Bug found and fixed while testing: when fresh data arrived from the server while a member was opening another page from Today, the app could jump back to Today. It now only refreshes the page that is showing.

## Move to www.mret.co.za/new-creation/ (2026-10-04)

www.mret.co.za is now a home page (separate repository Uhuru245/Uhuru245.github.io). New Creation is served at https://www.mret.co.za/new-creation/, and the old github.io address forwards there.

| Check | Result |
|---|---|
| Home page: swipe, arrows, drag into the slot opens New Creation, Coaching marked "coming soon", accessibility, no sideways scroll | 10 passed |
| New Creation browser journeys at the new address | 80 passed, 0 failed |
| Listen feature at the new address | 13 passed |
| Live sign-in and Leader tools against TEST data | Passed |
| Service worker scope is /new-creation/ | Passed |

Bug found and fixed: signing out waited for the server before clearing the phone, and a slow answer arriving afterwards could save the Circle cache again. The app now clears the phone first, then tells the server, and ignores answers that arrive after sign-out.

## Follow-along highlighting and worship music (2026-10-04)

- Verse timings for all 1,189 chapters for each narrator were worked out from the pauses in each recording (tools/timing). They are approximate.
- Checked against a speech-recognition transcript of four chapters:

| Narrator, chapter | Verses within 1 second | Largest miss |
|---|---|---|
| Bob Souer, Genesis 1 | 31 of 31 | 0.9 s |
| Bob Souer, John 3 | 34 of 36 | 2.2 s |
| Barry Hays, Genesis 1 | 30 of 31 | 2.2 s |
| Jordan Gilbert, Romans 8 | 33 of 39 | 3.4 s |

- Browser checks: verse highlight follows playback, "Listen from here" starts at the chosen verse, worship music starts and stops with the narration, listening from Today opens the chapter, listening options pass accessibility checks (7 passed). Full journey suite 80 passed; audio suite 13 passed.

## Back-on-track plan (2026-10-07)

For members who have missed chapters since they joined. Chapters before a late joiner's start day stay optional and are never included.

- Today shows "N chapters to catch up" with a button to make a plan.
- The member picks a pace: in 3, 7 or 14 days, or by the end of the challenge. Each choice shows the extra chapters a day and the minutes (from the narrated recordings). The quickest pace of five or fewer extra chapters a day is marked "Suggested".
- Each day lists that day's catch-up chapters (fixed for the day), with tick boxes, a progress bar and a "Listen to the catch-up chapters" button. If a day is missed, the remaining chapters are spread over the days left.
- When everything is caught up, it says "You're back on track." If the end date passes first, it offers a new plan.
- The plan is private to the member and syncs across their devices. The leader's encouragement message now points to the plan.

| Check | Result |
|---|---|
| Back-on-track journey (offer, pace choices, plan, tick, progress, saved privately, caught up, close) and accessibility | 11 passed |
| Full browser journey suite | 80 passed, 0 failed |

Fixed in the demo: the sample challenge's start date now moves with today's date, so a new demo member starts on the right day.

## Back button and late-joiner plan (2026-10-09)

- A "Back" button now sits at the top left of every page you can go back from. It returns to the previous page you were on (labelled, for example, "Back to Today"), which matters most in the installed phone app, where there is no browser back button. If a page was opened straight from a link, Back goes up to its natural parent: a word study goes back to its chapter, Privacy and Leader go to Me, everything else goes to Today. It is hidden when there is nowhere to go back to.
- Late joiners now get a back-on-track plan automatically, covering the chapters from the days before they joined, at the suggested gentle pace. The card welcomes them, says the plan is optional and never counts against them, and offers "Change" or "No thanks, I'll just read from today". Stopping is remembered, so the plan is not created again.

| Check | Result |
|---|---|
| Back button and late-joiner journeys, including accessibility | 15 passed |
| Back-on-track plan journey | 11 passed |
| Full browser journey suite | 80 passed, 0 failed |
| Listening and highlighting | 7 passed |
