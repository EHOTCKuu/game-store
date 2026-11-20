import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Game } from '../../types/game';

interface CartState {
  items: CartItem[];
  promoCode: string | null;
}

// Пытаемся достать корзину из localStorage при старте
const loadCartFromStorage = (): CartItem[] => {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Не удалось прочитать корзину из localStorage', error);
    return [];
  }
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  promoCode: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Game>) => {
      const game = action.payload;
      const existingItem = state.items.find((item) => item.gameId === game.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          gameId: game.id,
          title: game.title,
          price: game.price,
          cover: game.cover,
          quantity: 1,
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.gameId !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ gameId: string; quantity: number }>) => {
      const { gameId, quantity } = action.payload;
      const item = state.items.find((i) => i.gameId === gameId);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },
    applyPromoCode: (state, action: PayloadAction<string>) => {
      if (action.payload.trim().toUpperCase() === 'GAME10') {
        state.promoCode = 'GAME10';
      } else {
        state.promoCode = null;
      }
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, applyPromoCode } = cartSlice.actions;

// Селектор для подсчета итоговой суммы с учетом скидки
export const selectCartTotal = (state: { cart: CartState }) => {
  const subtotal = state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (state.cart.promoCode === 'GAME10') {
    return Math.round(subtotal * 0.9); // 10% скидка
  }
  return subtotal;
};

export default cartSlice.reducer;