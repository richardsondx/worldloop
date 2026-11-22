import { NextRequest, NextResponse } from "next/server";
import { Magic } from "@magic-sdk/admin";
import { ADMIN_EMAIL, createSessionToken, sessionCookie } from "../../../../lib/auth";

// POST { didToken, next } -> checks the Magic DID token, sets the session
// cookie, and returns { ok: true, next }. Magic sends the email itself;
// this route only proves the token came from Magic for the admin address.
export async function POST(req: NextRequest) {
  let didToken = "";
  let next = "/upload";
  try {
    const body = (await req.json()) as { didToken?: unknown; next?: unknown };
    didToken = typeof body.didToken === "string" ? body.didToken : "";
    if (typeof body.next === "string" && body.next.startsWith("/") && !body.next.startsWith("//")) {
      next = body.next;
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  if (!didToken) {
    return NextResponse.json({ ok: false, error: "Missing token." }, { status: 400 });
  }

  const secret = process.env.MAGIC_LINK_SECRET_KEY;
  if (!secret) {
    console.error("MAGIC_LINK_SECRET_KEY is not set, cannot verify DID token");
    return NextResponse.json({ ok: false, error: "Sign-in is not set up yet." }, { status: 500 });
  }

  let email: string;
  try {
    const magic = new Magic(secret);
    const metadata = await magic.users.getMetadataByToken(didToken);
    email = (metadata.email ?? "").toLowerCase();
  } catch (e) {
    console.error("DID token verification failed", e);
    return NextResponse.json({ ok: false, error: "link" }, { status: 401 });
  }
  if (email !== ADMIN_EMAIL) {
    return NextResponse.json({ ok: false, error: "link" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, next });
  res.headers.set("Set-Cookie", sessionCookie(await createSessionToken(email)));
  return res;
}
