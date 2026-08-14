import type { FormState, CardPayload } from "../types";

/**
 * Converts a FormState to a CardPayload with exactly the 7 allowed fields.
 * Ensures no server-generated fields (id, createdAt, updatedAt) are included.
 * Defaults empty arrays for allergies/conditions/medications and empty string for notes.
 */
export function buildPayload(formState: FormState): CardPayload {
  return {
    fullName: formState.fullName,
    bloodType: formState.bloodType,
    allergies: formState.allergies.length > 0 ? [...formState.allergies] : [],
    conditions: formState.conditions.length > 0 ? [...formState.conditions] : [],
    medications: formState.medications.length > 0 ? [...formState.medications] : [],
    emergencyContacts: formState.emergencyContacts.map((contact) => ({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
    })),
    notes: formState.notes ?? "",
  };
}
