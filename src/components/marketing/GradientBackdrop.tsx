/**
 * Fixed, decorative colour bloom behind all content. The base page gradient
 * lives on <body>; this adds the soft "light source" orbs that give the
 * liquid-glass surfaces something to refract.
 */
export function GradientBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -right-40 -top-48 size-[42rem] rounded-full bg-sky-200/55 blur-[130px]" />
      <div className="absolute top-1/3 -left-52 size-[36rem] rounded-full bg-petrol-200/40 blur-[140px]" />
      <div className="absolute -bottom-56 right-1/4 size-[38rem] rounded-full bg-sage-200/45 blur-[150px]" />
    </div>
  );
}
