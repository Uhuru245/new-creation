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
