# Pricing decision: hide prices from the landing page

Date: 2026-11-21. Decision: prices are NOT shown on the WorldLoop landing page. The page offers a free pilot and a custom quote.

## Why

- The buyer is a lab or robot company, not a shopper. Labs buy a custom pack for one place and one task. No two packs cost the same to build, so a public price would be wrong for most buyers.
- A public price anchors too low. The concept range from prior work is $5,000 to $10,000 per pack, $2,500 per eval, $1,500 per month for the loop. Those are concept prices, not tested prices. Printing them invites comparison with $1 per hour video from Build AI, which is a different product, and with free tools from NVIDIA, which are not a service.
- Scale AI, the vendor labs already trust, shows no public pricing. It sells by custom scope and quote. Mercor shows hourly expert rates because it sells people by the hour. WorldLoop sells a custom place, so it follows Scale AI, not Mercor.
- A solo founder cannot run self-serve checkout for a custom sim pack. A buy button would take money for a pack that needs a scan, a task spec, and a policy run first. The honest flow is a conversation, not a cart.
- The pilot is the price discovery. A free pilot proves the eval finds failures the lab's own sim missed. After the pilot, the paid pack price is set against the value of the failures found, not against a list.

## The experience, by design

- Not self-serve. The landing page is a request, not a store.
- Step 1: the lab requests a free pilot, one task, one place.
- Step 2: WorldLoop builds the pack, runs the lab policy, and sends the eval.
- Step 3: the lab sees the score before any price is named.
- Step 4: a paid pack follows the pilot, then the failure loop as a subscription.
- The pilot form on the live site must post to a pilot queue. The form in this local build saves to the browser only (localStorage) and sends nothing, labeled as a demo.

## What would change this decision

- If three labs in a row ask for a price before they will book a pilot, add a starting price range to the pilot section, labeled as a starting range, not a fixed price.
- If a pack becomes a standard product with a fixed scope, for example one kitchen counter and one task, publish that one fixed price and keep custom packs quoted.
- If the first paid pilot closes below $5,000, the concept range was too high and the range must be re-set from the sale, not from the plan.

## Numbers used in this decision, and their status

- Concept prices $5,000 to $10,000, $2,500, $1,500 per month: concept pricing from prior work, not quoted or tested.
- Paid pilot ask $7,500: the cheap test from the deep dive, not a sale. No lab has paid it yet.
- Scale AI custom quote, no public pricing: sourced, scale.com, checked Nov 21, 2026.
- Mercor expert rates $60 to $180 per hour: sourced, mercor.com, checked Nov 21, 2026.
- Build AI $1 per hour for the open research set: sourced, deep dive section 1, checked Nov 21, 2026.
