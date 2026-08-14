import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useFormState } from "./useFormState";
import { MAX_CHIPS, MAX_CHIP_LENGTH, MAX_CONTACTS } from "../constants";

describe("useFormState", () => {
  it("initializes with default state", () => {
    const { result } = renderHook(() => useFormState());
    const { formState } = result.current;

    expect(formState.fullName).toBe("");
    expect(formState.bloodType).toBe("");
    expect(formState.allergies).toEqual([]);
    expect(formState.conditions).toEqual([]);
    expect(formState.medications).toEqual([]);
    expect(formState.emergencyContacts).toEqual([
      { name: "", relationship: "", phone: "" },
    ]);
    expect(formState.notes).toBe("");
  });

  describe("setField", () => {
    it("updates a top-level field", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.setField("fullName", "John Doe");
      });

      expect(result.current.formState.fullName).toBe("John Doe");
    });

    it("updates bloodType", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.setField("bloodType", "O+");
      });

      expect(result.current.formState.bloodType).toBe("O+");
    });

    it("updates notes", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.setField("notes", "Some notes here");
      });

      expect(result.current.formState.notes).toBe("Some notes here");
    });
  });

  describe("addChip", () => {
    it("adds a trimmed chip to the specified field", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.addChip("allergies", "  Peanuts  ");
      });

      expect(result.current.formState.allergies).toEqual(["Peanuts"]);
    });

    it("rejects empty string", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.addChip("allergies", "");
      });

      expect(result.current.formState.allergies).toEqual([]);
    });

    it("rejects whitespace-only string", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.addChip("conditions", "   \t\n  ");
      });

      expect(result.current.formState.conditions).toEqual([]);
    });

    it("truncates chip value to MAX_CHIP_LENGTH", () => {
      const { result } = renderHook(() => useFormState());
      const longValue = "a".repeat(100);

      act(() => {
        result.current.addChip("medications", longValue);
      });

      expect(result.current.formState.medications[0].length).toBe(MAX_CHIP_LENGTH);
    });

    it("does not add beyond MAX_CHIPS", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        for (let i = 0; i < MAX_CHIPS + 5; i++) {
          result.current.addChip("allergies", `chip-${i}`);
        }
      });

      expect(result.current.formState.allergies.length).toBe(MAX_CHIPS);
    });
  });

  describe("removeChip", () => {
    it("removes chip at the given index", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.addChip("allergies", "A");
        result.current.addChip("allergies", "B");
        result.current.addChip("allergies", "C");
      });

      act(() => {
        result.current.removeChip("allergies", 1);
      });

      expect(result.current.formState.allergies).toEqual(["A", "C"]);
    });
  });

  describe("addContact", () => {
    it("adds an empty contact", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.addContact();
      });

      expect(result.current.formState.emergencyContacts.length).toBe(2);
      expect(result.current.formState.emergencyContacts[1]).toEqual({
        name: "",
        relationship: "",
        phone: "",
      });
    });

    it("does not add beyond MAX_CONTACTS", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        for (let i = 0; i < MAX_CONTACTS + 2; i++) {
          result.current.addContact();
        }
      });

      expect(result.current.formState.emergencyContacts.length).toBe(MAX_CONTACTS);
    });
  });

  describe("updateContact", () => {
    it("updates a specific field of a contact", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.updateContact(0, "name", "Jane Doe");
        result.current.updateContact(0, "phone", "555-1234");
      });

      expect(result.current.formState.emergencyContacts[0].name).toBe("Jane Doe");
      expect(result.current.formState.emergencyContacts[0].phone).toBe("555-1234");
    });
  });

  describe("removeContact", () => {
    it("removes a contact at the given index", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.addContact();
        result.current.updateContact(1, "name", "Contact 2");
      });

      act(() => {
        result.current.removeContact(0);
      });

      expect(result.current.formState.emergencyContacts.length).toBe(1);
      expect(result.current.formState.emergencyContacts[0].name).toBe("Contact 2");
    });

    it("does not remove if only one contact remains", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.removeContact(0);
      });

      expect(result.current.formState.emergencyContacts.length).toBe(1);
    });
  });

  describe("reset", () => {
    it("resets to initial default state", () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.setField("fullName", "Test User");
        result.current.setField("bloodType", "AB+");
        result.current.addChip("allergies", "Dust");
        result.current.addContact();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.formState.fullName).toBe("");
      expect(result.current.formState.bloodType).toBe("");
      expect(result.current.formState.allergies).toEqual([]);
      expect(result.current.formState.emergencyContacts).toEqual([
        { name: "", relationship: "", phone: "" },
      ]);
    });
  });
});
