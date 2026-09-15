import { ArrowRight, Tags } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { useBrands } from '@/hooks/useCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function BrandsPage() {
  useDocumentTitle('Бренды');
  const brandsQuery = useBrands();

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Бренды' }]} />
      <div className="page-heading">
        <div>
          <span className="eyebrow">Наши направления</span>
          <h1>Бренды КЕЛО</h1>
          <p>Несколько коллекций с единым вниманием к материалу, деталям и качеству изготовления.</p>
        </div>
      </div>
      {brandsQuery.isLoading ? (
        <div className="brand-grid" aria-label="Загрузка брендов">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="skeleton-card" key={index}>
              <div className="skeleton skeleton--image" />
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line skeleton--short" />
            </div>
          ))}
        </div>
      ) : brandsQuery.isError ? (
        <EmptyState
          icon={<Tags />}
          title="Не удалось загрузить бренды"
          description={brandsQuery.error instanceof Error ? brandsQuery.error.message : 'Проверьте доступность backend и повторите запрос.'}
          action={<button className="button button--primary" type="button" onClick={() => void brandsQuery.refetch()}>Повторить</button>}
        />
      ) : brandsQuery.data?.length ? (
        <div className="brand-grid">
          {brandsQuery.data.map((brand) => (
            <article className="brand-card" key={brand.id}>
              <ImagePlaceholder src={brand.image} alt={brand.name} label={brand.name} />
              <div>
                <h2>{brand.name}</h2>
                <p>{brand.description}</p>
                <Link className="text-link" to="/catalog">Перейти к товарам <ArrowRight size={17} /></Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Tags />}
          title="Брендов пока нет"
          description="Добавьте первый бренд в административной панели — он появится здесь автоматически."
        />
      )}
    </Container>
  );
}
