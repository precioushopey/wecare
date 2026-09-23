/**
 * The standard page-level header — optional eyebrow, `<h1>`, optional intro
 * paragraph — repeated verbatim (same classes, same order) across most
 * standalone content pages. `SectionHeading` (`Section.tsx`) is the sibling
 * component for *in-page* section headings (`<h2>`, on homepage-style
 * sections); this one is specifically the page's own `<h1>`, so the two stay
 * separate rather than overloading one component with a heading-level prop.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <>
      {eyebrow ? (
        <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.16em] text-petrol-600">
          {eyebrow}
        </p>
      ) : null}
      <h1 className={eyebrow ? "mt-3" : undefined}>{title}</h1>
      {intro ? <p className="mt-3 text-lg md:text-xl text-ink-muted">{intro}</p> : null}
    </>
  );
}
