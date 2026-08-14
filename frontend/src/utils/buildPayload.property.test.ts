import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { buildPayload } from "./buildPayload";
import type { FormState } from "../types";

/**
 * Feature: emergency-card-intake-form, Property 6: Payload data model conformance
 *
 * Validates: Requirements 3.3, 8.1–8.8
 *
 * For any valid form state that passes validation, the constructed CardPayload SHALL
 * contain exactly the fields fullName, bloodType, allergies, conditions, medications,
 * emergencyContacts, and notes — with no additional fields and all field names in exact camelCase.
 */

const EXPECTED_FIELDS = [
  "fullName",
  "bloodType",
  "allergies",
  "conditions",
  "medications",
  "emergencyContacts",
  "notes",
] as const;

const BLOOD_TYPE_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Unknown",
] as const;

// Arbitrary for generating valid FormState objects
const formStateArbitrary: fc.Arbitrary<FormState> = fc.record({
  fullName: fc.string({ minLength: 1 }),
  bloodType: fc.constantFrom(...BLOOD_TYPE_OPTIONS),
  allergies: fc.array(fc.string({ maxLength: 50 }), { maxLength: 20 }),
  conditions: fc.array(fc.string({ maxLength: 50 }), { maxLength: 20 }),
  medications: fc.array(fc.string({ maxLength: 50 }), { maxLength: 20 }),
  emergencyContacts: fc.array(
    fc.record({
      name: fc.string(),
      relationship: fc.string(),
      phone: fc.string(),
    }),
    { minLength: 1, maxLength: 3 }
  ),
  notes: fc.string(),
});

describe("buildPayload - Property 6: Payload data model conformance", () => {
  it("payload always contains EXACTLY 7 fields: fullName, bloodType, allergies, conditions, medications, emergencyContacts, notes", () => {
    fc.assert(
      fc.property(formStateArbitrary, (formState) => {
        const payload = buildPayload(formState);
        const keys = Object.keys(payload).sort();
        const expected = [...EXPECTED_FIELDS].sort();

        expect(keys).toEqual(expected);
        expect(keys).toHaveLength(7);
      }),
      { numRuns: 100 }
    );
  });

  it("payload NEVER contains id, createdAt, or updatedAt", () => {
    fc.assert(
      fc.property(formStateArbitrary, (formState) => {
        const payload = buildPayload(formState);
        const keys = Object.keys(payload);

        expect(keys).not.toContain("id");
        expect(keys).not.toContain("createdAt");
        expect(keys).not.toContain("updatedAt");
      }),
      { numRuns: 100 }
    );
  });

  it("allergies, conditions, medications are always arrays of strings", () => {
    fc.assert(
      fc.property(formStateArbitrary, (formState) => {
        const payload = buildPayload(formState);

        expect(Array.isArray(payload.allergies)).toBe(true);
        expect(Array.isArray(payload.conditions)).toBe(true);
        expect(Array.isArray(payload.medications)).toBe(true);

        for (const item of payload.allergies) {
          expect(typeof item).toBe("string");
        }
        for (const item of payload.conditions) {
          expect(typeof item).toBe("string");
        }
        for (const item of payload.medications) {
          expect(typeof item).toBe("string");
        }
      }),
      { numRuns: 100 }
    );
  });

  it("emergencyContacts is always an array of 1-3 objects with exactly {name, relationship, phone} as strings", () => {
    fc.assert(
      fc.property(formStateArbitrary, (formState) => {
        const payload = buildPayload(formState);

        expect(Array.isArray(payload.emergencyContacts)).toBe(true);
        expect(payload.emergencyContacts.length).toBeGreaterThanOrEqual(1);
        expect(payload.emergencyContacts.length).toBeLessThanOrEqual(3);

        for (const contact of payload.emergencyContacts) {
          const contactKeys = Object.keys(contact).sort();
          expect(contactKeys).toEqual(["name", "phone", "relationship"]);
          expect(typeof contact.name).toBe("string");
          expect(typeof contact.relationship).toBe("string");
          expect(typeof contact.phone).toBe("string");
        }
      }),
      { numRuns: 100 }
    );
  });

  it("fullName is always a string, bloodType is always a string", () => {
    fc.assert(
      fc.property(formStateArbitrary, (formState) => {
        const payload = buildPayload(formState);

        expect(typeof payload.fullName).toBe("string");
        expect(typeof payload.bloodType).toBe("string");
      }),
      { numRuns: 100 }
    );
  });

  it("notes is always a string (defaults to empty string if empty)", () => {
    fc.assert(
      fc.property(formStateArbitrary, (formState) => {
        const payload = buildPayload(formState);

        expect(typeof payload.notes).toBe("string");
      }),
      { numRuns: 100 }
    );
  });

  it("all field names use exact camelCase (no snake_case, PascalCase, or kebab-case)", () => {
    const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;

    fc.assert(
      fc.property(formStateArbitrary, (formState) => {
        const payload = buildPayload(formState);
        const keys = Object.keys(payload);

        for (const key of keys) {
          expect(key).toMatch(camelCaseRegex);
        }

        // Also verify nested emergencyContacts field names
        for (const contact of payload.emergencyContacts) {
          const contactKeys = Object.keys(contact);
          for (const key of contactKeys) {
            expect(key).toMatch(camelCaseRegex);
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
