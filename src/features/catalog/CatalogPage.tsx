import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Game, GameGenre, SortOption } from '../../types/game';
import gamesData from '../../data/games.json';
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
  
  // По умолчанию загрузка включена, чтобы при старте показать скелетоны
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  const currentGenre = (searchParams.get('genre') as GameGenre | 'all') || 'all';
  const currentSort = (searchParams.get('sort') as SortOption) || 'default';
  const currentSearch = searchParams.get('q') || '';

  // Имитация загрузки. Запускаем только ОДИН раз при монтировании страницы.
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // Встроенный debounce через useEffect для поля поиска
  useEffect(() => {
    if (searchInput === currentSearch) return;

    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (searchInput) {
        newParams.set('q', searchInput);
      } else {
        newParams.delete('q');
      }
      setSearchParams(newParams);
      setIsLoading(true); // Включаем скелетоны при применении фильтра
      setTimeout(() => setIsLoading(false), 400);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, currentSearch, searchParams, setSearchParams]);

  // Обновление обычных фильтров (жанр, сортировка)
  const updateParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'default') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setIsLoading(true); // Включаем скелетоны при смене фильтра
    setTimeout(() => setIsLoading(false), 400);
  };

  // Фильтрация и сортировка
  const filteredGames = useMemo(() => {
    let result = [...(gamesData as Game[])];

    if (currentGenre !== 'all') {
      result = result.filter((game) => game.genre === currentGenre);
    }

    if (currentSearch) {
      result = result.filter((game) =>
        game.title.toLowerCase().includes(currentSearch.toLowerCase())
      );
    }

    switch (currentSort) {
      case 'priceAsc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [currentGenre, currentSort, currentSearch]);

  return (
    <div className={styles.catalogPage}>
      <div className={styles.controls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск по названию..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        
        <select
          className={styles.select}
          value={currentGenre}
          onChange={(e) => updateParams('genre', e.target.value)}
        >
          {GENRES.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={currentSort}
          onChange={(e) => updateParams('sort', e.target.value)}
        >
          <option value="default">По умолчанию</option>
          <option value="priceAsc">Сначала дешевле</option>
          <option value="priceDesc">Сначала дороже</option>
          <option value="rating">По рейтингу</option>
        </select>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={styles.cardSkeleton} />
          ))}
        </div>
      ) : filteredGames.length > 0 ? (
        <div className={styles.grid}>
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>По вашему запросу ничего не найдено.</div>
      )}
    </div>
  );
};