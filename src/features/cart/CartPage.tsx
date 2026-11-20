import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { removeFromCart, updateQuantity, applyPromoCode, selectCartTotal } from './cartSlice';
import { Button } from '../../components/Button/Button';
import { CheckoutModal } from './CheckoutModal';
import styles from './CartPage.module.scss';

export const CartPage = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const promoCode = useAppSelector((state) => state.cart.promoCode);
  const total = useAppSelector(selectCartTotal);

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleApplyPromo = () => {
    if (promoInput.trim().toUpperCase() === 'GAME10') {
      dispatch(applyPromoCode('GAME10'));
      setPromoError('');
    } else {
      setPromoError('Неверный промокод');
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>Корзина пуста</h2>
        <p>Самое время найти что-нибудь интересное.</p>
        <Link to="/">
          <Button variant="primary">В каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles.itemsList}>
        {items.map((item) => {
          const coverUrl = new URL(`../../assets/covers/${item.cover}`, import.meta.url).href;

          return (
            <div key={item.gameId} className={styles.cartItem}>
              <img src={coverUrl} alt={item.title} className={styles.image} />
              
              <div className={styles.itemInfo}>
                <h3>{item.title}</h3>
                <span className={styles.price}>{item.price} ₽</span>
              </div>

              <div className={styles.quantityControls}>
                <button 
                  className={styles.quantityBtn}
                  onClick={() => dispatch(updateQuantity({ gameId: item.gameId, quantity: item.quantity - 1 }))}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  className={styles.quantityBtn}
                  onClick={() => dispatch(updateQuantity({ gameId: item.gameId, quantity: item.quantity + 1 }))}
                >
                  +
                </button>
              </div>

              <div className={styles.itemTotal}>
                {item.price * item.quantity} ₽
              </div>

              <button 
                className={styles.removeBtn}
                onClick={() => dispatch(removeFromCart(item.gameId))}
                title="Удалить из корзины"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.summary}>
        <h2>Итого</h2>
        
        <div className={styles.promoBlock}>
          <input
            type="text"
            placeholder="Промокод"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            className={styles.promoInput}
          />
          <Button variant="outline" onClick={handleApplyPromo}>
            Применить
          </Button>
        </div>
        
        {promoError && <span className={styles.errorText}>{promoError}</span>}
        {promoCode && <span className={styles.successText}>Промокод {promoCode} применен!</span>}

        <div className={styles.totalRow}>
          <span>Сумма:</span>
          <span>{total} ₽</span>
        </div>
        
        <Button 
          className={styles.checkoutBtn} 
          variant="primary"
          onClick={() => setIsCheckoutOpen(true)}
        >
          Оформить заказ
        </Button>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  );
};