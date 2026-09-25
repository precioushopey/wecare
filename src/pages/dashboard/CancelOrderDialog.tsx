import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";

/**
 * "Cancel this order?" confirmation for the My orders page (owner request,
 * 2026-09-25). One instance per page, driven by `orderId` (null = closed), so
 * the desktop table and the mobile cards share it.
 *
 * A native `<dialog>` opened with `showModal()`: the browser supplies the focus
 * trap, the backdrop, Escape and focus return, so no dialog library is needed
 * (the vendored shadcn dialog was removed as unused). "Keep order" comes first in
 * the DOM, so it is the element focused on open and an accidental Enter never
 * cancels. Escape and a click on the backdrop both mean "keep".
 */
export function CancelOrderDialog({
  orderId,
  onKeep,
  onConfirm,
}: {
  orderId: string | null;
  onKeep: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation("dashboard");
  const ref = useRef<HTMLDialogElement>(null);
  const open = orderId !== null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="cancel-order-title"
      aria-describedby="cancel-order-body"
      // Escape: keep our own state in charge instead of letting the browser
      // close the dialog behind React's back.
      onCancel={(e) => {
        e.preventDefault();
        onKeep();
      }}
      // The dialog has no padding of its own, so a click whose target is the
      // dialog element itself landed on the backdrop.
      onClick={(e) => {
        if (e.target === e.currentTarget) onKeep();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-white/60 bg-white p-0 text-ink shadow-[var(--shadow-float)] backdrop:bg-petrol-900/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <h2 id="cancel-order-title" className="font-display text-xl md:text-2xl text-ink">
          {t("orders.cancel.title")}
        </h2>
        <p id="cancel-order-body" className="mt-3 text-ink-muted">
          {t("orders.cancel.body", { id: orderId ?? "" })}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onKeep} className="w-full sm:w-auto">
            {t("orders.cancel.keep")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            {t("orders.cancel.confirm")}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
