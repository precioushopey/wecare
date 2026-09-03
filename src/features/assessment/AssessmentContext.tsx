import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { isConditionKey } from "@/features/conditions/conditions";
import type { RegionKey } from "@/features/delivery/delivery";

import type { AssessmentExclusions } from "./exclusions";
import { isComplete, type AssessmentAnswers, type QuestionId } from "./questions";
import { getRecommendation, type Recommendation } from "./recommendation";

const STORAGE_KEY = "wecare.assessment";

interface StoredState {
  answers: AssessmentAnswers;
  completedAt: string | null;
  postcode: string | null;
  deliveryRegion: RegionKey | null;
  exclusions: AssessmentExclusions | null;
}

interface AssessmentContextValue {
  answers: AssessmentAnswers;
  completedAt: string | null;
  result: Recommendation | null;
  postcode: string | null;
  deliveryRegion: RegionKey | null;
  exclusions: AssessmentExclusions | null;
  setAnswer: (id: QuestionId, value: string) => void;
  setPostcode: (postcode: string, region: RegionKey | null) => void;
  setExclusions: (x: AssessmentExclusions) => void;
  prefillProblem: (problem: string) => void;
  submit: () => Recommendation | null;
  reset: () => void;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

function load(): StoredState {
  const empty: StoredState = {
    answers: {},
    completedAt: null,
    postcode: null,
    deliveryRegion: null,
    exclusions: null,
  };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (parsed && typeof parsed === "object" && parsed.answers) {
      return {
        answers: parsed.answers,
        completedAt: parsed.completedAt ?? null,
        postcode: parsed.postcode ?? null,
        deliveryRegion: parsed.deliveryRegion ?? null,
        exclusions: parsed.exclusions ?? null,
      };
    }
  } catch {
    /* ignore malformed storage */
  }
  return empty;
}

function save(state: StoredState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const initial = load();
  const [answers, setAnswers] = useState<AssessmentAnswers>(initial.answers);
  const [completedAt, setCompletedAt] = useState<string | null>(
    initial.completedAt,
  );
  const [postcode, setPostcodeState] = useState<string | null>(initial.postcode);
  const [deliveryRegion, setDeliveryRegion] = useState<RegionKey | null>(
    initial.deliveryRegion,
  );
  const [exclusions, setExclusionsState] = useState<AssessmentExclusions | null>(
    initial.exclusions,
  );

  // Always-current snapshot for callbacks that must read the latest answers
  // without re-creating themselves (and without stale closures).
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    save({ answers, completedAt, postcode, deliveryRegion, exclusions });
  }, [answers, completedAt, postcode, deliveryRegion, exclusions]);

  const setAnswer = useCallback((id: QuestionId, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setCompletedAt(null); // editing an answer invalidates a prior completion
  }, []);

  const setPostcode = useCallback(
    (pc: string, region: RegionKey | null) => {
      setPostcodeState(pc);
      setDeliveryRegion(region);
      setCompletedAt(null);
    },
    [],
  );

  const setExclusions = useCallback((x: AssessmentExclusions) => {
    setExclusionsState(x);
  }, []);

  /**
   * Apply a `?problem=` deep link. Unlike a manual answer this may run against
   * an assessment that is already in progress (or completed) — e.g. a returning
   * user clicking "Start Pain Assessment". If the linked problem differs from
   * the stored one we switch to it and invalidate the previous completion so
   * the user gets a fresh result; if it matches we leave everything untouched.
   */
  const prefillProblem = useCallback((problem: string) => {
    if (!isConditionKey(problem)) return;
    if (answersRef.current.q1 === problem) return;
    setAnswers((prev) => ({ ...prev, q1: problem }));
    setCompletedAt(null);
  }, []);

  const submit = useCallback(() => {
    if (!isComplete(answers)) return null;
    setCompletedAt(new Date().toISOString());
    return getRecommendation(answers);
  }, [answers]);

  const reset = useCallback(() => {
    setAnswers({});
    setCompletedAt(null);
    setPostcodeState(null);
    setDeliveryRegion(null);
    setExclusionsState(null);
  }, []);

  const result = useMemo(
    () =>
      isComplete(answers) && completedAt ? getRecommendation(answers) : null,
    [answers, completedAt],
  );

  const value = useMemo<AssessmentContextValue>(
    () => ({
      answers,
      completedAt,
      result,
      postcode,
      deliveryRegion,
      exclusions,
      setAnswer,
      setPostcode,
      setExclusions,
      prefillProblem,
      submit,
      reset,
    }),
    [
      answers,
      completedAt,
      result,
      postcode,
      deliveryRegion,
      exclusions,
      setAnswer,
      setPostcode,
      setExclusions,
      prefillProblem,
      submit,
      reset,
    ],
  );

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment(): AssessmentContextValue {
  const ctx = useContext(AssessmentContext);
  if (!ctx) {
    throw new Error("useAssessment must be used within AssessmentProvider");
  }
  return ctx;
}
