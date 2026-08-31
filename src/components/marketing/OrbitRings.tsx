import { cn } from "@/app/components/ui/utils";

/**
 * Decorative broken-circle rings behind the "Simple recommendations" photo
 * (owner reference, Aug 2026) — concentric white arcs with gaps, echoing a
 * radar/orbit motif. Purely decorative (`aria-hidden`), static (no motion —
 * this section's photo doesn't float, so a spinning ring behind it would
 * read as busier than the reference, which is still). Not `AssessmentRing`:
 * that's the brand's one signature *progress* device (a single arc with a
 * value); this is a multi-ring backdrop with no value to represent, so it
 * stays a separate, simpler decoration rather than overloading that
 * component with an unrelated variant.
 *
 * Rebuilt as real arc paths (owner follow-up, "make it look exactly like
 * this") rather than `stroke-dasharray`-broken circles — the reference is
 * each ring as one long, mostly-complete sweep with a single gap, at radii
 * spread widely enough that the outer rings run past the photo's frame,
 * not a tight dashed cluster.
 */
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const toXY = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)];
  };
  const [sx, sy] = toXY(startDeg);
  const [ex, ey] = toXY(endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M${sx},${sy} A${r},${r} 0 ${largeArc},1 ${ex},${ey}`;
}

const CX = 120;
const CY = 120;

const RINGS: { r: number; start: number; end: number }[] = [
  { r: 118, start: 20, end: 300 },
  { r: 95, start: -70, end: 190 },
  { r: 72, start: 60, end: 330 },
];

export function OrbitRings({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={cn("overflow-visible", className)}
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="#ffffff" strokeOpacity={0.85} strokeWidth={1.5} fill="none">
        {RINGS.map((ring, i) => (
          <path key={i} d={arcPath(CX, CY, ring.r, ring.start, ring.end)} />
        ))}
      </g>
    </svg>
  );
}
