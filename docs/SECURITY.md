# TABOR Security & Privacy Model

Plain-language summary of how member data and messages are protected, what's
enforced, and the few dashboard toggles to flip.

## How messages & data are protected
1. **Encrypted in transit** — all app/web traffic is TLS (HTTPS); realtime chat is
   secure WebSockets (WSS). Nothing readable on the network.
2. **Encrypted at rest** — Supabase stores the database on AES-256 encrypted disks.
3. **Row-Level Security (RLS)** — the real access control. Every table enforces who
   can read/write at the database level:
   - A user can only read their **own** profile-private data, their guild's messages
     (if a member), and DMs they're a participant in.
   - Friends can see each other across guilds **only after an accepted request**.
   - There is **no path** for one user to query another user's private data.
4. **No client secrets / no AI backdoor** — the app ships only the public anon key;
   the master **service-role key lives server-side only** (web admin), never in the
   app or git. The in-app AI ("The System") runs under the **user's own permissions**
   — it can never read other members' messages or data. When wired to Claude, only
   the user's own conversation is sent, never other people's content.

## Active safety (server-enforced — can't be bypassed by a hacked client)
- **Bans** — `profiles.banned`; a DB trigger blocks banned accounts from posting.
- **Rate limiting** — DB triggers cap messages (8 / 10s) and friend requests
  (20 / 60s) to stop flooding/spam.
- **Reporting + moderation** — members hold a message to report; admins review at
  `/admin/moderation` and can delete the message or ban the user. All actions are
  written to the **audit log**.
- **Abuse filter** — egregious slurs are blocked client-side; nuanced cases go to
  human moderation (so we don't false-positive innocent users).
- **Blocking** — any member can block another (cross-guild); removes contact + hides them.
- **Right to erasure (POPIA/GDPR)** — one-click full data wipe in `/admin/customers`.

## Flip these in the Supabase dashboard (2 minutes, recommended)
Authentication → Settings / Policies:
- **Leaked-password protection: ON** (rejects passwords found in breaches).
- **Minimum password length: 10+**.
- **Email confirmation: ON** (already used by signup).
- Consider enabling **MFA (TOTP)** for admin accounts.
Database → Backups: ensure **Point-in-Time Recovery** (paid tier) when revenue starts.

## Not doing (deliberately) — End-to-End Encryption
Signal-style E2EE (server can't read anything) is **incompatible with a moderated,
guidelines-based community**: it removes the ability to stop abuse, report content,
run the AI mentor, and give admin oversight. Discord/Slack don't use it for the same
reason. If max-private 1:1 DMs are ever wanted, E2EE can be added to **DMs only**
later, with the trade-off that those DMs lose moderation/search/AI.

## Posture summary
Outsiders can't read data (TLS + at-rest). Other users can't read your data (RLS).
The AI can't siphon data (runs as you, no master key). Abuse is catchable (reports +
bans + rate limits + audit). That's the right balance of **privacy + safety** for a
brotherhood.
