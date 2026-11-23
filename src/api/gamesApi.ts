import type { Game, RawGame, GameGenre } from '../types/game';

const API_URL = 'https://www.freetogame.com/api/games';

const API_TIMEOUT_MS = 15_000;
const API_ATTEMPTS = 3;        
const API_RETRY_DELAY_MS = 800; 

const COVER_WIDTH = 400;        
const COVER_QUALITY = 80;      


const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const BASE_URL = (() => {
  const raw = import.meta.env.BASE_URL || '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
})();

const buildLocalCoverUrl = (id: number) => `${BASE_URL}covers/${id}.webp`;

const buildProxyCoverUrl = (url: string) =>
  `https://images.weserv.nl/?url=${encodeURIComponent(url)}` +
  `&w=${COVER_WIDTH}&fit=cover&output=webp&q=${COVER_QUALITY}`;

async function fetchJson<T>(url: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= API_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;

      if (attempt < API_ATTEMPTS) {
        await sleep(API_RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Неизвестная ошибка');
}

const mapGenre = (rawGenre: string): GameGenre => {
  const g = rawGenre.toLowerCase();
  if (g.includes('shooter')) return 'shooter';
  if (g.includes('mmorpg') || g.includes('rpg')) return 'rpg';
  if (g.includes('strategy')) return 'strategy';
  if (g.includes('racing')) return 'racing';
  if (g.includes('action')) return 'action';
  if (g.includes('adventure')) return 'adventure';
  if (g.includes('simulation')) return 'simulation';
  if (g.includes('horror')) return 'horror';
  return 'other';
};

const generateRating = (id: number) => {
  return Number((3.5 + (id % 15) / 10).toFixed(1));
};

const generatePrice = (id: number, title: string) => {
  let hash = id;
  for (let i = 0; i < title.length; i++) {
    hash += title.charCodeAt(i);
  }
  const price = 499 + (hash % 21) * 100;
  return price - 1;
};

const generateGradient = (title: string) => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue1 = Math.abs(hash % 60) + 180;
  const hue2 = Math.abs((hash >> 8) % 60) + 240;

  return `linear-gradient(135deg, hsl(${hue1}, 70%, 20%) 0%, hsl(${hue2}, 80%, 10%) 100%)`;
};


const loadGames = async (): Promise<Game[]> => {
  const rawData = await fetchJson<RawGame[]>(API_URL);

  const shuffledData = [...rawData].sort(() => Math.random() - 0.5);

  return shuffledData.map((raw) => {
    const price = generatePrice(raw.id, raw.title);
    const year = raw.release_date ? new Date(raw.release_date).getFullYear() : 2024;

    const originalCoverUrl = raw.thumbnail
      ? raw.thumbnail.replace(/^http:\/\//i, 'https://')
      : '';

    const cover = originalCoverUrl ? buildLocalCoverUrl(raw.id) : '';
    const coverFallback = originalCoverUrl ? buildProxyCoverUrl(originalCoverUrl) : '';

    return {
      id: String(raw.id),
      title: raw.title,
      genre: mapGenre(raw.genre),
      description: raw.short_description,
      price,
      oldPrice: price + 500,
      rating: generateRating(raw.id),
      releaseYear: year,
      cover,
      coverFallback,
      gradient: generateGradient(raw.title),
      tags: [raw.platform, raw.publisher],
      gameUrl: raw.game_url,
    };
  });
};

let gamesPromise: Promise<Game[]> | null = null;

export const fetchGames = (): Promise<Game[]> => {
  if (!gamesPromise) {
    gamesPromise = loadGames().catch((error) => {
      gamesPromise = null;
      throw error;
    });
  }

  return gamesPromise;
};