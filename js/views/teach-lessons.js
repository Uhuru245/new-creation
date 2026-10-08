// New Creation: prepared Life Group lessons (leader only). Each section is plain HTML.
// Sections with `copy` get a copy button; the copy text is the section's text content.

const L1 = {
  id: 'long-suffering',
  title: 'Slow to Anger, Strong to Stand',
  subtitle: 'Long-suffering in James 5 and the patience of God',
  passage: 'James 5:7-11',
  support: 'James 1:2-4 · Galatians 5:22-23 · Exodus 34:6 · Isaiah 40:27-31',
  translation: 'NIV, with KJV for Isaiah 40:31',
  minutes: 'Teaching about 35 minutes inside a 90-minute evening. A 20-minute version is at the end.',
  prepared: '2026-10-08',
  sections: [],
};

const S = (id, title, html, opts = {}) => L1.sections.push({ id, title, html, ...opts });

S('runsheet', 'Evening run sheet', `
<p class="note">Assumptions: you didn't fill in a length or outcome, so this plan uses about 35 minutes of teaching inside your usual evening. The outcome assumed: <b>each person names one relationship where they will choose patience instead of retaliation this week, and knows why they can.</b></p>
<table class="plan"><thead><tr><th>Time</th><th>Part</th><th>Who</th><th>Notes</th></tr></thead><tbody>
<tr><td>0:00</td><td>Open prayer</td><td>Ask a member in advance</td><td>2 to 3 minutes. Thank God for being "slow to anger and abounding in love".</td></tr>
<tr><td>0:05</td><td>Ice breaker</td><td>You</td><td>The opening question in section 5 doubles as the ice breaker. 8 minutes.</td></tr>
<tr><td>0:13</td><td>Word and teaching</td><td>You</td><td>Introduction, reading, context, the Greek, four points. 35 minutes.</td></tr>
<tr><td>0:48</td><td>Discussion</td><td>You facilitate</td><td>Choose 3 or 4 questions from section 19. 12 minutes.</td></tr>
<tr><td>1:00</td><td>Quiet examination and response</td><td>You</td><td>Section 18, then the weekly challenge. 7 minutes.</td></tr>
<tr><td>1:07</td><td>Prayer requests and prayer</td><td>Pairs or threes</td><td>15 minutes. Pray over requests in small groups so everyone prays.</td></tr>
<tr><td>1:22</td><td>Announcements</td><td>Ask a member in advance</td><td>5 minutes. Check the dates first (below).</td></tr>
<tr><td>1:27</td><td>Close</td><td>You</td><td>Closing prayer (section 24).</td></tr>
</tbody></table>
<h4>For the evening the Shepherd attends</h4>
<ul>
<li>Start on time and close on time. A shepherd notices timekeeping more than eloquence.</li>
<li>Involve others: one person opens in prayer, three people read Scripture, someone else reads announcements. Leading is not doing everything.</li>
<li>Ask, then wait. Count to seven in your head after each question before you answer it yourself.</li>
<li>When you say something about the Greek, show the group where it is in the text. Don't use Greek to impress.</li>
<li>Give prayer requests real time. If you run late, shorten the teaching, not the prayer.</li>
</ul>
<h4>Announcements: check before you read</h4>
<p class="warn">These look like last term's. Today is in October, but they mention camp "3 weeks away", baptism on 16 August and Term 3 starting 25 August. Confirm the current dates with the church office before reading them out.</p>
<ol>
<li>Camp is around the corner. Please start making your payments. Camp is R1,350 per person. <i>(Confirm the date and payment deadline.)</i></li>
<li>New Members course: Term 3 starts on 25 August. <i>(Likely passed.)</i></li>
<li>Water baptism: 16 August after the evening service. <i>(Likely passed.)</i></li>
<li>We'll be reading the book of Romans for BBC 3. More information to follow.</li>
<li>Prayer and Check-up Buddies for Term 3 are in the LG Planner.</li>
</ol>
`);

S('title', '1. Teaching title', `
<p class="big">Slow to Anger, Strong to Stand</p>
<p><b>Subtitle (optional):</b> What long-suffering really is, and where it comes from</p>
<p class="small">Why this title: James uses two different Greek words that English Bibles both call "patience". One is about being slow to anger with people. The other is about standing firm under pressure. The title holds both.</p>
`);

S('scripture', '2. Main Scripture', `
<p><b>Main passage: James 5:7-11 (NIV)</b></p>
<blockquote><sup>7</sup> Be patient, then, brothers and sisters, until the Lord's coming. See how the farmer waits for the land to yield its valuable crop, patiently waiting for the autumn and spring rains. <sup>8</sup> You too, be patient and stand firm, because the Lord's coming is near. <sup>9</sup> Don't grumble against one another, brothers and sisters, or you will be judged. The Judge is standing at the door! <sup>10</sup> Brothers and sisters, as an example of patience in the face of suffering, take the prophets who spoke in the name of the Lord. <sup>11</sup> As you know, we count as blessed those who have persevered. You have heard of Job's perseverance and have seen what the Lord finally brought about. The Lord is full of compassion and mercy.</blockquote>
<p><b>Supporting passages (use only these):</b></p>
<blockquote><b>James 1:2-4.</b> Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance. Let perseverance finish its work so that you may be mature and complete, not lacking anything.</blockquote>
<blockquote><b>Galatians 5:22-23.</b> But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law.</blockquote>
<blockquote><b>Exodus 34:6.</b> The LORD, the LORD, the compassionate and gracious God, slow to anger, abounding in love and faithfulness.</blockquote>
<blockquote><b>Isaiah 40:31 (KJV).</b> But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.<br><b>(NIV)</b> But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.</blockquote>
<p class="small">Why James 5 and not James 1:4 as the main text: the post you're teaching from quotes James 1:4, but the word there is <i>hypomonē</i> (endurance). The word for long-suffering, <i>makrothymia</i>, appears in James 5:7-10, right beside <i>hypomonē</i> in 5:11. James 5 lets you teach both honestly. See section 10.</p>
`);

S('bigidea', '3. Big Idea', `
<p class="big">Because the Lord is coming and he is full of compassion and mercy, his people can refuse to retaliate, refuse to turn on each other, and keep standing firm while they wait.</p>
`);

S('objective', '4. Teaching objective', `
<dl class="kv2">
<dt>Understand</dt><dd>Long-suffering (<i>makrothymia</i>) is patience with people, especially people who wrong us. Endurance (<i>hypomonē</i>) is standing firm under hardship. James calls for both while we wait for the Lord.</dd>
<dt>Believe</dt><dd>God has been long-suffering toward me first, in Christ, and the Judge will put things right, so I don't have to.</dd>
<dt>Reject</dt><dd>Revenge, grumbling against other believers, and the idea that patience means being a doormat or doing nothing.</dd>
<dt>Obey</dt><dd>Be patient, strengthen your heart, and stop grumbling against one another (5:7-9).</dd>
<dt>Change</dt><dd>Name one person or situation where I will respond with patience this week, and one concrete act of obedience.</dd>
</dl>
`);

S('opening', '5. Opening question (ice breaker)', `
<p class="big">What is one thing that makes you lose your patience faster than anything else?</p>
<p class="small">Easy, honest and funny answers are welcome: traffic, load-shedding, slow Wi-Fi, a group chat, a sibling. Go round the room. Answer first yourself to set the tone.</p>
<p><b>If the group is quiet:</b></p>
<ul><li>When you lose patience, what do you usually do: go quiet, get sharp, or complain to someone else?</li>
<li>Who is the most patient person you know, and what do you think makes them that way?</li></ul>
`);

S('intro', '6. Opening introduction', `
<div class="say">
<p>Most of us are patient with things we can't control. We wait for the taxi. We wait for the rain. We wait for exam results. We don't like it, but we wait.</p>
<p>It's different when a person is the problem. When someone takes advantage of us, talks behind our backs, or keeps doing the same thing again and again, something rises up in us. We want to say something. Post something. Pay them back. Or at least complain about them to somebody else.</p>
<p>You may have seen a post going around that says long-suffering is one of the clearest marks of spiritual maturity. That's true. But what exactly is long-suffering? Is it just waiting? Is it letting people walk over you? Is it a personality type some people are born with?</p>
<p>Tonight we're going to let James answer that. He wrote to believers who were being treated unfairly, not in theory but in their wages and their daily bread. And what he tells them is surprising. Let's read it.</p>
</div>
`);

S('read', '7. Read the passage', `
<p><b>Read James 5:1-11.</b> Read verses 1-6 so the group hears what was happening to these believers, then 7-11 slowly.</p>
<ul><li>Reader 1: James 5:1-6 (the rich who withheld wages)</li><li>Reader 2: James 5:7-9</li><li>Reader 3: James 5:10-11</li></ul>
<div class="say"><p>As we read, listen for three things: what James tells them to do, what he tells them not to do, and what he tells them about the Lord.</p></div>
<p><b>Observation question after the reading:</b> How many times did you hear the word "patient" or "patience"? And what reason does James give each time?</p>
<p class="small">Answer to watch for: "be patient" in verses 7 and 8, the farmer waiting patiently in verse 7, and "patience" in verse 10. Each time the reason is the Lord's coming or the Lord's character.</p>
`);

S('history', '8. Historical context', `
<p><b>Who wrote it.</b> The letter names "James, a servant of God and of the Lord Jesus Christ" (1:1). <span class="tag fact">Widely held</span> Most scholars identify him as James the brother of Jesus, leader of the Jerusalem church (Acts 15; Galatians 1:19). <span class="tag prob">Debated</span> Some scholars argue a later writer used his name; the traditional view has strong support.</p>
<p><b>Who received it.</b> "The twelve tribes scattered among the nations" (1:1): Jewish believers in Jesus living outside Judea. <span class="tag prob">Probable</span> Written somewhere between the mid-40s and early 60s AD.</p>
<p><b>What was happening.</b> <span class="tag fact">In the text</span> James 5:1-6 describes rich landowners who kept back the wages of the workers who mowed their fields (5:4), lived in luxury (5:5) and condemned and murdered the innocent (5:6). James 2:6 says the rich were dragging believers into court. These believers were poor, exploited and powerless to fix it.</p>
<p><b>Why that mattered to them.</b> <span class="tag fact">Background</span> Day labourers needed their wages that evening to eat. The Law of Moses said: pay workers the same day, "because they are poor and are counting on it" (Deuteronomy 24:14-15; Leviticus 19:13). So withheld wages were not just unfair; they meant hunger.</p>
<p><b>The farmer and the rains.</b> <span class="tag fact">Background</span> In the land of Israel the "autumn and spring rains" (the early and late rains) came around October-November and March-April (Deuteronomy 11:14; Jeremiah 5:24; Joel 2:23). A farmer planted and then had to wait for rain he could not control.</p>
<p class="small"><b>Local picture:</b> it's October. Farmers across our summer-rainfall areas are watching the sky right now, waiting for the first proper rains before they can plant with confidence. That's exactly James's picture.</p>
<p><b>What the first readers would have heard.</b> <span class="tag inf">Reasonable inference</span> A real temptation either to give up, to fight back with violence or bitterness, or to take their frustration out on each other. Jewish believers would also recognise "the Lord is compassionate and merciful" as God's self-description from Exodus 34.</p>
`);

S('literary', '9. Literary context', `
<p><b>Genre.</b> James is a letter with a strong wisdom flavour, a lot like Proverbs and the Sermon on the Mount: short, practical commands about how faith behaves.</p>
<p><b>Before our passage.</b> 4:13-17 warns merchants who plan without God. 5:1-6 pronounces judgment on rich oppressors. Notice that James does not tell the oppressors to be patient; he tells them to weep. Then in verse 7 he turns to the believers: "Be patient, <i>then</i>." The "then" (Greek <i>oun</i>, therefore) ties verse 7 to verses 1-6. Because God will judge the oppressors, the oppressed don't have to.</p>
<p><b>After our passage.</b> 5:12 on honest speech without oaths, and 5:13-20 on prayer, the sick, confession and bringing back those who wander. Patience leads into a praying, caring community.</p>
<p><b>The whole letter.</b> James opens with trials and endurance (1:2-4, 1:12) and returns to endurance at the end (5:11). <span class="tag prob">Common scholarly observation</span> The two passages work like bookends: the whole letter is about faith that keeps going under pressure and shows itself in how we treat people.</p>
<p><b>How context controls the meaning.</b> Read alone, "be patient" could sound like "relax, it will work out". In context it means: you are being wronged, and you are commanded not to take revenge, not to turn on each other, and to keep trusting the Judge who is coming.</p>
`);

S('words', '10. Key Greek and Hebrew words', `
<div class="word"><p class="w"><span class="gk">μακροθυμέω / μακροθυμία</span> makrothymeō / makrothymia</p>
<p class="small">Say it: mah-kro-thoo-MEH-oh / mah-kro-thoo-MEE-ah · verb and noun</p>
<p><b>Form here:</b> <span class="gk">μακροθυμήσατε</span> (makrothymēsate), aorist imperative plural: a command to the whole church, "be patient!" (5:7, 5:8). The farmer is <span class="gk">μακροθυμῶν</span>, present participle, "patiently waiting" (5:7). The noun appears in 5:10 for the prophets.</p>
<p><b>Range of meaning:</b> to be patient, forbearing, slow to anger; to wait patiently.</p>
<p><b>Meaning here:</b> patience toward people and circumstances that wrong you, without retaliating or giving up, while you wait for the Lord.</p>
<p><b>Old Testament background:</b> in the Greek Old Testament (the Septuagint), God describes himself as <span class="gk">μακρόθυμος</span> in Exodus 34:6, translating the Hebrew <span class="he">אֶרֶךְ אַפַּיִם</span> (<i>erek appayim</i>), "slow to anger". Proverbs 16:32 uses the same word: better a patient person than a warrior.</p>
<p><b>Elsewhere in the New Testament:</b> fruit of the Spirit (Galatians 5:22, NIV "forbearance"); "love is patient" (1 Corinthians 13:4); God's patience toward sinners (Romans 2:4; 2 Peter 3:9); Christ's "immense patience" with Paul (1 Timothy 1:16).</p>
<p class="caution"><b>Careful:</b> people often split it into <i>makros</i> (long) + <i>thymos</i> (anger) and preach "long-tempered". That happens to fit how the word is used, which is why the old English "long-suffering" was a good choice. But we know the meaning from how the word is used, not from its parts.</p></div>

<div class="word"><p class="w"><span class="gk">ὑπομονή / ὑπομένω</span> hypomonē / hypomenō</p>
<p class="small">Say it: hoo-poh-moh-NAY / hoo-poh-MEN-oh · noun and verb</p>
<p><b>Form here:</b> 5:11 <span class="gk">τοὺς ὑπομείναντας</span>, aorist participle, "those who have persevered", and <span class="gk">τὴν ὑπομονὴν Ἰώβ</span>, "Job's perseverance". Also James 1:3-4 and 1:12.</p>
<p><b>Range of meaning:</b> endurance, perseverance, steadfastness; to stand firm, hold out.</p>
<p><b>Meaning here:</b> keeping faith and obedience under hardship and suffering, as Job did, without walking away from God.</p>
<p><b>Old Testament background:</b> the Septuagint uses <span class="gk">ὑπομένοντες</span> in Isaiah 40:31 for "those who wait for the LORD". So the "wait upon the LORD" of your verse and James's "perseverance" share the same idea in Greek: steady, trusting endurance.</p>
<p><b>The difference that matters:</b> <i>makrothymia</i> is mostly about people (not exploding, not retaliating). <i>Hypomonē</i> is mostly about pressure and circumstances (not collapsing, not quitting). James 5 puts them side by side, and Colossians 1:11 prays for both: "great endurance and patience".</p>
<p class="caution"><b>For the post you saw:</b> James 1:4 ("let patience have its perfect work", NKJV) is <i>hypomonē</i>, endurance. It's a true and good verse, but strictly it's about endurance in trials, not long-suffering with people. Say this gently; it actually helps people see that God grows both in us.</p></div>

<div class="word"><p class="w"><span class="gk">στηρίξατε τὰς καρδίας</span> stērixate tas kardias</p>
<p class="small">Say it: stay-RIX-ah-teh · aorist imperative plural</p>
<p><b>Meaning:</b> "strengthen / make firm your hearts" (5:8, NIV "stand firm"). The same verb describes Jesus setting his face firmly toward Jerusalem (Luke 9:51).</p>
<p><b>Why it matters:</b> patience is not weakness. James commands an active, deliberate firmness of heart. Long-suffering takes strength.</p></div>

<div class="word"><p class="w"><span class="gk">μὴ στενάζετε κατ᾽ ἀλλήλων</span> mē stenazete kat' allēlōn</p>
<p class="small">Say it: meh steh-NAH-zeh-teh · present imperative with "not"</p>
<p><b>Meaning:</b> "don't groan / grumble against one another" (5:9). The word is used for sighing or groaning under strain (Romans 8:23; 2 Corinthians 5:2); here it is groaning aimed at fellow believers.</p>
<p><b>Grammar:</b> the present tense presents grumbling as an ongoing habit to avoid. Don't overclaim that it proves they were already doing it; it may be, but the text doesn't say.</p></div>

<div class="word"><p class="w"><span class="gk">τέλειος</span> teleios (James 1:4)</p>
<p class="small">Say it: TEL-ay-os · adjective</p>
<p><b>Meaning:</b> mature, complete, whole. KJV and NKJV say "perfect", which today sounds like "flawless". James means grown-up, fully formed, not sinless (compare James 3:2: "we all stumble in many ways").</p></div>

<div class="word"><p class="w"><span class="he">קָוָה</span> qavah (Isaiah 40:31, Hebrew)</p>
<p class="small">Say it: kah-VAH · verb, participle "those who wait for / hope in"</p>
<p><b>Meaning:</b> to wait for with expectation, to hope in. It is not passive killing of time; it is leaning your weight on the LORD while you wait. That's why NIV says "hope in" and KJV "wait upon". The verb behind "renew" (<i>ḥālap</i>) normally means to change or exchange; Isaiah's picture is weary people receiving new strength from the God who "does not grow tired" (40:28).</p></div>
`);

S('points', '11. Main teaching points', `
<div class="point"><h4>Point 1. Long-suffering starts with God, not with you</h4>
<p><b>Explanation.</b> James ends the passage with the reason underneath everything: "The Lord is full of compassion and mercy" (5:11). Before patience is something God asks of us, it is something God is. He described himself to Moses as "slow to anger" right after Israel built the golden calf (Exodus 32-34). Every one of us is alive in God's patience.</p>
<p><b>Textual evidence.</b> James 5:11, echoing Exodus 34:6; 2 Peter 3:9; 1 Timothy 1:16.</p>
<p><b>Original audience.</b> Jewish believers knew Exodus 34:6 by heart. James reminds them that the God they wait for is merciful, which means the waiting will end well (Job "saw what the Lord finally brought about").</p>
<p><b>New Covenant meaning.</b> In Christ we have received God's long-suffering personally. Paul calls himself the worst of sinners and says Jesus showed him "immense patience" as an example (1 Timothy 1:16). People who have been shown that much patience become patient people.</p>
<p><b>Practical example.</b> A friend keeps cancelling on you at the last minute. Before you write them off, remember how many times God has not written you off.</p>
<p><b>Group question.</b> Where have you seen God be patient with you, maybe in a sin or a season where you kept coming back to the same thing?</p>
<div class="say"><p>Transition: so patience flows from God's character. But James doesn't stop there. He tells us what patience looks like when someone has actually wronged us.</p></div></div>

<div class="point"><h4>Point 2. Patience waits for the Lord, not for revenge</h4>
<p><b>Explanation.</b> James's readers had real enemies who stole their wages. He does not say "it's fine". He has just condemned the oppressors (5:1-6). But he tells the believers: be patient "until the Lord's coming", because "the Judge is standing at the door". Long-suffering is not pretending the wrong didn't happen. It is refusing to take God's place as judge.</p>
<p><b>Textual evidence.</b> "Be patient, then" (5:7) follows directly from 5:1-6. "The Lord's coming is near" (5:8). Compare Romans 12:19: "Do not take revenge... leave room for God's wrath."</p>
<p><b>Original audience.</b> Some Jews at the time were turning to violent resistance against the powerful. <span class="tag inf">Inference</span> James's call not to retaliate would have stood out against that.</p>
<p><b>New Covenant meaning.</b> Jesus did exactly this. "When they hurled their insults at him, he did not retaliate... Instead, he entrusted himself to him who judges justly" (1 Peter 2:23). The farmer shows it isn't passive: he plants, works and waits for what only God can give.</p>
<p><b>Practical example.</b> Someone posts something unfair about you online. Patience doesn't mean you can never correct a lie, but it means you don't fire back to humiliate them, and you don't keep rehearsing the revenge in your head.</p>
<p><b>Group question.</b> Is there a situation where you've been quietly waiting, not for God to act, but for your chance to get even?</p>
<div class="say"><p>This is where many people misunderstand long-suffering. It does not mean you let people abuse you. James calls out injustice loudly. What it does mean is that you stop trying to be the judge.</p></div></div>

<div class="point"><h4>Point 3. Pressure from outside tempts us to turn on each other</h4>
<p><b>Explanation.</b> Notice what James says next. Right after "be patient", he says: "Don't grumble against one another" (5:9). When people are under pressure from outside, the people closest to them often get the worst of it. The enemy was the rich landowner, but the danger was believers groaning about each other.</p>
<p><b>Textual evidence.</b> 5:9, "Don't grumble against one another... or you will be judged." The same Judge who will judge the oppressors also sees our grumbling.</p>
<p><b>Original audience.</b> Small, poor communities under strain, likely blaming each other for their troubles.</p>
<p><b>New Covenant meaning.</b> Long-suffering is a community virtue. Paul links it to "bearing with one another in love" (Ephesians 4:2). The Spirit who makes us one body produces patience between members of that body (Galatians 5:22).</p>
<p><b>Practical example.</b> Exam stress, work pressure or money worries, and you snap at your roommate, your spouse, or the person who's always late for Life Group. Or a WhatsApp side-chat that slowly becomes a complaint session about someone in the group.</p>
<p><b>Group question.</b> When you're under pressure, who usually gets your impatience? What does that show you?</p></div>

<div class="point"><h4>Point 4. God uses endurance to make us mature, and the Spirit produces it</h4>
<p><b>Explanation.</b> James points to the prophets, who suffered for speaking God's word, and to Job, who held on without understanding. "We count as blessed those who have persevered" (5:11). In 1:2-4 he says trials produce endurance, and endurance makes us "mature and complete". The question isn't only how long you wait, but whether you keep trusting God while you wait.</p>
<p><b>Textual evidence.</b> 5:10-11; 1:2-4; Galatians 5:22; Colossians 1:11 ("strengthened with all power... so that you may have great endurance and patience").</p>
<p><b>Original audience.</b> Job was the model sufferer; the prophets, like Jeremiah, were mistreated by their own people.</p>
<p><b>New Covenant meaning.</b> Maturity here is not willpower. It is the fruit of the Holy Spirit in people united to Christ. You can't manufacture fruit; you stay connected and the Spirit grows it.</p>
<p><b>Practical example.</b> Waiting for a job offer, for healing, for a relationship to change. Who you become in that wait (honest in prayer, kind to others, still obeying) is what God is forming.</p>
<p><b>Group question.</b> What is God possibly forming in you through the thing you're waiting for right now?</p></div>
`);

S('covenant', '12. Old Testament and covenant background', `
<ul>
<li><b>God's character (Mosaic covenant, but not limited to it).</b> Exodus 34:6 reveals who God is. That is not a law for Israel only; it is God's name and nature, the same in both covenants. James quotes it as true for Christians.</li>
<li><b>Wages (a Mosaic command with a lasting moral principle).</b> Deuteronomy 24:14-15 required same-day wages. Christians are not under the Mosaic Law as a covenant, but the moral principle (don't exploit workers) is affirmed in James 5:4 and applies to us.</li>
<li><b>The prophets (pattern).</b> They spoke for God and suffered for it. James uses them as an example, not as a law.</li>
<li><b>Job (wisdom).</b> Job teaches endurance and honest lament without abandoning God. Note: Job complained a lot to God. Endurance is not silence.</li>
<li><b>Isaiah 40:31 (a prophetic promise to exiles).</b> Spoken to Israel in exile who said "my way is hidden from the LORD" (40:27). The promise: the everlasting Creator who doesn't grow tired gives strength to those who wait for him. For Christians: the promise rests on God's unchanging character and finds its fulfilment in Christ and the Spirit's strength (Colossians 1:11). It is not a guarantee that you'll never feel tired or that you'll get the specific outcome you want.</li>
<li><b>New Covenant.</b> Jeremiah 31 and Ezekiel 36 promised new hearts and God's Spirit within. That is why Galatians can call patience the Spirit's fruit, not a rule we strain to keep.</li>
</ul>
`);

S('christ', '13. Christ-centred meaning', `
<ul>
<li><b>His return.</b> James grounds patience in "the Lord's coming" (5:7-8). "Lord" in James refers to Jesus (1:1, 2:1). Our patience has a horizon: Jesus is coming to put things right.</li>
<li><b>His example.</b> At the cross Jesus did not retaliate and entrusted himself to the Father (1 Peter 2:21-23). That connection is in the New Testament itself, not imagined.</li>
<li><b>His patience with us.</b> 1 Timothy 1:16: Christ displayed "immense patience" (<i>makrothymia</i>) with Paul.</li>
<li><b>His Spirit in us.</b> Long-suffering is fruit of the Spirit given to those united to Christ (Galatians 5:22-25).</li>
</ul>
<p class="small">Not to claim: that the farmer is a picture of Jesus, or that the early and late rains are the Holy Spirit. Those are popular but imaginative; James uses the farmer simply as an example of patient waiting.</p>
`);

S('gospel', '14. The gospel and grace', `
<div class="say">
<p>God has been long-suffering toward every one of us. He didn't give up on Israel at the golden calf. He didn't give up on Paul, who persecuted the church. And he hasn't given up on you. At the cross Jesus took the judgment we deserved, and he rose again so that we could be forgiven and given his Spirit.</p>
<p>So hear this clearly: we do not become patient in order to be accepted by God. We obey because, through Christ, we have been accepted and brought under his rule.</p>
<p>But grace doesn't make patience optional. James says grumbling against one another brings judgment (5:9). Grace that leaves us bitter and vengeful hasn't been understood.</p>
<p>And this is the good news for anyone who says "I'm just not a patient person": long-suffering is fruit of the Spirit. You can't produce it by gritting your teeth. You ask for it, you stay close to Jesus, and you obey in the next small moment. The Spirit grows it.</p>
</div>
`);

S('misread', '15. Common misinterpretations', `
<div class="mis"><p><b>"Long-suffering means letting people mistreat you."</b></p><p><i>Why it's weak:</i> James condemns the oppressors in the strongest terms (5:1-6). Paul used his legal rights when he was being wronged (Acts 22:25; 25:11). Jesus told us to confront sin (Matthew 18:15).</p><p><i>Better:</i> long-suffering means no revenge and no bitterness, while still telling the truth, setting wise boundaries and seeking safety or justice through proper channels.</p></div>
<div class="mis"><p><b>"Patience means doing nothing."</b></p><p><i>Why it's weak:</i> the farmer works the land; James commands "strengthen your hearts".</p><p><i>Better:</i> do what is yours to do faithfully, and leave to God what only God can do.</p></div>
<div class="mis"><p><b>"James 1:4 says I can become perfect."</b></p><p><i>Why it's weak:</i> "perfect" (<i>teleios</i>) means mature or complete. James 3:2 says "we all stumble in many ways".</p><p><i>Better:</i> endurance grows us into grown-up, whole followers of Jesus, not flawless ones.</p></div>
<div class="mis"><p><b>"Isaiah 40:31 means if I wait, God will give me what I'm waiting for."</b></p><p><i>Why it's weak:</i> the verse promises strength from the LORD, not a specific outcome; and it was spoken first to exiles waiting for God's deliverance.</p><p><i>Better:</i> those who put their hope in God himself receive strength to keep going while they wait for him.</p></div>
<div class="mis"><p><b>"Some people are just patient by personality."</b></p><p><i>Why it's weak:</i> a calm temperament can be indifference. Biblical long-suffering is love that refuses to retaliate when it's provoked.</p><p><i>Better:</i> it's fruit of the Spirit that every believer can grow in.</p></div>
<div class="mis"><p><b>"The Greek 'really means' remain under / long-tempered."</b></p><p><i>Why it's weak:</i> this builds meaning from word parts (the root fallacy).</p><p><i>Better:</i> the meanings come from how the words are used in context. Here, that use does support "endurance" and "slow to anger".</p></div>
`);

S('views', '16. Major interpretive views', `
<p><b>The question:</b> what does James mean by "the Lord's coming is near" (5:8)?</p>
<p>Sincere Christians read "near" in different ways. You don't need to resolve this in the group, but be ready if someone asks.</p>
<ul>
<li><b>Imminence.</b> The return of Jesus could happen at any time and has been "near" since the resurrection. <i>Strength:</i> matches how the New Testament speaks (Romans 13:11-12; Revelation 22:20). <i>Weakness:</i> raises the question of the long delay, which 2 Peter 3:8-9 answers directly.</li>
<li><b>Near judgment in history.</b> "Near" refers mainly to God's judgment on Jerusalem in AD 70. <i>Strength:</i> fits a judgment on oppressors close at hand. <i>Weakness:</i> James's language of the Lord's coming (<i>parousia</i>) is normally used for Jesus's return.</li>
</ul>
<p><b>Best fit:</b> imminence, with the reminder that God's apparent delay is itself his patience, "not wanting anyone to perish" (2 Peter 3:9). Certainty: fairly confident about the meaning; humble about timing, which Jesus said no one knows (Matthew 24:36).</p>
`);

S('plain', '17. Plain meaning', `
<p><b>What James was saying:</b> you're being treated unfairly. Don't take revenge, don't turn on each other, and don't give up. The Lord is coming, he will judge rightly, and he is full of mercy.</p>
<p><b>To the first readers:</b> hold on through exploitation and poverty like a farmer waiting for rain.</p>
<p><b>The timeless truth:</b> God is patient, and he makes his people patient.</p>
<p><b>For someone in Christ today:</b> because Jesus has been patient with you and is coming back, you can be slow to anger with people and steady under pressure, by the strength his Spirit gives.</p>
`);

S('examine', '18. Personal examination', `
<div class="say"><p>Let's take two minutes of quiet. No one will be asked to share what comes to mind. This is between you and God.</p></div>
<ol>
<li>Who am I quietly waiting to see "get what they deserve"?</li>
<li>When I'm under pressure, who usually pays for it?</li>
<li>Am I grumbling about someone in this church or this group instead of speaking to them, or to God?</li>
<li>Have I mistaken my calm personality for patience, while holding grudges inside?</li>
<li>What am I waiting for right now, and am I trusting God in it or just enduring it on my own?</li>
</ol>
<div class="say"><p>If God has shown you something, respond to him now. Confess it. Release that person to the Judge. Ask the Spirit for patience you don't have. And if there's someone you need to speak to, decide when.</p></div>
`);

S('discuss', '19. Group discussion questions', `
<ol>
<li><b>Observation.</b> What was happening to these believers in James 5:1-6? How would you have felt in their position?</li>
<li><b>Understanding.</b> Why do you think James puts "don't grumble against one another" right after "be patient"?</li>
<li><b>Interpretation.</b> What's the difference between long-suffering and just being a pushover? Where is the line?</li>
<li><b>Belief.</b> How does believing that Jesus is coming back as Judge make it easier, or harder, to stop wanting revenge?</li>
<li><b>Motives.</b> Sometimes we look patient but are really just avoiding conflict. How can you tell the difference in yourself?</li>
<li><b>Obedience.</b> What would it look like this week to "strengthen your heart" instead of venting?</li>
<li><b>Relationships.</b> Is there a relationship where patience means speaking up kindly, rather than staying silent?</li>
<li><b>Transformation.</b> Who do you want to become while you wait for the thing you're waiting for?</li>
</ol>
`);

S('apply', '20. Practical New Covenant application', `
<dl class="kv2">
<dt>Believe</dt><dd>God has been long-suffering with me in Christ; the Judge is at the door; the Spirit can grow patience in me.</dd>
<dt>Reject</dt><dd>Revenge, bitterness, grumbling against believers, passivity, and "this is just how I am".</dd>
<dt>Obey</dt><dd>Be patient; strengthen your heart; stop grumbling against one another (5:7-9).</dd>
<dt>Stop</dt><dd>Venting about a believer to others; replaying revenge; sarcastic replies.</dd>
<dt>Start</dt><dd>Praying for the person who frustrates you by name; speaking directly and kindly where needed.</dd>
<dt>Prayer</dt><dd>Bring injustice to God honestly, like Job and the Psalms, instead of to the group chat.</dd>
<dt>Character</dt><dd>Slow to anger, steady under pressure.</dd>
<dt>Relationships</dt><dd>Give people the time and grace God gives you.</dd>
<dt>Leadership</dt><dd>Patient leaders don't punish people for growing slowly, but they still lead and correct.</dd>
<dt>Church life</dt><dd>Our group is a place where people can fail and come back without being written off.</dd>
<dt>Mission</dt><dd>God's patience is so that people can come to repentance (2 Peter 3:9). Our patience with unbelieving friends and family gives them room to see Jesus.</dd>
</dl>
`);

S('challenge', '21. Weekly action challenge', `
<p>Write these five lines in your notebook tonight:</p>
<ol>
<li><b>The truth I need to believe:</b> "God has been patient with me, and he is the Judge, not me."</li>
<li><b>The behaviour I need to stop:</b> one specific thing (venting about ___ / sharp replies to ___ / replaying what ___ did).</li>
<li><b>The act of obedience I will begin:</b> pray for that person by name every day for seven days.</li>
<li><b>The person I will speak to:</b> my Prayer and Check-up Buddy, about how it's going.</li>
<li><b>The date by which I will act:</b> by next Life Group.</li>
</ol>
<p><b>Midweek WhatsApp message:</b></p>
<div class="copybox" data-copy>Hey everyone, midweek check-in. Remember James 5:7-9: "Be patient... stand firm... don't grumble against one another." How is it going praying for that one person by name every day? If it's been hard, that's normal. Ask the Spirit for patience you don't have and keep going. Check in with your Prayer Buddy today. See you at Life Group.</div>
`);

S('leader', '22. Leader notes (private)', `
<ul>
<li><b>Most important truth:</b> our long-suffering flows from God's long-suffering toward us in Christ, and from trusting the Judge who is coming.</li>
<li><b>Sensitive area:</b> someone may be in an abusive or unsafe relationship. Never imply that long-suffering means staying in danger or keeping abuse secret. If someone shares this, thank them, keep it private, and involve your Shepherd or pastor that week. If someone is in immediate danger, help them get safe first.</li>
<li><b>Explain carefully:</b> "don't grumble against one another" doesn't mean never raising a concern. Raise it with the person (Matthew 18:15), not about them.</li>
<li><b>Possible disagreement:</b> how "near" the Lord's coming is (section 16), and where the line is between patience and confronting sin. Let people disagree respectfully; return to the text.</li>
<li><b>If discussion drifts</b> into politics or a specific church conflict: "That's important, but let's hold it for another time. What is James asking of us tonight?"</li>
<li><b>If someone shares something vulnerable:</b> stop, thank them, pray for them briefly right then, and follow up privately. Don't fix it in front of the group.</li>
<li><b>Don't claim with certainty:</b> the exact date of James; that every hard situation will turn out the way someone hopes.</li>
<li><b>Correct immediately:</b> "long-suffering means letting people walk all over you".</li>
<li><b>About the post:</b> it's good, but its verse (James 1:4) is about endurance, not long-suffering. You can say: "The post is right that this is a mark of maturity. Let's look at where the Bible actually uses the word."</li>
</ul>
`);

S('summary', '23. Closing summary', `
<div class="say" data-copy>
<p><b>Original meaning.</b> James wrote to poor believers who were being cheated and mistreated. He told them not to take revenge, not to turn on one another, and not to give up, because the Lord was coming as Judge and he is full of compassion and mercy. Like a farmer waiting for rain, they were to keep faithful and wait for what only God could do.</p>
<p><b>New Covenant meaning.</b> We have received God's long-suffering in Jesus, who did not retaliate when he was wronged and who showed immense patience to sinners like us. His Spirit now grows that same patience in us, so we can be slow to anger with people and steady under pressure while we wait for his return.</p>
<p><b>Central truth.</b> God is patient with us, and he makes his people patient.</p>
<p><b>Required response.</b> Release one person to God the Judge this week, and choose patience with them in prayer and in action.</p>
</div>
`);

S('prayer', '24. Closing prayer', `
<div class="say" data-copy>
<p>Lord God, you are compassionate and gracious, slow to anger and full of love. Thank you for being so patient with us. Thank you, Jesus, that when you were wronged you did not pay back evil, and that you carried our sin on the cross.</p>
<p>We confess that we are often quick to anger and slow to forgive. We grumble about one another. We want to be the judge. Forgive us.</p>
<p>Tonight we hand over to you the people who have hurt us. You are the Judge, and you are coming. Strengthen our hearts. Holy Spirit, grow in us the patience we don't have on our own, so that we stay faithful while we wait.</p>
<p>Help us to be patient with each other in this group, and with the people around us who don't yet know you, so they can see Jesus in us. In Jesus' name, amen.</p>
</div>
`);

S('whatsapp', '25. WhatsApp group announcement', `
<div class="copybox" data-copy>*Life Group Teaching*
*Topic:* Slow to Anger, Strong to Stand
*Scripture:* James 5:7-11
*Hook:* Is long-suffering just letting people walk all over you? James says no, and his answer will surprise you.
*Date:* [DATE]
*Time:* [TIME]
*Venue:* [VENUE]

Bring your Bible and a notebook. See you there!</div>
`);

S('short', '26. Short 20-minute version', `
<p><b>Scripture:</b> James 5:7-11</p>
<p><b>Big Idea:</b> Because the Lord is coming and is full of compassion and mercy, we can refuse revenge, refuse to turn on each other, and keep standing firm.</p>
<ol>
<li><b>Patience starts with God</b> (5:11; Exodus 34:6). He has been long-suffering with us in Christ.</li>
<li><b>Patience waits for the Lord, not for revenge</b> (5:7-8). The Judge is at the door; the farmer works and waits.</li>
<li><b>Don't turn on each other under pressure</b> (5:9). Long-suffering is lived out in community, by the Spirit's power (Galatians 5:22).</li>
</ol>
<p><b>Discussion:</b></p>
<ol><li>Why does James put "don't grumble against one another" right after "be patient"?</li><li>What's the difference between long-suffering and being a pushover?</li><li>Who do you need to release to God the Judge this week?</li></ol>
<p><b>Challenge:</b> pray for that person by name every day for seven days, and tell your Prayer Buddy how it went.</p>
<p><b>Prayer:</b> use section 24.</p>
`);

// Story slides for presenting to the group. Notes are for the leader only (press N in the presenter).
L1.slides = [
  { kicker: 'Life Group · James 5', title: 'Slow to Anger, Strong to Stand', titleHtml: 'Slow to Anger, <em>Strong to Stand</em>', layout: 'title', art: 'sunrise', alt: 'A seedling growing as the sun rises',
    body: '<p>What long-suffering really is, and where it comes from.</p>',
    notes: 'Welcome everyone. Open in prayer (or ask your prepared member). Keep this slide up while people settle.' },
  { kicker: 'Ice breaker', title: 'What makes you lose your patience fastest?', art: 'hourglass', alt: 'An hourglass and a clock',
    body: '<p>Traffic? Load-shedding? Slow Wi-Fi? A group chat?</p>',
    notes: 'Answer first yourself, lightly. Go round the room. Follow-ups if quiet: When you lose patience, do you go quiet, get sharp, or complain to someone else? Who is the most patient person you know?' },
  { kicker: 'The question', title: 'Patient with things. Impatient with people.', art: 'balance', alt: 'Two people, one crossed out in frustration, one calm',
    body: '<p>We wait for the taxi and the rain. But when a <i>person</i> wrongs us, something rises up.</p><p>Is long-suffering just letting people walk all over you?</p>',
    notes: 'This is the opening introduction (section 6). Mention the post going around about long-suffering. Don\'t give the answer yet.' },
  { kicker: 'Picture the scene · James 5:1-6', title: 'A field. A full harvest. An empty purse.', art: 'field', alt: 'Workers in a wheat field and an empty money pouch',
    body: '<p class="dk-verse">"The wages you failed to pay the workers who mowed your fields are crying out against you."<span class="dk-ref">James 5:4</span></p><p>Day labourers needed that money tonight to eat.</p>',
    notes: 'Have Reader 1 read James 5:1-6. Explain: same-day wages were God\'s command (Deuteronomy 24:14-15). These believers were poor, cheated, and powerless to fix it.' },
  { kicker: 'God sees', title: 'James doesn\'t say "it\'s fine"', art: 'scales', alt: 'A set of scales',
    body: '<p>He tells the oppressors to <b>weep and wail</b>. Injustice matters to God.</p><p>Then he turns to the believers...</p>',
    notes: 'Key point: long-suffering is never pretending a wrong didn\'t happen. James condemns it loudly first.' },
  { kicker: 'James 5:7', title: '"Be patient, then..."', art: 'farmer', alt: 'A farmer watching clouds and rain over a planted field',
    body: '<p class="dk-verse">"See how the farmer waits for the land to yield its valuable crop, patiently waiting for the autumn and spring rains."<span class="dk-ref">James 5:7</span></p><p>It\'s October. Our farmers are watching the sky right now.</p>',
    notes: 'Reader 2 reads 5:7-9. "Then" (oun) ties this to 5:1-6: because God will judge, you don\'t have to. The farmer works AND waits for what only God can give.' },
  { kicker: 'Two Greek words', title: 'Slow to anger. Strong to stand.', titleHtml: 'Slow to anger. <em>Strong to stand.</em>', art: 'twowords', alt: 'Two people at peace on the left; a person holding up a heavy weight on the right',
    body: '<div class="dk-two"><div><b>makrothymia</b><span class="gk">μακροθυμία</span><br>Patience with <i>people</i>. Not exploding, not retaliating. (5:7, 8, 10)</div><div><b>hypomonē</b><span class="gk">ὑπομονή</span><br>Endurance under <i>pressure</i>. Not collapsing, not quitting. (5:11; 1:3-4)</div></div>',
    notes: 'Both are translated "patience" in English. The post quoted James 1:4, which is hypomonē (endurance). Say gently: "The post is right about maturity; let\'s see where the Bible uses the word." Don\'t preach word parts (makros + thymos); the meaning comes from usage.' },
  { kicker: '1 · It starts with God', title: '"The Lord is full of compassion and mercy"', art: 'mountain', alt: 'Mount Sinai under a cloud with two stone tablets',
    body: '<p class="dk-verse">"The LORD, the LORD, the compassionate and gracious God, slow to anger, abounding in love and faithfulness."<span class="dk-ref">Exodus 34:6</span></p><p>God said this right after Israel built the golden calf.</p>',
    notes: 'Reader 3 reads 5:10-11. Greek Old Testament uses makrothymos in Exodus 34:6. Ask: Where have you seen God be patient with you?' },
  { kicker: '2 · Wait for the Lord, not for revenge', title: '"The Judge is standing at the door!"', art: 'door', alt: 'A door opening with light streaming out',
    body: '<p>Long-suffering is not pretending. It is <b>refusing to take God\'s place as judge</b>.</p><p class="dk-verse">"Do not take revenge... leave room for God\'s wrath."<span class="dk-ref">Romans 12:19</span></p>',
    notes: 'Ask: Is there a situation where you\'ve been quietly waiting, not for God to act, but for your chance to get even? Pause. Let it land.' },
  { kicker: '3 · Under pressure', title: '"Don\'t grumble against one another"', art: 'circle', alt: 'A group of people with speech bubbles, one with a heart, one crossed out',
    body: '<p>The enemy was outside. The danger was believers groaning about <b>each other</b>.</p><p>Exam stress. Money worries. The WhatsApp side-chat.</p>',
    notes: 'James 5:9. Raise concerns WITH people (Matthew 18:15), not ABOUT them. Ask: When you\'re under pressure, who usually gets your impatience?' },
  { kicker: '4 · Endurance makes us mature', title: 'Who you become while you wait', art: 'tree', alt: 'A tree with deep roots standing in the wind',
    body: '<p class="dk-verse">"Let perseverance finish its work so that you may be mature and complete, not lacking anything."<span class="dk-ref">James 1:4</span></p><p>"Mature" (<span class="gk">τέλειος</span>), not flawless. The prophets. Job.</p>',
    notes: 'Teleios = mature, complete; James 3:2 says we all stumble. Ask: What might God be forming in you through what you\'re waiting for?' },
  { kicker: 'Jesus', title: 'He did not retaliate', art: 'cross', alt: 'A cross on a hill with light rising behind it',
    body: '<p class="dk-verse">"When they hurled their insults at him, he did not retaliate... Instead, he entrusted himself to him who judges justly."<span class="dk-ref">1 Peter 2:23</span></p><p>And he showed "immense patience" to sinners like us (1 Timothy 1:16).</p>',
    notes: 'The gospel: we don\'t become patient to be accepted. We\'ve been accepted, so the Spirit makes us patient. Long-suffering is fruit of the Spirit (Galatians 5:22), not willpower.' },
  { kicker: 'Isaiah 40:31', title: 'Those who wait on the LORD', art: 'eagle', alt: 'An eagle with wings spread over mountains',
    body: '<p class="dk-verse">"But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles..."<span class="dk-ref">Isaiah 40:31 KJV</span></p><p>A promise of <b>strength while you wait</b>, not a promise of the outcome you want.</p>',
    notes: 'Spoken first to exiles who felt forgotten (40:27). The Greek Old Testament uses hypomenō here, the same idea as James\'s "perseverance". Correct gently if someone treats it as "God will give me what I want".' },
  { kicker: 'Clear up the confusion', title: 'Long-suffering is not being a doormat', art: 'balance', alt: 'Two people: one marked with an X, one at peace',
    body: '<div class="dk-two"><div><b>It is not</b>Staying in danger · Keeping abuse secret · Never speaking up · Doing nothing</div><div><b>It is</b>No revenge · No bitterness · Telling the truth kindly · Leaving judgment to God</div></div>',
    notes: 'Be careful here. If anyone is in an unsafe situation, long-suffering never means staying in danger. Follow up privately and involve your Shepherd.' },
  { kicker: 'A quiet moment', title: 'Two minutes with God', art: 'candle', alt: 'A single candle burning',
    body: '<ul><li>Who am I waiting to see "get what they deserve"?</li><li>Who pays for it when I\'m under pressure?</li><li>Am I grumbling about someone instead of speaking to them?</li></ul>',
    notes: 'Say: No one will be asked to share. Be silent for about two minutes. Then invite people to confess, release that person to God, and ask the Spirit for patience.' },
  { kicker: 'This week', title: 'One person. Seven days.', art: 'notebook', alt: 'A notebook with five numbered lines and a pen',
    body: '<ol><li>Believe: God is patient with me, and he is the Judge.</li><li>Stop: one specific thing.</li><li>Start: pray for that person by name daily.</li><li>Tell: my Prayer and Check-up Buddy.</li><li>By: next Life Group.</li></ol>',
    notes: 'Ask everyone to write the five lines in their notebook now. Send the midweek WhatsApp check-in (section 21).' },
  { kicker: 'The central truth', title: 'God is patient with us, and he makes his people patient.', titleHtml: 'God is patient with us, <em>and he makes his people patient.</em>', layout: 'title', art: 'sunrise', alt: 'A seedling growing as the sun rises',
    body: '<p>Release one person to God the Judge this week, and choose patience with them in prayer and in action.</p>',
    notes: 'Read the closing summary, then the closing prayer (sections 23 and 24). Then move to prayer requests and announcements (check the dates first).' },
];

export const LESSONS = [L1];
