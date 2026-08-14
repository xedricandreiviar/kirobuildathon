import type { FormState, ValidationErrors } from "../types";

/**
 * Validates the form state and returns an object containing error messages
 * for any fields that fail validation.
 *
 * Rules:
 * - fullName must be non-empty and not whitespace-only
 * - bloodType must be selected (non-empty string)
 * - At least one emergency contact must have both a non-empty name and non-empty phone
 */
export function validate(formState: FormState): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!formState.fullName || formState.fullName.trim().length === 0) {
    errors.fullName = "Full name is required";
  }

  if (!formState.bloodType) {
    errors.bloodType = "Blood type is required";
  }

  const hasValidContact = formState.emergencyContacts.some(
    (contact) =>
      contact.name.trim().length > 0 && contact.phone.trim().length > 0
  );

  if (!hasValidContact) {
    errors.emergencyContacts =
      "At least one contact with name and phone is required";
  }

  return errors;
}

/**
 * Returns true if the validation errors object contains any errors.
 */
export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
