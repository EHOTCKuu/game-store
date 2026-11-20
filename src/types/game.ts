export type GameGenre =
  | 'action'
  | 'rpg'
  | 'strategy'
  | 'shooter'
  | 'adventure'
  | 'simulation'
  | 'horror'
  | 'racing';

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
}

export interface CartItem {
  gameId: string;
  title: string;
  price: number;
  cover: string;
  quantity: number;
}

export type SortOption = 'default' | 'priceAsc' | 'priceDesc' | 'rating';