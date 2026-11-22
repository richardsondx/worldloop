import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken } from "./lib/auth";

// Only the admin pages need a session. Everything public stays public.
export const config = {
  matcher: ["/upload", "/admin/account"],
};

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken(token, "session") : null;
  if (session) return NextResponse.next();
  const login = new URL("/admin/login", req.url);
  login.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(login);
}
