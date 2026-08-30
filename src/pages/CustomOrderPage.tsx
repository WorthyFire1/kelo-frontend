import { FileCheck2, MessageSquareText, PackageCheck, PencilRuler } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { RequestForm } from '@/components/forms/RequestForm';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const steps = [
  { icon: MessageSquareText, title: 'Обсуждаем идею', text: 'Получаем рисунок, фото или описание и уточняем размер изделия.' },
  { icon: PencilRuler, title: 'Готовим макет', text: 'Адаптируем детали под резьбу и согласуем визуальный эскиз.' },
  { icon: FileCheck2, title: 'Делаем образец', text: 'Проверяем глубину, чистоту линий и тестовый отпечаток.' },
  { icon: PackageCheck, title: 'Изготавливаем заказ', text: 'Финишно шлифуем, покрываем и надёжно упаковываем.' },
];

export function CustomOrderPage() {
  useDocumentTitle('Столярные изделия на заказ');

  return (
    <>
      <Container className="page-shell">
        <Breadcrumbs items={[{ label: 'Столярные изделия на заказ' }]} />
        <section className="custom-hero">
          <div>
            <span className="eyebrow">Полный цикл производства</span>
            <h1>Столярные изделия на заказ</h1>
            <p>Пряничная доска, логотип, семейный сюжет, подарок для события или небольшая серия для бренда.</p>
            <a className="button button--primary" href="#custom-form">Рассчитать проект</a>
          </div>
          <ImagePlaceholder alt="Индивидуальное производство КЕЛО" label="Фото индивидуального изделия" />
        </section>
        <section className="section section--compact">
          <div className="process-grid">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <article className="process-step" key={title}>
                <span>{index + 1}</span>
                <Icon />
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="custom-info-grid">
          <div>
            <span className="eyebrow">Что можно заказать</span>
            <h2>От одной формы до корпоративной серии</h2>
            <ul className="check-list">
              <li>Пряничные доски по рисунку или фотографии</li>
              <li>Формы с логотипом для кондитерских и брендов</li>
              <li>Менажницы и сервировочные доски необычной формы</li>
              <li>Подарочные наборы и упаковку</li>
              <li>Повторные партии по согласованному макету</li>
            </ul>
          </div>
          <div className="custom-price-card">
            <span>Ориентировочная стоимость</span>
            <strong>от 5 900 ₽</strong>
            <p>Точная цена зависит от размера, древесины, сложности рисунка и количества изделий.</p>
            <dl>
              <div><dt>Макет</dt><dd>от 2 дней</dd></div>
              <div><dt>Производство</dt><dd>10–20 дней</dd></div>
              <div><dt>Тираж</dt><dd>от 1 штуки</dd></div>
            </dl>
          </div>
        </section>
      </Container>
      <section className="section section--soft" id="custom-form">
        <Container className="form-section">
          <div>
            <span className="eyebrow">Оставьте заявку</span>
            <h2>Расскажите о будущем изделии</h2>
            <p>Менеджер уточнит детали, поможет подобрать материал и подготовит предварительный расчёт.</p>
          </div>
          <RequestForm kind="custom-order" submitLabel="Получить расчёт" />
        </Container>
      </section>
    </>
  );
}
