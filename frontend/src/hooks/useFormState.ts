import { useState, useCallback } from "react";
import type { FormState, EmergencyContact } from "../types";
import { MAX_CHIPS, MAX_CHIP_LENGTH, MAX_CONTACTS } from "../constants";

const createEmptyContact = (): EmergencyContact => ({
  name: "",
  relationship: "",
  phone: "",
});

const initialFormState: FormState = {
  fullName: "",
  bloodType: "",
  allergies: [],
  conditions: [],
  medications: [],
  emergencyContacts: [createEmptyContact()],
  notes: "",
};

export interface UseFormStateReturn {
  formState: FormState;
  setField: (field: keyof FormState, value: any) => void;
  addChip: (field: "allergies" | "conditions" | "medications", value: string) => void;
  removeChip: (field: "allergies" | "conditions" | "medications", index: number) => void;
  addContact: () => void;
  updateContact: (index: number, field: keyof EmergencyContact, value: string) => void;
  removeContact: (index: number) => void;
  reset: () => void;
}

export function useFormState(): UseFormStateReturn {
  const [formState, setFormState] = useState<FormState>(initialFormState);

  const setField = useCallback((field: keyof FormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addChip = useCallback(
    (field: "allergies" | "conditions" | "medications", value: string) => {
      const trimmed = value.trim();
      if (trimmed === "") return;

      const truncated = trimmed.slice(0, MAX_CHIP_LENGTH);

      setFormState((prev) => {
        if (prev[field].length >= MAX_CHIPS) return prev;
        return { ...prev, [field]: [...prev[field], truncated] };
      });
    },
    []
  );

  const removeChip = useCallback(
    (field: "allergies" | "conditions" | "medications", index: number) => {
      setFormState((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    },
    []
  );

  const addContact = useCallback(() => {
    setFormState((prev) => {
      if (prev.emergencyContacts.length >= MAX_CONTACTS) return prev;
      return {
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, createEmptyContact()],
      };
    });
  }, []);

  const updateContact = useCallback(
    (index: number, field: keyof EmergencyContact, value: string) => {
      setFormState((prev) => {
        const updated = prev.emergencyContacts.map((contact, i) =>
          i === index ? { ...contact, [field]: value } : contact
        );
        return { ...prev, emergencyContacts: updated };
      });
    },
    []
  );

  const removeContact = useCallback((index: number) => {
    setFormState((prev) => {
      if (prev.emergencyContacts.length <= 1) return prev;
      return {
        ...prev,
        emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
      };
    });
  }, []);

  const reset = useCallback(() => {
    setFormState(initialFormState);
  }, []);

  return {
    formState,
    setField,
    addChip,
    removeChip,
    addContact,
    updateContact,
    removeContact,
    reset,
  };
}
