import type { Game } from '../../types/game';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart, removeFromCart, updateQuantity } from '../../features/cart/cartSlice';
import { Button } from '../Button/Button';
import styles from './GameDetailsModal.module.scss';

interface GameDetailsModalProps {
  game: Game;
}

export const GameDetailsModal = ({ game }: GameDetailsModalProps) => {
  const dispatch = useAppDispatch();
  
  const cartItem = useAppSelector((state) => 
    state.cart.items.find((item) => item.gameId === game.id)
  );

  const coverUrl = new URL(`../../assets/covers/${game.cover}`, import.meta.url).href;

  const handleAddToCart = () => {
    dispatch(addToCart(game));
  };

  const handleIncrease = () => {
    if (cartItem) {
      dispatch(updateQuantity({ gameId: game.id, quantity: cartItem.quantity + 1 }));
    }
  };

  const handleDecrease = () => {
    if (cartItem) {
      if (cartItem.quantity === 1) {
        dispatch(removeFromCart(game.id));
      } else {
        dispatch(updateQuantity({ gameId: game.id, quantity: cartItem.quantity - 1 }));
      }
    }
  };

  return (
    <div className={styles.details}>
      <img src={coverUrl} alt={game.title} className={styles.cover} />
      
      <div className={styles.info}>
        <div className={styles.header}>
          <h2>{game.title}</h2>
          <span className={styles.rating}>★ {game.rating}</span>
        </div>
        
        <div className={styles.tags}>
          {game.tags.map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
        
        <p className={styles.description}>{game.description}</p>
        
        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            {game.oldPrice && <span className={styles.oldPrice}>{game.oldPrice} ₽</span>}
            <span className={styles.price}>{game.price} ₽</span>
          </div>

          {cartItem ? (
            <div className={styles.counter}>
              <button className={styles.counterBtn} onClick={handleDecrease}>-</button>
              <span className={styles.counterValue}>{cartItem.quantity}</span>
              <button className={styles.counterBtn} onClick={handleIncrease}>+</button>
            </div>
          ) : (
            <Button onClick={handleAddToCart}>В корзину</Button>
          )}
        </div>
      </div>
    </div>
  );
};