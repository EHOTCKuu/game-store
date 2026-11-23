import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CatalogPage } from './features/catalog/CatalogPage';
import { CartPage } from './features/cart/CartPage';
import { useAppSelector } from './store/hooks';
import './App.css';

const Header = () => {
  const items = useAppSelector((state) => state.cart.items);
  const location = useLocation();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      backgroundColor: '#1e293b'
    }}>
      <Link to="/" style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d2ff' }}>
        GAME STORE
      </Link>
      <nav>
        <Link to="/" style={{ marginRight: '16px', fontWeight: location.pathname === '/' ? 'bold' : 'normal' }}>
          Каталог
        </Link>
        <Link to="/cart" style={{ fontWeight: location.pathname === '/cart' ? 'bold' : 'normal' }}>
          Корзина {totalItems > 0 && `(${totalItems})`}
        </Link>
      </nav>
    </header>
  );
};

function App() {
  return (
    <BrowserRouter basename="/game-store">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;