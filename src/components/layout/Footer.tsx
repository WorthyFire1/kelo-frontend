import { Instagram, Send, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/Container';

export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="logo logo--footer" to="/">
              <span>КЕЛО</span>
              <small>дерево с характером</small>
            </Link>
            <p>Резные пряничные формы, сервировочные доски и изделия из дерева собственного производства.</p>
            <div className="social-links">
              <a href="#" aria-label="Telegram"><Send size={19} /></a>
              <a href="#" aria-label="ВКонтакте"><MessageCircle size={19} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={19} /></a>
            </div>
          </div>
          <div>
            <h3>Покупателям</h3>
            <Link to="/catalog">Каталог</Link>
            <Link to="/promotions">Акции</Link>
            <Link to="/delivery">Доставка и оплата</Link>
            <Link to="/favorites">Избранное</Link>
          </div>
          <div>
            <h3>О КЕЛО</h3>
            <Link to="/about">О производстве</Link>
            <Link to="/custom-order">Изделия на заказ</Link>
            <Link to="/blog">Блог</Link>
            <Link to="/brands">Бренды</Link>
          </div>
          <div>
            <h3>Контакты</h3>
            <a href="tel:+79138430005">8-913-843-0005</a>
            <a href="mailto:kelo_creates@mail.ru">kelo_creates@mail.ru</a>
            <span>Пн–Пт, 09:00–18:00</span>
            <Link to="/contacts">Написать нам</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} КЕЛО</span>
          <div>
            <Link to="/policies/privacy">Политика конфиденциальности</Link>
            <Link to="/policies/offer">Публичная оферта</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
