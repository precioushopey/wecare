import amex from "@/assets/icons/amex-inverted_82041.jpg";
import appStore from "@/assets/icons/app-store-download-on-the-app-store-badge-11760038202udfggvbtov.jpg";
import applePay from "@/assets/icons/apple-pay.svg";
import dhl from "@/assets/icons/dhl-worldwide-express-png-logo-1.png";
import facebook from "@/assets/icons/Facebook_f_logo_(2021).svg.webp";
import gpay from "@/assets/icons/6124998.png";
import googlePlay from "@/assets/icons/png-clipart-google-play-computer-icons-android-google-text-label.png";
import klarna from "@/assets/icons/Klarna-Emblem.png";
import linkedin from "@/assets/icons/linkedin-logo-linkedin-icon-transparent-free-png.webp";
import mastercard from "@/assets/icons/Mastercard_logo.webp";
import visa from "@/assets/icons/visa-logo-visa-icon-free-free-vector.jpg";
import whatsapp from "@/assets/icons/WhatsApp_Logo_green.svg.webp";
import youtube from "@/assets/icons/YouTube_full-color_icon_(2017).svg.webp";

/* TODO: replace "#" with the real profile / store URLs. */
const SOCIALS = [
  { name: "Facebook", href: "#", src: facebook },
  { name: "LinkedIn", href: "#", src: linkedin },
  { name: "WhatsApp", href: "#", src: whatsapp },
  { name: "YouTube", href: "#", src: youtube },
] as const;

const PAYMENTS = [
  { name: "Visa", src: visa },
  { name: "American Express", src: amex },
  { name: "Mastercard", src: mastercard },
  { name: "Google Pay", src: gpay },
  { name: "Apple Pay", src: applePay },
  { name: "Klarna", src: klarna },
] as const;

function WhiteBadge({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="flex h-8 items-center rounded-md bg-white px-1.5">
      <img src={src} alt={alt} className="h-6 w-auto object-contain" />
    </span>
  );
}

export function SocialLinks({ label }: { label: string }) {
  return (
    <ul aria-label={label} className="flex items-center gap-2">
      {SOCIALS.map((s) => (
        <li key={s.name}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.name}
            className="flex size-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <img src={s.src} alt="" className="size-5 object-contain" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function TrustBadges({
  shippingLabel,
  paymentLabel,
}: {
  shippingLabel: string;
  paymentLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="sr-only">{shippingLabel}</span>
      <WhiteBadge src={dhl} alt="DHL" />
      <span className="mx-1 h-5 w-px bg-white/15" aria-hidden />
      <span className="sr-only">{paymentLabel}</span>
      {PAYMENTS.map((p) => (
        <WhiteBadge key={p.name} src={p.src} alt={p.name} />
      ))}
    </div>
  );
}

export function AppBadges({ label }: { label: string }) {
  return (
    <div aria-label={label} className="flex items-center gap-2">
      {/* Store art is a badge on a padded canvas with a grey stroke round it.
          Clip the box and zoom past the stroke so the badge reads edge-to-edge
          with no frame. Per-badge scale — the two canvases pad differently. */}
      <a
        href="#"
        aria-label="Google Play"
        className="block h-8 w-24 overflow-hidden rounded-md bg-black"
      >
        <img
          src={googlePlay}
          alt="Get it on Google Play"
          className="size-full scale-[1.12] object-cover"
        />
      </a>
      <a
        href="#"
        aria-label="App Store"
        className="block h-8 w-24 overflow-hidden rounded-md bg-black"
      >
        <img
          src={appStore}
          alt="Download on the App Store"
          className="size-full scale-[1.3] object-cover"
        />
      </a>
    </div>
  );
}
