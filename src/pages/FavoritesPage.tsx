import { Heart, ShoppingBag, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { useAddToCart } from '@/hooks/useCart';
import { useClearWishlist, useRemoveFromWishlist, useWishlistQuery } from '@/hooks/useWishlist';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatPrice } from '@/lib/formatters';
import { useAuthStore } from '@/store/useAuthStore';

export function FavoritesPage() {
  useDocumentTitle('Избранное');
  const user = useAuthStore((state) => state.user);
  const wishlistQuery = useWishlistQuery();
  const removeMutation = useRemoveFromWishlist();
  const clearMutation = useClearWishlist();
  const cartMutation = useAddToCart();
  const favorites = wishlistQuery.data ?? [];

  if (!user) {
    return (
      <Container className="page-shell">
        <Breadcrumbs items={[{ label: 'Избранное' }]} />
        <EmptyState icon={<Heart />} title="Войдите, чтобы сохранять товары" description="Избранное хранится в вашей учётной записи и синхронизируется между устройствами." action={<Link className="button button--primary" to="/account?returnTo=%2Ffavorites">Войти или зарегистрироваться</Link>} />
      </Container>
    );
  }

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Избранное' }]} />
      <div className="page-heading page-heading--split">
        <div><span className="eyebrow">Сохранённые товары</span><h1>Избранное</h1><p>Возвращайтесь к понравившимся изделиям в любое время.</p></div>
        {favorites.length > 0 && <button className="text-button" type="button" disabled={clearMutation.isPending} onClick={() => clearMutation.mutate()}>Очистить список</button>}
      </div>
      {wishlistQuery.isPending ? (
        <div className="center-message"><h2>Загружаем избранное…</h2></div>
      ) : wishlistQuery.isError ? (
        <EmptyState icon={<Heart />} title="Не удалось загрузить избранное" description={wishlistQuery.error instanceof Error ? wishlistQuery.error.message : 'Повторите запрос.'} action={<button className="button button--primary" type="button" onClick={() => void wishlistQuery.refetch()}>Повторить</button>} />
      ) : favorites.length ? (
        <div className="favorite-list">
          {favorites.map((item) => (
            <article className="favorite-line" key={item.id}>
              <Link to={`/catalog/${item.slug}`}><ImagePlaceholder src={item.mainImageUrl} alt={item.productName} compact /></Link>
              <div className="favorite-line__body">
                <h2><Link to={`/catalog/${item.slug}`}>{item.productName}</Link></h2>
                <span><Star size={15} fill="currentColor" /> {item.averageRating} · {item.reviewCount} отзывов</span>
                <div><strong>{formatPrice(item.price)}</strong>{item.oldPrice ? <s>{formatPrice(item.oldPrice)}</s> : null}</div>
              </div>
              <button className="button button--primary" type="button" disabled={!item.isInStock || cartMutation.isPending} onClick={() => cartMutation.mutate({ productId: item.productId, quantity: 1 })}><ShoppingBag size={17} /> В корзину</button>
              <button className="icon-button" type="button" disabled={removeMutation.isPending} onClick={() => removeMutation.mutate(item.productId)} aria-label="Убрать из избранного"><Trash2 size={18} /></button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Heart />} title="В избранном пока ничего нет" description="Нажимайте на сердечко в карточках товаров, чтобы сохранить их здесь." action={<Link className="button button--primary" to="/catalog">Открыть каталог</Link>} />
      )}
    </Container>
  );
}
