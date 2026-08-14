import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCard, Card, CardNotFoundError } from '../utils/apiClient';
import { exportCardAsImage } from '../utils/imageExport';
import { copyToClipboard } from '../utils/clipboardUtil';
import QRCodeDisplay from '../components/QRCodeDisplay';
import CardPreview from '../components/CardPreview';
import styles from './ResultPage.module.css';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();

  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<'not-found' | 'network' | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copyFailed, setCopyFailed] = useState<boolean>(false);

  const cardPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || id.trim() === '') {
      setError('not-found');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCard() {
      setLoading(true);
      setError(null);
      setCard(null);

      try {
        const data = await fetchCard(id!);
        if (!cancelled) {
          setCard(data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof CardNotFoundError) {
            setError('not-found');
          } else {
            setError('network');
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCard();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading} role="status" aria-label="Loading card data">
          <div className={styles.spinner} aria-hidden="true"></div>
          <p className={styles.loadingText}>Loading your card...</p>
        </div>
      </div>
    );
  }

  if (error === 'not-found') {
    return (
      <div className={styles.container}>
        <div className={styles.error} role="alert">
          <h1 className={styles.errorTitle}>Card not found</h1>
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
        <div className={styles.error} role="alert">
          <h1 className={styles.errorTitle}>Could not load card</h1>
          <p className={styles.errorMessage}>
            Something went wrong while loading your card data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  async function handleDownload() {
    if (!cardPreviewRef.current || !card) return;
    setDownloading(true);
    setDownloadError(false);
    try {
      await exportCardAsImage(cardPreviewRef.current, card.id);
    } catch {
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  }

  const publicUrl = card ? `${window.location.origin}/card/${card.id}` : '';

  async function handleCopyLink() {
    try {
      const success = await copyToClipboard(publicUrl);
      if (success) {
        setCopied(true);
        setCopyFailed(false);
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      } else {
        setCopyFailed(true);
      }
    } catch {
      setCopyFailed(true);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {card && (
          <QRCodeDisplay cardId={card.id} url={publicUrl} />
        )}
        {card && (
          <CardPreview card={card} ref={cardPreviewRef} />
        )}
        {card && (
          <div className={styles.actions}>
            <button
              className={styles.downloadButton}
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? 'Downloading...' : 'Download as image'}
            </button>
            {downloadError && (
              <p className={styles.downloadError} role="alert">
                Could not generate image
              </p>
            )}
            <button
              className={`${styles.copyButton} ${copied ? styles.copyButtonCopied : ''}`}
              onClick={handleCopyLink}
              type="button"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            {copyFailed && (
              <div className={styles.fallbackUrl}>
                <p className={styles.fallbackLabel}>Copy this link manually:</p>
                <span className={styles.fallbackText}>{publicUrl}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
