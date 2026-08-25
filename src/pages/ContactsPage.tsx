import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { RequestForm } from '@/components/forms/RequestForm';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function ContactsPage() {
  useDocumentTitle('Контакты');

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Контакты' }]} />
      <div className="page-heading"><div><span className="eyebrow">Мы на связи</span><h1>Контакты</h1><p>Ответим на вопрос о товаре, поможем с выбором и рассчитаем индивидуальный заказ.</p></div></div>
      <div className="contacts-layout">
        <div className="contacts-list">
          <article><Phone /><div><span>Телефон</span><a href="tel:+79138430005">8-913-843-0005</a></div></article>
          <article><Mail /><div><span>E-mail</span><a href="mailto:kelo_creates@mail.ru">kelo_creates@mail.ru</a></div></article>
          <article><Clock3 /><div><span>Режим работы</span><strong>Пн–Пт, 09:00–18:00</strong></div></article>
          <article><MapPin /><div><span>Производство</span><strong>Россия, адрес будет указан заказчиком</strong></div></article>
          <div className="map-placeholder"><MapPin /><strong>Здесь будет карта</strong><span>Координаты добавим после получения точного адреса производства.</span></div>
        </div>
        <RequestForm kind="question" title="Напишите нам" submitLabel="Отправить сообщение" />
      </div>
    </Container>
  );
}
