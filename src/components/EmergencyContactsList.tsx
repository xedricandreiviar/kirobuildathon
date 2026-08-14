import { EmergencyContact } from '../utils/apiClient';
import styles from './EmergencyContactsList.module.css';

interface EmergencyContactsListProps {
  contacts: EmergencyContact[];
}

export default function EmergencyContactsList({ contacts }: EmergencyContactsListProps) {
  if (contacts.length === 0) {
    return null;
  }

  return (
    <section className={styles.contactsSection} aria-label="Emergency contacts">
      <p className={styles.sectionLabel}>Emergency Contacts</p>
      <ul className={styles.contactsList}>
        {contacts.map((contact, index) => (
          <li key={index} className={styles.contactItem}>
            <span className={styles.contactName}>{contact.name}</span>
            <span className={styles.contactRelationship}>{contact.relationship}</span>
            {contact.phone && contact.phone.trim() !== '' ? (
              <a
                href={`tel:${contact.phone}`}
                className={styles.contactPhone}
              >
                {contact.phone}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
