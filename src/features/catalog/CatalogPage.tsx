import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Game, GameGenre, SortOption } from '../../types/game';
import { fetchGames } from '../../api/gamesApi';
import { GameCard } from '../../components/GameCard/GameCard';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import styles from './CatalogPage.module.scss';

const GENRES: { value: GameGenre | 'all'; label: string }[] = [
  { value: 'all', label: 'Все жанры' },
  { value: 'action', label: 'Экшен' },
  { value: 'rpg', label: 'РПГ' },
  { value: 'strategy', label: 'Стратегии' },
  { value: 'shooter', label: 'Шутеры' },
  { value: 'adventure', label: 'Приключения' },
  { value: 'simulation', label: 'Симуляторы' },
  { value: 'horror', label: 'Хорроры' },
  { value: 'racing', label: 'Гонки' },
];

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const currentGenre = (searchParams.get('genre') as GameGenre | 'all') || 'all';
  const currentSort = (searchParams.get('sort') as SortOption) || 'default';
  const currentSearch = searchParams.get('q') || '';

  useEffect(() => {
    const loadGames = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 400));
        const data = await fetchGames();
        setAllGames(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadGames();
  }, []);

  const updateParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'default') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setVisibleCount(12);
  };

  useEffect(() => {
    if (searchInput === currentSearch) return;
    const timer = setTimeout(() => {
      updateParams('q', searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, currentSearch]);

  const filteredGames = useMemo(() => {
    let result = [...allGames];
    if (currentGenre !== 'all') result = result.filter((game) => game.genre === currentGenre);
    if (currentSearch) result = result.filter((game) => game.title.toLowerCase().includes(currentSearch.toLowerCase()));
    switch (currentSort) {
      case 'priceAsc': result.sort((a, b) => a.price - b.price); break;
      case 'priceDesc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'titleAsc': result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'titleDesc': result.sort((a, b) => b.title.localeCompare(a.title)); break;
    }
    return result;
  }, [allGames, currentGenre, currentSort, currentSearch]);

  if (error) {
    return (
      <div className={styles.empty}>
        <h2>Ошибка загрузки</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.loadMoreBtn} style={{ marginTop: '16px' }}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className={styles.catalogPage}>
      <div className={styles.controls}>
        <input type="text" className={styles.searchInput} placeholder="Поиск по названию..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <select className={styles.select} value={currentGenre} onChange={(e) => updateParams('genre', e.target.value)}>
          {GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <select className={styles.select} value={currentSort} onChange={(e) => updateParams('sort', e.target.value)}>
          <option value="default">По умолчанию</option>
          <option value="priceAsc">Сначала дешевле</option>
          <option value="priceDesc">Сначала дороже</option>
          <option value="rating">По рейтингу</option>
          <option value="titleAsc">По алфавиту (А-Я)</option>
          <option value="titleDesc">По алфавиту (Я-А)</option>
        </select>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className={styles.cardSkeleton} />)}
        </div>
      ) : filteredGames.length > 0 ? (
        <>
          <div className={styles.grid}>
            {filteredGames.slice(0, visibleCount).map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
          {visibleCount < filteredGames.length && (
            <div className={styles.loadMoreWrapper}>
              <button className={styles.loadMoreBtn} onClick={() => setVisibleCount(prev => prev + 12)}>
                Показать еще
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.empty}>По вашему запросу ничего не найдено.</div>
      )}
    </div>
  );
};