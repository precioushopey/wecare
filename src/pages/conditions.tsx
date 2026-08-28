import { ConditionLandingPage } from "./conditions/ConditionLandingPage";

/**
 * Problem landing pages — shared template, four instances + General Wellness
 * fallback (spec Section 6). General Wellness stays routed but is kept out of
 * primary nav; it's reachable from assessment start and 404 dead ends.
 */

export function SleepPage() {
  return <ConditionLandingPage conditionKey="sleep" />;
}

export function ChronicPainPage() {
  return <ConditionLandingPage conditionKey="pain" />;
}

export function StressAnxietyPage() {
  return <ConditionLandingPage conditionKey="stressAnxiety" />;
}

export function MigrainePage() {
  return <ConditionLandingPage conditionKey="migraine" />;
}

export function GeneralWellnessPage() {
  return <ConditionLandingPage conditionKey="generalWellness" />;
}
