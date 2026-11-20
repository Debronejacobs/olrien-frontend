/// <reference types="@cloudflare/workers-types" />
import type { KVNamespace } from "@cloudflare/workers-types";

type Env = { WAITLIST: KVNamespace; EXPORT_TOKEN: string };

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
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
