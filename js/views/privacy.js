// Plain-language privacy notice. To be reviewed by the leader (and ideally a POPIA adviser) before relying on it.
export const title = 'Privacy';
export async function render() {
  return `<div class="stack-sm"><p class="eyebrow">Privacy notice</p><h1>How New Creation uses your information</h1><p class="muted small">Last updated October 2026 · Draft for the group leader to review</p></div>
  <section class="card prose">
    <h3>Who looks after your information</h3>
    <p>New Creation is run by the leader of your reading circle for the group's Bible reading. The leader is responsible for the information described here. Contact them through your circle's WhatsApp group to ask a question or make a request.</p>
    <h3>What we collect</h3>
    <ul><li>Your name and WhatsApp number, given when you join.</li><li>Your 4-digit PIN. It is never stored as you typed it, only in a scrambled (hashed) form that can't be turned back into the PIN.</li>
      <li>Your reading progress, reading streak, and the dates you joined and last opened the app.</li><li>Posts you share in the Circle, prayers you mark, and encouragements you send or receive.</li>
      <li>Private items you create: notes, bookmarks, highlights and saved word studies.</li><li>Your settings, and a simple log of sign-ins and leader actions (such as PIN resets) for security.</li></ul>
    <h3>Why</h3>
    <p>To run the shared reading challenge, show your progress, let the circle encourage and pray for one another, let the leader support members and reset forgotten PINs, and keep accounts secure.</p>
    <h3>Who can see what</h3>
    <ul><li><b>Everyone in the circle:</b> your name, your chapter count and whether you read today (unless you turn on "Keep my progress private"), and your Circle posts.</li>
      <li><b>Only the leader:</b> your WhatsApp number, your progress (even if private), when you last opened the app, and the sign-in log.</li>
      <li><b>Only you:</b> your notes, bookmarks, highlights and word studies.</li></ul>
    <h3>Emails to the leader</h3>
    <p>The leader receives emails when someone joins, when members first open the app each day, a short evening summary, and a notice when a prayer request is posted. Prayer notices name the member but do not include the request text.</p>
    <h3>Where it is stored</h3>
    <p>Member information is stored in a Google Sheet in the leader's Google account, on Google's servers, which may be outside South Africa. The app itself is a website. Your phone keeps a copy of recent app data and any Bible text you've opened so the app works quickly and offline; signing out removes your private copy from that device.</p>
    <h3>How long we keep it</h3>
    <p>Your information is kept while you are a member. Progress from finished challenges is kept so you can look back on it. If you delete your account, your profile, progress, posts, encouragements and private items are removed immediately. Backups made by the leader before app updates are kept for a limited time and then deleted.</p>
    <h3>Your choices</h3>
    <ul><li>Keep your progress private (Me &gt; Privacy).</li><li>Download a copy of your data (Me &gt; Account).</li><li>Delete your account (Me &gt; Account), or ask the leader to remove it for you.</li><li>Ask the leader to correct your information or to explain how it is used.</li></ul>
    <p class="small faint">This notice explains the app in plain language. It is not legal advice, and having a notice does not by itself make the app compliant with the Protection of Personal Information Act (POPIA). The leader should review it, ideally with someone familiar with POPIA, before relying on it.</p>
  </section>
  <a class="btn" href="#/me">Back</a>`;
}
