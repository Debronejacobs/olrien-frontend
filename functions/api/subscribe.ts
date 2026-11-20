/// <reference types="@cloudflare/workers-types" />
import type { KVNamespace } from "@cloudflare/workers-types";

type Env = { WAITLIST: KVNamespace };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
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
