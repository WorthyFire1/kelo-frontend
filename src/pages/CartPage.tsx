import { ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { products } from '@/data/mockData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatPrice } from '@/lib/formatters';
import { useCartStore } from '@/store/useCartStore';

export function CartPage() {
  useDocumentTitle('Корзина');
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const lines = items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? [{ ...item, product }] : [];
  });
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const delivery = subtotal >= 7000 ? 0 : 490;
  const total = subtotal + delivery;

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Корзина' }]} />
      <div className="page-heading"><div><span className="eyebrow">Ваш заказ</span><h1>Корзина</h1><p>{lines.length ? `${lines.length} позиций готовы к оформлению` : 'Добавьте товары из каталога'}</p></div></div>
      {!lines.length ? (
        <EmptyState icon={<ShoppingBag />} title="Корзина пока пуста" description="Выберите пряничные формы, доски или подарочные наборы в каталоге." action={<Link className="button button--primary" to="/catalog">Перейти в каталог</Link>} />
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {lines.map(({ product, quantity }) => (
              <article className="cart-line" key={product.id}>
                <Link to={`/catalog/${product.slug}`}><ImagePlaceholder src={product.images[0]} alt={product.title} compact /></Link>
                <div className="cart-line__info">
                  <span>{product.categoryName}</span>
                  <h2><Link to={`/catalog/${product.slug}`}>{product.title}</Link></h2>
                  <small>{product.material} · {product.dimensions}</small>
                </div>
                <QuantityControl value={quantity} onChange={(value) => setQuantity(product.id, value)} max={product.stock || 99} />
                <strong className="cart-line__price">{formatPrice(product.price * quantity)}</strong>
                <button className="icon-button" type="button" onClick={() => removeItem(product.id)} aria-label="Удалить товар"><Trash2 size={19} /></button>
              </article>
            ))}
          </div>
          <aside className="order-summary">
            <h2>Ваш заказ</h2>
            <dl>
              <div><dt>Товары</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div><dt>Доставка</dt><dd>{delivery === 0 ? 'Бесплатно' : formatPrice(delivery)}</dd></div>
            </dl>
            {delivery > 0 && <p className="order-summary__hint">Добавьте товаров на {formatPrice(7000 - subtotal)}, чтобы получить бесплатную доставку.</p>}
            <label><span>Промокод</span><div className="promo-input"><input placeholder="Введите код" /><button type="button">Применить</button></div></label>
            <div className="order-summary__total"><span>Итого</span><strong>{formatPrice(total)}</strong></div>
            <Link className="button button--primary button--full" to="/checkout">Перейти к оформлению</Link>
            <Link className="text-link text-link--center" to="/catalog">Продолжить покупки</Link>
          </aside>
        </div>
      )}
    </Container>
  );
}
