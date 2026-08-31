/**
 * Fixed, decorative colour bloom behind all content. The base page gradient
 * lives on <body>; this adds the soft "light source" orbs that give the
 * liquid-glass surfaces something to refract. Each orb drifts on its own very
 * slow path (`orb-drift-*` in index.css) — subliminal motion, off entirely
 * under `prefers-reduced-motion`.
 *
 * Orbs are sized/placed for `lg`+. Below that the fixed rem sizes are huge
 * next to a narrow viewport and would wash the whole screen blue, so the
 * mobile/tablet values are viewport-relative and pulled further off the
 * edges — the bloom stays on the sides and the centre keeps the pale page
 * colour, matching desktop.
 */
export function GradientBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="orb-drift-a absolute -right-1/4 -top-1/4 size-[60vw] rounded-full bg-sky-300/60 blur-[90px] lg:-right-40 lg:-top-48 lg:size-[42rem] lg:blur-[130px] dark:bg-petrol-500/20" />
      <div className="orb-drift-b absolute -left-1/4 top-1/3 size-[55vw] rounded-full bg-sky-400/40 blur-[100px] lg:-left-52 lg:size-[36rem] lg:blur-[140px] dark:bg-petrol-600/20" />
      <div className="orb-drift-c absolute -bottom-1/4 -right-[12%] size-[60vw] rounded-full bg-sky-200/55 blur-[100px] lg:-bottom-56 lg:right-1/4 lg:size-[38rem] lg:blur-[150px] dark:bg-sky-500/10" />
    </div>
  );
}
