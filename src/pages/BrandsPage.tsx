import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
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
      <div className="brand-grid">
        {brandsQuery.data?.map((brand) => (
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
    </Container>
  );
}
