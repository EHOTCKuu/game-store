import { useState } from 'react';
import styles from './GameImage.module.scss';

interface GameImageProps {
  cover: string;
  title: string;
  gradient: string;
  className?: string;
  showBackground?: boolean;
}

export const GameImage = ({ cover, title, gradient, className = '', showBackground = false }: GameImageProps) => {
  const [hasError, setHasError] = useState(false);

  if (!cover || hasError) {
    return (
      <div className={`${styles.container} ${className}`} style={{ background: gradient }}>
        <div className={styles.fallback}>{title.charAt(0).toUpperCase()}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`} style={{ background: gradient }}>
      {showBackground && (
        <div className={styles.background} style={{ backgroundImage: `url(${cover})` }} />
      )}

      <div className={styles.fallback}>
        {title.charAt(0).toUpperCase()}
      </div>

      <img
        src={cover}
        alt={title}
        className={styles.image}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
};