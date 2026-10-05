import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

/**
 * Moves keyboard / screen-reader focus to the new page's `<h1>` after a client-
 * side navigation. A single-page app swaps the content without a page load, so
 * without this focus stays on (or falls back to `<body>` from) the link that
 * was clicked and a screen reader announces nothing. Skips the first render
 * (the browser handles the initial load) and hash navigations (`ScrollToHash`
 * owns those). Focus is placed with `preventScroll`: `ScrollRestoration`
 * decides where the page ends up.
 */
export function RouteFocus() {
  const { pathname, hash } = useLocation();
  // The path we last handled; starts as the landing path so the first render
  // (and StrictMode's double effect in dev) never steals focus.
  const handled = useRef(pathname);

  useEffect(() => {
    if (handled.current === pathname) return;
    handled.current = pathname;
    if (hash) return;

    let raf = 0;
    let tries = 0;
    const tick = () => {
      const target =
        document.querySelector<HTMLElement>("main h1") ??
        document.querySelector<HTMLElement>("h1");
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        return;
      }
      if (tries++ < 20) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}
