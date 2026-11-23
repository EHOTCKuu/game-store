import { useCallback, useMemo, useState } from 'react';
import styles from './GameImage.module.scss';

interface GameImageProps {
  cover: string;
  coverFallback?: string;
  title: string;
  gradient: string;
  className?: string;
  showBackground?: boolean;
}

const MAX_ATTEMPTS_PER_SOURCE = 2;

const RETRY_DELAY_MS = 700;

function GameImageContent({
  cover,
  coverFallback,
  title,
  gradient,
  className = '',
  showBackground = false,
}: GameImageProps) {
  const sources = useMemo(
    () => [cover, coverFallback].filter((src): src is string => Boolean(src)),
    [cover, coverFallback],
  );

  const [sourceIndex, setSourceIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const src = sources[Math.min(sourceIndex, sources.length - 1)];
  const hasError = isFailed || !src;

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {

    if (attempt + 1 < MAX_ATTEMPTS_PER_SOURCE) {
      window.setTimeout(() => setAttempt((value) => value + 1), RETRY_DELAY_MS);
      return;
    }

    if (sourceIndex + 1 < sources.length) {
      setSourceIndex((value) => value + 1);
      setAttempt(0);
      return;
    }

    setIsFailed(true);
  }, [attempt, sourceIndex, sources.length]);

  if (hasError) {
    return (
      <div className={`${styles.container} ${className}`} style={{ background: gradient }}>
        <div className={styles.fallback}>{title.charAt(0).toUpperCase()}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`} style={{ background: gradient }}>
      {showBackground && isLoaded && (
        <div className={styles.background} style={{ backgroundImage: `url("${src}")` }} />
      )}

      <div className={styles.fallback}>{title.charAt(0).toUpperCase()}</div>

      <img
        key={`${src}#${attempt}`}
        src={src}
        alt={title}
        className={styles.image}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
        onError={handleError}
        style={{ opacity: isLoaded ? 1 : 0 }}
      />
    </div>
  );
}

export const GameImage = (props: GameImageProps) => (
  <GameImageContent key={props.cover} {...props} />
);