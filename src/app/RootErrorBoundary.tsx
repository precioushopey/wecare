import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

/**
 * App-wide error boundary. Without it, a render error anywhere unmounts the
 * whole tree and leaves a blank page. This catches it and offers a way back.
 *
 * A class component (boundaries can't be hooks) — so copy is read straight
 * from `localStorage:wecare.language` rather than i18next, with an EN default.
 */

const COPY = {
  de: {
    title: "Etwas ist schiefgelaufen",
    body: "Auf dieser Seite ist ein Fehler aufgetreten. Deine Daten sind sicher — lade die Seite neu oder geh zur Startseite.",
    reload: "Seite neu laden",
    home: "Zur Startseite",
  },
  en: {
    title: "Something went wrong",
    body: "This page hit an error. Your data is safe — reload the page or go back to the homepage.",
    reload: "Reload page",
    home: "Back to home",
  },
} as const;

function pickCopy() {
  try {
    return localStorage.getItem("wecare.language") === "de" ? COPY.de : COPY.en;
  } catch {
    return COPY.en;
  }
}

interface State {
  hasError: boolean;
}

export class RootErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Owner decision D19 — wire GlitchTip (EU-hosted / Sentry-compatible) here
    // via VITE_ERROR_DSN. Scrub PII, health data and tokens before sending;
    // never include assessment answers or breadcrumb form values.
    console.error("[RootErrorBoundary]", error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    const c = pickCopy();
    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "var(--color-surface, #f4f5fa)",
          color: "var(--color-ink, #12211f)",
          fontFamily:
            "var(--wc-font-sans, system-ui, -apple-system, sans-serif)",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", margin: "0 0 .75rem" }}>{c.title}</h1>
          <p
            style={{
              margin: "0 0 1.5rem",
              color: "var(--color-ink-muted, #566664)",
              lineHeight: 1.6,
            }}
          >
            {c.body}
          </p>
          <div
            style={{
              display: "flex",
              gap: ".75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                borderRadius: "999px",
                border: "none",
                padding: ".65rem 1.4rem",
                fontWeight: 600,
                cursor: "pointer",
                background: "var(--color-petrol-600, #218390)",
                color: "#fff",
              }}
            >
              {c.reload}
            </button>
            <a
              href="/"
              style={{
                borderRadius: "999px",
                border: "1px solid var(--color-border, #cdd8d7)",
                padding: ".65rem 1.4rem",
                fontWeight: 600,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {c.home}
            </a>
          </div>
        </div>
      </div>
    );
  }
}
