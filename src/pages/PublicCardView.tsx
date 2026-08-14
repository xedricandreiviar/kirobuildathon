import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCard, Card, CardNotFoundError } from '../utils/apiClient';
import EmergencyContactsList from '../components/EmergencyContactsList';
import styles from './PublicCardView.module.css';

type ErrorType = 'not-found' | 'network' | null;

export default function PublicCardView() {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ErrorType>(null);

  const loadCard = useCallback(async () => {
    if (!id || id.trim() === '') {
      setLoading(false);
      setError('not-found');
      return;
    }

    setLoading(true);
    setError(null);
    setCard(null);

    try {
      const data = await fetchCard(id);
      setCard(data);
      setError(null);
    } catch (err) {
      if (err instanceof CardNotFoundError) {
        setError('not-found');
      } else {
        setError('network');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  const handleRetry = () => {
    loadCard();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading} role="status" aria-label="Loading">
          <div className={styles.spinner} aria-hidden="true" />
          <p className={styles.loadingText}>Loading emergency card...</p>
        </div>
      </div>
    );
  }

  if (error === 'not-found') {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <span className={styles.errorIcon} aria-hidden="true">🔍</span>
          <h1 className={styles.errorTitle}>Emergency card not found</h1>
          <p className={styles.errorMessage}>
            This card does not exist or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  if (error === 'network') {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <span className={styles.errorIcon} aria-hidden="true">⚠️</span>
          <h1 className={styles.errorTitle}>Could not load card</h1>
          <p className={styles.errorMessage}>
            There was a problem connecting to the server. Please check your connection and try again.
          </p>
          <button
            className={styles.retryButton}
            onClick={handleRetry}
            type="button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!card) {
    return null;
  }

  const displayBloodType = card.bloodType || 'Not specified';
  const displayAllergies =
    card.allergies.length > 0 ? card.allergies.join(', ') : 'None reported';

  return (
    <div className={styles.container}>
      <div className={styles.cardContent}>
        {/* Header: Full Name */}
        <h1 className={styles.cardName}>{card.fullName}</h1>

        {/* Critical Info Section */}
        <section className={styles.criticalSection} aria-label="Critical medical information">
          <p className={styles.criticalLabel}>Blood Type</p>
          <p className={styles.bloodType}>{displayBloodType}</p>
          <p className={styles.criticalLabel}>Allergies</p>
          <p className={styles.allergies}>{displayAllergies}</p>
        </section>

        {/* Medical Details Section */}
        {(card.conditions.length > 0 || card.medications.length > 0) && (
          <section className={styles.medicalSection} aria-label="Medical details">
            {card.conditions.length > 0 && (
              <div className={styles.medicalCategory}>
                <p className={styles.categoryLabel}>Conditions</p>
                <ul className={styles.medicalList}>
                  {card.conditions.map((condition, index) => (
                    <li key={index}>{condition}</li>
                  ))}
                </ul>
              </div>
            )}
            {card.medications.length > 0 && (
              <div className={styles.medicalCategory}>
                <p className={styles.categoryLabel}>Medications</p>
                <ul className={styles.medicalList}>
                  {card.medications.map((medication, index) => (
                    <li key={index}>{medication}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Notes Section */}
        {card.notes && card.notes.trim() !== '' && (
          <section className={styles.notesSection} aria-label="Additional notes">
            <p className={styles.notesLabel}>Notes</p>
            <p className={styles.notesText}>{card.notes}</p>
          </section>
        )}

        {/* Emergency Contacts Section */}
        {card.emergencyContacts.length > 0 && (
          <EmergencyContactsList contacts={card.emergencyContacts} />
        )}
      </div>
    </div>
  );
}
