# WorldLoop site

Next.js app, App Router, Tailwind v4. Local build only. Not deployed. No DNS change.

## Run it

```bash
cd ~/workspace/worldloop-site
npm run dev
```

Open http://localhost:3000. Production build:

```bash
npm run build
npm run start
```

## What is in the app

- `app/page.tsx`: the landing page, all sections, all copy.
- `app/layout.tsx`: Host Grotesk and IBM Plex Mono fonts, metadata.
- `app/globals.css`: brand colors, type scale, section labels.
- `components/HeroScene.tsx`: Three.js scene, two carbon robotic hands folding a cloth, with play and pause. Falls back to a still when WebGL is off.
- `components/IsoArt.tsx`: Mercor style isometric SVG illustrations, redrawn in the WorldLoop palette.
- `components/EvalDemo.tsx`: interactive sample eval, labeled Example only.
- `components/PilotForm.tsx`: pilot request form. Demo form only: it saves to localStorage and sends nothing.
- `pricing-decision.md`: why prices are hidden from the landing page, with the conditions that would change the decision.

## Facts used, and their status

- Name: WorldLoop, approved by Richardson Nov 21, 2026. He typed Wordloop in that message. Treat that as a typo for WorldLoop, the name used in all prior work.
- Buyer: a lab or robot company that pays for testers, not a warehouse.
- Corrected scale math: solo year 1 $108,500, small team year 2 $417,000, platform year 3 $1,190,000. Do not use the old $240k, $1.79M, $10M+ figures.
- Sample eval numbers (62 of 100, and the failure counts): Example only, from the Environment Pack Proof Playbook sample.
- Font: Scale uses Aeonik, licensed. Scale's brand guide names Host Grotesk as the approved free fallback, so the site uses Host Grotesk. Source: https://brand.scale.com/typography. The fonts are self-hosted in public/fonts (latin woff2), because next/font/google fails in dev mode in this sandbox.
- Copy: written in a Gemini 4 Neon role proxy, and design planned in an Opus 5.5 role proxy. Live OpenRouter calls to both models were blocked: the key is a management key, $90 monthly budget spent, remaining -$0.107, reset Dec 1, 2026. No live Gemini or Opus call ran for this site.

## Known limits

- The pilot form is a demo. It saves to the browser only. A live form needs a pilot queue endpoint.
- Terms, privacy, and cookie links are placeholders that point to the top of the page.
- LinkedIn and X links point to the platform home pages, not to WorldLoop profiles, because no profiles exist yet.
- No customer logos are shown, because there are no customers yet.
