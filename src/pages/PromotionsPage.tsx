import { ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
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
        <div className="heading-note"><Tag /><span>Здесь отображаются активные скидки и промокоды из системы КЕЛО.</span></div>
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
        {promotionsQuery.isLoading && <p>Загружаем действующие предложения…</p>}
      </div>
      {promotionsQuery.isError && <EmptyState icon={<Tag />} title="Не удалось загрузить акции" description={promotionsQuery.error instanceof Error ? promotionsQuery.error.message : 'Повторите запрос.'} action={<button className="button button--primary" type="button" onClick={() => void promotionsQuery.refetch()}>Повторить</button>} />}
      {promotionsQuery.isSuccess && !promotionsQuery.data.length && <EmptyState icon={<Tag />} title="Активных акций пока нет" description="Новые предложения появятся здесь автоматически." />}
    </Container>
  );
}
