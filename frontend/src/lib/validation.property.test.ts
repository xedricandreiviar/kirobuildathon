import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validate, hasErrors } from "./validation";
import type { FormState } from "../types";

/**
 * Feature: emergency-card-intake-form
 * Property 4: Validation rejects all invalid form states
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */

// Helper: generate a valid emergency contact (non-empty name AND non-empty phone)
const validContactArb = fc.record({
  name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  relationship: fc.string(),
  phone: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
});

// Helper: generate an invalid emergency contact (empty name OR empty phone)
const invalidContactArb = fc.oneof(
  // Empty name
  fc.record({
    name: fc.constantFrom("", " ", "  ", "\t", "\n"),
    relationship: fc.string(),
    phone: fc.string(),
  }),
  // Empty phone
  fc.record({
    name: fc.string(),
    relationship: fc.string(),
    phone: fc.constantFrom("", " ", "  ", "\t", "\n"),
  }),
  // Both empty
  fc.record({
    name: fc.constantFrom("", " ", "  "),
    relationship: fc.string(),
    phone: fc.constantFrom("", " ", "  "),
  })
);

// Helper: generate a base valid form state
const validFormStateArb = fc.record({
  fullName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  bloodType: fc.constantFrom(
    "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"
  ),
  allergies: fc.array(fc.string(), { maxLength: 5 }),
  conditions: fc.array(fc.string(), { maxLength: 5 }),
  medications: fc.array(fc.string(), { maxLength: 5 }),
  emergencyContacts: fc
    .array(validContactArb, { minLength: 1, maxLength: 3 }),
  notes: fc.string(),
});

describe("Feature: emergency-card-intake-form, Property 4: Validation rejects all invalid form states", () => {
  it("rejects form states with invalid fullName (empty or whitespace-only)", () => {
    fc.assert(
      fc.property(
        // Generate a form state with invalid fullName
        validFormStateArb.chain((baseState) =>
          fc
            .constantFrom("", " ", "  ", "\t", "\n", "   \t\n  ")
            .map((invalidName) => ({
              ...baseState,
              fullName: invalidName,
            }))
        ),
        (formState: FormState) => {
          const errors = validate(formState);
          expect(errors.fullName).toBeDefined();
          expect(errors.fullName).toBe("Full name is required");
          expect(hasErrors(errors)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("rejects form states with empty bloodType", () => {
    fc.assert(
      fc.property(
        // Generate a form state with empty bloodType
        validFormStateArb.map((baseState) => ({
          ...baseState,
          bloodType: "",
        })),
        (formState: FormState) => {
          const errors = validate(formState);
          expect(errors.bloodType).toBeDefined();
          expect(errors.bloodType).toBe("Blood type is required");
          expect(hasErrors(errors)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("rejects form states where no emergency contact has both non-empty name AND non-empty phone", () => {
    fc.assert(
      fc.property(
        // Generate a form state where ALL contacts are invalid
        fc.record({
          fullName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          bloodType: fc.constantFrom(
            "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"
          ),
          allergies: fc.array(fc.string(), { maxLength: 5 }),
          conditions: fc.array(fc.string(), { maxLength: 5 }),
          medications: fc.array(fc.string(), { maxLength: 5 }),
          emergencyContacts: fc.array(invalidContactArb, {
            minLength: 1,
            maxLength: 3,
          }),
          notes: fc.string(),
        }),
        (formState: FormState) => {
          const errors = validate(formState);
          expect(errors.emergencyContacts).toBeDefined();
          expect(errors.emergencyContacts).toBe(
            "At least one contact with name and phone is required"
          );
          expect(hasErrors(errors)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("rejects any invalid form state and hasErrors returns true (no API request would be made)", () => {
    // Generate form states that are invalid in at least one way
    const invalidFormStateArb = fc.oneof(
      // Invalid fullName
      validFormStateArb.map((s) => ({
        ...s,
        fullName: "",
      })),
      // Invalid bloodType
      validFormStateArb.map((s) => ({
        ...s,
        bloodType: "",
      })),
      // Invalid contacts (all contacts have empty name or phone)
      fc.record({
        fullName: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        bloodType: fc.constantFrom(
          "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"
        ),
        allergies: fc.array(fc.string(), { maxLength: 5 }),
        conditions: fc.array(fc.string(), { maxLength: 5 }),
        medications: fc.array(fc.string(), { maxLength: 5 }),
        emergencyContacts: fc.array(invalidContactArb, {
          minLength: 1,
          maxLength: 3,
        }),
        notes: fc.string(),
      }),
      // Multiple fields invalid at once
      fc.record({
        fullName: fc.constantFrom("", " ", "\t"),
        bloodType: fc.constant(""),
        allergies: fc.array(fc.string(), { maxLength: 5 }),
        conditions: fc.array(fc.string(), { maxLength: 5 }),
        medications: fc.array(fc.string(), { maxLength: 5 }),
        emergencyContacts: fc.array(invalidContactArb, {
          minLength: 1,
          maxLength: 3,
        }),
        notes: fc.string(),
      })
    );

    fc.assert(
      fc.property(invalidFormStateArb, (formState: FormState) => {
        const errors = validate(formState);
        // Must have at least one error
        expect(hasErrors(errors)).toBe(true);
        // At least one error field should be present
        const errorKeys = Object.keys(errors);
        expect(errorKeys.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});
