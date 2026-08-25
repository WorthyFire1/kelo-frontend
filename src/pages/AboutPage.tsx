import { BadgeCheck, Hand, Leaf, ScanLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function AboutPage() {
  useDocumentTitle('О нас');

  return (
    <>
      <Container className="page-shell">
        <Breadcrumbs items={[{ label: 'О нас' }]} />
        <section className="about-hero">
          <div>
            <span className="eyebrow">Производим сами</span>
            <h1>КЕЛО — дерево, рисунок и внимание к деталям</h1>
            <p>Мы создаём предметы, которые становятся частью семейных традиций: от первого печатного пряника до праздничной сервировки.</p>
          </div>
          <ImagePlaceholder alt="Команда и производство КЕЛО" label="Фотография производства" />
        </section>
        <section className="about-story">
          <div><strong>2019</strong><span>первые авторские формы</span></div>
          <div><strong>120+</strong><span>сюжетов в каталоге</span></div>
          <div><strong>5 000+</strong><span>выполненных заказов</span></div>
          <div><strong>18</strong><span>регионов с постоянными клиентами</span></div>
        </section>
        <section className="section section--compact about-text-grid">
          <div>
            <span className="eyebrow">Наша история</span>
            <h2>Начинали с одной формы для семейного праздника</h2>
          </div>
          <div>
            <p>Первый рисунок мы подготовили для домашнего печатного пряника. Оказалось, что сделать красивую форму недостаточно: важно правильно подобрать глубину, ширину линий и скругления, чтобы рисунок легко выходил из теста.</p>
            <p>Сегодня КЕЛО объединяет серийное производство и мастерскую индивидуальных заказов. Мы продолжаем тестировать новые сюжеты и совершенствовать технологию обработки дерева.</p>
          </div>
        </section>
        <section className="values-grid">
          <article><Leaf /><h3>Натуральные материалы</h3><p>Используем бук, дуб, ясень и безопасные покрытия.</p></article>
          <article><ScanLine /><h3>Точная резьба</h3><p>Настраиваем глубину и геометрию под реальное использование.</p></article>
          <article><Hand /><h3>Ручная доводка</h3><p>Шлифуем, проверяем кромки и очищаем каждое углубление.</p></article>
          <article><BadgeCheck /><h3>Контроль качества</h3><p>Не отправляем изделие, пока оно не пройдёт финальную проверку.</p></article>
        </section>
        <section className="about-cta">
          <div><span className="eyebrow">Есть идея?</span><h2>Создадим изделие специально для вас</h2><p>Расскажите о рисунке, событии или задаче — подскажем оптимальный формат.</p></div>
          <Link className="button button--primary" to="/custom-order">Обсудить заказ</Link>
        </section>
      </Container>
    </>
  );
}
