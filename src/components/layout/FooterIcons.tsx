import dhl from "@/assets/icons/dhl-worldwide-express-png-logo-1.png";

/**
 * Shipping + payment strip in the footer. Payment-brand badges (Visa /
 * Mastercard / Amex / Google Pay / Apple Pay / Klarna) were removed — MVP
 * checkout only accepts invoice + bank transfer (owner decision D7), and a
 * platform must not advertise a payment method it can't process. Re-add the
 * badges here only when the corresponding method is live at checkout. The
 * unused icon files stay in `src/assets/icons/`.
 */
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
  paymentMethods,
}: {
  shippingLabel: string;
  paymentLabel: string;
  paymentMethods: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
      <span className="sr-only">{shippingLabel}</span>
      <WhiteBadge src={dhl} alt="DHL" />
      <span className="mx-1 h-5 w-px bg-white/15" aria-hidden />
      <span>
        <span className="sr-only">{paymentLabel}: </span>
        {paymentMethods}
      </span>
    </div>
  );
}
