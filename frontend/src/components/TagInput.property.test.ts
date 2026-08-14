import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { useFormState } from "../hooks/useFormState";
import { MAX_CHIP_LENGTH, MAX_CHIPS } from "../constants";

/**
 * Property-based tests for TagInput logic via the useFormState hook.
 * Tests the core addChip/removeChip logic directly without DOM rendering.
 */

const chipFields = ["allergies", "conditions", "medications"] as const;

describe("Feature: emergency-card-intake-form, Property 1: TagInput chip length and count enforcement", () => {
  it("stored chip value NEVER exceeds 50 characters (MAX_CHIP_LENGTH)", () => {
    /**
     * Validates: Requirements 1.3, 1.4, 1.5
     *
     * For any string value added to a TagInput (allergies, conditions, or medications),
     * the stored chip value SHALL never exceed 50 characters.
     */
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.constantFrom(...chipFields),
        (value, field) => {
          const { result } = renderHook(() => useFormState());

          act(() => {
            result.current.addChip(field, value);
          });

          const chips = result.current.formState[field];
          for (const chip of chips) {
            expect(chip.length).toBeLessThanOrEqual(MAX_CHIP_LENGTH);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("total chips in any array NEVER exceeds 20 (MAX_CHIPS)", () => {
    /**
     * Validates: Requirements 1.3, 1.4, 1.5
     *
     * For any number of strings added to a TagInput,
     * the total number of chips SHALL never exceed 20.
     */
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 30 }),
        fc.constantFrom(...chipFields),
        (values, field) => {
          const { result } = renderHook(() => useFormState());

          for (const value of values) {
            act(() => {
              result.current.addChip(field, value);
            });
          }

          expect(result.current.formState[field].length).toBeLessThanOrEqual(MAX_CHIPS);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Feature: emergency-card-intake-form, Property 2: Whitespace-only input rejection in TagInput", () => {
  it("whitespace-only strings are rejected and chips array remains empty", () => {
    /**
     * Validates: Requirements 1.6
     *
     * For any string composed entirely of whitespace characters (spaces, tabs, newlines,
     * or empty string), attempting to add it as a chip SHALL be rejected, and the chips
     * array SHALL remain unchanged.
     */
    const whitespaceChars = [" ", "\t", "\n", "\r", "\f", "\v"];
    const whitespaceArb = fc
      .array(fc.constantFrom(...whitespaceChars), { minLength: 0, maxLength: 50 })
      .map((chars) => chars.join(""));

    fc.assert(
      fc.property(
        whitespaceArb,
        fc.constantFrom(...chipFields),
        (whitespaceValue, field) => {
          const { result } = renderHook(() => useFormState());

          const chipsBefore = [...result.current.formState[field]];

          act(() => {
            result.current.addChip(field, whitespaceValue);
          });

          expect(result.current.formState[field]).toEqual(chipsBefore);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Feature: emergency-card-intake-form, Property 3: Chip removal correctness", () => {
  it("removing a chip at a valid index reduces array length by 1 and removes the value at that index", () => {
    /**
     * Validates: Requirements 1.11, 1.12
     *
     * For any TagInput with a non-empty chips array and any valid index within that array,
     * removing the chip at that index SHALL reduce the array length by exactly one and the
     * removed value SHALL no longer appear at that index position.
     */
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 20 }),
        fc.constantFrom(...chipFields),
        (values, field) => {
          const { result } = renderHook(() => useFormState());

          // Add all chips
          for (const value of values) {
            act(() => {
              result.current.addChip(field, value);
            });
          }

          const chipsAfterAdd = [...result.current.formState[field]];
          // Only proceed if we actually have chips (some may have been whitespace-only)
          if (chipsAfterAdd.length === 0) return;

          // Pick a random valid index
          const indexToRemove = Math.floor(Math.random() * chipsAfterAdd.length);
          const removedValue = chipsAfterAdd[indexToRemove];
          const lengthBefore = chipsAfterAdd.length;

          act(() => {
            result.current.removeChip(field, indexToRemove);
          });

          const chipsAfterRemove = result.current.formState[field];

          // Array length decreased by exactly 1
          expect(chipsAfterRemove.length).toBe(lengthBefore - 1);

          // The removed value is no longer at that index position
          if (indexToRemove < chipsAfterRemove.length) {
            expect(chipsAfterRemove[indexToRemove]).not.toBe(removedValue);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
