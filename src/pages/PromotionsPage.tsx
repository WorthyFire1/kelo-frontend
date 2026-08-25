import { ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { usePromotions } from '@/hooks/useCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function PromotionsPage() {
  useDocumentTitle('Акции');
  const promotionsQuery = usePromotions();

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Акции' }]} />
      <div className="page-heading page-heading--split">
        <div>
          <span className="eyebrow">Выгодные предложения</span>
          <h1>Акции КЕЛО</h1>
          <p>Скидки на наборы, доставку и индивидуальное производство.</p>
        </div>
        <div className="heading-note"><Tag /><span>Часть специальных условий будет доступна зарегистрированным покупателям после подключения бэкенда.</span></div>
      </div>
      <div className="promotion-list">
        {promotionsQuery.data?.map((promotion) => (
          <article className="promotion-card" key={promotion.id}>
            <ImagePlaceholder src={promotion.image} alt={promotion.title} label={promotion.label} />
            <div className="promotion-card__body">
              <span className="promotion-card__label">{promotion.label}</span>
              <h2>{promotion.title}</h2>
              <p>{promotion.description}</p>
              <small>Действует до: {promotion.validUntil}</small>
              <Link className="button button--secondary" to="/catalog">Выбрать товары <ArrowRight size={17} /></Link>
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
}
