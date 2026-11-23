import { useState, useEffect, useRef } from 'react';
import styles from './GameImage.module.scss';

interface GameImageProps {
  cover: string;
  title: string;
  gradient: string;
  className?: string;
  showBackground?: boolean;
}

let isDownloading = false;
const downloadQueue: (() => void)[] = [];

const processQueue = () => {
  if (isDownloading || downloadQueue.length === 0) return;
  isDownloading = true;
  const next = downloadQueue.shift();
  if (next) {
    next();
    setTimeout(() => {
      isDownloading = false;
      processQueue();
    }, 300);
  }
};

export const GameImage = ({ cover, title, gradient, className = '', showBackground = false }: GameImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cover || hasError || isLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            downloadQueue.push(() => {
              const img = new Image();
              img.onload = () => {
                setIsLoaded(true);
                setHasError(false);
              };
              img.onerror = () => {
                setHasError(true);
              };
              img.src = cover;
            });
            processQueue();
            
            if (containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        });
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [cover, hasError, isLoaded]);

  if (!cover || hasError) {
    return (
      <div className={`${styles.container} ${className}`} style={{ background: gradient }}>
        <div className={styles.fallback}>{title.charAt(0).toUpperCase()}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`} style={{ background: gradient }} ref={containerRef}>
      {showBackground && isLoaded && (
        <div className={styles.background} style={{ backgroundImage: `url(${cover})` }} />
      )}

      <div className={styles.fallback}>
        {title.charAt(0).toUpperCase()}
      </div>

      {isLoaded && (
        <img
          src={cover}
          alt={title}
          className={styles.image}
        />
      )}
    </div>
  );
};