import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { products } from '@/data/mockData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useFavoritesStore } from '@/store/useFavoritesStore';

export function FavoritesPage() {
  useDocumentTitle('Избранное');
  const ids = useFavoritesStore((state) => state.productIds);
  const clear = useFavoritesStore((state) => state.clear);
  const favorites = products.filter((product) => ids.includes(product.id));

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Избранное' }]} />
      <div className="page-heading page-heading--split">
        <div><span className="eyebrow">Сохранённые товары</span><h1>Избранное</h1><p>Возвращайтесь к понравившимся изделиям в любое время.</p></div>
        {favorites.length > 0 && <button className="text-button" type="button" onClick={clear}>Очистить список</button>}
      </div>
      {favorites.length ? <ProductGrid products={favorites} /> : <EmptyState icon={<Heart />} title="В избранном пока ничего нет" description="Нажимайте на сердечко в карточках товаров, чтобы сохранить их здесь." action={<Link className="button button--primary" to="/catalog">Открыть каталог</Link>} />}
    </Container>
  );
}
