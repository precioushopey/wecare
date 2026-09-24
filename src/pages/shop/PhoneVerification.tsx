import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { PHONE_VERIFICATION_LIVE } from "@/config";
import {
  CODE_LENGTH,
  checkVerificationCode,
  normalizePhone,
  sendVerificationCode,
} from "@/features/phone/verification";
import { AnalyticsEvent, track } from "@/lib/analytics";

interface Props {
  /** The E.164 number confirmed by SMS, or `null` while unverified. Owned by
   *  the page so it can gate submit and hand the number to the order. */
  verifiedPhone: string | null;
  onVerified: (phone: string) => void;
  onReset: () => void;
  initialPhone?: string;
  /** A `checkout.errors.*` key from the page (a submit attempted unverified). */
  error?: string;
}

/** The row's buttons match the inputs' height: `Input` is a fixed `h-9`, while a
 *  default `Button` is `py-3` + a 24px line (48px), which sat visibly taller
 *  beside the field. `py-0` lets `h-9` win. Full-width when the row stacks. */
const ROW_BUTTON = "h-9 w-full shrink-0 py-0 sm:w-auto";

/**
 * Replaces the old email + password account block on checkout (changes-matrix,
 * 2026-09-24): enter a mobile number → "Send code" → enter the 6-digit code.
 * Backed by `features/phone/verification.ts`; while `PHONE_VERIFICATION_LIVE`
 * is false it is a preview and says so (no SMS is sent, any 6 digits pass) —
 * it must never claim a code was sent when none was.
 *
 * Lives inside the checkout `<form>`, so Enter in its inputs is intercepted:
 * it triggers this block's own action, never the whole form's submit.
 */
export function PhoneVerification({
  verifiedPhone,
  onVerified,
  onReset,
  initialPhone = "",
  error,
}: Props) {
  const { t } = useTranslation("shop");
  const [input, setInput] = useState(initialPhone);
  /** The E.164 number a code was requested for; non-null = "code" step. */
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const shownError = localError ?? error ?? null;
  const describedBy =
    ["phone-hint", shownError ? "phone-error" : null].filter(Boolean).join(" ") ||
    undefined;

  async function send() {
    if (busy) return;
    const phone = normalizePhone(input);
    if (!phone) {
      setLocalError("phone");
      return;
    }
    setBusy(true);
    setLocalError(null);
    const res = await sendVerificationCode(phone);
    setBusy(false);
    if (!res.ok) {
      setLocalError(res.reason === "rateLimited" ? "phoneRateLimited" : "phoneUnavailable");
      return;
    }
    setSentTo(phone);
    setCode("");
    track(AnalyticsEvent.checkoutPhoneCodeSent);
  }

  async function verify() {
    if (busy || !sentTo) return;
    if (code.length !== CODE_LENGTH) {
      setLocalError("phoneCode");
      return;
    }
    setBusy(true);
    setLocalError(null);
    const res = await checkVerificationCode(sentTo, code);
    setBusy(false);
    if (!res.ok) {
      setLocalError(res.reason === "wrongCode" ? "phoneCodeWrong" : "phoneUnavailable");
      return;
    }
    track(AnalyticsEvent.checkoutPhoneVerified);
    setSentTo(null);
    setCode("");
    onVerified(sentTo);
  }

  function changeNumber() {
    if (verifiedPhone) setInput(verifiedPhone);
    setSentTo(null);
    setCode("");
    setLocalError(null);
    onReset();
  }

  const onEnter = (e: KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    action();
  };

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg md:text-xl font-medium text-ink">
        {t("checkout.phone.heading")}
      </legend>
      <p className="text-sm md:text-base text-ink-muted">
        {t("checkout.phone.intro")}
      </p>
      {!PHONE_VERIFICATION_LIVE ? (
        <p className="rounded-xl bg-sage-50 p-3 text-sm md:text-base text-petrol-700">
          {t("checkout.phone.previewNote")}
        </p>
      ) : null}

      {verifiedPhone ? (
        <div
          role="status"
          className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-sage-50 p-3 text-sm md:text-base text-ink"
        >
          <Check className="size-4 shrink-0 text-petrol-700" aria-hidden />
          <span>{t("checkout.phone.verified")}</span>
          <span className="font-medium">{verifiedPhone}</span>
          <button
            type="button"
            onClick={changeNumber}
            className="ml-auto text-ink-muted underline underline-offset-2 hover:text-ink"
          >
            {t("checkout.phone.change")}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t("checkout.phone.label")}</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={input}
                readOnly={sentTo !== null}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (localError) setLocalError(null);
                }}
                onKeyDown={(e) => onEnter(e, send)}
                aria-invalid={shownError ? true : undefined}
                aria-describedby={describedBy}
                className="sm:flex-1"
              />
              {sentTo === null ? (
                <Button
                  type="button"
                  variant="cta"
                  onClick={send}
                  disabled={busy}
                  className={ROW_BUTTON}
                >
                  {busy ? t("checkout.phone.sending") : t("checkout.phone.sendCode")}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={changeNumber}
                  className={ROW_BUTTON}
                >
                  {t("checkout.phone.change")}
                </Button>
              )}
            </div>
            <p id="phone-hint" className="text-sm md:text-base text-ink-muted">
              {t("checkout.phone.hint")}
            </p>
          </div>

          {sentTo !== null ? (
            <div className="space-y-1.5">
              <Label htmlFor="phone-code">{t("checkout.phone.codeLabel")}</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="phone-code"
                  name="phone-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={CODE_LENGTH}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH));
                    if (localError) setLocalError(null);
                  }}
                  onKeyDown={(e) => onEnter(e, verify)}
                  aria-invalid={shownError ? true : undefined}
                  aria-describedby={describedBy}
                  className="sm:flex-1"
                />
                <Button
                  type="button"
                  variant="cta"
                  onClick={verify}
                  disabled={busy || code.length !== CODE_LENGTH}
                  className={ROW_BUTTON}
                >
                  {busy ? t("checkout.phone.verifying") : t("checkout.phone.verify")}
                </Button>
              </div>
              {PHONE_VERIFICATION_LIVE ? (
                <p className="text-sm md:text-base text-ink-muted">
                  {t("checkout.phone.codeSent", { phone: sentTo })}
                </p>
              ) : null}
              <button
                type="button"
                onClick={send}
                disabled={busy}
                className="text-base text-ink-muted underline underline-offset-2 hover:text-ink disabled:opacity-60"
              >
                {t("checkout.phone.resend")}
              </button>
            </div>
          ) : null}
        </>
      )}

      {shownError ? (
        <p
          id="phone-error"
          role="alert"
          className="text-sm md:text-base text-danger-600"
        >
          {t(`checkout.errors.${shownError}`)}
        </p>
      ) : null}
    </fieldset>
  );
}
