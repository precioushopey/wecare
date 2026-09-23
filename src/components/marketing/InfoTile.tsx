import type { ReactNode } from "react";

import { cn } from "@/app/components/ui/utils";

/**
 * One glass tile in a `grid sm:grid-cols-2` info pair — the Costs page's
 * reimbursement/paying cards and the Contact page's email/hours cards share
 * this exact wrapper + heading shape. Body content stays `children` (not a
 * plain string prop) since Contact's email tile needs a `mailto:` link, not
 * just text.
 */
export function InfoTile({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-2xl md:rounded-3xl p-5", className)}>
      <h2 className="text-base md:text-lg">{title}</h2>
      {children}
    </div>
  );
}
