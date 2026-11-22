// Client-side Magic Link SDK.
//
// The publishable key is public by design. The secret key never leaves the
// server; it lives in MAGIC_LINK_SECRET_KEY and is only used by the Admin
// SDK in the callback route.
import { Magic } from "magic-sdk";

let magic: Magic | null = null;

export function getMagic(): Magic {
  if (!magic) {
    const key = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error("NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY is not set");
    }
    magic = new Magic(key);
  }
  return magic;
}

// Magic redirects the browser here after the user clicks the link in the
// email. This origin is on the Magic dashboard allowlist.
export const MAGIC_REDIRECT_URI =
  "https://worldloop-344.netlify.app/admin/callback";
