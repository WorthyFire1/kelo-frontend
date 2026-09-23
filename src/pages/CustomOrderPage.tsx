import { FileCheck2, MessageSquareText, PackageCheck, PencilRuler } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { RequestForm } from '@/components/forms/RequestForm';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatPrice } from '@/lib/formatters';
import { customOrderService } from '@/services/customOrderService';

const stepIcons = [MessageSquareText, PencilRuler, FileCheck2, PackageCheck];

export function CustomOrderPage() {
  useDocumentTitle('Столярные изделия на заказ');
  const infoQuery = useQuery({ queryKey: ['custom-order', 'info'], queryFn: customOrderService.getInfo });
  const info = infoQuery.data;

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
            {(info?.steps ?? []).map((step, index) => {
              const Icon = stepIcons[index] ?? FileCheck2;
              return (
              <article className="process-step" key={step.number}>
                <span>{step.number}</span>
                <Icon />
                <h2>{step.title}</h2>
                <p>{step.description}</p>
              </article>
              );
            })}
            {infoQuery.isPending && <p>Загружаем этапы работы…</p>}
          </div>
        </section>
        <section className="custom-info-grid">
          <div>
            <span className="eyebrow">Что можно заказать</span>
            <h2>От одной формы до корпоративной серии</h2>
            <ul className="check-list">{(info?.whatCanOrder ?? []).map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="custom-price-card">
            <span>Ориентировочная стоимость</span>
            <strong>{info ? `от ${formatPrice(info.startingPrice)}` : 'Рассчитываем…'}</strong>
            <p>Точная цена зависит от размера, древесины, сложности рисунка и количества изделий.</p>
            <dl>
              <div><dt>Макет</dt><dd>{info ? `от ${info.minMacetDays} дней` : '—'}</dd></div>
              <div><dt>Производство</dt><dd>{info ? `${info.minProductionDays}–${info.maxProductionDays} дней` : '—'}</dd></div>
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
