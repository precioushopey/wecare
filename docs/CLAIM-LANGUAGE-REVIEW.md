# WeCare — Claim-Language Review Queue

**Date:** 2026-09-04 (updated 2026-09-25: see §F and §G, questions 7–11, and a corrected mitigating point) · **For:** Austrian/EU counsel (medicine & product advertising — §50a / §51 AMG, UWG, LMSVG where relevant).

## Purpose

The UX Master Brief (§32) and CLAUDE.md decision-set-4 #14 name an **Austrian medicine/cannabis advertising review as a hard launch blocker**. Engineering has deliberately **not** rewritten this copy — advertising-law judgment on specific phrasing is counsel's call. This document is the inventory: every user-facing string that (a) implies a health effect, (b) makes a comparative product claim, or (c) pairs a product with a condition and/or a strength axis. **Nothing here is asserted to be non-compliant** — it is the list to rule on.

## Context that already mitigates

Present site-wide, so counsel can weigh the copy below against it:

- Every recommendation carries "**a recommendation, not a guarantee of treatment**" and "**issued only if a doctor decides it is medically appropriate**" (`home:faq.items.prescription.a`, `faq:categories.review.items.*`).
- `recommendation.ts` sets `requiresMedicalReview = true` for **every** result — the funnel always routes through medical review.
- The sentence "**not intended to diagnose, treat, cure or prevent any disease**" is shown on the **first assessment screen** and must be ticked before the questionnaire starts (`assessment:legalGate.notes.noDiagnosis`, CL-47). **Correction 2026-09-25:** this document used to say it was a separate checkout checkbox (`shop:checkout.disclaimerLabel`). That checkbox was removed on 2026-09-24 at the owner's request ("on page 1 he confirms already about it") and the sentence was added to page 1 on 2026-09-25 to make that true. It no longer appears at checkout.
- Condition pages carry `<MedicalNotice>` ("side effects… not a substitute for standard therapy… not individual medical advice").
- Assessment framing: "helps **understand** / **place** how this affects you" — not "assess your condition".
- No "treats", "cures", "guaranteed", "relief guaranteed", "Rezept in Minuten" anywhere (verified).

## Risk categories

| Code | Meaning |
|---|---|
| **E** | Effect / benefit implication — ties a product or solution to easing a condition |
| **C** | Comparative product claim — "stronger", "deeper", "advanced", "gentle" applied to a solution |
| **R** | Suitability framing — "for [condition]", "recommended for", a product named as being *for* a symptom |
| **S** | Condition framing in a headline / list — describes the visitor's problem on a page that then recommends a medicine |
| **P** | Promotional / cross-sell wording near a prescription product ("you might also like…") — added 2026-09-25 |
| **O** | Operational promise — delivery timing, notifications, "confirmed" (consumer-law / misleading-statement risk, not §50a) — added 2026-09-25 |

---

## A. Solution pages — product + condition + strength (highest concentration)

`src/i18n/locales/{en,de}/shop.json`

| ID | Key | Phrase (EN) | Risk |
|---|---|---|---|
| CL-01 | `solutions.night-now.category` | "Sleep Support" | R |
| CL-02 | `solutions.calm-night.category` | "Advanced Sleep Support" | R, C |
| CL-03 | `solutions.deep-ease.category` | "Body Comfort Support" | R |
| CL-04 | `solutions.synergy-forte.category` | "Daily Balance Support" | R |
| CL-05 | `solutions.synergy-ultra.category` | "Advanced Balance Support" | R, C |
| CL-06 | `solutions.night-now.blurb` | "A night-focused solution for users looking to support their evening routine." | E, R |
| CL-07 | `solutions.calm-night.blurb` | "A stronger night-time option for users looking for deeper evening support." | E, R, C |
| CL-08 | `solutions.deep-ease.blurb` | "A body-focused solution for users looking for daily comfort support." | E, R |
| CL-09 | `solutions.synergy-forte.blurb` | "A balanced solution for users looking for daily calm, balance and routine support." | E, R |
| CL-10 | `solutions.synergy-ultra.blurb` | "A stronger balanced solution for users looking for advanced daily support." | E, R, C |
| CL-11 | `solutions.calm-night.why` | "For stronger or frequent sleep problems when a light solution isn't enough. A calming, body-focused profile." | E, R, C |
| CL-12 | `solutions.deep-ease.why` | "For chronic pain, muscle and joint discomfort through the day. A balanced daytime profile." | E, R |
| CL-13 | `solutions.synergy-ultra.why` | "For stronger tension, anxiety or pain, and for experienced users. A higher THC range." | E, R, C |
| CL-14 | `solutions.synergy-forte.suitability` | "As a first step for stress and migraine concerns. After medical review." | R |
| CL-15 | `solutions.synergy-ultra.suitability` | "For stronger symptoms or when a lighter solution isn't enough. After medical review." | R, C |

## B. Homepage support cards — product named *for* a symptom

`src/i18n/locales/{en,de}/home.json` → `solutionsPreview.cards.*`

| ID | Key | Phrase (EN) | Risk |
|---|---|---|---|
| CL-16 | `solutionsPreview.cards.sleep.title` / `.description` | "Sleep Support" — "For winding down and more restful nights." | R, E |
| CL-17 | `solutionsPreview.cards.pain.title` / `.description` | "Body Comfort Support" — "For managing persistent physical discomfort." | R, E |
| CL-18 | `solutionsPreview.cards.stressAnxiety.description` | "For restlessness, tension and everyday stress." | R |
| CL-19 | `solutionsPreview.cards.migraine.title` / `.description` | "Head Tension Support" — "For recurring migraine and tension headaches." | R |
| CL-20 | `hero.subtitle` | "…get matched with a suitable **CBD-based solution** for your needs." | E (mild — "suitable", "for your needs") |

## C. Assessment result — recommended product tied to an effect

`src/i18n/locales/{en,de}/assessment.json`

| ID | Key | Phrase (EN) | Risk |
|---|---|---|---|
| CL-21 | `result.explanations.sleep` | "…we start with an evening support solution that tends to be **calming**. A **stronger** option is available if you need to step up." | E, C |
| CL-22 | `result.explanations.pain` | "…a body comfort solution for daily support. A **stronger** option is available as an advanced step." | E, C |
| CL-23 | `result.explanations.stressAnxiety` | "…a daily balance solution for a **calmer routine**. A **stronger** option is available if you need to step up." | E, C |
| CL-24 | `result.gentleNudge` | "We start **gentle** with a **lower-THC** solution, usually an oil for **controlled dosing**. You can adjust it later with your doctor." | E, C (dosing statement) |
| CL-25 | `result.advancedHeading` | "Advanced option" | C |
| CL-26 | `questions.q6.hints.oil` | "Drops taken by mouth, the usual **gentle** starting format" | C (mild) |

## D. Condition-page framing — headlines & symptom lists on pages that recommend a medicine

`src/i18n/locales/{en,de}/conditions.json`

| ID | Key | Phrase (EN) | Risk |
|---|---|---|---|
| CL-27 | `sleep.hero.title` | "Struggling to fall asleep or stay asleep?" | S |
| CL-28 | `pain.hero.title` | "Living with daily pain or body discomfort?" | S |
| CL-29 | `stressAnxiety.hero.title` | "Feeling stressed, tense or unable to relax?" | S |
| CL-30 | `migraine.hero.title` | "Recurring head tension or migraine-related discomfort?" | S |
| CL-31 | `sleep.hero.subtitle` | "…discover a **suitable evening support solution**." | R |
| CL-32 | `pain.hero.subtitle` | "…get matched with a **suitable body comfort solution**." | R |
| CL-33 | `stressAnxiety.hero.subtitle` | "…find a **suitable daily balance solution**." | R |
| CL-34 | `*.situations.*` (24 bullets across the 4 pages) | e.g. "Difficulty falling asleep", "Muscle tension", "Migraine-related discomfort", "Light sensitivity" | S — symptom lists; describe the visitor, not the product |
| CL-35 | `*.helpSteps.*` | "We match you with a **suitable** solution" / "We recommend a **suitable balance solution**" | R (mild — "suitable", "match") |

## E. Nav / category labels (structural, repeated everywhere)

| ID | Source | Phrase | Risk |
|---|---|---|---|
| CL-36 | `common:nav.pain` | "Pain & Body Comfort" | S |
| CL-37 | `common:nav.stressAnxiety` | "Stress & Anxiety" | S |
| CL-38 | `common:nav.migraine` | "Migraine" / "Migraine / Head Tension" | S |
| CL-39 | `assessment:questions.q1.title` | "What do you need help with today?" + options "Pain / Body Discomfort", "Stress & Anxiety", "Migraine / Head Tension" | S |

## F. Added 2026-09-25 — alternative option and order pages

`src/i18n/locales/{en,de}/assessment.json` and `shop.json`

| ID | Key | Phrase (EN) | Risk |
|---|---|---|---|
| CL-40 | `assessment:result.altHeading` | "You might also like this alternative option" (was the neutral "Alternative option") | P, C |
| CL-41 | `assessment:result.altStrongerHint` | "Usually a stronger option, for later." (shown under that card; existed before, not previously listed) | C |
| CL-42 | `shop:solution.addToCart` on the alternative card | "Add to cart" (was "Choose {name}"): a one-tap add of the second, usually stronger, Solution before any medical review | P (a process question, see Q7) |
| CL-43 | `shop:confirmation.heading` / `.body` | "Thank you for your order" / "Your order is confirmed. Here is a summary for your records." (the doctor-review step was removed from this page) | O |
| CL-44 | `shop:confirmation.shipping` | "Orders placed before 12:00 ship the same day. Orders placed after 12:00 ship the next day." (not in the Shipping policy text; earlier removed by the 2026-09-04 product-owner ruling) | O |
| CL-45 | `shop:confirmation.emailNote` | "We'll email you as soon as your DHL package is on its way." (the prototype sends no email) | O |

## G. Added 2026-09-25 — consent and disclosure copy on the first assessment screen

`assessment:legalGate.*`, shown once per device before the questionnaire. These are **not advertising claims**; they are consent and disclosure statements the owner asked for (modelled on a competitor's "Important!" page), listed so counsel reviews them too. German equivalents exist for each. Deliberately **not** copied: the § 630a BGB remote-treatment intro, the GoÄ billing note, the invoice/doctor's-letter note and "punishable by law".

| ID | Key | Phrase (EN) | Nature |
|---|---|---|---|
| CL-46 | `legalGate.notes.truthful` | "I will answer all questions truthfully, to the best of my knowledge. I understand that incorrect information can be harmful to my health, and that my answers are for my personal use only." | disclosure |
| CL-47 | `legalGate.notes.noDiagnosis` | "This questionnaire is not a medical diagnosis, and WeCare's service is not intended to diagnose, treat, cure or prevent any disease." | disclosure (**moved here from a checkout checkbox**) |
| CL-48 | `legalGate.notes.doctorDecides` | "A licensed doctor reviews every request and decides whether a prescription is medically appropriate and, if so, what is prescribed. A prescription is never guaranteed, and I have no claim to a particular product." | disclosure |
| CL-49 | `legalGate.notes.dataSharing` | "I understand that, if I go ahead, WeCare passes the information needed for the medical review to the responsible doctor and, if a prescription is issued, the information needed to dispense and deliver to the pharmacy." | health-data sharing (Art. 9) |
| CL-50 | `legalGate.checkbox` | "I have read all the notes and agree to the Terms of Service and Privacy Policy (currently in draft; final versions will be confirmed before launch)." | consent |

---

## Questions for counsel

1. **Category names as claims** (CL-01…CL-05, CL-16…CL-19): does "*[Condition] Support*" as a product-line name constitute product advertising for a condition under §50a/§51 AMG, given the product is a prescription medicine? If so, is a rename to non-condition names required, or is the standing medical-review + disclaimer context sufficient?
2. **Strength axis** (CL-02, CL-05, CL-07, CL-10, CL-11, CL-13, CL-15, CL-21…CL-25): "stronger" / "advanced" / "gentle" / "deeper" — comparative claims about prescription-medicine options shown before a prescription exists. Acceptable framing, or must these be neutralised (e.g. "another option", factual THC range only)?
3. **`result.gentleNudge`** (CL-24): it states a dosing rationale ("lower-THC… controlled dosing"). Is that permissible pre-prescription patient information, or a dosing recommendation that must come from the reviewing doctor only?
4. **Condition headlines** (CL-27…CL-30): problem-framing questions on a page whose CTA leads to a medicine recommendation. Standard health-marketing, or do they need softening?
5. **`hero.subtitle`** (CL-20): the homepage names "CBD-based solution" in the hero. Confirm this early transparency (required by prior user feedback) does not itself constitute prohibited advertising.
6. **DE parity:** every ID above has a German equivalent in `de/*.json` — the same ruling applies to both; German phrasing may carry different weight (e.g. "Unterstützung", "stärkere Option", "sanft").
7. **Cross-sell framing and one-tap add** (CL-40…CL-42): the recommendation page now says "You might also like this alternative option" beside a stronger prescription product, with an "Add to cart" that adds it to the request before any medical review. Is promotional wording acceptable there, or must it stay neutral ("Alternative option", the wording ruled earlier)? Is adding a second, stronger product to the request before the doctor's decision acceptable? (A similar cross-sell pop-up was removed on 2026-09-24 for that reason.)
8. **"Order confirmed" wording** (CL-43, CL-45): the confirmation page says "Thank you for your order / Your order is confirmed" and no longer mentions the doctor. Does that imply a prescription has been issued? What must a confirmation say for a prescription product, and at what point may it say "confirmed"?
9. **Shipping cut-off** (CL-44): "Orders placed before 12:00 ship the same day". The Shipping policy text is deliberately neutral (`[LEGAL REVIEW REQUIRED]`). Which text governs, and what must operations be able to guarantee before either says this?
10. **The consent screen** (CL-46…CL-50): one checkbox covers the notes, the Terms and the Privacy Policy, including the health-data hand-off (CL-49). Is a single shared checkbox acceptable, or does the health-data note need its own explicit Art. 9 consent? Is showing the "not intended to diagnose, treat, cure or prevent" disclaimer on the first screen (instead of at checkout) sufficient?
11. **Cancellation:** My Orders lets a customer cancel an order before dispatch (no claim is made; the copy says nothing about refunds). How does this relate to the statutory withdrawal right and `legal:docs.refund`, what must the cancellation confirmation say, and how must a payment already taken be handled?

## After the ruling

Wherever counsel requires a change, it's an i18n-only edit (both locales) plus, for the category names, updates to `docs/` references. No logic change — `recommendation.ts` keys off `tier` (`lighter`/`stronger`) internally regardless of the visible labels.
