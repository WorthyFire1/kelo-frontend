import { useMemo, useState } from 'react';
import { Check, Heart, PackageCheck, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { LoadingGrid } from '@/components/ui/LoadingGrid';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useProduct, useProducts } from '@/hooks/useCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatPrice } from '@/lib/formatters';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';

export function ProductPage() {
  const { slug = '' } = useParams();
  const productQuery = useProduct(slug);
  const product = productQuery.data;
  useDocumentTitle(product?.title ?? 'Товар');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'delivery'>('description');
  const addItem = useCartStore((state) => state.addItem);
  const favorites = useFavoritesStore((state) => state.productIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const relatedQuery = useProducts({ category: product?.categoryId, sort: 'rating' });
  const related = useMemo(() => relatedQuery.data?.filter((item) => item.id !== product?.id).slice(0, 4) ?? [], [relatedQuery.data, product?.id]);

  if (productQuery.isLoading) {
    return <Container className="page-shell"><LoadingGrid count={4} /></Container>;
  }

  if (!product) {
    return (
      <Container className="page-shell center-message">
        <h1>Товар не найден</h1>
        <p>Возможно, ссылка устарела или товар был перемещён.</p>
        <Link className="button button--primary" to="/catalog">Вернуться в каталог</Link>
      </Container>
    );
  }

  const isFavorite = favorites.includes(product.id);
  const gallery = product.images.length ? product.images : ['', '', '', ''];

  return (
    <>
      <Container className="page-shell">
        <Breadcrumbs items={[{ label: 'Каталог', to: '/catalog' }, { label: product.categoryName, to: `/catalog?category=${product.categoryId}` }, { label: product.title }]} />
        <section className="product-detail">
          <div className="product-gallery">
            <div className="product-gallery__main">
              <ImagePlaceholder src={gallery[selectedImageIndex]} alt={product.title} label={product.categoryName} />
            </div>
            <div className="product-gallery__thumbs">
              {gallery.slice(0, 4).map((image, index) => (
                <button
                  className={selectedImageIndex === index ? 'is-active' : ''}
                  type="button"
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={`Изображение ${index + 1}`}
                >
                  <ImagePlaceholder src={image} alt={`${product.title}, вид ${index + 1}`} compact />
                </button>
              ))}
            </div>
          </div>
          <div className="product-info">
            <span className="product-info__sku">Артикул: {product.sku}</span>
            <h1>{product.title}</h1>
            <div className="product-info__rating">
              <Star size={18} fill="currentColor" /> <strong>{product.rating}</strong>
              <a href="#reviews">{product.reviewCount} отзывов</a>
            </div>
            <p className="product-info__lead">{product.shortDescription}</p>
            <div className="product-info__price">
              <strong>{formatPrice(product.price)}</strong>
              {product.oldPrice && <s>{formatPrice(product.oldPrice)}</s>}
            </div>
            <div className={clsx('availability-panel', `availability-panel--${product.availability}`)}>
              <Check size={18} />
              <span>
                {product.availability === 'in-stock' && `В наличии — ${product.stock} шт.`}
                {product.availability === 'made-to-order' && 'Изготовим на заказ'}
                {product.availability === 'out-of-stock' && 'Временно нет в наличии'}
              </span>
            </div>
            <dl className="product-info__quick-specs">
              <div><dt>Материал</dt><dd>{product.material}</dd></div>
              <div><dt>Размер</dt><dd>{product.dimensions}</dd></div>
              <div><dt>Покрытие</dt><dd>{product.finish}</dd></div>
            </dl>
            <div className="product-info__buy-row">
              <QuantityControl value={quantity} onChange={setQuantity} max={product.stock || 99} />
              <Button onClick={() => addItem(product.id, quantity)} disabled={product.availability === 'out-of-stock'}>
                <ShoppingBag size={19} /> Добавить в корзину
              </Button>
              <button className={clsx('favorite-button', isFavorite && 'is-active')} type="button" onClick={() => toggleFavorite(product.id)} aria-label="Добавить в избранное">
                <Heart fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="product-benefits">
              <div><Truck /><span><strong>Доставка по России</strong>СДЭК и Почта России</span></div>
              <div><ShieldCheck /><span><strong>Гарантия 6 месяцев</strong>Прямая поддержка производителя</span></div>
              <div><PackageCheck /><span><strong>Защитная упаковка</strong>Проверяем перед отправкой</span></div>
            </div>
          </div>
        </section>
        <section className="product-tabs">
          <div className="product-tabs__nav">
            <button className={activeTab === 'description' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('description')}>Описание</button>
            <button className={activeTab === 'specs' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('specs')}>Характеристики</button>
            <button className={activeTab === 'delivery' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('delivery')}>Доставка и оплата</button>
          </div>
          <div className="product-tabs__content">
            {activeTab === 'description' && <><h2>О товаре</h2><p>{product.description}</p><p>Каждое изделие проходит ручную проверку перед упаковкой. Оттенок и рисунок древесины могут немного отличаться — это естественная особенность натурального материала.</p></>}
            {activeTab === 'specs' && <><h2>Технические характеристики</h2><dl className="spec-table"><div><dt>Материал</dt><dd>{product.material}</dd></div><div><dt>Размер</dt><dd>{product.dimensions}</dd></div><div><dt>Вес</dt><dd>{product.weight}</dd></div><div><dt>Покрытие</dt><dd>{product.finish}</dd></div>{product.specifications.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl></>}
            {activeTab === 'delivery' && <><h2>Как получить заказ</h2><p>Доставляем СДЭК, Почтой России и курьерскими службами. Стоимость рассчитывается при оформлении. Заказы от 7 000 ₽ доставляем бесплатно до пункта выдачи в рамках действующей акции.</p><Link className="text-link" to="/delivery">Подробные условия доставки</Link></>}
          </div>
        </section>
      </Container>
      <section className="section section--soft">
        <Container>
          <SectionHeader title="Похожие товары" description="Другие изделия из этой коллекции." />
          {relatedQuery.isLoading ? <LoadingGrid count={4} /> : <ProductGrid products={related} />}
        </Container>
      </section>
    </>
  );
}
