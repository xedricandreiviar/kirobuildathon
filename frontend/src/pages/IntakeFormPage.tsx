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

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    const errors = validate(formState);
    if (hasErrors(errors)) {
      setValidationErrors(errors);
      return;
    }
    setApiError(null);
    setIsLoading(true);
    try {
      const payload = buildPayload(formState);
      const response = await createCard(payload);
      if (response.id && response.id.trim() !== "") {
        navigate(`/result/${response.id}`);
      } else {
        setApiError("Your card was saved but we couldn't navigate to the result. Please try again later.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="max-w-[800px] mx-auto px-[16px] md:px-[48px] py-8 md:py-12">
      <div className="mb-[40px]">
        <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">Create your living emergency medical card</h1>
        <p className="text-body-md text-on-surface-variant">Fill out the essential information below. This data will be rapidly accessible via your personalized Emergency QR.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-[40px]">
        {/* Personal Info Section */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
          <div className="border-b border-outline-variant pb-4 mb-6">
            <h2 className="text-headline-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">person</span>
              Personal Information
            </h2>
          </div>
          <div className="space-y-[16px]">
            <div>
              <label className="block text-label-md text-primary mb-2" htmlFor="full-name">
                Full Name <span className="text-secondary">*</span>
              </label>
              <input
                className="w-full h-12 px-4 bg-surface-bright border border-outline-variant rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-primary placeholder:text-outline transition-colors"
                id="full-name"
                type="text"
                value={formState.fullName}
                onChange={(e) => handleFullNameChange(e.target.value)}
                maxLength={MAX_FULL_NAME_LENGTH}
                placeholder="e.g., Jane Doe"
                aria-invalid={!!validationErrors.fullName}
                aria-describedby={validationErrors.fullName ? "full-name-error" : undefined}
              />
              {validationErrors.fullName && (
                <p id="full-name-error" className="text-error text-label-sm mt-1" role="alert">
                  {validationErrors.fullName}
                </p>
              )}
            </div>

            <BloodTypeSelector
              value={formState.bloodType}
              onChange={handleBloodTypeChange}
              options={[...BLOOD_TYPE_OPTIONS]}
              error={validationErrors.bloodType}
            />
          </div>
        </section>

        {/* Medical Details Section */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
          <div className="border-b border-outline-variant pb-4 mb-6">
            <h2 className="text-headline-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">monitor_heart</span>
              Medical Details
            </h2>
          </div>
          <div className="space-y-[16px]">
            <TagInput
              label="Allergies"
              chips={formState.allergies}
              onAddChip={(value) => addChip("allergies", value)}
              onRemoveChip={(index) => removeChip("allergies", index)}
              maxChips={MAX_CHIPS}
              maxChipLength={MAX_CHIP_LENGTH}
              variant="danger"
            />

            <hr className="border-t border-surface-variant" />

            <TagInput
              label="Medical Conditions"
              chips={formState.conditions}
              onAddChip={(value) => addChip("conditions", value)}
              onRemoveChip={(index) => removeChip("conditions", index)}
              maxChips={MAX_CHIPS}
              maxChipLength={MAX_CHIP_LENGTH}
            />

            <hr className="border-t border-surface-variant" />

            <TagInput
              label="Medications"
              chips={formState.medications}
              onAddChip={(value) => addChip("medications", value)}
              onRemoveChip={(index) => removeChip("medications", index)}
              maxChips={MAX_CHIPS}
              maxChipLength={MAX_CHIP_LENGTH}
            />
          </div>
        </section>

        {/* Emergency Contacts Section */}
        <EmergencyContactGroup
          contacts={formState.emergencyContacts}
          onUpdateContact={handleContactUpdate}
          onAddContact={addContact}
          onRemoveContact={removeContact}
          maxContacts={MAX_CONTACTS}
          error={validationErrors.emergencyContacts}
        />

        {/* Additional Notes Section */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
          <div className="border-b border-outline-variant pb-4 mb-6">
            <h2 className="text-headline-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">note_alt</span>
              Additional Notes
            </h2>
          </div>
          <div>
            <label className="sr-only" htmlFor="notes">Additional Notes</label>
            <textarea
              className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md text-primary placeholder:text-outline transition-colors resize-y"
              id="notes"
              value={formState.notes}
              onChange={(e) => setField("notes", e.target.value)}
              maxLength={MAX_NOTES_LENGTH}
              placeholder="Any other vital information responders should know? (e.g., Pacemaker, Organ Donor, specific instructions)"
              rows={4}
            />
          </div>
        </section>

        {/* Error Banner */}
        {apiError && (
          <div className="bg-error-container border border-error rounded p-4 text-on-error-container text-body-md" role="alert">
            {apiError}
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-8 pb-12 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-4 bg-primary text-on-primary text-label-md rounded-lg flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
            {isLoading ? "Generating..." : "Generate Emergency QR & Card"}
          </button>
        </div>
      </form>
    </main>
  );
}
