# Competitor teardown — quick-green.com

**Captured:** 2026-09-03, via a live end-to-end browser walkthrough (marketing site → full onboarding
funnel → strain marketplace → checkout). The walkthrough was stopped at the checkout's phone
verification / personal-details / payment step — no account was created, no OTP verified, no data
submitted beyond a placeholder free-text answer and neutral multiple-choice selections needed to
advance.

**Why this doc exists:** `docs/BUSINESS-FLOW.md` already benchmarks quick-green.com as the closest
DE-market reference for the assessment → doctor → pharmacy → delivery model. This is the detailed
version — every funnel step, the marketplace, the checkout, and a side-by-side with WeCare's
deliberate choices.

**Provider note:** quick-green.com is a German (not Austrian) medical-cannabis telehealth platform.
Its legal framing (GoÄ billing, § 630a BGB, § 4 Nr. 14a UStG, the April 2024 BtMG change, the
100 g / 30-day limit) is German law. WeCare is Austria-market, so the specifics differ — the
structure and UX are the transferable part.

---

## 1. Positioning & content

The entire site sells **one message: speed**. Hero, section titles, and ~8 repeated CTAs all say
variations of "Medizinal Cannabis in Minuten geliefert" / "Lieferung in 60–90 Min." / "Rezept
digital". The mandatory doctor step is present but framed as a fast checkpoint, never the headline.

- **Primary nav — 4 items only:** *So funktioniert's · Vorteile · Häufige Fragen · Chatte mit uns!*
  plus a green **BEHANDLUNG ANFRAGEN** button. No shop / products / strains in nav (same as WeCare).
- **Prices on the homepage**, directly under the hero CTA:
  *"Behandlung: ab 14,99€, Medikamente ab 4,99€ zzgl. Versand."*
  Payment icons (Apple Pay, Google Pay, Visa, Mastercard, Amex, SEPA) sit on the hero — signalling
  "real checkout, pay now".
- **Hero bullets:** Online Behandlung anfragen · Rezept digital ausstellen lassen · Medikamente aus
  der Apotheke geliefert bekommen. Cities as codes: BER | HAM | MUC | COL | DUS | FFM | STR | DRE.
  "Lieferung in 60–90 Min." in-city, "Ganz Deutschland in 1–3 Tagen" by DHL.
- **"So funktioniert's"** — 3 icon steps: *Fragebogen ausfüllen* (+ ggf. Termin buchen) → *Behandlung
  erhalten* (Arzt prüft, berät, stellt ggf. ein Rezept aus) → *Direktlieferung erhalten*.
- **"Lieferung? In Minuten."** — 8 cities with per-district opening hours, next to a **real Berlin map
  with a drawn pink coverage polygon** (an actual map tile, not a stylised graphic).
- **"Du verdienst erstklassigen Service"** — 3 cards:
  - *Live-Produktbestand* — see relevant pharmacies' stock in real time **while filling the
    questionnaire**, so nothing is unavailable later.
  - *Live-Verfolgung deiner Lieferung* — real-time delivery tracking.
  - *Erstklassiger Support* — fast support via live chat.
- **"Legalisierung & rechtliche Aspekte"** — a plain-language explainer: from 1 April 2024 cannabis
  is no longer a BtMG narcotic; still prescription-only; only qualified doctors (e.g. quick-green's
  partner doctors) may prescribe.
- **FAQ** — 5 Q&As: how to request treatment, *data is not shared with your Krankenkasse* (private
  service), cost "ab 14,99€", how live stock works, delivery times.
- **Final CTA:** "Bereit für eine Behandlung?"

### Consent (marketing site)

**Cookiebot by Usercentrics.** 4 categories — Necessary / Preferences / Statistics / Marketing —
with *Allow all* / *Allow selection* / **Deny**. Contains a **cannabis-specific Art. 9(2)(a) GDPR
notice**: *"As our platform facilitates medical cannabis therapy, the use of such [statistics/
marketing] services may allow inferences about your interest in this type of treatment. By making
your selection, you also explicitly consent in this respect (Art. 9(2)(a) GDPR)."*

Persistent **Intercom-style chat bubble** on every page, including inside the funnel. DE/EN toggle
top-right; language is carried into the app subdomain via a `language=` query param.

---

## 2. The onboarding funnel

Runs on a separate app subdomain (`app.quick-green.com/onboarding`), **hash-routed**, with a thin
**progress bar** at the top of every screen and "Trustpilot 4.8/5 · 1,065+ reviews" + payment icons
in every step's footer. One question per screen; **most steps auto-advance on tap** — an explicit
*Next* button appears only for free-text and multi-select screens. A *Back* link is always present.

| # | Route (`#…`) | Question | Answers |
|---|---|---|---|
| 1 | `returning-customer` | "Existing treatment" — Have you already received a prescription through quick-green? | Yes / No |
| 2 | `zip` | "Your postal code" | free text (placeholder `e.g. 10115`) + Next |
| 3 | `treatment-type` | "Preferred treatment type" — How would you like to provide details about your health condition?\* | Online questionnaire *(Instant)* / Video consultation *(subject to availability)* / In-person appointment *(subject to availability)*. Footnote: "\*Medical services are billed according to the currently valid German Scale of Fees for Physicians (GoÄ)." |
| 4 | `delivery-mode` | "Shipping method" — If a prescription is issued, how would you like to receive your medication? | **Courier** (names the real pharmacy "Herz Apotheke Berlin", shows a "Closed" state + dispatch time-slot chips from 09:00 / 11:00 / 13:00 / 15:00 / 17:00) · **Pickup** (€0 delivery badge, "ready for pickup in 30–60 min", "Pharmacy selectable in the next step") · **DHL Shipping** (1–3 days, "Internationale Hauptbahnhof Apotheke") · **Prescription only** (2–7 days, "Redeem the prescription at a pharmacy of your choice") |
| 5 | `consent` | "Important! Please read the following notes carefully and confirm them" | 7 bullet points (below) + one checkbox "I have read all the notes and agree" + Next |
| 6 | `symptoms` | "Symptoms" — Select your main symptom | **Sleep disorder / AD(H)D / Migraine / Chronic pain** |
| 7 | `symptom-description` | "Medical history" — Please describe your symptoms. Is there a diagnosis or additional complaints? | free textarea, placeholder "e.g. ICD code, findings, additional complaints", **min. 20 characters** + Next |
| 8 | `symptom-severity` | "Symptom intensity" — How much do your symptoms affect you? | Mild / Moderate / Severe |
| 9 | `symptom-duration` | "Duration of illness" — How long have you suffered from the main condition? | Over 12 months / 6–12 months / Less than 6 months |
| 10 | `doctor-visited` | "Previous treatment" — Have you already seen a doctor to treat your symptoms? | Yes / No |
| 11 | `medications` | "Previous medications" — Have you taken medication for your symptoms? | Yes / No |
| 12 | `medication-details` | "Current medications" — Do you take medication regularly or have you taken medication recently? | Yes / No + Next |
| 13 | `prior-therapies` | "Non-drug therapy" — Have other, non-drug therapy approaches already been tried? | Yes / No. **If Yes**, a conditional multi-select appears — "Which therapies were carried out?": Physiotherapy / Rehabilitation / Massage / Meditation / … / Other + Next |
| 14 | `exclusion-criteria` | "Exclusion criteria" — **three questions on one screen** | (a) "Are you pregnant or breastfeeding?" Yes/No · (b) "Have you obtained 100 g of cannabis or more within the last 30 days?" Yes/No · (c) "Do you have any of the following pre-existing conditions?" — single-select: None of the above / Schizophrenia · delusions / Personality disorder / Addictive disorders / Heart conditions / Liver · kidney conditions / Anxiety disorders / Allergy to THC · CBD. + Next |
| 15 | `cannabis-experience` | "Cannabis experience" — Have you already had experience taking cannabis (flower form, extract, etc.)? | Yes / No → **drops straight into the marketplace** |

### The consent screen (step 5), verbatim gist

A single checkbox gates the entire medical questionnaire. The 7 points:

1. Remote treatment is *not possible in every case* — only where, under recognised professional
   standards (§ 630a BGB), no in-person contact is medically necessary.
2. All questions answered truthfully to the best of my knowledge and belief; false information "can
   be harmful to my health and may also be punishable by law"; diagnoses and treatments are for my
   personal use only.
3. I am aware this is a **private medical service**; medical services are billed according to the
   currently valid GoÄ.
4. The medical invoice and any doctor's letter will be sent to me **by email**.
5. **"I have no right to have the strains I propose prescribed by the cooperating doctors, as the
   therapy and medication decision rests solely with the doctor"**, who alone determines whether and
   which cannabis strain, THC concentration, and quantity is best suited.
6. My information (in particular name, address, date of birth, treatment data and histories) may be
   passed to the cooperating doctors for treatment and billing, and health data I share may be
   viewed by **non-medical support staff** to answer inquiries. Consent is revocable with future
   effect via `support@quick-green.com`.
7. "I accept the platform's Privacy Policy and Terms & Conditions."

---

## 3. The quiz — observations

- **~10 medical questions**, almost all single-tap binary or 3-way. A realistic ~60–90 s fill,
  exactly as the marketing promises.
- **Deliberate ordering.** returning-customer → postcode → *treatment type* → *delivery method* →
  consent → symptoms. **Logistics and commercial choices come first**; the clinical questions are
  quarantined behind the consent gate. This front-loads the "you'll get it fast" experience before
  asking anything medical.
- **Postcode (step 2) powers real data downstream** — step 4 shows real pharmacy names, "Closed"
  states, and dispatch time-slots for that postcode.
- **Progressive disclosure.** "Yes" on non-drug therapy reveals a therapy checklist inline; the
  exclusion screen stacks three questions on one page.
- **Only one free-text field** (symptom description, 20-char minimum). Everything else is choices, so
  the abandonment surface is small.
- **4 conditions:** Sleep disorder / AD(H)D / Migraine / Chronic pain. Near-identical to WeCare's
  four, except **AD(H)D instead of Stress & Anxiety** — anxiety appears here only as an *exclusion*
  criterion.
- Severity, duration, prior-doctor, prior-meds, prior-therapy, and cannabis experience are all
  captured — but per the consent text, **none of it entitles the patient to a specific product**;
  it's a dossier assembled for the doctor.

---

## 4. Marketplace & checkout (what happens after the quiz)

The single biggest structural difference from WeCare: the moment the quiz ends, the user lands in
**`/marketplace/<uuid>` — a full strain shop**.

### Marketplace

- Header: selected pharmacy name + shipping method + ETA (e.g. "Internationale Hauptbahnhof
  Apotheke · DHL Shipping · 1–3 days").
- **~23 flower SKUs + 1 Curaleaf inhaler device.** Each card shows: brand + batch code + **strain
  name** (OG Kush, Berlin Berries, Girl Scout Cookies, Northern Lime Pie…), **strain type**
  (Indica / Sativa / Hybrid, often "-dominant"), an occasional **"Limited"** badge, **a real bud
  photo**, **THC % · CBD %** (THC 21–33 %, CBD ~1 % throughout), **price per gram** (€4.99–€10.49/g;
  the inhaler is €29.99/pc), and a **gram-selector** (10–50 g chips; some 5–50 g; inhaler 1–100 pc).
- **Filter** modal: product type — Flower (23) / Vape (1) — plus collapsible THC content / Price /
  Strain. **Sort by Price / THC.**
- **Cart rail (right):**
  - "You can still add up to 100 g or ml" — a progress meter that **enforces the 100 g / 30-day
    legal limit**.
  - Up to **3 line items** ("Item 1 of 3 / 2 of 3 / 3 of 3").
  - "Free DHL shipping on orders over €200. Add another €X."
  - Running **Subtotal**, **Continue** button, payment icons (Klarna, Apple Pay, Google Pay,
    Mastercard, Visa).

The patient **self-assembles a strain cart**. Per the consent screen it is a *proposal* — the doctor
can substitute or decline.

### Checkout (`/checkout?pharmacyId=…`)

- **Passwordless auth.** "Verify your mobile number — we'll send you a one-time code by SMS — no
  password needed." Phone field (`+49`), "Send code via" **SMS / WhatsApp** (WhatsApp is the
  pre-highlighted option).
- **Personal details:** First name · Last name · **Date of birth** (`tt.mm.jjjj`) · Email · Confirm
  email · a marketing opt-in checkbox ("offers and news, e.g. €1 prescription").
- **Delivery address:** "Add new address".
- **Order summary (right):** line items (`10 g × 4,99 €` = `49,90 €`) · Shipping `6,99 €` ·
  Subtotal incl. VAT `56,89 €` · **Treatment fee\* `14,99 €`** · **Total `71,88 €`** ·
  "\*VAT-exempt pursuant to § 4 No. 14 a) of the German VAT Act (UStG)" · "Have a discount code? You
  can enter it on the next page" · **"Proceed to payment"**.

So the user **pays goods + shipping + the €14.99 treatment fee up front**, *before* any doctor has
looked at the request. The medical review happens after payment.

---

## 5. Direct contrasts with WeCare

| Dimension | quick-green.com | WeCare (current) |
|---|---|---|
| **Hook** | Speed ("in Minuten geliefert") | Problem-first ("find the right support for Sleep / Pain / …") |
| **Prices** | On the homepage hero; full itemised total incl. €14.99 fee shown at checkout, pre-review | `PRICES_CONFIRMED = false` — "indicative, confirmed after your medical review" everywhere |
| **Product layer** | Raw strain marketplace — names, genetics, THC %, bud photos, €/g; the user picks | 5 abstract Solutions; no strain names/photos before the assessment; deterministic recommendation |
| **Strain / leaf imagery** | Everywhere, including the shop grid and filter modal | Hard rule — none before the assessment; no leaf/bud imagery anywhere |
| **Who chooses the product** | Patient builds a cart; doctor may override | `recommendation.ts` picks; a new user is never led to the stronger option |
| **Quiz → product path** | Quiz dumps the user into the shop; buy, *then* get reviewed | Quiz → Result → **submit for medical review** → order only if approved (D3) |
| **Payment** | Card / Klarna / Apple Pay / Google Pay / SEPA — pay now | Invoice / bank transfer, after approval (D7) |
| **Auth** | Passwordless SMS / WhatsApp OTP at checkout | Mock email + password; sign-in required before checkout |
| **Consent** | Cookiebot by Usercentrics; per-category; cannabis-specific Art. 9(2)(a) line | Custom banner, per-category (Essential / Analytics); a real CMP is still a launch blocker |
| **Fee transparency** | €14.99 treatment fee itemised at checkout, VAT-exemption cited | `/costs` deliberately carries no euro figures (D5 blocked) |
| **Delivery UX** | Real coverage map, live pharmacy stock, courier time-slots, live tracking | `AustriaMap` + "order before 12:00" copy; "real courier tracking once the partner is connected" |
| **Conditions** | Sleep / AD(H)D / Migraine / Chronic pain | Sleep / Pain / Stress & Anxiety / Migraine |
| **Trust signals** | Trustpilot 4.8/5 · 1,065+ on every funnel step | None (fabricated testimonials were removed) |
| **Funnel feel** | Hash-routed, thin progress bar, one question per screen, auto-advance | Assessment engine with a linear progress bar; "~60–90 s · not a medical form" |
| **Legal jurisdiction** | Germany (GoÄ, § 630a BGB, 100 g/30-day limit, April 2024 BtMG change) | Austria (medicines/narcotics law; advertising review still a launch blocker) |

---

## 6. What to borrow vs. what not to

### Safe to borrow — no conflict with D3 / D7 / the problem-first rules or Austrian law

- **Thin persistent progress bar + one-question-per-screen + auto-advance** funnel feel. Lower
  cognitive load than a multi-field page; the abandonment surface shrinks.
- **Ask postcode early** and use it to drive a real **delivery-eligibility / ETA check** further
  down the flow (WeCare already has `AustriaMap` and coverage cities — wire the postcode to it).
- **An explicit exclusion / safety screen** as a visible gate (pregnancy, contraindicated
  conditions, recent-supply limit). WeCare's assessment currently has no equivalent hard stop.
- **Persistent live chat** through the funnel and dashboard.
- **Itemised "here's your total" clarity** at checkout — even while the number stays *indicative*,
  showing goods + delivery + (review fee, once D5 lands) as separate lines reads as honest, not
  evasive.
- **Passwordless OTP** as a lighter alternative to email + password, if/when real auth is built.
- **A conditional follow-up** ("Yes → which ones?") pattern for richer history without more screens.
- **Trust density** — a real reviews widget once WeCare has genuine reviews (never fabricated).

### Do NOT copy — these are exactly what WeCare's spec and PO decisions rule out

- **Strain marketplace + bud photos + THC sort before medical review.** Violates the problem-first
  hard rule and the "no product/strain imagery before the assessment" rule (owner + compliance,
  Aug 2026).
- **Pay-then-review.** Conflicts with D3 (submit → review → order-if-approved) and, for Austria, with
  prescription-medicine law. quick-green keeps the doctor step for the same legal reason — it just
  bills first.
- **Card / Klarna payment UI now.** Conflicts with D7; there is no PSP integrated — a card form
  would be a non-functional fake, which the audit bars.
- **"€1 prescription" promo / discount codes** on a prescription medical service — advertising-law
  risk; needs Austrian counsel (§ 14 open item).
- **User-visible THC %, strain names, Indica/Sativa framing** as the product layer. WeCare's Solution
  model is intentionally one abstraction level above this.

---

## 7. Cross-references

- `docs/BUSINESS-FLOW.md` — the end-to-end WeCare flow + open decisions D-A…D-F; already cites
  quick-green as the benchmark for the treatment-fee / upfront-price / Cookiebot patterns.
- `CLAUDE.md` — "Stakeholder checkout/flow feedback (2026-09-02)" section: the WhatsApp feedback that
  first raised quick-green, and which of its ideas were applied vs. deferred.
- `docs/STRAIN-SOLUTION-MAPPING.md` — why WeCare's product layer is Solutions, not strains.
