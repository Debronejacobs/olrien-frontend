Here's the full runbook, zero to production. Every command is copy-pasteable; do it in order and you'll be collecting emails in about 20 minutes.

---

## Phase 0 — Prerequisites

- A Cloudflare account (free tier is all you need).
- Your repo local, building cleanly with bun.
- Node available **just for the wrangler CLI** (bun stays your package manager/build tool).
- Confirm your app has **no Next route handlers (`app/api/*`), no Server Actions, no ISR** — static export can't carry those. Anything dynamic moves to `functions/`.

Target file layout when done:

```
your-project/
├── functions/
│   └── api/
│       ├── subscribe.ts      ← new
│       └── export.ts         ← new
├── out/                      ← build output (gitignored)
├── .dev.vars                 ← new, gitignored
├── wrangler.toml             ← new
├── next.config.mjs
└── ...your app
```

---

## Phase 1 — Make the app statically exportable

**Step 1.** `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
```

**Step 2.** Build and confirm the artifact:

```bash
bun run build
ls out    # should contain index.html, _next/, etc.
```

If the build errors here, fix your app first — everything after this assumes `out/` exists.

---

## Phase 2 — The Functions

**Step 3.** Install the types (dev-only):

```bash
bun add -d @cloudflare/workers-types
```

**Step 4.** Create `functions/api/subscribe.ts`:

```ts
import type { PagesFunction } from "@cloudflare/workers-types";

type Env = { WAITLIST: KVNamespace };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let email = "";
  let honeypot = "";
  try {
    const body = (await request.json()) as Record<string, unknown>;
    email = String(body.email ?? "");
    honeypot = String(body.company ?? "");
  } catch {
    return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
  }

  if (honeypot) return Response.json({ ok: true }); // bot: pretend success, discard

  const normalized = email.trim().toLowerCase();
  if (!EMAIL_RE.test(normalized) || normalized.length > 254)
    return Response.json({ ok: false, error: "That email doesn't look right." }, { status: 400 });

  if (await env.WAITLIST.get(normalized))
    return Response.json({ ok: true, already: true });

  await env.WAITLIST.put(normalized, "1", {
    metadata: { subscribedAt: new Date().toISOString() },
  });
  return Response.json({ ok: true, already: false }, { status: 201 });
};
```

**Step 5.** Create `functions/api/export.ts`:

```ts
import type { PagesFunction } from "@cloudflare/workers-types";

type Env = { WAITLIST: KVNamespace; EXPORT_TOKEN: string };

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (request.headers.get("Authorization") !== `Bearer ${env.EXPORT_TOKEN}`)
    return Response.json({ ok: false }, { status: 401 });

  const rows = ["email,subscribed_at"];
  let cursor: string | undefined;
  do {
    const page = await env.WAITLIST.list({ cursor });
    for (const key of page.keys) {
      const meta = key.metadata as { subscribedAt?: string } | undefined;
      rows.push(`${key.name},${meta?.subscribedAt ?? ""}`);
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return new Response(rows.join("\n"), { headers: { "Content-Type": "text/csv" } });
};
```

Rules for this directory: it lives at the **project root**, file path = URL, and **only Web APIs inside** — no `Bun.*`, no `node:*`.

---

## Phase 3 — KV namespace, config, secrets

**Step 6.** Log in and create the namespace:

```bash
npx wrangler login
npx wrangler kv namespace create WAITLIST
```

The output prints a `id = "..."` — copy it.

**Step 7.** Create `wrangler.toml` at the project root (paste your KV id):

```toml
name = "olrien"
compatibility_date = "2025-09-01"
pages_build_output_dir = "out"

[[kv_namespaces]]
binding = "WAITLIST"
id = "<paste-kv-id-here>"
```

**Step 8.** Generate an export token and store it safely (password manager — you'll need it every time you pull the list):

```bash
openssl rand -hex 32
```

**Step 9.** Set it as a Pages secret (paste the token when prompted):

```bash
npx wrangler pages secret put EXPORT_TOKEN
```

**Step 10.** Create `.dev.vars` for **local** dev (secrets aren't readable locally otherwise):

```
EXPORT_TOKEN=dev-only-token
```

**Step 11.** Gitignore the right things:

```bash
echo -e ".dev.vars\n.wrangler/\nout/" >> .gitignore
```

---

## Phase 4 — Point the form at the same-origin endpoint

**Step 12.** In your `WaitlistForm` component, the only change:

```tsx
const ENDPOINT = "/api/subscribe";
```

Keep everything else (honeypot field, loading/success/error states) exactly as written earlier. If you previously deployed the standalone Worker version, delete it now so there's one source of truth: `npx wrangler delete --name olrien-waitlist` (or whatever you named it).

---

## Phase 5 — Test locally before shipping anything

**Step 13.** Run the dev server with Functions + emulated KV:

```bash
bun run build
npx wrangler pages dev out --persist
# → http://localhost:8788
```

(`--persist` keeps test emails in `.wrangler/` between restarts.)

**Step 14.** Exercise every branch with curl:

```bash
# valid → expect 201 {"ok":true,"already":false}
curl -i -X POST http://localhost:8788/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","company":""}'

# duplicate → expect 200 {"ok":true,"already":true}
curl -i -X POST http://localhost:8788/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","company":""}'

# invalid → expect 400
curl -i -X POST http://localhost:8788/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"nope","company":""}'

# honeypot filled → expect 200 {"ok":true} but NOTHING stored
curl -i -X POST http://localhost:8788/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"bot@spam.xyz","company":"ACME LLC"}'

# export → expect CSV with only test@example.com
curl -H "Authorization: Bearer dev-only-token" http://localhost:8788/api/export

# wrong token → expect 401
curl -i -H "Authorization: Bearer wrong" http://localhost:8788/api/export
```

**Step 15.** Open `http://localhost:8788` in a browser, submit the real form, confirm the success state renders and the email shows up:

```bash
npx wrangler kv key list --namespace-id <paste-kv-id>
```

---

## Phase 6 — Deploy

**Option A — CLI deploy (fastest, do this first):**

```bash
npx wrangler pages deploy out
# → https://olrien.pages.dev
```

**Step 16.** Re-run the curl suite from Step 14 against `https://olrien.pages.dev/api/subscribe` (swap the token for the real one on `/api/export`).

**Step 17.** Add your domain: Cloudflare dashboard → your Pages project → **Custom domains** → add `your-domain.com` (and `www` if you use it). Because the form posts to a relative path, it keeps working on the custom domain with zero changes.

**Option B — Git-based builds (set up once you're happy):**

1. Dashboard → Workers & Pages → Create → Pages → connect your repo.
2. Build settings: command `bun run build`, output directory `out`. (If the app lives in a monorepo subfolder, set the root directory accordingly.)
3. Environment variables: `BUN_VERSION = 1.2.x` (pin to your local version), `NODE_VERSION = 22`.
4. **Commit your lockfile** (`bun.lock` / `bun.lockb`) — the build container detects bun from it.
5. Bindings: project → Settings → Functions/Bindings → add KV namespace binding named `WAITLIST` → **for Production and for Previews**.
6. Secrets: Settings → Variables and Secrets → add `EXPORT_TOKEN` (same value).
7. Every push to your default branch now deploys; every PR gets a preview URL with a working endpoint.

---

## Phase 7 — Production verification

**Step 18.** On the live custom domain:
- Submit a real email through the form → success state appears.
- `curl -H "Authorization: Bearer $EXPORT_TOKEN" https://your-domain.com/api/export` → your email in CSV.
- Submit garbage in devtools → friendly error message, no crash.
- Watch logs if anything misbehaves: `npx wrangler pages deployment tail` (pick the latest deployment).

**Step 19.** Clean your test data before announcing anything:

```bash
npx wrangler kv key delete --namespace-id <paste-kv-id> --key "test@example.com"
```

---

## Phase 8 — Optional hardening (later, when needed)

- **Turnstile:** if bots start hitting you despite the honeypot — add the invisible Turnstile widget to the form, post `cf-turnstile-response` in the payload, verify it in `subscribe.ts` against `https://challenges.cloudflare.com/turnstile/v0/siteverify` with a secret. Free.
- **Rate limit:** in `subscribe.ts`, before the put: `const ip = request.headers.get("cf-connecting-ip") ?? "unknown"; const rl = \`rl:${ip}\`; if (await env.WAITLIST.get(rl)) return Response.json({ ok: false, error: "Too many attempts, try again in a minute." }, { status: 429 }); await env.WAITLIST.put(rl, "1", { expirationTtl: 60 });`
- **Double opt-in:** skip it. Your promise is one email at launch.

---

## Phase 9 — Launch day

```bash
curl -H "Authorization: Bearer $EXPORT_TOKEN" https://your-domain.com/api/export > waitlist.csv
```

Import `waitlist.csv` into Resend / Loops / Buttondown (all have free tiers), send your "early access is open" email, and delete this entire waitlist subsystem from your mental load.

---

## Troubleshooting cheat-sheet

| Symptom | Cause → fix |
|---|---|
| `env.WAITLIST is undefined` in prod | Binding missing in dashboard → add `WAITLIST` KV binding for that environment (prod **and** preview) |
| 404 on `/api/subscribe` locally | `functions/` not at project root, or you ran `pages dev` from the wrong directory |
| Works locally, 401/500 in prod | Secret not set for that environment → re-add `EXPORT_TOKEN` in dashboard |
| Cloudflare Git build fails on install | Lockfile not committed, or `BUN_VERSION` unset |
| CORS error in browser console | You're still posting to an old `workers.dev` URL → set `ENDPOINT = "/api/subscribe"` |
| `bunx wrangler` behaves strangely | Run wrangler under Node: `npx wrangler ...` |
| Form "succeeds" but nothing stored | Honeypot got autofilled by a password manager → ensure it's `tabIndex={-1}`, `autoComplete="off"`, visually hidden |

That's the whole system: static site + two Functions + one KV namespace + one secret, all on the free tier, all yours. Tick the phases off in order and ping me if any step misbehaves — I'll debug it with you.