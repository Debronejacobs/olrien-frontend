# Olrien — One governed model of the company

> Olrien gives operations-heavy companies one shared, trustworthy picture of the business: the customers, orders and invoices they run on, how they connect, and what people and AI tools are allowed to do. Every answer shows where it came from, every change is checked before it happens, and everything is written into one record. Open source. Runs on your own servers.

A landing page for an enterprise data governance / ontology platform. Built as a fully static Next.js export and deployed to Cloudflare Pages with serverless Functions for waitlist signup and CSV export.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui (Radix UI primitives) |
| Language | TypeScript 5 |
| Package Manager | Bun 1.4.5 |
| Animations | GSAP, framer-motion, lenis (smooth scroll) |
| Icons | lucide-react |
| Forms | react-hook-form + zod |
| Notifications | sonner |
| Deployment | Cloudflare Pages + Cloudflare Functions |
| KV Storage | Cloudflare KV (waitlist emails) |

---

## Project Structure

```
olrien/
├── .github/workflows/deploy-pages.yml   # GitHub Actions deploy workflow
├── scripts/
│   ├── fetch_logos.py                   # Fetch brand logos
│   └── gen_brand_module.py              # Generate brand module
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout, metadata, fonts
│   │   └── page.tsx                     # Home page (single route "/")
│   ├── components/
│   │   ├── landing/                     # Page sections (Hero, Problem, FAQ, etc.)
│   │   │   ├── animated-text.tsx
│   │   │   ├── brand-logos.tsx
│   │   │   ├── endpoint.tsx
│   │   │   ├── faq.tsx
│   │   │   ├── fluid-grid.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── hero.tsx
│   │   │   ├── logo.tsx
│   │   │   ├── magnetic.tsx
│   │   │   ├── nav.tsx
│   │   │   ├── problem.tsx
│   │   │   ├── reveal.tsx
│   │   │   ├── scroll-rail.tsx
│   │   │   ├── section-heading.tsx
│   │   │   ├── smooth-scroll.tsx
│   │   │   └── trust-marquee.tsx
│   │   └── ui/                          # shadcn/ui components (50+)
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   └── lib/
│       ├── gsap.ts                      # GSAP animation setup
│       ├── scroll.ts                    # scrollToId utility
│       └── utils.ts                     # cn() class-variance utility
├── functions/
│   └── api/
│       ├── subscribe.ts                 # Waitlist POST endpoint (Cloudflare Function)
│       └── export.ts                    # CSV export GET endpoint (Cloudflare Function)
├── out/                                 # Static build output (gitignored)
├── .dev.vars                            # Local dev secrets (gitignored)
├── wrangler.toml                        # Cloudflare Pages + Functions config
├── next.config.mjs                      # Next.js static export config
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── bun.lock
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.4+
- [Node.js](https://nodejs.org) (for the Wrangler CLI only — Bun remains your package manager/build tool)
- A [Cloudflare](https://cloudflare.com) account (free tier is sufficient)

### Install

```bash
bun install
```

### Development

```bash
bun run dev          # Start Next.js dev server on port 3005
bun run build        # Build static export to out/
bun run typecheck    # TypeScript type check
bun run lint         # ESLint
```

### Build for Production

```bash
bun run build
# → produces out/ with index.html, _next/, etc.
```

---

## Cloudflare Pages Deployment

This project is configured for deployment to **Cloudflare Pages** with **Cloudflare Functions**. The full runbook is below; every command is copy-pasteable.

### Phase 1 — Make the app statically exportable

`next.config.mjs` is already configured with `output: "export"` and `images: { unoptimized: true }`.

Build and confirm the artifact:

```bash
bun run build
ls out    # should contain index.html, _next/, etc.
```

### Phase 2 — The Functions

`functions/api/subscribe.ts` and `functions/api/export.ts` already exist at the project root.

Install Workers types (dev-only):

```bash
bun add -d @cloudflare/workers-types
```

### Phase 3 — KV namespace, config, secrets

Log in and create the KV namespace:

```bash
npx wrangler login
npx wrangler kv namespace create WAITLIST
```

Copy the printed `id = "..."` into `wrangler.toml` (already present with binding `WAITLIST`).

Generate an export token:

```bash
openssl rand -hex 32
```

Set it as a Pages secret:

```bash
npx wrangler pages secret put EXPORT_TOKEN
```

Create `.dev.vars` for local development:

```
EXPORT_TOKEN=dev-only-token
```

Ensure `.gitignore` includes:

```
.dev.vars
.wrangler/
out/
```

### Phase 4 — Form endpoint

The waitlist form posts to `/api/subscribe` (same-origin). No changes needed.

### Phase 5 — Test locally

```bash
bun run build
npx wrangler pages dev out --persist
# → http://localhost:8788
```

Exercise the endpoints:

```bash
# valid → 201 {"ok":true,"already":false}
curl -i -X POST http://localhost:8788/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","company":""}'

# duplicate → 200 {"ok":true,"already":true}
curl -i -X POST http://localhost:8788/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","company":""}'

# invalid → 400
curl -i -X POST http://localhost:8788/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"nope","company":""}'

# honeypot filled → 200 {"ok":true} (nothing stored)
curl -i -X POST http://localhost:8788/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"bot@spam.xyz","company":"ACME LLC"}'

# export → CSV (requires valid token)
curl -H "Authorization: Bearer dev-only-token" http://localhost:8788/api/export
```

### Phase 6 — Deploy

**CLI deploy (fastest):**

```bash
npx wrangler pages deploy out
# → https://olrien.pages.dev
```

**Git-based builds (set up once):**

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → connect your repo
2. Build command: `bun run build`, output directory: `out`
3. Environment variables: `BUN_VERSION = 1.4.x`, `NODE_VERSION = 22`
4. Commit your lockfile (`bun.lock`)
5. Bindings: add KV namespace `WAITLIST` for Production and Previews
6. Secrets: add `EXPORT_TOKEN`

Every push to your default branch now deploys; every PR gets a preview URL.

### Phase 7 — Production verification

- Submit a real email through the form → success state appears.
- `curl -H "Authorization: Bearer $EXPORT_TOKEN" https://your-domain.com/api/export` → your email in CSV.
- Watch logs: `npx wrangler pages deployment tail`

---

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `EXPORT_TOKEN` | `.dev.vars` (local) / Pages Secrets (prod) | Bearer token for `/api/export` |
| `WAITLIST` KV binding | `wrangler.toml` / Pages Bindings | KV namespace for waitlist emails |

---

## Architecture Notes

- **Fully static export** — No Next.js route handlers (`app/api/*`), no Server Actions, no ISR. All dynamic behavior lives in Cloudflare Functions under `functions/api/`.
- **Single route** (`/`) — The home page renders: Nav → ScrollRail → Hero → TrustMarquee → Problem → Endpoint → FAQ → Footer.
- **`cn()` utility** (`src/lib/utils.ts`) — Shared class-variance-authority utility used by ~267 symbols across the project. High blast radius if changed.
- **No Node server** — Deployed as plain HTML/CSS/JS on Cloudflare Pages.

---

## Scripts

| Script | Description |
|--------|-------------|
| `scripts/fetch_logos.py` | Fetches brand logos for the trust marquee |
| `scripts/gen_brand_module.py` | Generates the brand module |

---

## License

Private — all rights reserved.