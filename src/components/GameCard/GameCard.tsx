import { useState } from 'react';
import type { Game } from '../../types/game';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart, removeFromCart, updateQuantity } from '../../features/cart/cartSlice';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import { GameDetailsModal } from '../GameDetailsModal/GameDetailsModal';
import { GameImage } from '../GameImage/GameImage';
import styles from './GameCard.module.scss';

interface GameCardProps {
  game: Game;
}

export const GameCard = ({ game }: GameCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  
  const cartItem = useAppSelector((state) => 
    state.cart.items.find((item) => item.gameId === game.id)
  );

  const handleAddToCart = () => dispatch(addToCart(game));
  const handleIncrease = () => {
    if (cartItem) dispatch(updateQuantity({ gameId: game.id, quantity: cartItem.quantity + 1 }));
  };
  const handleDecrease = () => {
    if (cartItem) {
      if (cartItem.quantity === 1) dispatch(removeFromCart(game.id));
      else dispatch(updateQuantity({ gameId: game.id, quantity: cartItem.quantity - 1 }));
    }
  };

  return (
    <>
      <div className={styles.card} style={{ background: game.gradient }}>
        <div className={styles.imageWrapper} onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
          <GameImage 
            cover={game.cover} 
            title={game.title} 
            gradient={game.gradient} 
          />
        </div>
        
        <div className={styles.content}>
          <div className={styles.header}>
            <h3 className={styles.title} onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
              {game.title}
            </h3>
            <span className={styles.rating}>★ {game.rating}</span>
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
              <Button onClick={handleAddToCart} className={styles.addToCartBtn}>
                В корзину
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <GameDetailsModal game={game} />
      </Modal>
    </>
  );
};