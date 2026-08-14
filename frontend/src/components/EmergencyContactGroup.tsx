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
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
      <div className="border-b border-outline-variant pb-4 mb-6 flex justify-between items-center">
        <h2 className="text-headline-sm text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant">contact_phone</span>
          Emergency Contacts
        </h2>
      </div>

      <div className="space-y-[16px]">
        {contacts.map((contact, index) => {
          const n = index + 1;
          return (
            <div key={index} className="bg-surface-bright border border-outline-variant rounded p-4 relative group">
              {index > 0 && (
                <button
                  type="button"
                  className="absolute top-2 right-2 material-symbols-outlined text-outline hover:text-secondary transition-colors"
                  onClick={() => onRemoveContact(index)}
                  aria-label={`Remove contact ${n}`}
                  title="Remove Contact"
                >
                  delete
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1" htmlFor={`contact-${n}-name`}>
                    Name
                  </label>
                  <input
                    type="text"
                    id={`contact-${n}-name`}
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline"
                    value={contact.name}
                    maxLength={MAX_CONTACT_NAME_LENGTH}
                    onChange={(e) => onUpdateContact(index, "name", e.target.value)}
                    placeholder="Contact Name"
                  />
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1" htmlFor={`contact-${n}-relationship`}>
                    Relationship
                  </label>
                  <input
                    type="text"
                    id={`contact-${n}-relationship`}
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline"
                    value={contact.relationship}
                    maxLength={MAX_RELATIONSHIP_LENGTH}
                    onChange={(e) => onUpdateContact(index, "relationship", e.target.value)}
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-label-sm text-on-surface-variant mb-1" htmlFor={`contact-${n}-phone`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id={`contact-${n}-phone`}
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline"
                    value={contact.phone}
                    maxLength={MAX_PHONE_LENGTH}
                    onChange={(e) => onUpdateContact(index, "phone", e.target.value)}
                    placeholder="+63 XXX XXX XXXX"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {contacts.length < maxContacts && (
        <button
          type="button"
          className="mt-4 flex items-center justify-center gap-2 w-full h-12 border-2 border-dashed border-outline-variant rounded text-on-surface-variant hover:border-primary hover:text-primary hover:bg-surface-container-low transition-colors text-label-md"
          onClick={onAddContact}
        >
          <span className="material-symbols-outlined">add</span>
          Add another contact
        </button>
      )}

      {error && (
        <p className="text-error text-label-sm mt-2" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
