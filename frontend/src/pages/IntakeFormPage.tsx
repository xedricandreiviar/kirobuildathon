import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useFormState } from "../hooks/useFormState";
import { validate, hasErrors } from "../lib/validation";
import { createCard } from "../lib/api-client";
import { buildPayload } from "../utils/buildPayload";
import { BloodTypeSelector } from "../components/BloodTypeSelector";
import { TagInput } from "../components/TagInput";
import { EmergencyContactGroup } from "../components/EmergencyContactGroup";
import type { ValidationErrors } from "../types";
import {
  BLOOD_TYPE_OPTIONS,
  MAX_CHIPS,
  MAX_CHIP_LENGTH,
  MAX_CONTACTS,
  MAX_FULL_NAME_LENGTH,
  MAX_NOTES_LENGTH,
} from "../constants";

export function IntakeFormPage() {
  const navigate = useNavigate();
  const {
    formState,
    setField,
    addChip,
    removeChip,
    addContact,
    updateContact,
    removeContact,
  } = useFormState();

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reactive error clearing: remove field error when user corrects input
  function handleFullNameChange(value: string) {
    setField("fullName", value);
    if (validationErrors.fullName) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next.fullName;
        return next;
      });
    }
  }

  function handleBloodTypeChange(value: string) {
    setField("bloodType", value);
    if (validationErrors.bloodType) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next.bloodType;
        return next;
      });
    }
  }

  function handleContactUpdate(
    index: number,
    field: "name" | "relationship" | "phone",
    value: string
  ) {
    updateContact(index, field, value);
    if (validationErrors.emergencyContacts) {
      // Check if the update makes at least one contact valid
      const updatedContacts = formState.emergencyContacts.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      );
      const hasValid = updatedContacts.some(
        (c) => c.name.trim().length > 0 && c.phone.trim().length > 0
      );
      if (hasValid) {
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next.emergencyContacts;
          return next;
        });
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Run validation
    const errors = validate(formState);
    if (hasErrors(errors)) {
      setValidationErrors(errors);
      return;
    }

    // Dismiss previous error on new submission attempt (Req 6.6)
    setApiError(null);
    setIsLoading(true);

    try {
      const payload = buildPayload(formState);
      const response = await createCard(payload);

      if (response.id && response.id.trim() !== "") {
        navigate(`/result/${response.id}`);
      } else {
        setApiError(
          "Your card was saved but we couldn't navigate to the result. Please try again later."
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Full Name */}
      <div className="form-field">
        <label htmlFor="full-name">Full Name</label>
        <input
          id="full-name"
          type="text"
          value={formState.fullName}
          onChange={(e) => handleFullNameChange(e.target.value)}
          maxLength={MAX_FULL_NAME_LENGTH}
          aria-invalid={!!validationErrors.fullName}
          aria-describedby={
            validationErrors.fullName ? "full-name-error" : undefined
          }
        />
        {validationErrors.fullName && (
          <p id="full-name-error" className="error-message" role="alert">
            {validationErrors.fullName}
          </p>
        )}
      </div>

      {/* Blood Type Selector */}
      <BloodTypeSelector
        value={formState.bloodType}
        onChange={handleBloodTypeChange}
        options={[...BLOOD_TYPE_OPTIONS]}
        error={validationErrors.bloodType}
      />

      {/* Tag Inputs */}
      <TagInput
        label="Allergies"
        chips={formState.allergies}
        onAddChip={(value) => addChip("allergies", value)}
        onRemoveChip={(index) => removeChip("allergies", index)}
        maxChips={MAX_CHIPS}
        maxChipLength={MAX_CHIP_LENGTH}
      />

      <TagInput
        label="Conditions"
        chips={formState.conditions}
        onAddChip={(value) => addChip("conditions", value)}
        onRemoveChip={(index) => removeChip("conditions", index)}
        maxChips={MAX_CHIPS}
        maxChipLength={MAX_CHIP_LENGTH}
      />

      <TagInput
        label="Medications"
        chips={formState.medications}
        onAddChip={(value) => addChip("medications", value)}
        onRemoveChip={(index) => removeChip("medications", index)}
        maxChips={MAX_CHIPS}
        maxChipLength={MAX_CHIP_LENGTH}
      />

      {/* Emergency Contacts */}
      <EmergencyContactGroup
        contacts={formState.emergencyContacts}
        onUpdateContact={handleContactUpdate}
        onAddContact={addContact}
        onRemoveContact={removeContact}
        maxContacts={MAX_CONTACTS}
        error={validationErrors.emergencyContacts}
      />

      {/* Notes */}
      <div className="form-field">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={formState.notes}
          onChange={(e) => setField("notes", e.target.value)}
          maxLength={MAX_NOTES_LENGTH}
        />
      </div>

      {/* Error Banner - shown above submit button */}
      {apiError && (
        <div className="error-banner" role="alert">
          {apiError}
        </div>
      )}

      {/* Submit Button */}
      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
