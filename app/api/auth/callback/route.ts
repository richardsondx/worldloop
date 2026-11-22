import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, sessionCookie, verifyToken } from "../../../../lib/auth";

// GET /api/auth/callback?token=... -> checks the magic link, sets the
// session cookie, and sends the user to the admin page they asked for.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const payload = await verifyToken(token, "magic");
  const login = new URL("/admin/login", req.url);
  if (!payload) {
    login.searchParams.set("error", "link");
    return NextResponse.redirect(login);
  }
  const next = req.nextUrl.searchParams.get("next") ?? "/upload";
  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/upload";
  const res = NextResponse.redirect(new URL(dest, req.url));
  res.headers.set("Set-Cookie", sessionCookie(await createSessionToken(payload.email)));
  return res;
}
