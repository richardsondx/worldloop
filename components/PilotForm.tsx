"use client";

import Script from "next/script";

// Pilot request form, collected by Tally. Every submission is emailed to
// richardsondx@gmail.com. Form: https://tally.so/r/KpVk1M
export default function PilotForm() {
  return (
    <div>
      <p className="text-base leading-7">
        Your request goes straight to WorldLoop, and we reply by email.
        Prefer email? Write to{" "}
        <a
          href="mailto:richardsondx@gmail.com"
          className="font-medium text-[#1d4ed8] hover:underline"
        >
          richardsondx@gmail.com
        </a>
        .
      </p>
      <iframe
        src="https://tally.so/embed/KpVk1M?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
        data-tally-src="https://tally.so/embed/KpVk1M?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
        loading="lazy"
        width="100%"
        height="858"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title="WorldLoop pilot request"
        className="mt-4"
      />
      <Script
        src="https://tally.so/widgets/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          const w = window as unknown as {
            Tally?: { loadEmbeds: () => void };
          };
          if (w.Tally) w.Tally.loadEmbeds();
        }}
      />
    </div>
  );
}
