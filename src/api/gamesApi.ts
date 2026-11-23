import type { Game, RawGame, GameGenre } from '../types/game';

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

export const fetchGames = async (): Promise<Game[]> => {
  const response = await fetch('https://www.freetogame.com/api/games');
  
  if (!response.ok) {
    throw new Error('Не удалось загрузить игры. Попробуйте позже.');
  }

  const rawData: RawGame[] = await response.json();
  const shuffledData = rawData.sort(() => Math.random() - 0.5);

  return shuffledData.map((raw) => {
    const price = generatePrice(raw.id, raw.title);
    const year = raw.release_date ? new Date(raw.release_date).getFullYear() : 2024;

    let secureCoverUrl = raw.thumbnail 
      ? raw.thumbnail.replace(/^http:\/\//i, 'https://') 
      : '';

    // ПРОКСИ ДЛЯ КАРТИНОК
    if (secureCoverUrl) {
      const cleanUrl = secureCoverUrl.replace(/^https?:\/\//, '');
      secureCoverUrl = `https://images.weserv.nl/?url=${cleanUrl}&output=webp&n=-1`;
    }

    return {
      id: String(raw.id),
      title: raw.title,
      genre: mapGenre(raw.genre),
      description: raw.short_description,
      price: price,
      oldPrice: price + 500,
      rating: generateRating(raw.id),
      releaseYear: year,
      cover: secureCoverUrl, // <-- Теперь тут ссылка на прокси
      gradient: generateGradient(raw.title),
      tags: [raw.platform, raw.publisher],
      gameUrl: raw.game_url,
    };
  });
};