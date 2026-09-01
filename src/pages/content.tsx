import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Mail } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { usePageTitle } from "@/app/usePageTitle";
import { SUPPORT_EMAIL } from "@/config";

/**
 * Contact / trust page (spec Section 4). No backend: the form composes a
 * `mailto:` so it works today, and the support address + hours are surfaced
 * directly. Swap `SUPPORT_EMAIL` (src/config.ts) for the real inbox and wire a
 * real form handler when the backend lands.
 *
 * "How It Works" redirects to the homepage `#how-it-works` section; the FAQ has
 * its own page. About / Careers / For providers were removed (owner decision,
 * Aug 2026).
 */
export function ContactPage() {
  const { t } = useTranslation();
  usePageTitle(t("pages.contact.title"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`WeCare — ${name || t("pages.contact.title")}`);
    const body = encodeURIComponent(
      `${message}\n\n— ${name}${email ? ` (${email})` : ""}`,
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
        {t("footer.headings.wecare")}
      </p>
      <h1 className="mt-3">{t("pages.contact.title")}</h1>
      <p className="mt-4 text-lg text-ink-muted">{t("pages.contact.intro")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-3xl p-5">
          <h2 className="text-base">{t("pages.contact.emailHeading")}</h2>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-1 inline-flex items-center gap-2 font-mono text-sm text-petrol-700 underline-offset-4 hover:underline"
          >
            <Mail className="size-4" aria-hidden />
            {SUPPORT_EMAIL}
          </a>
          <p className="mt-2 text-xs text-ink-muted">
            {t("pages.contact.emailNote")}
          </p>
        </div>
        <div className="glass rounded-3xl p-5">
          <h2 className="text-base">{t("pages.contact.hoursHeading")}</h2>
          <p className="mt-1 text-sm text-ink">{t("pages.contact.hoursValue")}</p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 glass-strong rounded-3xl p-6"
      >
        <div>
          <h2 className="text-base">{t("pages.contact.formHeading")}</h2>
          <p className="mt-1 text-xs text-ink-muted">
            {t("pages.contact.formNote")}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contact-name">{t("pages.contact.nameLabel")}</Label>
            <Input
              id="contact-name"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-email">{t("pages.contact.emailLabel")}</Label>
            <Input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-message">
            {t("pages.contact.messageLabel")}
          </Label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex w-full rounded-md border border-input bg-input-background px-3 py-2 text-base outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-petrol-600 md:text-sm"
          />
        </div>
        <Button type="submit" variant="cta" className="w-full sm:w-auto">
          {t("pages.contact.send")}
        </Button>
      </form>

      <p className="mt-6 rounded-xl border border-border bg-surface-raised p-4 text-sm text-ink-muted">
        {t("pages.contact.emergency")}
      </p>
    </div>
  );
}

// The 6 /legal/* documents have real content — see src/pages/legal/LegalPage.tsx.
