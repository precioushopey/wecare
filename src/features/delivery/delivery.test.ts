import { describe, expect, it } from "vitest";

import { AT_POSTCODE_RE, isServiceableAt, regionForPostcode } from "./delivery";

describe("AT_POSTCODE_RE", () => {
  it("accepts a 4-digit code with a leading 1-9", () => {
    expect(AT_POSTCODE_RE.test("1010")).toBe(true);
    expect(AT_POSTCODE_RE.test("9500")).toBe(true);
  });
  it("rejects wrong length, leading zero, and non-digits", () => {
    expect(AT_POSTCODE_RE.test("101")).toBe(false);
    expect(AT_POSTCODE_RE.test("10100")).toBe(false);
    expect(AT_POSTCODE_RE.test("0100")).toBe(false);
    expect(AT_POSTCODE_RE.test("10a0")).toBe(false);
    expect(AT_POSTCODE_RE.test("")).toBe(false);
    expect(AT_POSTCODE_RE.test(" 1010 ")).toBe(false);
  });
});

describe("regionForPostcode", () => {
  it("maps each leading digit to its region", () => {
    expect(regionForPostcode("1010")).toBe("wien");
    expect(regionForPostcode("2000")).toBe("niederoesterreich");
    expect(regionForPostcode("3100")).toBe("niederoesterreich");
    expect(regionForPostcode("4020")).toBe("oberoesterreich");
    expect(regionForPostcode("5020")).toBe("salzburg");
    expect(regionForPostcode("6020")).toBe("tirolVorarlberg");
    expect(regionForPostcode("7000")).toBe("burgenland");
    expect(regionForPostcode("8010")).toBe("steiermark");
    expect(regionForPostcode("9500")).toBe("kaernten");
  });
  it("returns undefined for anything that is not a valid AT postcode", () => {
    expect(regionForPostcode("0100")).toBeUndefined();
    expect(regionForPostcode("123")).toBeUndefined();
    expect(regionForPostcode("12345")).toBeUndefined();
    expect(regionForPostcode("abcd")).toBeUndefined();
    expect(regionForPostcode("")).toBeUndefined();
  });
});

describe("isServiceableAt", () => {
  it("is true for any valid AT postcode (DHL is nationwide)", () => {
    expect(isServiceableAt("1010")).toBe(true);
    expect(isServiceableAt("8010")).toBe(true);
  });
  it("is false for an invalid postcode", () => {
    expect(isServiceableAt("0000")).toBe(false);
    expect(isServiceableAt("99")).toBe(false);
  });
});
