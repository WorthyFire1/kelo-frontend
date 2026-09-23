import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingGrid } from '@/components/ui/LoadingGrid';
import { Pagination } from '@/components/ui/Pagination';
import { useCatalogPage } from '@/hooks/useCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const requestedPage = Number(params.get('page') ?? '1');
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  useDocumentTitle(`Поиск: ${query}`);
  const productsQuery = useCatalogPage({ query }, page, 12);

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Поиск' }]} />
      <div className="page-heading">
        <div><span className="eyebrow">Результаты поиска</span><h1>{query ? `По запросу «${query}»` : 'Поиск по каталогу'}</h1><p>Найдено товаров: {productsQuery.data?.totalItems ?? 0}</p></div>
      </div>
      <form className="search-page-form" onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const next = String(formData.get('q') ?? '').trim();
        if (next) setParams({ q: next });
      }}>
        <Search size={21} />
        <input name="q" defaultValue={query} placeholder="Название товара, материал или артикул" />
        <button className="button button--primary" type="submit">Найти</button>
      </form>
      {productsQuery.isLoading ? <LoadingGrid /> : productsQuery.data?.products.length ? <><ProductGrid products={productsQuery.data.products} /><Pagination page={page} totalPages={productsQuery.data.totalPages} onChange={(nextPage) => setParams({ q: query, ...(nextPage > 1 ? { page: String(nextPage) } : {}) })} /></> : <EmptyState icon={<Search />} title="Ничего не найдено" description="Проверьте написание или попробуйте более общий запрос." />}
    </Container>
  );
}
