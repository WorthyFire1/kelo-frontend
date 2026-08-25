import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';

export function PromoSplit() {
  return (
    <section className="section directions-section">
      <Container>
        <div className="directions-section__heading">
          <span className="eyebrow">Направления КЕЛО</span>
          <h2>Выберите своё изделие</h2>
        </div>
        <div className="direction-grid">
          <article className="direction-card">
            <ImagePlaceholder alt="Кухонная утварь и принадлежности из дерева" label="Изделия для кухни" />
            <div className="direction-card__content">
              <h3>Кухонная утварь и принадлежности из дерева</h3>
              <p>Природа вдохновляет на творчество, дерево сохраняет тепло ваших рук, чтобы вы могли делиться им с теми, кто вам по-настоящему дорог.</p>
              <Link to="/catalog?category=kitchenware">Перейти в каталог <ArrowRight size={18} /></Link>
            </div>
          </article>
          <article className="direction-card">
            <ImagePlaceholder alt="Сувениры, творчество и декор" label="Рыцарь — два варианта" />
            <div className="direction-card__content">
              <h3>Сувениры, творчество и декор</h3>
              <p>Мы бережно вытачиваем форму из природного материала, чтобы вы могли вдохнуть в неё характер, раскрасить своё неповторимое творение, оставив на память себе или подарив близким.</p>
              <Link to="/catalog?category=souvenirs-decor">Посмотреть рыцарей <ArrowRight size={18} /></Link>
            </div>
          </article>
          <article className="direction-card">
            <ImagePlaceholder alt="3D-фасады для мебели" label="3D-фасад «Бык»" />
            <div className="direction-card__content">
              <h3>3D-фасады для мебели</h3>
              <p>Стирая границы плоских поверхностей: мы создаём архитектурные 3D-фасады, чтобы вы могли раскрыть весь потенциал корпусной мебели и наполнить интерьер объёмом, глубиной и стилем.</p>
              <Link to="/catalog?category=facades-3d">Посмотреть фасад <ArrowRight size={18} /></Link>
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}
