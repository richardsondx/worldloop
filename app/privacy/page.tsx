import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy — WorldLoop",
  description:
    "Privacy policy for the WorldLoop site: what we collect, which is nothing on this site by itself.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <p className="text-sm">
        <a href="/" className="text-[#1d4ed8] hover:underline">
          ← WorldLoop
        </a>
      </p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
        Privacy policy
      </h1>
      <p className="mt-3 text-lg leading-8 text-[#5b5f66]">
        Last updated Nov 23, 2026.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">
        What we collect
      </h2>
      <p className="mt-4 leading-7 text-[#5b5f66]">
        Nothing, on this site by itself. There is no account, no analytics,
        and no tracking. We do not sell or share any data, because we do not
        collect any.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">
        The pilot form
      </h2>
      <p className="mt-4 leading-7 text-[#5b5f66]">
        The pilot request form sends your answers to us through Tally, our
        form provider. Richardson gets each request by email and replies from
        there. Tally stores your answers on its servers under its own privacy
        policy. To request a real pilot without the form, email{" "}
        <a
          href="mailto:richardsondx@gmail.com"
          className="text-[#1d4ed8] hover:underline"
        >
          richardsondx@gmail.com
        </a>
        .
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">
        The admin sign-in
      </h2>
      <p className="mt-4 leading-7 text-[#5b5f66]">
        The admin sign-in is for Richardson only. It sets one session cookie
        that lasts 30 days and keeps him signed in. It is not used for
        visitors.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">
        Email
      </h2>
      <p className="mt-4 leading-7 text-[#5b5f66]">
        If you email Richardson, he has your email address and whatever you
        wrote. That is the only personal data we hold.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">Contact</h2>
      <p className="mt-4 leading-7 text-[#5b5f66]">
        Questions about this policy: email{" "}
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
