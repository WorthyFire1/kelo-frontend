import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { formatPrice } from '@/lib/formatters';
import { useAddToCart } from '@/hooks/useCart';
import { useAddToWishlist, useRemoveFromWishlist, useWishlistQuery } from '@/hooks/useWishlist';
import { useAuthStore } from '@/store/useAuthStore';
import type { Product, ProductBadge } from '@/types/catalog';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';

const badgeLabels: Record<ProductBadge, string> = {
  new: 'Новинка',
  hit: 'Хит продаж',
  recommended: 'Рекомендуем',
  sale: 'Акция',
};

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const cartMutation = useAddToCart();
  const wishlistQuery = useWishlistQuery();
  const addWishlistMutation = useAddToWishlist();
  const removeWishlistMutation = useRemoveFromWishlist();
  const productId = Number(product.id);
  const isFavorite = wishlistQuery.data?.some((item) => item.productId === productId) ?? false;
  const favoritePending = addWishlistMutation.isPending || removeWishlistMutation.isPending;

  const requireAuth = () => {
    if (user) return true;
    const returnTo = `${location.pathname}${location.search}`;
    navigate(`/account?returnTo=${encodeURIComponent(returnTo)}`);
    return false;
  };

  const addToCart = () => {
    if (!requireAuth()) return;
    cartMutation.mutate(
      { productId, quantity: 1 },
      { onError: (error) => window.alert(error instanceof Error ? error.message : 'Не удалось добавить товар в корзину.') },
    );
  };

  const toggleFavorite = () => {
    if (!requireAuth()) return;
    const mutation = isFavorite ? removeWishlistMutation : addWishlistMutation;
    mutation.mutate(productId, {
      onError: (error) => window.alert(error instanceof Error ? error.message : 'Не удалось изменить избранное.'),
    });
  };

  return (
    <article className="product-card">
      <div className="product-card__media">
        <Link to={`/catalog/${product.slug}`} aria-label={`Открыть ${product.title}`}>
          <ImagePlaceholder src={product.images[0]} alt={product.title} label={product.categoryName} />
        </Link>
        <div className="product-card__badges">
          {product.badges.slice(0, 2).map((badge) => (
            <span className={clsx('product-badge', `product-badge--${badge}`)} key={badge}>
              {badgeLabels[badge]}
            </span>
          ))}
        </div>
        <button
          className={clsx('icon-button', 'product-card__favorite', isFavorite && 'is-active')}
          type="button"
          onClick={toggleFavorite}
          disabled={favoritePending}
          aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <Heart size={19} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="product-card__body">
        <Link className="product-card__category" to={`/catalog?category=${product.categoryId}`}>
          {product.categoryName}
        </Link>
        <h3><Link to={`/catalog/${product.slug}`}>{product.title}</Link></h3>
        <p>{product.shortDescription}</p>
        <div className="product-card__rating">
          <Star size={15} fill="currentColor" />
          <strong>{product.rating}</strong>
          <span>{product.reviewCount} отзывов</span>
        </div>
        <div className="product-card__footer">
          <div className="price-block">
            <strong>{formatPrice(product.price)}</strong>
            {product.oldPrice && <s>{formatPrice(product.oldPrice)}</s>}
          </div>
          <button
            className="product-card__cart"
            type="button"
            onClick={addToCart}
            disabled={product.availability === 'out-of-stock' || cartMutation.isPending}
            aria-label="Добавить в корзину"
          >
            <ShoppingBag size={19} />
          </button>
        </div>
        <span className={clsx('stock-label', `stock-label--${product.availability}`)}>
          {product.availability === 'in-stock' && `В наличии${product.stock ? `: ${product.stock} шт.` : ''}`}
          {product.availability === 'made-to-order' && 'Изготовим на заказ'}
          {product.availability === 'out-of-stock' && 'Временно нет в наличии'}
        </span>
      </div>
    </article>
  );
}
