import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { cn } from "@/app/components/ui/utils";

/**
 * One choice as a large tile: the label on the left, a radio / check circle on
 * the right (owner request, 2026-09-24, modelled on quick-green's onboarding).
 * The real `<input>` stays in the DOM (visually hidden) so keyboard, screen
 * readers and form semantics are unchanged; the circle is drawn from its
 * `:checked` state. Lay several out in a grid — two-up for a Yes/No pair.
 */
export function OptionTile({
  type = "radio",
  name,
  id,
  value,
  checked,
  onChange,
  label,
  hint,
  className,
}: {
  type?: "radio" | "checkbox";
  name?: string;
  id?: string;
  value?: string;
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 border-petrol-900/10 bg-white/85 px-5 py-4 text-left text-ink shadow-[0_1px_2px_rgba(13,68,75,0.06)] transition-colors hover:border-petrol-300 has-[:checked]:border-petrol-600 has-[:checked]:bg-sage-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-petrol-600",
        className,
      )}
    >
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="min-w-0">
        <span className="block">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-sm md:text-base text-ink-muted">
            {hint}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden
        className={cn(
          "grid size-6 shrink-0 place-items-center border-2 border-petrol-900/60 bg-white transition-colors peer-checked:border-petrol-600 peer-checked:bg-petrol-600 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100",
          type === "radio" ? "rounded-full" : "rounded-md",
        )}
      >
        <Check className="size-3.5 text-white" strokeWidth={3} />
      </span>
    </label>
  );
}
