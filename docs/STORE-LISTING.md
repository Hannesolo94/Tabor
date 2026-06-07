# TABOR — App Store + Google Play Listing Copy & Reviewer Notes

Ready-to-paste copy + the answers to the submission questionnaires. Brand voice: terse,
ceremonial, no em dashes, no emoji. Fill the [BRACKETED] items before submitting.

---

## APPLE — App Store Connect

**App Name** (max 30): `TABOR: Sons of Fire`

**Subtitle** (max 30): `Brotherhood for Christian men`

**Promotional Text** (max 170, editable anytime):
`Free for life. Daily scripture, real training, and a band of brothers who keep you in the fight. Forged not bought.`

**Description** (max 4000):
```
TABOR is a free brotherhood for Christian men who train, seek, and refuse to drift.

Three pillars, one daily quest:

THE WORD. The full King James Bible, daily passages, reading plans, and a prayer journal. Take ground in scripture every day.

THE BODY. Hundreds of exercises with form guides, tailored workout programs built around your goal and equipment, plus a built-in Tabata timer. Train the temple.

THE BROTHERHOOD. Join a guild, find brothers across the world, and keep each other accountable. Private messages are end to end encrypted.

THE SYSTEM. An AI mentor that speaks like a status window, counseling you toward the next right step.

Build your streak. Rise through the ranks from Recruit to Supersonic Fit. Win the day.

TABOR is free, for life. You can support the mission through giving or by wearing the gear, and a share of every gift goes to charities the brotherhood chooses.

For men 18 and over.
```

**Keywords** (max 100, comma separated, no spaces):
`christian,bible,men,faith,fitness,brotherhood,devotional,accountability,workout,scripture,prayer,discipleship,gym`

**Support URL:** `https://tabor.quest` (ensure a support/contact route or use mailto support@tabor.quest)
**Marketing URL:** `https://tabor.quest`
**Privacy Policy URL:** `https://tabor.quest/privacy`

**Category:** Primary: Lifestyle (or Health & Fitness). Secondary: Health & Fitness.

**Age Rating:** complete the 2026 questionnaire honestly. Expect **17+ / 18+** because of unrestricted user-generated content + social messaging. Declare: user-generated content YES, unrestricted web access NO (links are controlled), no gambling, no mature themes beyond UGC.

**Encryption (export compliance):** Uses encryption: YES. Uses only standard/exempt algorithms (libsodium/NaCl + TLS): qualifies for exemption. `ITSAppUsesNonExemptEncryption = NO` is set in app config.

---

## GOOGLE — Play Console

**App title** (max 30): `TABOR: Sons of Fire`

**Short description** (max 80):
`A free brotherhood for Christian men. Scripture, training, and accountability.`

**Full description** (max 4000): use the same body as the Apple description above.

**Category:** Lifestyle (or Health & Fitness).
**Tags:** Christianity, fitness, community.
**Contact email:** support@tabor.quest
**Privacy Policy URL:** `https://tabor.quest/privacy`

**Data Safety form** — declare honestly:
- Collected & linked to the user: email, name, app activity (quests/workouts), user content (messages, prayers), approximate fitness data. Identifiers: user ID.
- Direct messages: end to end encrypted.
- Data is encrypted in transit. Users can request deletion: YES.
- **Account deletion URL:** `https://tabor.quest/delete-account`
- Data shared with third parties for ads/tracking: NO.

**Content rating (IARC questionnaire):** declare users can interact/communicate + share user-generated content. Expect **Teen/Mature (17+)**.

**Child safety standards:** policy URL `https://tabor.quest/child-safety`; child-safety contact `safety@tabor.quest`. Complete the CSAE self-certification.

**Target audience & content:** 18+.

---

## REVIEWER NOTES (paste into Apple "App Review Information" notes + keep for Google)

```
Thank you for reviewing TABOR.

DEMO ACCOUNT
Email: [create a test account and put it here]
Password: [password]
(The account is pre-onboarded so you can reach all features.)

USER-GENERATED CONTENT & MODERATION (Apple 1.2 / Google UGC)
- Users accept Terms with a zero-tolerance objectionable-content clause during
  onboarding before they can post (see "The Covenant" step).
- Every message and user can be reported (press and hold a message) and blocked.
- A profanity/keyword filter blocks objectionable text before sending.
- Admin moderation queue reviews reports; abusive content is removed and users
  are banned, with a target of acting within 24 hours. Server-side rate limits
  and bans are enforced at the database level.
- Contact for safety issues: safety@tabor.quest. General support: support@tabor.quest.

ENCRYPTED DIRECT MESSAGES
- 1:1 DMs are end to end encrypted (libsodium/NaCl). The server cannot read them.
- Reporting a DM packages the message content from the reporting user's device so
  our team can act on it, despite the encryption.

ACCOUNT DELETION (Apple 5.1.1(v) / Google)
- In-app: Status > Settings > Danger Zone > Delete my account. It permanently
  erases the account and personal data. Web path: https://tabor.quest/delete-account.

DONATIONS
- There is NO in-app payment. The "Support the mission" button opens our website
  in the system browser, where giving is processed externally. Donations unlock
  nothing in the app.

AGE
- 18+. An in-app date-of-birth gate blocks under-18 users at onboarding.

ENCRYPTION EXPORT
- Standard published cryptography only (NaCl/TLS). ITSAppUsesNonExemptEncryption = NO.
```

---

## PRE-SUBMIT ASSET CHECKLIST
- [ ] App icon (1024x1024, no alpha) — brand seal on black.
- [ ] iPhone 6.7" + 6.5" screenshots (Quests, Word reader, Body program, Guild chat, Status). Android phone screenshots + feature graphic (1024x500).
- [ ] Short promo/preview video (optional but helps).
- [ ] Demo account created + credentials in reviewer notes.
- [ ] Privacy, Terms, Child-Safety, Delete-Account pages live (they are).
- [ ] Apple: age rating, App Privacy labels, export compliance, support/marketing/privacy URLs.
- [ ] Google: Data Safety (+ deletion URL), IARC rating, child-safety declaration, target audience.
- [ ] Accounts: Apple Developer ($99/yr), Google Play ($25 once).
- [ ] Build + submit via `eas build` then `eas submit` (iOS to TestFlight, Android to Internal Testing).
```
