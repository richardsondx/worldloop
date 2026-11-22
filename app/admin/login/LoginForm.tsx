"use client";

import { useState } from "react";
import { MAGIC_REDIRECT_URI, getMagic } from "../../../lib/magic";

const NEXT_KEY = "worldloop_next";

export default function LoginForm({ next, error }: { next: string; error?: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setMessage("");
    setSending(true);

    // First ask the server whether this address may sign in. Magic never
    // gets called for a non-admin address, so no link goes out to anyone
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
        setSending(false);
        return;
      }
      allowed = data.allowed === true;
    } catch {
      setMessage("Something went wrong. Try again.");
      setSending(false);
      return;
    }

    if (!allowed) {
      // Same reply as for the admin address. No link is sent.
      setSent(true);
      setSending(false);
      return;
    }

    // Magic sends the email. The link brings the browser back to
    // /admin/callback, which finishes the sign-in.
    try {
      sessionStorage.setItem(NEXT_KEY, next);
    } catch {
      // sessionStorage unavailable; the callback page falls back to /upload.
    }
    try {
      const magic = getMagic();
      // With a redirect URI this call does not resolve in this tab; the
      // sign-in completes on the callback page. Show the sent state now.
      magic.auth.loginWithMagicLink({ email, redirectURI: MAGIC_REDIRECT_URI }).catch(() => {
        setMessage("The sign-in link did not send. Try again.");
        setSending(false);
      });
      setSent(true);
      setSending(false);
    } catch {
      setMessage("Sign-in is not set up yet. Try again later.");
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-8 rounded-3xl bg-[#f0fdf4] p-6">
        <p className="text-lg font-medium">Check your email.</p>
        <p className="mt-2 leading-7 text-[#5b5f66]">
          If that address can sign in, a link is on its way to {email}. It
          stops working in 15 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
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
        disabled={sending}
        className="w-full rounded-full bg-[#0b0b0c] px-6 py-3 text-base font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-60"
      >
        {sending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
