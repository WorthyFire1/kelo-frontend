import { useEffect, useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, Heart, PackageCheck, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { LoadingGrid } from '@/components/ui/LoadingGrid';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAddToCart } from '@/hooks/useCart';
import { useProduct } from '@/hooks/useCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAddToWishlist, useRemoveFromWishlist, useWishlistQuery } from '@/hooks/useWishlist';
import { formatPrice } from '@/lib/formatters';
import { catalogService } from '@/services/catalogService';
import { useAuthStore } from '@/store/useAuthStore';

const reviewDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function ProductPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const productQuery = useProduct(slug);
  const details = productQuery.data;
  const product = details?.product;
  useDocumentTitle(product?.title ?? 'Товар');
  const user = useAuthStore((state) => state.user);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'delivery'>('description');
  const [reviewMessage, setReviewMessage] = useState('');
  const cartMutation = useAddToCart();
  const wishlistQuery = useWishlistQuery();
  const addWishlistMutation = useAddToWishlist();
  const removeWishlistMutation = useRemoveFromWishlist();
  const reviewMutation = useMutation({
    mutationFn: ({ productId, rating, comment }: { productId: string; rating: number; comment: string }) =>
      catalogService.addProductReview(productId, rating, comment),
    onSuccess: (response) => setReviewMessage(response.message),
  });
  const firstVariantId = product?.variants?.[0]?.id ?? null;

  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedVariantId(firstVariantId);
    setQuantity(1);
    setReviewMessage('');
  }, [firstVariantId, product?.id]);

  if (productQuery.isLoading) {
    return <Container className="page-shell"><LoadingGrid count={4} /></Container>;
  }

  if (productQuery.isError || !product) {
    return (
      <Container className="page-shell center-message">
        <h1>{productQuery.isError ? 'Не удалось загрузить товар' : 'Товар не найден'}</h1>
        <p>{productQuery.error instanceof Error ? productQuery.error.message : 'Возможно, ссылка устарела или товар был перемещён.'}</p>
        {productQuery.isError && <button className="button button--secondary" type="button" onClick={() => void productQuery.refetch()}>Повторить</button>}
        <Link className="button button--primary" to="/catalog">Вернуться в каталог</Link>
      </Container>
    );
  }

  const productId = Number(product.id);
  const isFavorite = wishlistQuery.data?.some((item) => item.productId === productId) ?? false;
  const gallery = product.images.length ? product.images : ['', '', '', ''];
  const variants = product.variants ?? [];
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
  const availableQuantity = selectedVariant ? selectedVariant.stockQuantity : product.stock;
  const canBuy = product.availability !== 'out-of-stock' && availableQuantity > 0;
  const related = details?.relatedProducts ?? [];
  const reviews = details?.reviews ?? [];

  const requireAuth = () => {
    if (user) return true;
    navigate(`/account?returnTo=${encodeURIComponent(location.pathname)}`);
    return false;
  };

  const addToCart = () => {
    if (!requireAuth()) return;
    cartMutation.mutate(
      { productId, quantity, variantName: selectedVariant?.name },
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

  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setReviewMessage('');
    reviewMutation.mutate({
      productId: product.id,
      rating: Number(data.get('rating')),
      comment: String(data.get('comment') ?? '').trim(),
    }, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <>
      <Container className="page-shell">
        <Breadcrumbs items={[{ label: 'Каталог', to: '/catalog' }, { label: product.categoryName, to: `/catalog?category=${product.categoryId}` }, { label: product.title }]} />
        <section className="product-detail">
          <div className="product-gallery">
            <div className="product-gallery__main"><ImagePlaceholder src={gallery[selectedImageIndex]} alt={product.title} label={product.categoryName} /></div>
            <div className="product-gallery__thumbs">
              {gallery.slice(0, 4).map((image, index) => (
                <button className={selectedImageIndex === index ? 'is-active' : ''} type="button" key={`${image}-${index}`} onClick={() => setSelectedImageIndex(index)} aria-label={`Изображение ${index + 1}`}>
                  <ImagePlaceholder src={image} alt={`${product.title}, вид ${index + 1}`} compact />
                </button>
              ))}
            </div>
          </div>
          <div className="product-info">
            <span className="product-info__sku">Артикул: {selectedVariant?.sku || product.sku}</span>
            <h1>{product.title}</h1>
            <div className="product-info__rating"><Star size={18} fill="currentColor" /> <strong>{product.rating}</strong><a href="#reviews">{product.reviewCount} отзывов</a></div>
            <p className="product-info__lead">{product.shortDescription}</p>
            <div className="product-info__price"><strong>{formatPrice(product.price)}</strong>{product.oldPrice && <s>{formatPrice(product.oldPrice)}</s>}</div>
            <div className={clsx('availability-panel', `availability-panel--${canBuy ? 'in-stock' : 'out-of-stock'}`)}><Check size={18} /><span>{canBuy ? `В наличии — ${availableQuantity} шт.` : 'Временно нет в наличии'}</span></div>
            {variants.length > 0 && (
              <label className="product-variant-select">
                <span>Вариант</span>
                <select value={selectedVariant?.id ?? ''} onChange={(event) => { setSelectedVariantId(Number(event.target.value)); setQuantity(1); }}>
                  {variants.map((variant) => <option value={variant.id} key={variant.id} disabled={variant.stockQuantity <= 0}>{variant.name}{variant.size ? ` · ${variant.size}` : ''}{variant.stockQuantity <= 0 ? ' — нет в наличии' : ''}</option>)}
                </select>
              </label>
            )}
            <dl className="product-info__quick-specs"><div><dt>Материал</dt><dd>{product.material}</dd></div><div><dt>Размер</dt><dd>{selectedVariant?.size || product.dimensions || 'Не указан'}</dd></div><div><dt>Покрытие</dt><dd>{product.finish || 'Не указано'}</dd></div></dl>
            <div className="product-info__buy-row">
              <QuantityControl value={quantity} onChange={setQuantity} max={availableQuantity || 1} />
              <Button onClick={addToCart} disabled={!canBuy || cartMutation.isPending}><ShoppingBag size={19} /> {cartMutation.isPending ? 'Добавляем…' : 'Добавить в корзину'}</Button>
              <button className={clsx('favorite-button', isFavorite && 'is-active')} type="button" onClick={toggleFavorite} disabled={addWishlistMutation.isPending || removeWishlistMutation.isPending} aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}><Heart fill={isFavorite ? 'currentColor' : 'none'} /></button>
            </div>
            <div className="product-benefits"><div><Truck /><span><strong>Доставка по России</strong>СДЭК и Почта России</span></div><div><ShieldCheck /><span><strong>Гарантия 6 месяцев</strong>Прямая поддержка производителя</span></div><div><PackageCheck /><span><strong>Защитная упаковка</strong>Проверяем перед отправкой</span></div></div>
          </div>
        </section>
        <section className="product-tabs">
          <div className="product-tabs__nav"><button className={activeTab === 'description' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('description')}>Описание</button><button className={activeTab === 'specs' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('specs')}>Характеристики</button><button className={activeTab === 'delivery' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('delivery')}>Доставка и оплата</button></div>
          <div className="product-tabs__content">
            {activeTab === 'description' && <><h2>О товаре</h2><p>{product.description}</p><p>Каждое изделие проходит ручную проверку перед упаковкой. Оттенок и рисунок древесины могут немного отличаться — это естественная особенность натурального материала.</p></>}
            {activeTab === 'specs' && <><h2>Технические характеристики</h2><dl className="spec-table"><div><dt>Материал</dt><dd>{product.material}</dd></div><div><dt>Размер</dt><dd>{product.dimensions || '—'}</dd></div><div><dt>Вес</dt><dd>{product.weight || '—'}</dd></div><div><dt>Покрытие</dt><dd>{product.finish || '—'}</dd></div>{product.specifications.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl></>}
            {activeTab === 'delivery' && <><h2>Как получить заказ</h2><p>Доставляем СДЭК, Почтой России и курьерскими службами. Стоимость рассчитывается при оформлении. Заказы от 7 000 ₽ доставляем бесплатно до пункта выдачи.</p><Link className="text-link" to="/delivery">Подробные условия доставки</Link></>}
          </div>
        </section>
        <section className="reviews-section" id="reviews">
          <div className="reviews-section__heading"><div><span className="eyebrow">Отзывы покупателей</span><h2>{reviews.length ? `${reviews.length} отзывов` : 'Отзывов пока нет'}</h2></div></div>
          <div className="reviews-layout">
            <div className="review-list">
              {reviews.map((review) => <article className="review-card" key={review.id}><div><strong>{review.userName || 'Покупатель'}</strong><span>{reviewDateFormatter.format(new Date(review.createdAt))}</span></div><div className="review-stars" aria-label={`Оценка ${review.rating} из 5`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < review.rating ? 'currentColor' : 'none'} />)}</div><p>{review.comment}</p></article>)}
              {!reviews.length && <p>Станьте первым, кто поделится впечатлением об этом товаре.</p>}
            </div>
            {user ? (
              <form className="review-form" onSubmit={submitReview}>
                <h3>Оставить отзыв</h3>
                <label><span>Оценка</span><select name="rating" required defaultValue="5"><option value="5">5 — отлично</option><option value="4">4 — хорошо</option><option value="3">3 — нормально</option><option value="2">2 — плохо</option><option value="1">1 — очень плохо</option></select></label>
                <label><span>Комментарий</span><textarea name="comment" required minLength={3} rows={5} /></label>
                {reviewMessage && <p className="profile-feedback is-success">{reviewMessage}</p>}
                {reviewMutation.isError && <p className="profile-feedback is-error">{reviewMutation.error instanceof Error ? reviewMutation.error.message : 'Не удалось отправить отзыв.'}</p>}
                <Button type="submit" disabled={reviewMutation.isPending}>{reviewMutation.isPending ? 'Отправляем…' : 'Отправить отзыв'}</Button>
              </form>
            ) : (
              <div className="review-form"><h3>Хотите оставить отзыв?</h3><p>Войдите в аккаунт, чтобы оценить товар.</p><Link className="button button--secondary" to={`/account?returnTo=${encodeURIComponent(location.pathname)}`}>Войти</Link></div>
            )}
          </div>
        </section>
      </Container>
      {related.length > 0 && <section className="section section--soft"><Container><SectionHeader title="Похожие товары" description="Другие изделия из этой коллекции." /><ProductGrid products={related} /></Container></section>}
    </>
  );
}
