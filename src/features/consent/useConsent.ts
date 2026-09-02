import { useCallback, useSyncExternalStore } from "react";

import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  reopenConsent,
  setConsent,
  subscribeConsent,
  type ConsentChoice,
  type ConsentState,
} from "./consent";

interface UseConsentResult extends ConsentState {
  acceptAll: () => void;
  essentialOnly: () => void;
  /** Save an explicit choice built from the per-category toggles. */
  setChoice: (choice: Exclude<ConsentChoice, "unset">) => void;
  reopen: () => void;
}

export function useConsent(): UseConsentResult {
  const state = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );

  const acceptAll = useCallback(() => setConsent("all"), []);
  const essentialOnly = useCallback(() => setConsent("essential"), []);
  const setChoice = useCallback(
    (choice: Exclude<ConsentChoice, "unset">) => setConsent(choice),
    [],
  );
  const reopen = useCallback(() => reopenConsent(), []);

  return { ...state, acceptAll, essentialOnly, setChoice, reopen };
}
