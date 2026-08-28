import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Scrolls to the element named by `location.hash` after a navigation.
 * `<ScrollRestoration>` handles top/position restore but not hash targets, and
 * the target may mount a frame or two after a cross-route redirect (e.g.
 * `/how-it-works` → `/#how-it-works`), so this retries on animation frames.
 */
export function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));
    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let tries = 0;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
        return;
      }
      if (tries++ < 20) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [hash]);

  return null;
}
