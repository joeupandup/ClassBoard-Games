# ClassBoard Games

A production-oriented Next.js application for publishing, organising,
discovering and hosting teacher-made classroom games.

## What is included

- Premium responsive public site and teacher dashboard
- Search, filters, collections and persistent local preview state
- Real new-tab play, Web Share and clipboard fallback
- URL submission, processing and editable review workflow
- Verified Wellesley Games publisher and HTML importer
- Signed HttpOnly preview sessions
- D1 schema for users, schools, games, jobs, collections and moderation
- Worker API routes for game CRUD, publishing, rescans and reports
- Queue consumer using Browser Run, R2 and Workers AI
- Separate R2-backed game-host Worker for `play.classboardgames.com`
- OpenNext configuration for deployment to Cloudflare Workers

## Local development

```bash
pnpm install
copy .dev.vars.example .dev.vars
pnpm db:migrate:local
pnpm dev
```

Open `http://127.0.0.1:3000`.

The interface remains usable without Cloudflare bindings: browser state is
stored in `localStorage`. D1, R2, Queue and Browser Run operations activate in
the Cloudflare preview/runtime.

## Cloudflare setup

Create the resources:

```bash
pnpm wrangler d1 create classboard-games-db
pnpm wrangler r2 bucket create classboard-game-assets
pnpm wrangler queues create classboard-scan-jobs
pnpm wrangler queues create classboard-scan-jobs-dlq
```

Replace the placeholder D1 ID `00000000-0000-0000-0000-000000000000` in:

- `wrangler.jsonc`
- `wrangler.scanner.jsonc`
- `wrangler.game-host.jsonc`

Create a strong session secret:

```bash
pnpm wrangler secret put SESSION_SECRET
```

Apply migrations:

```bash
pnpm db:migrate:remote
```

Deploy the three services:

```bash
pnpm deploy
pnpm wrangler deploy --config wrangler.scanner.jsonc
pnpm wrangler deploy --config wrangler.game-host.jsonc
```

Attach `play.classboardgames.com` to the game-host Worker and the main domain to
the OpenNext Worker.

## Security notes

- URL scans permit only public HTTP/HTTPS targets and block obvious private,
  loopback, link-local and metadata addresses.
- Production should additionally resolve every redirect and DNS answer before
  browser navigation to defend against DNS rebinding.
- Hosted games run on a separate origin with a CSP sandbox and no account
  cookies.
- Public hosting requires moderation approval and an ownership confirmation.
- Preview authentication is deliberately labelled as preview mode. Replace it
  with verified email magic links or school SSO before public launch.

## Project map

```text
app/                         Next.js pages and route handlers
components/                  Reusable product UI
lib/                         Types, validation, auth and shared data
migrations/                  D1 schema
workers/scanner/             Queue + Browser Run scan consumer
workers/game-host/           Isolated R2 game delivery
public/                      Logo and public assets
```
