# Backup, migration and rollback

## What changed in the data (version 13, 4 October 2026)

Verified against the live Sheet before and after the change:

| Item | Before | After | Verified |
|---|---|---|---|
| Members | 14 rows | 14 rows | `ping` returns `members: 14`; `migrate()` logged "Members: 14" |
| Member columns | 15 headers (A–O) | 18 headers: adds `inMain`, `pinV`, `settings` | Header row rewritten by `migrate()`; no member values changed |
| Reading progress | Stored in Members (`bits`, `ch`) for the 93-day challenge | Unchanged. New challenges use the `Progress` sheet. | Existing bits untouched |
| Reflections | 2 posts, 7 columns | Same posts; header now includes `pray`, `challenge` | Old posts belong to the 93-day challenge |
| Challenges | `nc93` | Unchanged | — |
| New sheets | — | `Private` (notes, bookmarks, highlights, word studies) | Created empty |
| Leader | `LEADER_ID` = the first joiner (the group leader) | Same value; joining can no longer set it | Server test "joining never makes someone leader" |
| PINs | v1 hash (salt + SHA-256) | Upgraded to v2 (salt + secret pepper + 150 rounds) the next time each member signs in | Old PINs keep working |

**Backups taken:** "New Creation backup 2026-10-04 before v13 (keep)" in your Google Drive (a full copy of the data Sheet), plus Apps Script's version history (versions 1 to 14).

## Rolling back

Each part can be rolled back on its own.

**Server (minutes):** Apps Script → Deploy → Manage deployments → main deployment → pencil → Version: choose **12** (the last version before the new API) → Deploy. The old app at the same link keeps working with the old server. Members who signed in with the new app will have v2 PIN hashes, which version 12 can't check, so reset their PINs (version 12's Leader tab has Reset PIN) or roll forward again.

**Data (if something went wrong in the Sheet):** open the backup copy, then File → Make a copy, or copy the affected tab back into the live Sheet. Don't swap the whole spreadsheet: `SHEET_ID` points at the original file.

**Web app:** in GitHub, revert the last commit (or point members back to the Apps Script link, which still serves the previous app).

## Moving members to the new app

Nothing needs to be migrated. Members sign in to the new app with the same WhatsApp number and PIN, and their progress is already there. Share the new link in the WhatsApp group. The old link keeps working during the change-over.
