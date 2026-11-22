"use client";

import { useState } from "react";

export default function LoginForm({ next, error }: { next: string; error?: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, next }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "Something went wrong. Try again.");
      return;
    }
    setSent(true);
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
        className="w-full rounded-full bg-[#0b0b0c] px-6 py-3 text-base font-medium text-white hover:bg-[#1d4ed8]"
      >
        Email me a sign-in link
      </button>
    </form>
  );
}
