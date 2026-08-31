import amex from "@/assets/icons/amex-inverted_82041.jpg";
import applePay from "@/assets/icons/apple-pay.svg";
import dhl from "@/assets/icons/dhl-worldwide-express-png-logo-1.png";
import gpay from "@/assets/icons/6124998.png";
import klarna from "@/assets/icons/Klarna-Emblem.png";
import mastercard from "@/assets/icons/Mastercard_logo.webp";
import visa from "@/assets/icons/visa-logo-visa-icon-free-free-vector.jpg";

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
