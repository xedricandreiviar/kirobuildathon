import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { useFormState } from "./useFormState";
import { validate } from "../lib/validation";
import { MAX_CHIPS, MAX_CHIP_LENGTH } from "../constants";

/**
 * **Validates: Requirements 1.3, 1.4, 1.5**
 *
 * Property 1: TagInput chip length and count enforcement (hook level)
 *
 * For any string value added to a TagInput (allergies, conditions, or medications),
 * the stored chip value SHALL never exceed 50 characters, and the total number of
 * chips in any single TagInput SHALL never exceed 20.
 */
describe("Feature: emergency-card-intake-form, Property 1: TagInput chip length and count enforcement (hook level)", () => {
  const chipFields = ["allergies", "conditions", "medications"] as const;

  chipFields.forEach((field) => {
    it(`addChip enforces MAX_CHIP_LENGTH (${MAX_CHIP_LENGTH}) and MAX_CHIPS (${MAX_CHIPS}) for ${field}`, () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 0, maxLength: 200 }), { minLength: 1, maxLength: 30 }),
          (values) => {
            const { result } = renderHook(() => useFormState());

            act(() => {
              for (const value of values) {
                result.current.addChip(field, value);
              }
            });

            const chips = result.current.formState[field];

            // No chip exceeds MAX_CHIP_LENGTH
            for (const chip of chips) {
              expect(chip.length).toBeLessThanOrEqual(MAX_CHIP_LENGTH);
            }

            // Total count never exceeds MAX_CHIPS
            expect(chips.length).toBeLessThanOrEqual(MAX_CHIPS);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  it("removeChip maintains correctness - removed chip is gone and remaining chips are intact", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 40 }), { minLength: 2, maxLength: 15 }),
        fc.constantFrom(...chipFields),
        (values, field) => {
          const { result } = renderHook(() => useFormState());

          // Add chips
          act(() => {
            for (const value of values) {
              result.current.addChip(field, value);
            }
          });

          const chipsBeforeRemoval = [...result.current.formState[field]];
          if (chipsBeforeRemoval.length === 0) return;

          // Pick a valid index to remove
          const indexToRemove = Math.floor(Math.random() * chipsBeforeRemoval.length);

          act(() => {
            result.current.removeChip(field, indexToRemove);
          });

          const chipsAfterRemoval = result.current.formState[field];

          // Length decreased by exactly 1
          expect(chipsAfterRemoval.length).toBe(chipsBeforeRemoval.length - 1);

          // The expected array after removal
          const expected = [
            ...chipsBeforeRemoval.slice(0, indexToRemove),
            ...chipsBeforeRemoval.slice(indexToRemove + 1),
          ];
          expect(chipsAfterRemoval).toEqual(expected);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Validates: Requirements 2.5**
 *
 * Property 5: Reactive error clearing on field correction
 *
 * For any form field that currently has a validation error, when the user modifies
 * that field to a valid value, the corresponding error message SHALL be removed
 * without requiring a new form submission attempt.
 *
 * At the hook level, we verify that after correcting the fullName field from
 * empty (invalid) to a non-empty, non-whitespace value (valid), calling validate()
 * again returns no fullName error.
 */
describe("Feature: emergency-card-intake-form, Property 5: Reactive error clearing on field correction", () => {
  it("correcting fullName from empty to a valid value clears the fullName validation error", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (validName) => {
          const { result } = renderHook(() => useFormState());

          // Start with empty fullName (invalid state)
          // The hook initializes with fullName = "", which is invalid.
          const errorsBeforeCorrection = validate(result.current.formState);
          expect(errorsBeforeCorrection.fullName).toBe("Full name is required");

          // Correct the field by setting a valid non-empty, non-whitespace name
          act(() => {
            result.current.setField("fullName", validName);
          });

          // After correction, validate should NOT produce a fullName error
          const errorsAfterCorrection = validate(result.current.formState);
          expect(errorsAfterCorrection.fullName).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
