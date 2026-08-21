# Private gated page (`/w/<slug>`)

A confidential work portfolio hosted on tabor.quest, behind real server-side auth.
It shares the domain and the Supabase project with TABOR but is otherwise separate:
no nav entry, no inbound links, not in the sitemap, its own CSP.

> The route slug and all credentials live in env / Supabase, never in this repo.
> The slug is in `CV_ROUTE_SLUG` (root `.env`, `apps/web/.env.local`, and Vercel).

## How it is protected

Two independent conditions, checked server-side on **every** request, for the page
and for every image, video and font:

1. a valid Supabase session, verified against the auth server (`getUser()`, not a
   decoded cookie)
2. an un-revoked row in `private_page_access` for that user

Condition 2 is the important one. This Supabase project has **public sign-up
enabled** because the TABOR mobile app depends on it, so "is authenticated" is not
an access decision here. Anyone can make a TABOR account; only a granted account
can open the page. The grant table is the authority, and the gateway reads it on
every request, so revocation takes effect immediately, including for a session
that is already signed in.

## Architecture

Option A, server route as gateway.

```
browser ──> /w/<slug>                     apps/web/app/w/[slug]/route.ts
            /w/<slug>/assets/<...>        apps/web/app/w/[slug]/assets/[...path]/route.ts
                    │
                    ├─ session check + grant check   apps/web/lib/cv-gate.ts
                    │
                    └─ streams from PRIVATE bucket "private-cv"
                       using the service role, server-side only
```

- **Bucket `private-cv` is private.** `public: false`, and `scripts/cv-upload.mjs`
  re-asserts that on every run then probes the public URL to prove it 400s. RLS is
  on `storage.objects` with no policy granting anon or authenticated any read, so
  the only path in is the gateway.
- **`presentation.html` is stored byte-for-byte as authored.** The gateway makes
  two serve-time rewrites so it works under the gated path without editing it:
  - injects `<base href="/w/<slug>/">`, so its relative `assets/deck/<file>` paths
    resolve through the gate
  - swaps the Google Fonts `<link>`s for a self-hosted copy at
    `assets/fonts/fonts.css`, so the page makes **no third-party request at all**
- **Range requests are forwarded** to Storage, so video seeks instead of
  downloading the whole file first. `Cache-Control: private` keeps every byte out
  of the Vercel edge cache and any shared proxy.
- **Only two folders are reachable**: `deck/` and `fonts/`, one flat filename each.
  Traversal, encoded traversal and directory listing all 404.

## Managing access

```bash
node scripts/cv-access.mjs list
node scripts/cv-access.mjs grant <email> "Label for your records"
node scripts/cv-access.mjs revoke <email>      # immediate
node scripts/cv-access.mjs restore <email>
node scripts/cv-access.mjs password <email>    # issue a fresh password
```

`grant` creates the account if it does not exist, with a generated password and
the email pre-confirmed (no confirmation mail is sent, you hand over the password
yourself), then prints the credentials once. One account per person, so each can
be revoked without touching the others.

**Sign-in log**: Supabase dashboard, project `bceysfguycepothnwvmu`.
- Authentication > Users: last sign-in per account
- Logs > Auth Logs: every sign-in attempt, success and failure, with IP
- `cv-access.mjs list` also shows view count and last-seen per grant, recorded by
  the gateway itself.

## Rotating

- **New password for one person**: `cv-access.mjs password <email>`. No deploy.
- **Cut everyone off**: `cv-access.mjs revoke <email>` for each. No deploy.
- **New URL**: change `CV_ROUTE_SLUG` in Vercel (Settings > Environment Variables)
  and redeploy. The old URL 404s from that moment.

## Updating the content

```bash
node scripts/cv-upload.mjs <source-dir> <fonts-dir>
```

`<source-dir>` must contain `presentation.html` and `assets/deck/`. The script
uploads **only** those two things: any `working/`, notes or README in the source
folder are never touched. Changes are live immediately, no redeploy.

## What is deliberately not here

- No admin UI section. An entry in the admin nav would be one more place the route
  can be discovered, and access is a five-second script call.
- No signed URLs. A signed URL is a bearer token that keeps working for anyone it
  is forwarded to until it expires; the gateway re-checks identity on every byte.
- No caching of the grant lookup. It costs an auth round-trip plus a small query
  per asset, which is the price of revocation being instant rather than eventually.
