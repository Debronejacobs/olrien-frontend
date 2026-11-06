import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const signupSchema = z.object({
  email: z.email("Please enter a valid email address."),
  role: z.string().max(80).optional(),
  source: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid work email." },
        { status: 400 }
      );
    }

    const { email, role, source } = parsed.data;

    const existing = await db.earlyAccessSignup.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    await db.earlyAccessSignup.create({
      data: { email: email.toLowerCase(), role, source: source ?? "landing-page" },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[early-access] signup failed:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong on our side. Please try again." },
      { status: 500 }
    );
  }
}
