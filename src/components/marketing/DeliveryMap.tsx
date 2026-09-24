import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";

import type { DeliveryCountry } from "@/features/delivery/country";

/**
 * Simplified country outline + pins for the major cities WeCare is targeting —
 * Austria (default) and Germany (changes-matrix, 2026-09-24; the homepage
 * delivery section shows the visitor's country, see `features/delivery/country`).
 * Each outline is a simplified boundary polygon projected with a cos(latitude)
 * correction so its aspect ratio matches the real country's, and every pin sits
 * at its actual relative lon/lat position on the same projection. (Germany:
 * 90 points, hand-simplified from approximate border coordinates — a schematic
 * shape, not survey-accurate.)
 *
 * The pins are **targets, not a coverage guarantee** — the caller
 * (`DeliveryBannerSection`) renders a `deliveryBanner.coverageNote` line right
 * below the map ("Availability depends on medical and pharmacy partner
 * coverage"). All pins are equal weight — the map asserts no fulfilment origin
 * (WeCare's registered seat isn't confirmed).
 *
 * Visual: a 3-stop terrain gradient for the landmass, a soft outer glow halo
 * behind the crisp outline, an `.image-glow` "held" treatment behind the
 * shape. Markers are map-pin teardrops (lucide `MapPin` silhouette, inlined
 * as path data) each with a staggered `animate-ping` ring, off under
 * reduced-motion. The dot-grid texture is painted by the caller across the
 * whole panel, not here. Decorative (`aria-hidden`).
 */

const AT_VIEW = { w: 600, h: 320 };
const DE_VIEW = { w: 400, h: 520 };

const AT_OUTLINE =
  "M574.71,117.73 L569.15,162.24 L527.89,162.46 L542.08,186.06 L517.76,256.19 L503.8,274.57 L439.73,277.29 L402.76,302 L342.25,293.56 L237.49,265.43 L221.12,227.54 L148.72,246.47 L140.2,267.19 L95.82,251.71 L58.44,248.74 L25.29,228.91 L36.49,202.25 L33.66,182.92 L55.77,176.91 L92.84,207.16 L103.28,178.41 L167.88,183.06 L220.26,163.53 L255.38,166.87 L278.23,189.17 L285.06,170.66 L274.67,99.69 L300.99,85.86 L326.82,35.64 L381.25,70.7 L422.46,26.13 L448.25,18 L505.11,51.24 L539.52,45.59 L573.29,66.16 L567.41,79.99 L574.71,117.73 Z";

const DE_OUTLINE =
  "M75.77,130.17 L75.77,110.76 L111.92,116.82 L127.14,113.18 L132.85,95.59 L144.26,96.2 L138.55,79.81 L129.8,69.5 L144.26,58.58 L132.85,43.41 L122.19,24.0 L130.94,33.1 L161.38,39.17 L178.5,48.27 L176.6,57.37 L189.92,62.22 L212.75,69.5 L226.06,60.4 L214.65,81.63 L215.41,90.13 L237.48,93.77 L262.21,76.78 L277.43,60.4 L300.26,69.5 L312.81,46.45 L323.09,66.47 L330.7,78.6 L344.01,91.95 L347.82,115.0 L345.15,144.73 L340.21,160.5 L357.33,173.85 L355.43,187.8 L361.89,212.07 L370.65,239.37 L373.69,266.67 L366.84,275.77 L340.21,275.77 L324.99,283.05 L296.45,300.04 L275.53,309.14 L264.11,312.17 L269.82,330.38 L277.43,345.54 L283.13,366.78 L304.06,383.16 L313.57,417.13 L296.45,435.33 L289.98,441.4 L295.69,462.03 L300.26,477.19 L286.94,471.13 L267.92,469.91 L243.18,475.98 L219.59,486.9 L199.43,479.01 L190.68,496.0 L182.31,488.11 L172.8,479.01 L157.58,475.98 L150.73,471.13 L136.65,468.7 L129.04,466.88 L121.43,475.98 L104.31,477.8 L90.99,477.19 L89.09,451.71 L92.89,430.48 L98.6,418.34 L113.82,391.04 L102.41,388.01 L83.38,381.94 L68.16,378.91 L52.94,369.81 L44.19,363.74 L49.14,342.51 L45.33,330.38 L35.82,321.28 L41.53,309.14 L33.92,297.01 L32.02,284.87 L26.31,266.67 L37.73,257.57 L37.73,245.44 L30.12,221.17 L47.24,216.32 L60.55,212.07 L68.16,196.9 L70.07,169.6 L83.38,145.34 Z";

type LabelAnchor = "start" | "middle" | "end";

interface MapCity {
  key: string;
  x: number;
  y: number;
  labelDx: number;
  labelDy: number;
  anchor: LabelAnchor;
}

const AT_CITIES: MapCity[] = [
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


const DE_CITIES: MapCity[] = [
  {
    key: "hamburg",
    x: 181.93,
    y: 115.0,
    labelDx: 10,
    labelDy: 4,
    anchor: "start",
  },
  {
    key: "berlin",
    x: 311.67,
    y: 177.49,
    labelDx: 10,
    labelDy: 4,
    anchor: "start",
  },
  {
    key: "leipzig",
    x: 272.48,
    y: 249.08,
    labelDx: 10,
    labelDy: 4,
    anchor: "start",
  },
  {
    key: "cologne",
    x: 66.64,
    y: 273.35,
    labelDx: 10,
    labelDy: 4,
    anchor: "start",
  },
  {
    key: "frankfurt",
    x: 132.08,
    y: 323.7,
    labelDx: 10,
    labelDy: 4,
    anchor: "start",
  },
  {
    key: "stuttgart",
    x: 151.11,
    y: 404.39,
    labelDx: 10,
    labelDy: 4,
    anchor: "start",
  },
  {
    key: "munich",
    x: 242.42,
    y: 443.22,
    labelDx: 10,
    labelDy: 4,
    anchor: "start",
  },
];

/** Per-country map data. Germany is taller than wide, so it is capped in width
 *  to keep the section from growing far taller than the Austria one. */
const MAPS: Record<
  DeliveryCountry,
  { viewW: number; viewH: number; outline: string; cities: MapCity[]; className: string }
> = {
  AT: { viewW: AT_VIEW.w, viewH: AT_VIEW.h, outline: AT_OUTLINE, cities: AT_CITIES, className: "" },
  DE: { viewW: DE_VIEW.w, viewH: DE_VIEW.h, outline: DE_OUTLINE, cities: DE_CITIES, className: "max-w-[22rem] sm:max-w-sm" },
};

export function DeliveryMap({ country = "AT" }: { country?: DeliveryCountry }) {
  const { t } = useTranslation("home");
  const { viewW, viewH, outline, cities, className } = MAPS[country];
  const fillId = `${country}Fill`;

  return (
    <div className="image-glow rounded-[2rem]">
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className={`mx-auto h-auto w-full ${className} drop-shadow-[0_18px_34px_rgba(1,15,20,0.35)]`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* 3-stop terrain gradient for the landmass — a lit corner fading
              through the brand teal rather than a flat tint. */}
          <linearGradient id={fillId} x1="8%" y1="0%" x2="95%" y2="100%">
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
          d={outline}
          fill="none"
          stroke="#7fe3ea"
          strokeOpacity={0.45}
          strokeWidth={7}
          strokeLinejoin="round"
          style={{ filter: "blur(6px)" }}
        />

        <path
          d={outline}
          fill={`url(#${fillId})`}
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        {cities.map((c, i) => {
          const scale = 0.56;
          const pingR = 5;
          return (
            <g key={c.key}>
              {/* Ping ring at the pin's ground point — staggered delay per
                  city so the pins don't pulse in lockstep. */}
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

              {/* The pin itself, tip anchored exactly on the city's point —
                  the actual lucide `MapPin` icon component (24×24, tip at
                  ~12,21.7), not a hand-copied path. Nested SVG elements are
                  valid, so its own <svg> root nests cleanly inside this
                  transform group. The gradient dot on top is the one bit
                  the icon's props can't express (its own inner circle would
                  inherit the same flat `fill`), so it's a small custom
                  circle layered over the icon's native one. */}
              <g
                transform={`translate(${c.x},${c.y}) scale(${scale}) translate(-12,-21.7)`}
              >
                <MapPin
                  width={24}
                  height={24}
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
                className="fill-white text-sm md:text-base font-semibold font-sans"
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
