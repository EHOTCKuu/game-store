import { useState } from 'react';
import type { Game } from '../../types/game';
import styles from './GameImage.module.scss';

interface GameImageProps {
  game: Game;
  className?: string;
  showBackground?: boolean;
}

export const GameImage = ({ game, className = '', showBackground = false }: GameImageProps) => {
  const [retry, setRetry] = useState(0);

  if (!game.cover) {
    return (
      <div className={`${styles.container} ${className}`} style={{ background: game.gradient }}>
        <div className={styles.fallback}>{game.title.charAt(0).toUpperCase()}</div>
      </div>
    );
  }

  const srcUrl = retry > 0 
    ? `${game.cover}${game.cover.includes('?') ? '&' : '?'}retry=${retry}` 
    : game.cover;

  return (
    <div className={`${styles.container} ${className}`} style={{ background: game.gradient }}>
      {showBackground && (
        <div className={styles.background} style={{ backgroundImage: `url(${srcUrl})` }} />
      )}

      <div className={styles.fallback}>
        {game.title.charAt(0).toUpperCase()}
      </div>

      <img
        src={srcUrl}
        alt={game.title}
        className={styles.image}
        loading="lazy"
        onError={() => {
          if (retry < 5) {
            setRetry((prev) => prev + 1);
          } else {
            document.querySelectorAll(`img[src="${srcUrl}"]`).forEach((el) => {
               (el as HTMLElement).style.display = 'none';
            });
          }
        }}
      />
    </div>
  );
};