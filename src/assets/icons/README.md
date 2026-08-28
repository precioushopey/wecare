# Third-party icons

Brand marks for the site footer strip. Wired in
`src/components/layout/FooterIcons.tsx` → rendered by `SiteFooter`.

| Group | Files used |
|-------|-----------|
| Social | `Facebook_f_logo_(2021).svg.webp`, `linkedin-…webp`, `WhatsApp_Logo_green.svg.webp`, `YouTube_…webp` |
| Shipping | `dhl-worldwide-express-png-logo-1.png` |
| Payment | `visa-…jpg`, `amex-inverted_82041.webp`, `Mastercard_logo.webp`, `6124998.png` (Google Pay), `apple-pay.svg`, `Klarna-Emblem.png` |
| App stores | `png-clipart-google-play-…png`, `app-store-download-…webp` |

Not yet used: `images.png` (dup Google Pay), `Google.png`, `Apple.png`
(for social sign-in later), `Klarna-Logo.jpg`, `Apple_Pay-Logo.wine.png`.

To add Instagram / TikTok (in the design, no asset yet): drop the files here
and append to `SOCIALS` in `FooterIcons.tsx`.

**Social + app-store links point at `#`** — replace with real URLs in
`FooterIcons.tsx`. The app-store badges imply a native app exists.

Third-party logos are used under nominative/fair use for payment & delivery
identification; keep them unmodified.
