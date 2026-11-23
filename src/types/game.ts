export interface RawGame {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
  freetogame_profile_url: string;
  game_url: string;
}

export type GameGenre =
  | 'action'
  | 'rpg'
  | 'strategy'
  | 'shooter'
  | 'adventure'
  | 'simulation'
  | 'horror'
  | 'racing'
  | 'other';

export interface Game {
  id: string;
  title: string;
  genre: GameGenre;
  description: string;
  price: number;
  oldPrice?: number;
  rating: number;
  releaseYear: number;
  cover: string;
  tags: string[];
  gameUrl: string;
  gradient: string;
  coverFallback?: string;
}

export interface CartItem {
  gameId: string;
  title: string;
  price: number;
  cover: string;
  quantity: number;
}

export type SortOption = 'default' | 'priceAsc' | 'priceDesc' | 'rating' | 'titleAsc' | 'titleDesc';