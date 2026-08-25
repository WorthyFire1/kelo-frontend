import { useState, type FormEvent } from 'react';
import { Heart, Menu, Search, ShieldCheck, ShoppingBag, UserRound, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Container } from '@/components/ui/Container';

const navItems = [
  { label: 'Каталог', to: '/catalog' },
  { label: 'На заказ', to: '/custom-order' },
  { label: 'Акции', to: '/promotions' },
  { label: 'Блог', to: '/blog' },
  { label: 'Бренды', to: '/brands' },
  { label: 'Доставка и оплата', to: '/delivery' },
  { label: 'О нас', to: '/about' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const favoritesCount = useFavoritesStore((state) => state.productIds.length);
  const user = useAuthStore((state) => state.user);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    navigate(`/search?q=${encodeURIComponent(value)}`);
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="topbar">
        <Container className="topbar__inner">
          <span>Доставка по всей России</span>
          <span>Собственное производство</span>
          <a href="tel:+79138430005">8-913-843-0005</a>
        </Container>
      </div>
      <Container className="header-main">
        <button className="mobile-menu-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Открыть меню">
          <Menu />
        </button>
        <Link className="logo" to="/" aria-label="КЕЛО — на главную">
          <span>КЕЛО</span>
          <small>дерево с характером</small>
        </Link>
        <form className="header-search" onSubmit={submitSearch}>
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по каталогу"
            aria-label="Поиск по каталогу"
          />
          <button type="submit">Найти</button>
        </form>
        <div className="header-actions">
          <button className="header-action header-action--search" type="button" onClick={() => setSearchOpen((open) => !open)} aria-label="Открыть поиск">
            <Search />
          </button>
          <Link className="header-action" to="/favorites" aria-label="Избранное">
            <Heart />
            {favoritesCount > 0 && <span>{favoritesCount}</span>}
          </Link>
          <Link className="header-action" to="/account" aria-label="Личный кабинет">
            <UserRound />
          </Link>
          <Link className="header-action" to="/cart" aria-label="Корзина">
            <ShoppingBag />
            {cartCount > 0 && <span>{cartCount}</span>}
          </Link>
        </div>
      </Container>
      {searchOpen && (
        <Container>
          <form className="mobile-search" onSubmit={submitSearch}>
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Что вы ищете?" autoFocus />
            <button type="submit">Найти</button>
          </form>
        </Container>
      )}
      <nav className="desktop-nav" aria-label="Основная навигация">
        <Container className="desktop-nav__inner">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>{item.label}</NavLink>
          ))}
          {user?.isAdmin && <Link className="desktop-nav__admin" to="/admin"><ShieldCheck size={16} /> Админ-панель</Link>}
          <Link className="desktop-nav__cta" to="/contacts">Связаться с нами</Link>
        </Container>
      </nav>
      <div className={`mobile-drawer ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <button className="mobile-drawer__overlay" type="button" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню" />
        <div className="mobile-drawer__panel">
          <div className="mobile-drawer__header">
            <strong>Меню</strong>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню"><X /></button>
          </div>
          <nav>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>
            ))}
            {user?.isAdmin && <NavLink className="mobile-drawer__admin" to="/admin" onClick={() => setMenuOpen(false)}><ShieldCheck size={17} /> Админ-панель</NavLink>}
            <NavLink to="/contacts" onClick={() => setMenuOpen(false)}>Контакты</NavLink>
          </nav>
          <a className="mobile-drawer__phone" href="tel:+79138430005">8-913-843-0005</a>
        </div>
      </div>
    </header>
  );
}
