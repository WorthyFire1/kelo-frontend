import { Banknote, Box, CreditCard, MapPin, PackageCheck, Truck } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const deliveryMethods = [
  { icon: Truck, title: 'СДЭК', text: 'До пункта выдачи или курьером по России и странам СНГ.', note: 'Срок: от 2 дней' },
  { icon: Box, title: 'Почта России', text: 'Подходит для населённых пунктов, где нет пунктов транспортных компаний.', note: 'Срок: от 5 дней' },
  { icon: MapPin, title: 'Самовывоз', text: 'По предварительному согласованию с производства.', note: 'Бесплатно' },
];

export function DeliveryPage() {
  useDocumentTitle('Доставка и оплата');

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Доставка и оплата' }]} />
      <div className="page-heading page-heading--split">
        <div>
          <span className="eyebrow">Получение заказа</span>
          <h1>Доставка и оплата</h1>
          <p>Подберём удобный способ получения и надёжно упакуем деревянные изделия.</p>
        </div>
        <div className="delivery-highlight"><PackageCheck /><strong>Бесплатная доставка</strong><span>До пункта выдачи при заказе от 7 000 ₽</span></div>
      </div>
      <section className="info-section">
        <h2>Способы доставки</h2>
        <div className="info-card-grid">
          {deliveryMethods.map(({ icon: Icon, title, text, note }) => (
            <article className="info-card" key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
              <strong>{note}</strong>
            </article>
          ))}
        </div>
      </section>
      <section className="info-section">
        <h2>Способы оплаты</h2>
        <div className="info-card-grid">
          <article className="info-card"><CreditCard /><h3>Банковской картой</h3><p>Онлайн при оформлении заказа после подключения платёжного сервиса.</p></article>
          <article className="info-card"><Banknote /><h3>При получении</h3><p>Для доступных направлений и способов доставки.</p></article>
          <article className="info-card"><Box /><h3>По счёту</h3><p>Для юридических лиц и корпоративных заказчиков.</p></article>
        </div>
      </section>
      <section className="faq-section">
        <h2>Частые вопросы</h2>
        <details><summary>Как рассчитывается стоимость доставки?</summary><p>Стоимость зависит от веса, габаритов, города и выбранной службы. После подключения бэкенда расчёт будет выполняться автоматически.</p></details>
        <details><summary>Как упаковываются изделия?</summary><p>Формы и доски оборачиваются защитным материалом, фиксируются внутри коробки и не соприкасаются с её стенками.</p></details>
        <details><summary>Можно ли изменить адрес после оформления?</summary><p>Да, пока заказ не передан в службу доставки. Свяжитесь с нами по телефону или через форму обратной связи.</p></details>
      </section>
    </Container>
  );
}
