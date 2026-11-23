import { describe, it, expect } from 'vitest';
import cartReducer, { addToCart, removeFromCart, applyPromoCode, selectCartTotal } from './cartSlice';
import type { Game } from '../../types/game';

const mockGame: Game = {
  id: '1',
  title: 'Test Game',
  genre: 'action',
  description: 'desc',
  price: 1000,
  rating: 5,
  releaseYear: 2024,
  cover: 'url',
  gradient: 'grad',
  tags: [],
  gameUrl: '',
};

describe('cartSlice', () => {
  it('должен добавлять игру в корзину', () => {
    const initialState = { items: [], promoCode: null };
    const newState = cartReducer(initialState, addToCart(mockGame));
    expect(newState.items).toHaveLength(1);
    expect(newState.items[0].gameId).toBe('1');
  });

  it('должен удалять игру из корзины', () => {
    let state = cartReducer({ items: [], promoCode: null }, addToCart(mockGame));
    state = cartReducer(state, removeFromCart('1'));
    expect(state.items).toHaveLength(0);
  });

  it('должен применять скидку GAME10', () => {
    let state = cartReducer({ items: [], promoCode: null }, addToCart(mockGame));
    state = cartReducer(state, applyPromoCode('GAME10'));
    
    expect(selectCartTotal({ cart: state })).toBe(900);
  });
});