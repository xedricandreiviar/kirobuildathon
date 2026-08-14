import { useEffect, useState } from 'react';
import { generateQRDataURL } from '../utils/qrGenerator';
import styles from './QRCodeDisplay.module.css';

interface QRCodeDisplayProps {
  cardId: string;
  url: string;
}

export default function QRCodeDisplay({ cardId: _cardId, url }: QRCodeDisplayProps) {
  void _cardId;
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      setLoading(true);
      setError(false);
      setQrDataUrl(null);

      try {
        const dataUrl = await generateQRDataURL(url);
        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    generate();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return (
      <div className={styles.qrContainer}>
        <div className={styles.loading} role="status" aria-label="Generating QR code">
          <p>Generating QR code...</p>
        </div>
      </div>
    );
  }

  if (error || !qrDataUrl) {
    return (
      <div className={styles.qrContainer}>
        <div className={styles.error} role="alert">
          <p className={styles.errorText}>Failed to generate QR code.</p>
          <span className={styles.fallbackUrl}>{url}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.qrContainer}>
      <img
        src={qrDataUrl}
        alt="QR code linking to your emergency card"
        className={styles.qrImage}
        width={200}
        height={200}
      />
    </div>
  );
}
