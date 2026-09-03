import { describe, expect, it } from "vitest";

import {
  exclusionFlagCount,
  hasAnyFlag,
  toggleCondition,
} from "./exclusions";

describe("toggleCondition", () => {
  it("adds a condition", () => {
    expect(toggleCondition([], "heart")).toEqual(["heart"]);
  });
  it("removes a condition that is already selected", () => {
    expect(toggleCondition(["heart", "allergy"], "heart")).toEqual(["allergy"]);
  });
  it("selecting 'none' clears every other condition", () => {
    expect(toggleCondition(["heart", "allergy"], "none")).toEqual(["none"]);
  });
  it("selecting a real condition clears a prior 'none'", () => {
    expect(toggleCondition(["none"], "heart")).toEqual(["heart"]);
  });
  it("re-selecting 'none' removes it", () => {
    expect(toggleCondition(["none"], "none")).toEqual([]);
  });
});

describe("hasAnyFlag", () => {
  it("is false for undefined / empty / all-negative", () => {
    expect(hasAnyFlag(undefined)).toBe(false);
    expect(hasAnyFlag({})).toBe(false);
    expect(
      hasAnyFlag({ pregnancy: "no", recentSupply: "no", conditions: ["none"] }),
    ).toBe(false);
  });
  it("is true when any single flag is set", () => {
    expect(hasAnyFlag({ pregnancy: "yes" })).toBe(true);
    expect(hasAnyFlag({ recentSupply: "yes" })).toBe(true);
    expect(hasAnyFlag({ conditions: ["heart"] })).toBe(true);
  });
});

describe("exclusionFlagCount", () => {
  it("counts every set flag", () => {
    expect(exclusionFlagCount(undefined)).toBe(0);
    expect(
      exclusionFlagCount({
        pregnancy: "yes",
        recentSupply: "no",
        conditions: ["heart", "allergy"],
      }),
    ).toBe(3);
    expect(exclusionFlagCount({ conditions: ["none"] })).toBe(0);
  });
});
