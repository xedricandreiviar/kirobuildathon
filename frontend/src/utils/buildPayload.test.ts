import { describe, it, expect } from "vitest";
import { buildPayload } from "./buildPayload";
import type { FormState } from "../types";

describe("buildPayload", () => {
  const baseFormState: FormState = {
    fullName: "Juan Dela Cruz",
    bloodType: "O+",
    allergies: ["Peanuts", "Shellfish"],
    conditions: ["Asthma"],
    medications: ["Albuterol"],
    emergencyContacts: [
      { name: "Maria", relationship: "Mother", phone: "09171234567" },
    ],
    notes: "No additional notes",
  };

  it("should return exactly the 7 allowed fields", () => {
    const payload = buildPayload(baseFormState);
    const keys = Object.keys(payload);

    expect(keys).toHaveLength(7);
    expect(keys).toEqual(
      expect.arrayContaining([
        "fullName",
        "bloodType",
        "allergies",
        "conditions",
        "medications",
        "emergencyContacts",
        "notes",
      ])
    );
  });

  it("should not include id, createdAt, or updatedAt", () => {
    const payload = buildPayload(baseFormState);

    expect(payload).not.toHaveProperty("id");
    expect(payload).not.toHaveProperty("createdAt");
    expect(payload).not.toHaveProperty("updatedAt");
  });

  it("should return empty arrays for allergies/conditions/medications when user provides none", () => {
    const emptyState: FormState = {
      ...baseFormState,
      allergies: [],
      conditions: [],
      medications: [],
    };

    const payload = buildPayload(emptyState);

    expect(payload.allergies).toEqual([]);
    expect(payload.conditions).toEqual([]);
    expect(payload.medications).toEqual([]);
  });

  it("should default notes to empty string when not provided", () => {
    const stateWithoutNotes: FormState = {
      ...baseFormState,
      notes: "",
    };

    const payload = buildPayload(stateWithoutNotes);

    expect(payload.notes).toBe("");
  });

  it("should map emergency contacts with only name, relationship, and phone", () => {
    const payload = buildPayload(baseFormState);

    expect(payload.emergencyContacts).toHaveLength(1);
    expect(Object.keys(payload.emergencyContacts[0])).toEqual(
      expect.arrayContaining(["name", "relationship", "phone"])
    );
    expect(Object.keys(payload.emergencyContacts[0])).toHaveLength(3);
    expect(payload.emergencyContacts[0]).toEqual({
      name: "Maria",
      relationship: "Mother",
      phone: "09171234567",
    });
  });

  it("should preserve all provided field values correctly", () => {
    const payload = buildPayload(baseFormState);

    expect(payload.fullName).toBe("Juan Dela Cruz");
    expect(payload.bloodType).toBe("O+");
    expect(payload.allergies).toEqual(["Peanuts", "Shellfish"]);
    expect(payload.conditions).toEqual(["Asthma"]);
    expect(payload.medications).toEqual(["Albuterol"]);
    expect(payload.notes).toBe("No additional notes");
  });

  it("should not share array references with the original form state", () => {
    const payload = buildPayload(baseFormState);

    expect(payload.allergies).not.toBe(baseFormState.allergies);
    expect(payload.conditions).not.toBe(baseFormState.conditions);
    expect(payload.medications).not.toBe(baseFormState.medications);
  });
});
