"use client";

import { useState } from "react";
import { getMagic } from "../../../lib/magic";

const NEXT_KEY = "worldloop_next";

function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/upload";
}

export default function LoginForm({ next, error }: { next: string; error?: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  // Magic sends a 6-digit code for this app, not a link: the relayer
  // delivers a code even for a magic-link call, so the form uses the code
  // flow directly. loginWithEmailOTP shows Magic's own modal to collect
  // the code, then resolves with the DID token. That token is what creates
  // the session: it goes to /api/auth/callback, the server verifies it
  // with Magic, sets the 30-day session cookie, and we redirect to next.
  // Awaiting the call is the whole fix: the old form fired the login and
  // ignored the resolved token, so a correct code created no session.
  async function requestCode(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (busy) return;
    setMessage("");
    setBusy(true);

    // First ask the server whether this address may sign in. Magic never
    // gets called for a non-admin address, so no code goes out to anyone
    // else. The reply is the same either way, so nothing leaks.
    let allowed = false;
    try {
      const res = await fetch("/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok?: boolean; allowed?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMessage(data.error ?? "Something went wrong. Try again.");
        setBusy(false);
        return;
      }
      allowed = data.allowed === true;
    } catch {
      setMessage("Something went wrong. Try again.");
      setBusy(false);
      return;
    }

    if (!allowed) {
      // Same reply as for the admin address. No code is sent.
      setSent(true);
      setBusy(false);
      return;
    }

    try {
      sessionStorage.setItem(NEXT_KEY, next);
    } catch {
      // sessionStorage unavailable; the callback falls back to /upload.
    }
    try {
      const magic = getMagic();
      setSent(true);
      const didToken = await magic.auth.loginWithEmailOTP({ email });
      if (!didToken) throw new Error("no token");
      const res = await fetch("/api/auth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ didToken, next }),
      });
      const data = (await res.json()) as { ok?: boolean; next?: string };
      if (!res.ok || !data.ok) throw new Error("callback failed");
      window.location.href = safeNext(data.next ?? next);
    } catch {
      // The code was wrong, expired, or the modal was closed. The user can
      // ask for a new code; busy is false again, so a new request works.
      setMessage("That code did not work, or it expired. Ask for a new code.");
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-8 rounded-3xl bg-[#f0fdf4] p-6">
        <p className="text-lg font-medium">Check your email.</p>
        <p className="mt-2 leading-7 text-[#5b5f66]">
          If that address can sign in, a 6-digit code is on its way to {email}.
          It stops working in 20 minutes.
        </p>
        {message && <p className="mt-3 text-sm text-[#991b1b]">{message}</p>}
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() => requestCode()}
            disabled={busy}
            className="w-full rounded-full bg-[#0b0b0c] px-6 py-3 text-base font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send a new code"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (busy) return;
              setSent(false);
              setMessage("");
            }}
            disabled={busy}
            className="w-full rounded-full border border-[#e5e7eb] px-6 py-3 text-base font-medium hover:border-[#1d4ed8] disabled:opacity-60"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={requestCode} className="mt-8 space-y-4">
      {error === "link" && (
        <p className="rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">
          That link did not work. It may have expired or already been used. Ask for a new one.
        </p>
      )}
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-2 w-full rounded-2xl border border-[#e5e7eb] px-4 py-3 text-base outline-none focus:border-[#1d4ed8]"
        />
      </label>
      {message && <p className="text-sm text-[#991b1b]">{message}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-[#0b0b0c] px-6 py-3 text-base font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-60"
      >
        {busy ? "Sending…" : "Email me a sign-in code"}
      </button>
    </form>
  );
}
