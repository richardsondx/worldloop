import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "../../../../lib/auth";

// POST /api/auth/logout -> clears the session cookie.
export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin/login", req.url));
  res.headers.set("Set-Cookie", clearSessionCookie());
  return res;
}
