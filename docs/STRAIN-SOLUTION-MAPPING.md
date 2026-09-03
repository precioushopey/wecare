# Strain → Solution mapping audit

> **PROVISIONAL DATA — NOT FOR PRODUCTION USE**
>
> These strain-to-Solution mappings were built from incomplete / placeholder
> product data (THC, CBD, genetics, origin, price, COA are all invented). Every
> mapping must be revalidated against pharmacy-supplied data, real COAs and
> **medical-partner approval** before production use. When D10 / D11 data lands,
> re-run the whole audit; for each product verify identity, manufacturer,
> format, THC, CBD, batch, COA, price/unit, stock, genetics (where relevant),
> pharmacy, and the medical-partner-approved Solution mapping. **Placeholder
> mappings must never drive production recommendations.**

**Product-owner decision (Sept 2026):** the strains/devices stay a **fulfilment
layer beneath the 5 Solutions** — never a pre-assessment catalogue. Build
**Option B** (a simple "dispensing options" section on the Solution page) for
MVP; keep the data model open for **Option D** (post-approval *preference* among
already-eligible options for returning patients — not unrestricted strain
shopping) as a later phase. **Do not** create new Solutions to house inventory —
only if there is a coherent unmet customer need with **≥ 2–3 appropriate
options** and PO + pharmacy/medical + legal sign-off.

Hierarchy that must hold (revised model):

```
Problem → Assessment → WeCare Solution → Medical approval
  → Eligible fulfilment formats (flower · device · oil later)
    → Eligible dispensing options → Pharmacy
```

A Solution is **not** "a set of flower strains" — it groups options by
**format**. The data now reflects this: `ProductFormat = "flower" | "device"`,
and the Solution page renders flower options and an "alternative dispensing
format" block separately.

> The customer chooses their problem. WeCare recommends the Solution. The
> underlying product is a professionally validated fulfilment option — not the
> starting point of the customer journey.

## Decisions applied this pass

- **ZOIKS Tangrini** removed from **Night Now** `strainIds` (pending medical
  validation — not on a sativa=daytime rule, but because no validated profile
  data supports it there). Left in Synergy Forte, also pending confirmation.
- **TANNENBUSCH Tubitti Frubitti** removed from **Synergy Forte** `strainIds` —
  marked UNMAPPED / medical-partner review required (31 % is above the stated
  22–28 % band; not moved elsewhere on THC alone, no new Solution for one
  strain).
- **Curaleaf inhaler** re-modelled as `format: "device"` (per-unit, €59, no gram
  selector). Still listed under Night Now / Synergy Forte but rendered as an
  **"Alternative dispensing format"** block with a "subject to medical-partner
  confirmation" note — not as a flower strain.
- **Invented "Gentle / Standard / Stronger" strength label removed.** The
  option now shows format + factual THC %, plus a neutral comparison
  ("Lower / Higher THC among this Solution's options") *only where it's
  factually the min / max*, and a plain "what THC % means, a higher number
  isn't 'better'" note in the details. A cleared plain-language descriptor
  needs the medical partner to define it.
- **COA card** (separate Solution-level section): behind `COA_CONFIRMED = false`
  it now shows a plain "you'll get a real batch certificate" line — no
  fabricated cannabinoid grid, batch number, test date or "Lab tested" badge
  (executing D11).

## Owner decisions — PO decision set 3 (Sept 2026)

1. **DECIDED — Solutions are defined by approved profile fit, not a THC
   bracket.** `thcRange` (shown to the user as "Typical THC range",
   `shop:solution.thcRangeLabel`) is **descriptive metadata only** — the real
   rule is "has the medical/pharmacy partner approved this dispensing option
   as fitting this Solution's profile?". Correct hierarchy: **approved profile
   fit → format → product characteristics → THC/CBD data** — never "THC % →
   automatically assign or reject a Solution". This is why Tubitti Frubitti
   stays UNMAPPED for lack of an actual partner decision, not because 31 %
   "doesn't fit the box" (see the `thcRange` doc comment and the
   `synergy-forte` `strainIds` comment in `src/data/solutions.ts`). The old
   "revisit once real mappings exist" framing is superseded — this is the
   standing rule now, not a future review.
2. ~~The Solution's hero must not be a specific strain.~~ **Done.** `solutionImage()`
   (which derived from `heroStrainId`, i.e. a bud photo of one strain — e.g.
   Synergy Ultra = a 33 % sativa) is removed. Every Solution surface (product
   page hero, result-page cards, shop grid, cart, dashboard) now renders
   `<SolutionMark>` (`src/components/brand/SolutionMark.tsx`) — the Solution's
   primary problem icon in a soft medallion, no strain photo, no new asset
   needed. Real strain photos still appear, post-assessment, per dispensing
   option in the Solution page's accordion. `heroStrainId` now only feeds the
   example COA (`solutionExampleCoa`).
3. **DECIDED — full `Solution → Format → DispensingOption` entity model is the
   permanent target, architect-now / populate-later.** The current
   `flower | device` split is a deliberate simplification, not the permanent
   shape — the Curaleaf device already proves more formats are coming. Target
   `DispensingOption` shape: product id, commercial name, manufacturer,
   pharmacy id, format, unit type, THC %, CBD %, pack/unit size, price,
   availability, batch, COA, medical mapping, active/inactive status. **Do
   not** build a complex inventory UI before real pharmacy data (D10/D11)
   lands — the launch UI stays the current simple accordion. Design the types
   now so the later migration isn't a rewrite; populate/wire once real data
   exists. A `src/data/dispensing.ts` type sketch (`FulfillmentFormat`,
   `DispensingOption`) was written and then **removed in the 2026-09-02 repo
   cleanup** — it was never wired into any component, and this section's field
   list (plus `mappingStatus` ∈ `pending_medical_validation | approved |
   rejected`, per Solution, and `active`) is the spec to re-create it from.
   The app runs on the simpler `Product` / `ProductFormat` model. Next
   engineering step: re-create the types, map real pharmacy data onto them,
   and wire them into `ProductPage`.
4. **DECIDED — Returning-patient preference flow (Option D) is Phase 2, not
   launch.** Priority **P2 / Early Phase 2**, after legal/compliance, real
   backend, auth/profile, medical-review integration, pharmacy integration,
   core assessment, recommendation page, checkout/order flow, analytics, and
   real-device QA. `Solution.strainIds[]` + `Product` already support it with
   no schema change; add a component + a `wecare.strainPreference` store
   (user-scoped, gated on an `approved` review). **Required wording** (owner
   decision, verbatim): never "Choose your strain" — call it **"Select your
   preferred dispensing option"**, and always pair it with **"Final dispensing
   remains subject to medical approval and pharmacy availability."** Beginners
   are never asked to choose.

---

## The 5 Solutions

| Solution | Problem(s) | Tier | THC range | Tier label to the user |
|---|---|---|---|---|
| Night Now | Sleep | lighter | 20–24 % | Beginner-friendly |
| Calm Night | Sleep | stronger | 27–33 % | Advanced |
| Deep Ease | Pain & Body Comfort | lighter | 24–28 % | Beginner-friendly |
| Synergy Forte | Stress & Anxiety · Migraine | lighter | 22–28 % | Beginner-friendly |
| Synergy Ultra | Stress & Anxiety · Pain | stronger | 30–33 % | Advanced |

`recommendation.ts` PAIR table: sleep → Night Now / Calm Night · pain → Deep
Ease / Synergy Ultra · stress → Synergy Forte / Synergy Ultra · migraine →
Synergy Forte / Deep Ease.

---

## The 19 strains

Data below is from `src/data/products.ts` and is **placeholder** — genetics,
prices, origin and COA values are not yet verified pharmacy data (see D6 / D10 /
D11). "Availability" is not modelled at all. THC/CBD values are the ones
currently in the codebase.

The "Tier fit" column below is the strain's THC against its Solution's range.
A user-facing plain-language *strength* label was tried (Gentle / Standard /
Stronger from THC bands) and **pulled** — the bands weren't clinically grounded
and could contradict the Solution's own tier framing (a "beginner-friendly"
Solution showing a "Stronger profile" option). The product page now shows only
the factual THC %; a cleared plain-language descriptor needs the medical
partner to define it.

| # | Strain (brand · name) | Format | Genetics | THC | CBD | Current Solution(s) | Tier fit | Fit |
|---|---|---|---|---|---|---|---|---|
| 1 | Curaleaf · Medical Grade Inhaler | device | — | 5 % | 5 % | Night Now, Synergy Forte | — | **Poor** |
| 2 | 420 Compound · Platinum Pavé | flower | indica | 27 % | <1 % | Deep Ease | in range (top) | **Clear** |
| 3 | 420 Compound · Berlin Berries | flower | hybrid | 30 % | <1 % | Calm Night | in range | **Clear** |
| 4 | AVAAY · Amnesia Haze Cake | flower | **sativa** | 32 % | <1 % | Synergy Ultra | in range | **Possible** |
| 5 | Demecan · First Class Funk | flower | hybrid | 26 % | <1 % | Deep Ease | in range | **Clear** |
| 6 | Demecan Craft · Walkie Talkie | flower | indica | 27 % | <1 % | Calm Night | in range (floor) | **Clear** |
| 7 | enua · G13 Ultra | flower | indica | 27 % | <1 % | Calm Night | in range (floor) | **Clear** |
| 8 | enua · Best Cap | flower | hybrid | 30 % | <1 % | Synergy Ultra | in range (floor) | **Clear** |
| 9 | enua · Purps Crystal Breath | flower | indica | 33 % | <1 % | Synergy Ultra | in range (top) | **Clear** |
| 10 | Huala · Goldkirsch | flower | indica | 30 % | <1 % | Calm Night | in range | **Clear** |
| 11 | IUVO · Ice Burn | flower | hybrid | 24 % | <1 % | Deep Ease, Synergy Forte | in range (floor) | **Clear** |
| 12 | IUVO OC · Temptation | flower | hybrid | 24 % | <1 % | Synergy Forte | in range | **Clear** |
| 13 | IUVO OC · Neutronium | flower | indica | 28 % | <1 % | Deep Ease | in range (top) | **Clear** |
| 14 | Peace Naturals · Sonic Lemon Fuel | flower | **sativa** | 33 % | <1 % | Synergy Ultra (**hero**) | in range (top) | **Possible** |
| 15 | Siggis · Waldmeister | flower | hybrid | 28 % | <1 % | Synergy Forte | in range (top) | **Clear** |
| 16 | Siggis · Pfefferminze | flower | hybrid | 28 % | <1 % | Synergy Forte | in range (top) | **Clear** |
| 17 | TANNENBUSCH · Tubitti Frubitti | flower | hybrid | **31 %** | <1 % | Synergy Forte | **over range** (22–28 %) | **Poor** |
| 18 | ZOIKS · Tangrini | flower | **sativa** | 22 % | <1 % | Night Now, Synergy Forte | in range both | **Poor** (Night Now) / Clear (Forte) |
| 19 | slouu · Berry Arctic Gelato | flower | indica | 22 % | <1 % | Night Now (**hero**) | in range | **Clear** |

**Tally:** 12 Clear · 3 Possible · 4 Poor. Note some strains carry a
`primaryConditionKey` that differs from the Solution they're mapped into (e.g.
IUVO Ice Burn = migraine, mapped into Deep Ease) — expected, since a Solution
can pull from adjacent profiles.

---

## Flagged mappings — status after the owner decision

1. **Curaleaf inhaler (5 % THC / 5 % CBD).** It also breaks the *buy model*, not
   just the profile — priced **€59 per unit**, while the flower Solutions it
   belongs to are entirely per-gram. **Applied:** re-modelled as
   `format: "device"` (per-unit, no gram selector), shown under Night Now /
   Synergy Forte as an "Alternative dispensing format" block with a "subject to
   medical-partner confirmation" note. **Open:** whether it stays under those
   Solutions at all — pharmacy/medical to confirm.
2. **TANNENBUSCH Tubitti Frubitti (31 %).** Above Synergy Forte's stated
   22–28 % band; no *stronger* migraine Solution to move it to. **Applied:**
   removed from `synergy-forte.strainIds` — UNMAPPED, medical-partner review
   required. Not force-fitted, not moved on THC alone, no new Solution for one
   strain.
3. **ZOIKS Tangrini (sativa, 22 %) in Night Now.** **Applied:** removed from
   `night-now.strainIds` (no validated profile data supports it there — the
   reasoning is *lack of validation*, **not** a "sativa = daytime" rule). Left
   in Synergy Forte pending independent confirmation.
4. **High-THC sativas as the face of Synergy Ultra** (hero = *Sonic Lemon Fuel*,
   sativa 33 %; also *Amnesia Haze Cake*). **Not changed** — see architecture
   flag 2: the Solution's identity should not depend on any one strain. Needs a
   generic-hero design decision + the pharmacy/medical view on which options
   lead.

---

## Coverage per Solution

| Solution | Clean flower fits | Notes |
|---|---|---|
| Night Now | **1** flower (Berry Arctic Gelato) + the device | After removing the sativa: one flower option, plus the Curaleaf device as an alternative format. **Ask sourcing for 1–2 more validated gentle sleep options.** For launch, one validated option is acceptable — the UI can say "1 dispensing option currently available" rather than fake variety. |
| Calm Night | 4 | Solid — all indica/hybrid, 27–30 %. |
| Deep Ease | 4 | Solid — indica/hybrid, 24–28 %. |
| Synergy Forte | 4 flower + device | After removing Tubitti (31 %): Temptation, Ice Burn, Siggis ×2 (Waldmeister, Pfefferminze), + Tangrini pending, + the device. Still **skews head-tension over stress** (only Temptation is stress-primary). Ask the partner to classify each option by suitability for *stress/balance* vs *head tension* — internal metadata, not necessarily shown to the customer; the assessment can then prioritise options after approval. |
| Synergy Ultra | 2 clear (Purps, Best Cap) + 2 sativas (Sonic Lemon Fuel, Amnesia Haze Cake) | Adequate for pain, weak for the anxiety use. Don't lead with a 33 % sativa for a Solution that includes Stress & Anxiety without clinical justification. |

---

## Findings

- The 19 strains **do map onto the 5 Solutions** — no strain is unmappable.
- The 4 poor fits are **individual misfits** (wrong genetics for the use case,
  THC out of the Solution's band, a low-dose device among high-THC flower) —
  **not a coherent cluster of unmet customer need.**
- **Therefore: no new Solution is warranted right now.** The fix is to review
  the 4 flagged mappings with the pharmacy/medical partner, not to add a 6th
  Solution.
- **Sourcing asks:** more validated gentle sleep options for Night Now;
  Synergy Forte options classified for stress vs head-tension.
- **No CBD-dominant strain exists** (all flower < 1 % CBD; the device is 5/5). A
  CBD-dominant Solution is **not supported by current inventory** — need
  customer, ≥ 2–3 real products, profiles, pricing, regulatory treatment and
  medical approval *first*, then decide if it becomes Solution #6.

## What was built for MVP (Option B)

The Solution page's section is renamed **"Available dispensing options"** — a
low-emphasis, collapsed accordion item, grouped by format:

- **Flower options** first. Per option, by default: name, format, the real
  **THC %**, and "Matched to *{Solution}*". Where a flower option is factually
  the **min / max THC** among that Solution's flower options, a neutral line —
  "Lower / Higher THC among this Solution's options" — nothing about "stronger
  effect" or "better for severe symptoms". No invented strength scale.
- An **"Alternative dispensing format"** block for non-flower (`device`)
  options: name, `THC / CBD`, `€X per device` (no gram selector), and a
  "subject to medical-partner confirmation" note.
- Per-option **"View details"** (`<details>`) reveals genetics, CBD, producer,
  origin, a plain "what THC % means — a higher number isn't 'better'" note, and
  "a batch-specific certificate is included with every delivery".
- **No** terpene names, CBG/CBN, cultivation notes, effect descriptions, or
  invented "Available" / "Lab tested" claims.

**COA card** (separate Solution-level section): behind `COA_CONFIRMED = false`
(mirrors `PRICES_CONFIRMED`) it now shows one line — "every delivery comes with
its own batch certificate; real lab values appear here once the pharmacy
supplies them" — no fabricated cannabinoid grid, batch number, test date or
"Lab tested" badge (executing D11). `getProductCoa` / `solutionExampleCoa` stay
in code for when the flag flips.

## Option D readiness (later phase — not built)

The data model already supports a post-approval "choose your option" step with
**no schema change**: `Solution.strainIds[]` is the candidate list, `Product`
holds the per-option data. A future build adds a component + a
`wecare.strainPreference` store (user-scoped, like `wecare.review`), gated on an
`approved` medical review, and only where the pharmacy integration and counsel
allow it. Beginners are never asked to pick; returning/approved patients may.
