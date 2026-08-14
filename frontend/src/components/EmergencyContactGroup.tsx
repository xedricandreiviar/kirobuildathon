import {
  MAX_CONTACT_NAME_LENGTH,
  MAX_RELATIONSHIP_LENGTH,
  MAX_PHONE_LENGTH,
} from "../constants";
import type { EmergencyContact } from "../types";

interface EmergencyContactGroupProps {
  contacts: EmergencyContact[];
  onUpdateContact: (
    index: number,
    field: keyof EmergencyContact,
    value: string
  ) => void;
  onAddContact: () => void;
  onRemoveContact: (index: number) => void;
  maxContacts: number;
  error?: string;
}

export function EmergencyContactGroup({
  contacts,
  onUpdateContact,
  onAddContact,
  onRemoveContact,
  maxContacts,
  error,
}: EmergencyContactGroupProps) {
  return (
    <fieldset className="emergency-contact-group">
      <legend className="emergency-contact-group__legend">
        Emergency Contacts
      </legend>

      {contacts.map((contact, index) => {
        const n = index + 1;
        return (
          <div key={index} className="emergency-contact-group__contact">
            <div className="emergency-contact-group__field">
              <label htmlFor={`contact-${n}-name`}>Contact {n} Name</label>
              <input
                type="text"
                id={`contact-${n}-name`}
                value={contact.name}
                maxLength={MAX_CONTACT_NAME_LENGTH}
                onChange={(e) =>
                  onUpdateContact(index, "name", e.target.value)
                }
              />
            </div>

            <div className="emergency-contact-group__field">
              <label htmlFor={`contact-${n}-relationship`}>
                Contact {n} Relationship
              </label>
              <input
                type="text"
                id={`contact-${n}-relationship`}
                value={contact.relationship}
                maxLength={MAX_RELATIONSHIP_LENGTH}
                onChange={(e) =>
                  onUpdateContact(index, "relationship", e.target.value)
                }
              />
            </div>

            <div className="emergency-contact-group__field">
              <label htmlFor={`contact-${n}-phone`}>Contact {n} Phone</label>
              <input
                type="tel"
                id={`contact-${n}-phone`}
                value={contact.phone}
                maxLength={MAX_PHONE_LENGTH}
                onChange={(e) =>
                  onUpdateContact(index, "phone", e.target.value)
                }
              />
            </div>

            {index > 0 && (
              <button
                type="button"
                className="emergency-contact-group__remove-btn"
                onClick={() => onRemoveContact(index)}
                aria-label={`Remove contact ${n}`}
              >
                Remove
              </button>
            )}
          </div>
        );
      })}

      {contacts.length < maxContacts && (
        <button
          type="button"
          className="emergency-contact-group__add-btn"
          onClick={onAddContact}
        >
          Add another contact
        </button>
      )}

      {error && (
        <p className="emergency-contact-group__error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
