import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { FiltersSidebar, type FilterState } from '@/components/catalog/FiltersSidebar';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingGrid } from '@/components/ui/LoadingGrid';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { CatalogFilters } from '@/types/catalog';

const defaultFilterState: FilterState = {
  minPrice: '',
  maxPrice: '',
  materials: [],
  availability: [],
};

export function CatalogPage() {
  useDocumentTitle('Каталог');
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const categoryId = searchParams.get('category') ?? '';
  const query = searchParams.get('q') ?? '';
  const sort = (searchParams.get('sort') as CatalogFilters['sort']) ?? 'popular';
  const categoriesQuery = useCategories();

  const requestFilters: CatalogFilters = useMemo(() => ({
    query,
    category: categoryId || undefined,
    materials: filters.materials,
    availability: filters.availability,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    sort,
  }), [query, categoryId, filters, sort]);

  const productsQuery = useProducts(requestFilters);
  const materials = useMemo(() => ['Бук', 'Дуб', 'Ясень', 'Массив дерева'], []);
  const activeCategory = categoriesQuery.data?.find((category) => category.id === categoryId);

  useEffect(() => {
    setMobileFiltersOpen(false);
  }, [categoryId, sort]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Каталог' }]} />
      <div className="page-heading">
        <div>
          <span className="eyebrow">Каталог КЕЛО</span>
          <h1>{activeCategory?.name ?? 'Все изделия'}</h1>
          <p>{activeCategory?.description ?? 'Кухонная утварь, сувениры для творчества и объёмные фасады для мебели.'}</p>
        </div>
      </div>
      <div className="category-tabs" aria-label="Категории">
        <button className={!categoryId ? 'is-active' : ''} type="button" onClick={() => updateParam('category', '')}>Все</button>
        {categoriesQuery.data?.map((category) => (
          <button
            className={categoryId === category.id ? 'is-active' : ''}
            type="button"
            onClick={() => updateParam('category', category.id)}
            key={category.id}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="catalog-toolbar">
        <button className="filter-mobile-button" type="button" onClick={() => setMobileFiltersOpen(true)}>
          <SlidersHorizontal size={18} /> Фильтры
        </button>
        <span>Найдено: <strong>{productsQuery.data?.length ?? 0}</strong></span>
        <label>
          <span>Сортировка</span>
          <select value={sort} onChange={(event) => updateParam('sort', event.target.value)}>
            <option value="popular">По популярности</option>
            <option value="newest">Сначала новинки</option>
            <option value="rating">По рейтингу</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
          </select>
        </label>
      </div>
      <div className="catalog-layout">
        <div className={`filters-mobile ${mobileFiltersOpen ? 'is-open' : ''}`}>
          <div className="filters-mobile__head">
            <strong>Фильтры</strong>
            <button type="button" onClick={() => setMobileFiltersOpen(false)}><X /></button>
          </div>
          <FiltersSidebar value={filters} materials={materials} onChange={setFilters} onReset={() => setFilters(defaultFilterState)} />
        </div>
        <FiltersSidebar value={filters} materials={materials} onChange={setFilters} onReset={() => setFilters(defaultFilterState)} />
        <div>
          {productsQuery.isLoading ? (
            <LoadingGrid count={9} />
          ) : productsQuery.data?.length ? (
            <ProductGrid products={productsQuery.data} />
          ) : (
            <EmptyState
              icon={<SlidersHorizontal />}
              title="По выбранным параметрам ничего не найдено"
              description="Попробуйте изменить фильтры или посмотреть все товары."
              action={<button className="button button--primary" type="button" onClick={() => { setFilters(defaultFilterState); setSearchParams({}); }}>Сбросить параметры</button>}
            />
          )}
        </div>
      </div>
    </Container>
  );
}
