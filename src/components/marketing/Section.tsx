import type { ReactNode } from "react";

import { cn } from "@/app/components/ui/utils";

type SectionTone = "surface" | "raised" | "brand" | "mint";

const TONE: Record<SectionTone, string> = {
  // transparent — the page gradient shows through
  surface: "text-ink",
  // faint frosted band lifting off the gradient
  raised:
    "text-ink bg-white/45 backdrop-blur-md border-y border-white/50",
  // deep blue-teal gradient
  brand:
    "text-white bg-[linear-gradient(135deg,#0b2f45_0%,#0d444b_55%,#12586c_100%)]",
  // barely-there mint wash
  mint: "text-ink bg-sage-100/35",
};

export function Section({
  children,
  className,
  tone = "surface",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: SectionTone;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("px-4 py-16 sm:px-6 sm:py-24", TONE[tone], className)}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  invert?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" && "mx-auto max-w-2xl text-center",
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.16em]",
            invert ? "text-sage-300" : "text-petrol-600",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className={cn(invert && "text-white")}>{title}</h2>
      {intro ? (
        <p className={cn("text-lg", invert ? "text-sage-100" : "text-ink-muted")}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}
