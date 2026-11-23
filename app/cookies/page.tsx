import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie preferences — WorldLoop",
  description:
    "Cookie preferences for the WorldLoop site: one admin session cookie, no tracking cookies.",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <p className="text-sm">
        <a href="/" className="text-[#1d4ed8] hover:underline">
          ← WorldLoop
        </a>
      </p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
        Cookie preferences
      </h1>
      <p className="mt-3 text-lg leading-8 text-[#5b5f66]">
        Last updated Nov 23, 2026.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">
        The one cookie
      </h2>
      <p className="mt-4 leading-7 text-[#5b5f66]">
        This site sets one cookie: the admin session cookie, and only when
        Richardson signs in to the admin area. It lasts 30 days and keeps him
        signed in. Visitors never get it.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">
        Nothing to turn off
      </h2>
      <p className="mt-4 leading-7 text-[#5b5f66]">
        This site sets no tracking cookies, no advertising cookies, and no
        analytics cookies. So there is nothing to turn off here. Your browser
        can clear the admin session cookie any time; that just signs
        Richardson out.
      </p>
      <p className="mt-4 leading-7 text-[#5b5f66]">
        The pilot request form is hosted by Tally. Tally does not use cookie
        tracking.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">Contact</h2>
      <p className="mt-4 leading-7 text-[#5b5f66]">
        Questions about cookies: email{" "}
        <a
          href="mailto:richardsondx@gmail.com"
          className="text-[#1d4ed8] hover:underline"
        >
          richardsondx@gmail.com
        </a>
        .
      </p>
    </main>
  );
}
