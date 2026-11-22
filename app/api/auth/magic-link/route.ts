import { NextRequest, NextResponse } from "next/server";
import { ADMIN_EMAIL, createMagicToken } from "../../../../lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST { email } -> always { ok: true }.
// A link is only ever sent to the one allowed address, and nothing in the
// reply says whether the address was allowed or not.
export async function POST(req: NextRequest) {
  let email = "";
  let next = "/upload";
  try {
    const body = (await req.json()) as { email?: unknown; next?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (typeof body.next === "string" && body.next.startsWith("/") && !body.next.startsWith("//")) {
      next = body.next;
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Send an email address." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "That email address does not look right." }, { status: 400 });
  }

  if (email !== ADMIN_EMAIL) {
    return NextResponse.json({ ok: true });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set, cannot send magic link");
    return NextResponse.json({ ok: false, error: "Email is not set up yet." }, { status: 500 });
  }

  const token = await createMagicToken(email);
  const origin = req.headers.get("origin") ?? `https://${req.headers.get("host")}`;
  const link = `${origin}/api/auth/callback?token=${encodeURIComponent(token)}&next=${encodeURIComponent(next)}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "WorldLoop <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: "Your WorldLoop sign-in link",
      html: `<p>Here is your sign-in link for the WorldLoop admin area. It works once and stops working in 15 minutes.</p><p><a href="${link}">Sign in to WorldLoop</a></p><p>If you did not ask for this, ignore this email.</p>`,
      text: `Here is your sign-in link for the WorldLoop admin area. It works once and stops working in 15 minutes.\n\n${link}\n\nIf you did not ask for this, ignore this email.`,
    }),
  });
  if (!res.ok) {
    console.error("Resend send failed", res.status, await res.text());
    return NextResponse.json({ ok: false, error: "The email did not send. Try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
