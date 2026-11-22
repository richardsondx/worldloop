"use client";

import { useEffect, useState } from "react";
import { getMagic } from "../../../lib/magic";

const NEXT_KEY = "worldloop_next";

function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/upload";
}

// Runs after Magic redirects back here from the email link. Completes the
// login with the credential in the URL, sends the DID token to the server,
// and the server sets the session cookie.
export default function CallbackClient() {
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function finish() {
      let next = "/upload";
      try {
        next = safeNext(sessionStorage.getItem(NEXT_KEY));
        sessionStorage.removeItem(NEXT_KEY);
      } catch {
        // sessionStorage unavailable; fall back to /upload.
      }
      try {
        const magic = getMagic();
        await magic.auth.loginWithCredential();
        const didToken = await magic.user.getIdToken();
        const res = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ didToken, next }),
        });
        const data = (await res.json()) as { ok?: boolean; next?: string };
        if (!res.ok || !data.ok) throw new Error("callback failed");
        if (!cancelled) window.location.href = safeNext(data.next ?? next);
      } catch {
        if (!cancelled) setError("link");
      }
    }
    finish();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error === "link") {
    return (
      <div>
        <p className="section-label">Admin sign in</p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight">That link did not work</h1>
        <p className="mt-4 leading-7 text-[#5b5f66]">
          The link may have expired or already been used. Ask for a new one.
        </p>
        <a
          href="/admin/login"
          className="mt-8 inline-block rounded-full bg-[#0b0b0c] px-6 py-3 text-base font-medium text-white hover:bg-[#1d4ed8]"
        >
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div>
      <p className="section-label">Admin sign in</p>
      <h1 className="mt-4 text-4xl font-medium tracking-tight">Signing you in…</h1>
      <p className="mt-4 leading-7 text-[#5b5f66]">One moment while we check your link.</p>
    </div>
  );
}
