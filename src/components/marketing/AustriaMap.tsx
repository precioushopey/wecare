/**
 * Neutral simplified outline of Austria — a real simplified boundary polygon
 * (37 points) projected with a cos(latitude) correction so the east–west
 * stretch matches Austria's true ~1.94:1 aspect ratio.
 *
 * **No city pins.** Named pins implied verified service coverage we cannot yet
 * back up (PO decision, Sept 2026 — "no 7-city map until those 7 cities are
 * genuinely covered"). The callers pair this shape with a plain
 * "availability depends on medical and pharmacy partner coverage" note. A
 * proper service map returns once real coverage data exists.
 *
 * Visual: a 3-stop terrain gradient for the landmass and a soft outer glow
 * halo behind the crisp outline stroke; an `.image-glow` "held" treatment
 * sits behind the shape. The dot-grid texture is painted by the callers
 * (`DeliveryBannerSection`, the dashboard delivery card), not here, so it
 * reads as one continuous atlas surface. Decorative (`aria-hidden`).
 */

const VIEW_W = 600;
const VIEW_H = 320;

const OUTLINE =
  "M574.71,117.73 L569.15,162.24 L527.89,162.46 L542.08,186.06 L517.76,256.19 L503.8,274.57 L439.73,277.29 L402.76,302 L342.25,293.56 L237.49,265.43 L221.12,227.54 L148.72,246.47 L140.2,267.19 L95.82,251.71 L58.44,248.74 L25.29,228.91 L36.49,202.25 L33.66,182.92 L55.77,176.91 L92.84,207.16 L103.28,178.41 L167.88,183.06 L220.26,163.53 L255.38,166.87 L278.23,189.17 L285.06,170.66 L274.67,99.69 L300.99,85.86 L326.82,35.64 L381.25,70.7 L422.46,26.13 L448.25,18 L505.11,51.24 L539.52,45.59 L573.29,66.16 L567.41,79.99 L574.71,117.73 Z";

export function AustriaMap() {
  return (
    <div className="image-glow rounded-[2rem]">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-auto w-full drop-shadow-[0_18px_34px_rgba(1,15,20,0.35)]"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* 3-stop terrain gradient for the landmass — a lit corner fading
              through the brand teal rather than a flat tint. */}
          <linearGradient id="austriaFill" x1="8%" y1="0%" x2="95%" y2="100%">
            <stop offset="0%" stopColor="#eafeff" stopOpacity="0.42" />
            <stop offset="45%" stopColor="#7fd8e0" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0d444b" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {/* Soft glow halo behind the crisp outline. */}
        <path
          d={OUTLINE}
          fill="none"
          stroke="#7fe3ea"
          strokeOpacity={0.45}
          strokeWidth={7}
          strokeLinejoin="round"
          style={{ filter: "blur(6px)" }}
        />

        <path
          d={OUTLINE}
          fill="url(#austriaFill)"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
