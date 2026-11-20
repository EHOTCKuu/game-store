import styles from './Skeleton.module.scss';

export const Skeleton = ({ className = '' }: { className?: string }) => {
  return <div className={`${styles.skeleton} ${className}`.trim()} />;
};