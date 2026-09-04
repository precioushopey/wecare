import { useTranslation } from "react-i18next";

/**
 * Simplified outline of Austria + pins for the major cities WeCare is
 * targeting. The outline is a real simplified boundary polygon (37 points)
 * projected with a cos(latitude) correction so the east–west stretch matches
 * Austria's true ~1.94:1 aspect ratio, and every pin sits at its actual
 * relative lon/lat position on the same projection.
 *
 * The pins are **targets, not a coverage guarantee** — both callers
 * (`DeliveryBannerSection`, the dashboard delivery card) render a
 * `deliveryBanner.coverageNote` line right below the map ("Availability
 * depends on medical and pharmacy partner coverage"). All 7 pins are equal
 * weight — the map asserts no fulfilment origin (WeCare's registered seat
 * isn't confirmed).
 *
 * Visual: a 3-stop terrain gradient for the landmass, a soft outer glow halo
 * behind the crisp outline, an `.image-glow` "held" treatment behind the
 * shape. Markers are map-pin teardrops (lucide `MapPin` silhouette, inlined
 * as path data) each with a staggered `animate-ping` ring, off under
 * reduced-motion. The dot-grid texture is painted by the callers across the
 * whole panel, not here. Decorative (`aria-hidden`).
 */

const VIEW_W = 600;
const VIEW_H = 320;

const OUTLINE =
  "M574.71,117.73 L569.15,162.24 L527.89,162.46 L542.08,186.06 L517.76,256.19 L503.8,274.57 L439.73,277.29 L402.76,302 L342.25,293.56 L237.49,265.43 L221.12,227.54 L148.72,246.47 L140.2,267.19 L95.82,251.71 L58.44,248.74 L25.29,228.91 L36.49,202.25 L33.66,182.92 L55.77,176.91 L92.84,207.16 L103.28,178.41 L167.88,183.06 L220.26,163.53 L255.38,166.87 L278.23,189.17 L285.06,170.66 L274.67,99.69 L300.99,85.86 L326.82,35.64 L381.25,70.7 L422.46,26.13 L448.25,18 L505.11,51.24 L539.52,45.59 L573.29,66.16 L567.41,79.99 L574.71,117.73 Z";

type LabelAnchor = "start" | "middle" | "end";

const CITIES: {
  key: string;
  x: number;
  y: number;
  labelDx: number;
  labelDy: number;
  anchor: LabelAnchor;
}[] = [
  // Vienna & St. Pölten sit ~55px apart at nearly the same latitude — Vienna
  // labels to the right, St. Pölten below (pins stand ~13px tall above their
  // point, so "above" would run the label into St. Pölten's own pin).
  {
    key: "vienna",
    x: 530.33,
    y: 108.5,
    labelDx: 10,
    labelDy: 3,
    anchor: "start",
  },
  {
    key: "stPoelten",
    x: 475.51,
    y: 108.89,
    labelDx: 0,
    labelDy: 16,
    anchor: "middle",
  },
  {
    key: "graz",
    x: 461.88,
    y: 232.41,
    labelDx: 10,
    labelDy: 4,
    anchor: "start",
  },
  {
    key: "linz",
    x: 377.36,
    y: 97.75,
    labelDx: 10,
    labelDy: -7,
    anchor: "start",
  },
  {
    key: "salzburg",
    x: 287.19,
    y: 151.93,
    labelDx: 10,
    labelDy: 3,
    anchor: "start",
  },
  {
    key: "innsbruck",
    x: 166.25,
    y: 210.79,
    labelDx: 10,
    labelDy: 3,
    anchor: "start",
  },
  {
    key: "klagenfurt",
    x: 378.77,
    y: 280.99,
    labelDx: 10,
    labelDy: 4,
    anchor: "start",
  },
];

/** lucide `MapPin` geometry (24×24, tip at ~12,21.7), inlined as raw path
 * data so it can be scaled/placed as SVG rather than mounted as a nested
 * icon component. */
const PIN_OUTLINE =
  "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0";

export function AustriaMap() {
  const { t } = useTranslation("home");

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
          <radialGradient id="pinFill" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#eafeff" />
            <stop offset="100%" stopColor="#38c5cd" />
          </radialGradient>
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

        {CITIES.map((c, i) => {
          const scale = 0.56;
          const pingR = 5;
          return (
            <g key={c.key}>
              {/* Ping ring at the pin's ground point — staggered delay per
                  city so all 7 don't pulse in lockstep. */}
              <circle
                cx={c.x}
                cy={c.y}
                r={pingR}
                className="origin-center fill-white/50 [transform-box:fill-box] animate-ping motion-reduce:animate-none"
                style={{ animationDelay: `${i * 260}ms` }}
              />
              <circle
                cx={c.x}
                cy={c.y}
                r={pingR * 0.55}
                fill="#ffffff"
                fillOpacity={0.35}
              />

              {/* The pin itself, tip anchored exactly on the city's point. */}
              <g
                transform={`translate(${c.x},${c.y}) scale(${scale}) translate(-12,-21.7)`}
              >
                <path
                  d={PIN_OUTLINE}
                  fill="#ffffff"
                  stroke="#0d444b"
                  strokeWidth={0.75}
                />
                <circle cx={12} cy={10} r={3.2} fill="url(#pinFill)" />
              </g>

              <text
                x={c.x + c.labelDx}
                y={c.y + c.labelDy}
                textAnchor={c.anchor}
                className="fill-white text-[11px] font-semibold font-sans"
                style={{ textShadow: "0 1px 3px rgba(1,15,20,0.55)" }}
              >
                {t(`deliveryBanner.cities.${c.key}`)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
