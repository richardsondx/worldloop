import { NextRequest, NextResponse } from "next/server";
import { ADMIN_EMAIL } from "../../../../lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST { email } -> { ok: true, allowed: boolean }.
// The login form asks this first so Magic never sends a link to a
// non-admin address. The reply says nothing beyond allowed or not.
export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = (await req.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Send an email address." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "That email address does not look right." }, { status: 400 });
  }
  return NextResponse.json({ ok: true, allowed: email === ADMIN_EMAIL });
}
