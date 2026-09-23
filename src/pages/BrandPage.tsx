import { Tags } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { LoadingGrid } from '@/components/ui/LoadingGrid';
import { Pagination } from '@/components/ui/Pagination';
import { useBrand, useCatalogPage } from '@/hooks/useCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function BrandPage() {
  const { slug = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = Number(searchParams.get('page') ?? '1');
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const brandQuery = useBrand(slug);
  const brand = brandQuery.data;
  const productsQuery = useCatalogPage({ brand: brand?.id }, page, 12);
  useDocumentTitle(brand?.name ?? 'Бренд');

  if (brandQuery.isPending) return <Container className="page-shell"><LoadingGrid count={3} /></Container>;
  if (brandQuery.isError || !brand) {
    return <Container className="page-shell"><EmptyState icon={<Tags />} title="Бренд не найден" description={brandQuery.error instanceof Error ? brandQuery.error.message : 'Возможно, ссылка устарела.'} action={<Link className="button button--primary" to="/brands">Все бренды</Link>} /></Container>;
  }

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Бренды', to: '/brands' }, { label: brand.name }]} />
      <section className="brand-detail-hero">
        <ImagePlaceholder src={brand.image} alt={brand.name} label={brand.name} />
        <div><span className="eyebrow">Коллекция КЕЛО</span><h1>{brand.name}</h1><p>{brand.description}</p><strong>{brand.productCount} товаров</strong></div>
      </section>
      <section className="section section--compact">
        <h2>Товары бренда</h2>
        {productsQuery.isPending ? <LoadingGrid /> : productsQuery.isError ? <EmptyState icon={<Tags />} title="Не удалось загрузить товары" description={productsQuery.error instanceof Error ? productsQuery.error.message : 'Повторите запрос.'} /> : productsQuery.data?.products.length ? <><ProductGrid products={productsQuery.data.products} /><Pagination page={page} totalPages={productsQuery.data.totalPages} onChange={(nextPage) => setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {})} /></> : <EmptyState icon={<Tags />} title="В этой коллекции пока нет активных товаров" description="Загляните позднее или посмотрите весь каталог." action={<Link className="button button--primary" to="/catalog">Открыть каталог</Link>} />}
      </section>
    </Container>
  );
}
