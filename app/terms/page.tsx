import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of use — WorldLoop",
  description:
    "Terms of use for the WorldLoop site: what the site is, what the sample pack is, and what the demo does.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <p className="text-sm">
        <a href="/" className="text-[#1d4ed8] hover:underline">
          ← WorldLoop
        </a>
      </p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
        Terms of use
      </h1>
      <p className="mt-3 text-lg leading-8 text-[#5b5f66]">
        Last updated Nov 23, 2026.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">
        What this site is
      </h2>
      <p className="mt-4 leading-7 text-[#5b5f66]">
        This site shows what WorldLoop does: a sample eval pack and a demo of
        the upload workflow. The sample numbers are illustrative. The 100-run
        eval and the failure clips are not built yet, and the pages say so.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">
        The pack files
      </h2>
      <p className="mt-4 leading-7 text-[#5b5f66]">
        The pack files (world.xml, success-test.py, and the rest) are provided
        as they are, so you can check our work by running the judge yourself.
        They are a demo, not a safety certification, and they carry no
        warranty. Run them at your own risk.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">
        The demo
      </h2>
      <p className="mt-4 leading-7 text-[#5b5f66]">
        The demo upload flow is a walkthrough of the workflow. It runs no
        eval, stores nothing on our side, and books nothing. A pilot is agreed
        by email, not through this site.
      </p>

      <h2 className="mt-12 text-2xl font-medium tracking-tight">Contact</h2>
      <p className="mt-4 leading-7 text-[#5b5f66]">
        Questions about these terms: email{" "}
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
