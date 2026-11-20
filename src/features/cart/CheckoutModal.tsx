import { useForm } from 'react-hook-form';
import { useAppSelector } from '../../store/hooks';
import { selectCartTotal } from './cartSlice';
import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal/Modal';
import styles from './CheckoutModal.module.scss';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CheckoutFormData {
  name: string;
  email: string;
}

export const CheckoutModal = ({ isOpen, onClose }: CheckoutModalProps) => {
  const total = useAppSelector(selectCartTotal);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>();

  const onSubmit = (data: CheckoutFormData) => {
    // Имитация отправки заказа на сервер (setTimeout)
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        alert(`Заказ оформлен!\nИмя: ${data.name}\nEmail: ${data.email}\nСумма: ${total} ₽`);
        reset();
        onClose();
        resolve();
      }, 800);
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.checkout}>
        <h2>Оформление заказа</h2>
        <p className={styles.totalInfo}>Сумма к оплате: <strong>{total} ₽</strong></p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">Ваше имя</label>
            <input
              id="name"
              type="text"
              placeholder="Иван Иванов"
              {...register('name', { required: 'Введите имя' })}
              className={errors.name ? styles.inputError : ''}
            />
            {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="ivan@example.com"
              {...register('email', { 
                required: 'Введите email',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Некорректный email'
                }
              })}
              className={errors.email ? styles.inputError : ''}
            />
            {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
          </div>

          <Button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
            {isSubmitting ? 'Отправка...' : 'Оплатить'}
          </Button>
        </form>
      </div>
    </Modal>
  );
};