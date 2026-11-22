// Magic-link auth for the WorldLoop admin area.
//
// Only one person can sign in: richardsondx@gmail.com. Magic Link sends the
// sign-in email; the server proves the DID token came from Magic for that
// address, then issues the session below. The session is a signed cookie.
// No database, no passwords, no user table.
//
// Tokens are stateless: base64url(payload) + "." + base64url(HMAC-SHA256).
// Payload is { email, exp, purpose } where purpose is "session" (30 days). Everything here uses WebCrypto, so the same code
// runs in Node route handlers and in Edge middleware.

export const ADMIN_EMAIL = "richardsondx@gmail.com";
export const SESSION_COOKIE = "worldloop_session";
export const SESSION_DAYS = 30;

export function base64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function getSecret(): string {
  const s = process.env.MAGIC_LINK_SECRET;
  if (!s) throw new Error("MAGIC_LINK_SECRET is not set");
  return s;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export type TokenPurpose = "session";

export interface TokenPayload {
  email: string;
  exp: number;
  purpose: TokenPurpose;
}

export async function signToken(
  email: string,
  purpose: TokenPurpose,
  lifetimeMs: number
): Promise<string> {
  const payload: TokenPayload = {
    email,
    exp: Date.now() + lifetimeMs,
    purpose,
  };
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const sig = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    payloadBytes
  );
  return base64urlEncode(payloadBytes) + "." + base64urlEncode(new Uint8Array(sig));
}

export async function verifyToken(
  token: string,
  purpose: TokenPurpose
): Promise<TokenPayload | null> {
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return null;
    const payloadBytes = base64urlDecode(payloadB64);
    const sig = base64urlDecode(sigB64);
    const ok = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      sig as BufferSource,
      payloadBytes as BufferSource
    );
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as TokenPayload;
    if (payload.purpose !== purpose) return null;
    if (payload.email.toLowerCase() !== ADMIN_EMAIL) return null;
    if (typeof payload.exp !== "number" || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSessionToken(email: string): Promise<string> {
  return signToken(email, "session", SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export function sessionCookie(token: string): string {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
