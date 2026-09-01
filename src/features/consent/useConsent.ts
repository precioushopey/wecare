import { useCallback, useSyncExternalStore } from "react";

import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  reopenConsent,
  setConsent,
  subscribeConsent,
  type ConsentState,
} from "./consent";

interface UseConsentResult extends ConsentState {
  acceptAll: () => void;
  essentialOnly: () => void;
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
  const reopen = useCallback(() => reopenConsent(), []);

  return { ...state, acceptAll, essentialOnly, reopen };
}
