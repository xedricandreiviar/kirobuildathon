import React from 'react';
import { Card } from '../utils/apiClient';
import styles from './CardPreview.module.css';

interface CardPreviewProps {
  card: Card;
}

const CardPreview = React.forwardRef<HTMLDivElement, CardPreviewProps>(
  ({ card }, ref) => {
    const hasAllergies = card.allergies.length > 0;
    const hasConditions = card.conditions.length > 0;
    const hasMedications = card.medications.length > 0;
    const hasEmergencyContacts = card.emergencyContacts.length > 0;
    const hasNotes = card.notes.trim() !== '';

    return (
      <div className={styles.card} ref={ref}>
        <h2 className={styles.fullName}>{card.fullName}</h2>

        <div className={styles.criticalSection}>
          <p className={styles.fieldLabel}>Blood Type</p>
          <p className={styles.bloodType}>{card.bloodType || 'Not specified'}</p>

          {hasAllergies && (
            <>
              <p className={styles.fieldLabel}>Allergies</p>
              <p className={styles.allergies}>{card.allergies.join(', ')}</p>
            </>
          )}
        </div>

        {hasConditions && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Conditions</p>
            <ul className={styles.list}>
              {card.conditions.map((condition, index) => (
                <li key={index} className={styles.listItem}>
                  {condition}
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasMedications && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Medications</p>
            <ul className={styles.list}>
              {card.medications.map((medication, index) => (
                <li key={index} className={styles.listItem}>
                  {medication}
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasEmergencyContacts && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Emergency Contacts</p>
            {card.emergencyContacts.map((contact, index) => (
              <div key={index} className={styles.contact}>
                <p className={styles.contactName}>{contact.name}</p>
                <p className={styles.contactRelationship}>
                  {contact.relationship}
                </p>
                {contact.phone && (
                  <p className={styles.contactPhone}>{contact.phone}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {hasNotes && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Notes</p>
            <p className={styles.sectionContent}>{card.notes}</p>
          </div>
        )}
      </div>
    );
  }
);

CardPreview.displayName = 'CardPreview';

export default CardPreview;
