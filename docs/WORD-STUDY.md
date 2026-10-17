# The Word Behind the Word: setup and test checklist

*Understand what you read, make time for God, and grow together, one day at a time.*

## What was added

| Where | File | Change |
|---|---|---|
| Server | `server/Code.gs` | New section at the end. API calls: `words`, `wordLearn`, `wordApprove`, `teacher`. Editor helpers: `seedWordStudies()` and `teacherCheck()`. Three small hooks: the private item type `lang` (letters known, quiz scores); account deletion also removes WordProgress and TutorChats rows; "Download my data" includes them. |
| App | `js/words.js` | Alphabets, word data, progress, read-aloud and voice input. |
| App | `js/views/words.js` | Today's word, progress, alphabet, flashcards and quiz (`#/words`, `#/words/alphabet`, `#/words/practice`). |
| App | `js/views/teacher.js` | Ask the Teacher (`#/teacher`). |
| App | `js/views/today.js`, `js/views/original.js` | Word card and summary on Today; "Ask the Teacher" on the Original page. |
| App | `js/app.js`, `js/api.js`, `css/app.css`, `sw.js`, `js/demo.js`, `js/views/privacy.js` | Routes and Back, a longer wait for the teacher, styles, offline files, the sample teacher in the demo, and the privacy notice. |

Not changed: the reading plan, member records and email features.

## Setup (about 10 minutes)

1. **Back up.** In the Apps Script editor, run `backupData()`.
2. **Update the code.** Paste the new `Code.gs` and save.
3. **Add the Script Properties.** Go to Project Settings, then Script Properties, then Add:
   - `CLAUDE_API_KEY`: your key from console.anthropic.com. Type it here only, never in the sheet or the app.
   - `CLAUDE_MODEL`: `claude-sonnet-5-5`. This is optional; it's the default. Change it here at any time without editing code.
4. **Allow internet access.** Run `teacherCheck()` and approve Google's new permission, "Connect to an external service". The log should say `OK: The teacher is ready.`
5. **Create the tabs and starter words.** Run `seedWordStudies()`. This creates WordStudies, WordProgress, TutorChats and Logs, and adds 27 words as Draft. It never overwrites existing words.
6. **Review and approve the words.** Open the WordStudies tab and change Status to `Approved`, or open the app as yourself, go to Word study, open a word and tap "Approve for everyone". Members see a word only once it is approved and its day has arrived. Edits made in the sheet show in the app within 5 minutes.
7. **Redeploy.** Deploy > Manage deployments > pencil > Version: New version > Deploy. The web-app link stays the same.
8. **Publish the app files** to GitHub Pages, as before.

Costs: each teacher message is one Claude API call (up to 700 output tokens) and is billed to your Anthropic account. The limit of 30 messages per member per day caps usage. To change it, edit `TEACHER_DAILY_LIMIT` at the top of the new section.

## Starter words (Draft until you approve them)

| Day | Word | Verse | | Day | Word | Verse |
|---|---|---|---|---|---|---|
| 1 | בְּרֵאשִׁית bereshit | Genesis 1:1 | | 71 | σῴζω sōzō | Matthew 1:21 |
| 5 | יְהוָה YHWH | Exodus 3:15 | | 72 | ἐκκλησία ekklēsia | Matthew 16:18 |
| 7 | חֶסֶד chesed | Exodus 34:6 | | 76 | μετάνοια metanoia | Luke 15:7 |
| 9 | קָדוֹשׁ qadosh | Leviticus 19:2 | | 77 | λόγος logos | John 1:1 |
| 10 | שָׁלוֹם shalom | Numbers 6:26 | | 78 | φιλέω phileō | John 11:3 |
| 13 | שְׁמַע shema | Deuteronomy 6:4 | | 79 | τετέλεσται tetelestai | John 19:30 |
| 35 | אָמֵן amen | Nehemiah 8:6 | | 80 | πνεῦμα pneuma | Acts 2:4 |
| 39 | תּוֹרָה torah | Psalm 1:2 | | 83 | εὐαγγέλιον euangelion | Romans 1:16 |
| 42 | אֱלֹהִים elohim | Psalm 46:1 | | 84 | κύριος kyrios | Romans 10:9 |
| 45 | נֶפֶשׁ nefesh | Psalm 103:1 | | 85 | ἀγάπη agapē | 1 Corinthians 13:4 |
| 51 | כָּבוֹד kavod | Isaiah 6:3 | | 86 | καινός kainos | 2 Corinthians 5:17 |
| 59 | בְּרִית berit | Jeremiah 31:31 | | 87 | χάρις charis | Ephesians 2:8 |
| 64 | רוּחַ ruach | Ezekiel 37:14 | | 89 | πίστις pistis | Hebrews 11:1 |
| | | | | 90 | παράκλητος paraklētos | 1 John 2:1 |

How each row was checked:

- **Day:** the reading plan's chapters for that day include the verse.
- **Original word:** taken from the STEPBible Hebrew and Greek text already in the app, which confirms the word appears in that verse.
- **Strong's number:** from the same data.
- **English renderings:** checked against the BSB, KJV and WEB text of that verse.
- **Meanings:** drafted with AI assistance and written to match standard lexicons (BDB/HALOT, BDAG). They have not been checked against those books, so please read each one before approving it.
- **Where scholars disagree,** the meaning says so: phileo and agapao, the "paid in full" idea for tetelestai, "called-out ones" for ekklesia, and kainos vs neos.

The days already past (1 to 13) appear as earlier words. A member's card shows the latest approved word until the next word day.

## Test checklist

| Check | How | Automated result (demo) |
|---|---|---|
| Hebrew displays right to left | Open Word study > Alphabet > Hebrew; open a Hebrew word card | PASS |
| Vowel marks render on mobile | Look at בְּרֵאשִׁית, שָׁלוֹם and the Vowel marks section on an Android phone and an iPhone | PASS in Chromium; check by eye on both phones |
| Greek accents render (GFS Didot) | Alphabet > Greek; a Greek word card | PASS |
| Teacher remembers earlier messages | Ask a question, then "Can you say that more simply?" | PASS (demo teacher) |
| New conversation forgets the old one | Tap "Start a new conversation" | PASS |
| Daily limit works | After 30 messages, a friendly note appears and nothing is sent | PASS |
| API failure is handled | Friendly message plus a row in Logs (no key in it) | PASS |
| The API key never appears in browser code | Search the app's files for the key, the key header and the Anthropic address; the browser never calls Anthropic | PASS |
| Unapproved entries stay hidden | Members receive only Approved words whose day has arrived | PASS |
| You can approve from the app | Open a draft and tap "Approve for everyone" | PASS |
| Read aloud works on Android and iPhone | On each phone, tap "Read aloud" on a teacher reply; try Voice settings | Check by eye (needs real phones) |
| The microphone appears only where supported | Chrome on Android shows it; iPhone Safari may not | Check by eye |
| Accessibility | axe-core on Word study, Teacher, Alphabet and Practice | PASS (no serious issues) |
| No sideways scrolling on phones | Pixel 7 and iPhone 14 sizes | PASS |
| Existing features unaffected | Full e2e suite plus the Back, back-on-track and listening tests | 80 + 15 + 11 + 7 PASS |
