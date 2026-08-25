import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { formatPrice } from '@/lib/formatters';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import type { Product, ProductBadge } from '@/types/catalog';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';

const badgeLabels: Record<ProductBadge, string> = {
  new: 'Новинка',
  hit: 'Хит продаж',
  recommended: 'Рекомендуем',
  sale: 'Акция',
};

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const favoriteIds = useFavoritesStore((state) => state.productIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const isFavorite = favoriteIds.includes(product.id);

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
          onClick={() => toggleFavorite(product.id)}
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
            onClick={() => addItem(product.id)}
            disabled={product.availability === 'out-of-stock'}
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
