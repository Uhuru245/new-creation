# New Creation: setup, deployment and maintenance

New Creation has two parts:

| Part | Where it runs | What it does |
|---|---|---|
| **Web app** (this repository's `app/` folder) | GitHub Pages (free static hosting) | Everything members see: Today, Bible, Original, Circle, Journey, Me and Leader. Installable, works offline for reading. |
| **Server** (`Code.gs`) | Your Google Apps Script project "New Creation" | Accounts, progress, posts, private notes and challenges, stored in your Google Sheet. |

Member data never leaves your Google account. The web app only talks to your Apps Script URL.

## 1. Configuration (`app/config.js`)

| Setting | Value | Notes |
|---|---|---|
| `apiUrl` | Your Apps Script web-app URL (`https://script.google.com/macros/s/…/exec`) | Deploy → Manage deployments → Web app URL. Use the deployment that has **Execute as: Me** and **Who has access: Anyone**. |
| `env` | `prod` | `test` points the app at the separate test sheet. Adding `?env=test` to the address does the same for one visit. |

Adding `?demo=1` to the address opens a self-contained demonstration with sample people. It runs the real server code inside the browser and never touches your data.

## 2. Server settings (Apps Script → Project Settings → Script Properties)

These are created automatically. **Do not delete them.**

| Property | Purpose |
|---|---|
| `SHEET_ID` | The live data spreadsheet. |
| `LEADER_ID` | The member id of the leader. Change it only with `setLeaderByPhone('082…')`. |
| `PIN_PEPPER` | A secret mixed into every PIN hash. **If it is lost, every member who has signed in since version 13 must have their PIN reset.** Keep a private copy somewhere safe (for example, a password manager). |
| `TEST_SHEET_ID`, `TEST_LEADER_ID`, `TEST_ADMIN_KEY` | The separate test environment (sample members only). `TEST_ADMIN_KEY` lets automated tests move the test clock; it has no effect on live data. |

Constants at the top of `Code.gs`: `NOTIFY_ON_JOIN`, `NOTIFY_ON_OPEN`, `DIGEST_HOUR`, `GROUP_LINK`, `STUDY_SHEET_ID`, `BOOK_SHEET_ID`, `TZ` (Africa/Johannesburg).

## 3. Publishing the web app on GitHub Pages (one time)

1. Create a GitHub repository named `new-creation` and upload the contents of this folder (or let Claude do it once GitHub is connected).
2. In the repository: **Settings → Pages → Build and deployment → Deploy from a branch**, branch `main`, folder `/ (root)`.
3. After a minute the app is at `https://<your-username>.github.io/new-creation/`.
4. Optional own domain (for example `newcreation.co.za`): Settings → Pages → Custom domain, then add the DNS record GitHub shows you.

## 4. Updating

**Web app:** change the files and push. Also change `VERSION` at the top of `app/sw.js` so phones fetch the new files. Members get the update the next time they open the app.

**Server:**
1. Run `backupData` in the Apps Script editor first. It saves a dated copy of the Sheet.
2. Paste the new `Code.gs` and save.
3. Deploy → Manage deployments → select the **main** deployment → pencil → Version: **New version** → Deploy. The URL stays the same.

## 5. Admin functions (run from the Apps Script editor)

| Function | When |
|---|---|
| `backupData()` | Before every upgrade. |
| `migrate()` | After installing a new server version. Updates sheet headers; never changes member data. Safe to run more than once. |
| `setLeaderByPhone('082 123 4567')` | Hand leadership to another member who has already joined. |
| `setupTest()` | Re-creates or repairs the test environment. |
| `setup()` | Only for a brand-new installation (creates the Sheet and the evening-summary trigger). |

## 6. Running the tests

```
cd server && node tests.js            # 68 server tests (mocked Google services)
cd server && node legacy_tests.js     # earlier challenge tests, still passing
python3 -m http.server 8765 -d app &  # serve the app
node tools/e2e.js                     # 80 browser journeys on the demo (needs Playwright)
API=<exec url> TEST_KEY=<TEST_ADMIN_KEY> node tools/live_api.js   # 38 checks against the deployed server, test sheet only
node tools/perf.js; node tools/live_ui.js                            # loading measurements
```

## 7. Bible data

`tools/build_data.py` rebuilds `app/data/` from the original sources (see `docs/SOURCES.md`). Download the sources into `raw/` first; the script prints verse counts so you can check nothing was lost.
