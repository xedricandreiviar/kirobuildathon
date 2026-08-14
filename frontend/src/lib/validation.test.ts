import { describe, it, expect } from "vitest";
import { validate, hasErrors } from "./validation";
import type { FormState } from "../types";

function makeValidFormState(): FormState {
  return {
    fullName: "John Doe",
    bloodType: "A+",
    allergies: [],
    conditions: [],
    medications: [],
    emergencyContacts: [{ name: "Jane Doe", relationship: "Spouse", phone: "09171234567" }],
    notes: "",
  };
}

describe("validate", () => {
  it("returns no errors for a valid form state", () => {
    const errors = validate(makeValidFormState());
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });

  it('returns "Full name is required" when fullName is empty', () => {
    const state = makeValidFormState();
    state.fullName = "";
    const errors = validate(state);
    expect(errors.fullName).toBe("Full name is required");
  });

  it('returns "Full name is required" when fullName is whitespace-only', () => {
    const state = makeValidFormState();
    state.fullName = "   \t\n  ";
    const errors = validate(state);
    expect(errors.fullName).toBe("Full name is required");
  });

  it('returns "Blood type is required" when bloodType is empty', () => {
    const state = makeValidFormState();
    state.bloodType = "";
    const errors = validate(state);
    expect(errors.bloodType).toBe("Blood type is required");
  });

  it('returns emergency contacts error when no contact has both name and phone', () => {
    const state = makeValidFormState();
    state.emergencyContacts = [{ name: "", relationship: "", phone: "" }];
    const errors = validate(state);
    expect(errors.emergencyContacts).toBe(
      "At least one contact with name and phone is required"
    );
  });

  it('returns emergency contacts error when contact has name but no phone', () => {
    const state = makeValidFormState();
    state.emergencyContacts = [{ name: "Jane", relationship: "", phone: "" }];
    const errors = validate(state);
    expect(errors.emergencyContacts).toBe(
      "At least one contact with name and phone is required"
    );
  });

  it('returns emergency contacts error when contact has phone but no name', () => {
    const state = makeValidFormState();
    state.emergencyContacts = [{ name: "", relationship: "", phone: "123456" }];
    const errors = validate(state);
    expect(errors.emergencyContacts).toBe(
      "At least one contact with name and phone is required"
    );
  });

  it("passes when at least one contact among many has both name and phone", () => {
    const state = makeValidFormState();
    state.emergencyContacts = [
      { name: "", relationship: "", phone: "" },
      { name: "Jane", relationship: "Sister", phone: "09171234567" },
    ];
    const errors = validate(state);
    expect(errors.emergencyContacts).toBeUndefined();
  });

  it("returns multiple errors when multiple fields are invalid", () => {
    const state: FormState = {
      fullName: "",
      bloodType: "",
      allergies: [],
      conditions: [],
      medications: [],
      emergencyContacts: [{ name: "", relationship: "", phone: "" }],
      notes: "",
    };
    const errors = validate(state);
    expect(errors.fullName).toBe("Full name is required");
    expect(errors.bloodType).toBe("Blood type is required");
    expect(errors.emergencyContacts).toBe(
      "At least one contact with name and phone is required"
    );
    expect(hasErrors(errors)).toBe(true);
  });

  it("treats whitespace-only contact name and phone as invalid", () => {
    const state = makeValidFormState();
    state.emergencyContacts = [{ name: "   ", relationship: "", phone: "  " }];
    const errors = validate(state);
    expect(errors.emergencyContacts).toBe(
      "At least one contact with name and phone is required"
    );
  });
});

describe("hasErrors", () => {
  it("returns false for an empty errors object", () => {
    expect(hasErrors({})).toBe(false);
  });

  it("returns true when at least one error exists", () => {
    expect(hasErrors({ fullName: "Full name is required" })).toBe(true);
  });
});
