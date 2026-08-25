import { useState, type FormEvent } from 'react';
import { CheckCircle2, LoaderCircle, ShoppingBag } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { products } from '@/data/mockData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatPrice } from '@/lib/formatters';
import { orderService } from '@/services/orderService';
import { useCartStore } from '@/store/useCartStore';
import type { CreatedOrder } from '@/types/catalog';

export function CheckoutPage() {
  useDocumentTitle('Оформление заказа');
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const [error, setError] = useState('');

  const lines = items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? [{ ...item, product }] : [];
  });
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const deliveryPrice = subtotal >= 7000 ? 0 : 490;
  const total = subtotal + deliveryPrice;

  if (!items.length && !order) return <Navigate to="/cart" replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(event.currentTarget);

    try {
      const created = await orderService.createOrder({
        customer: {
          firstName: String(formData.get('firstName') ?? ''),
          lastName: String(formData.get('lastName') ?? ''),
          phone: String(formData.get('phone') ?? ''),
          email: String(formData.get('email') ?? ''),
        },
        delivery: {
          method: String(formData.get('deliveryMethod')) as 'cdek' | 'post' | 'courier' | 'pickup',
          city: String(formData.get('city') ?? ''),
          address: String(formData.get('address') ?? ''),
          comment: String(formData.get('comment') ?? ''),
        },
        paymentMethod: String(formData.get('paymentMethod')) as 'card' | 'on-delivery' | 'invoice',
        items: lines.map((line) => ({ productId: line.product.id, quantity: line.quantity, price: line.product.price })),
      });
      setOrder({ ...created, total });
      clear();
    } catch {
      setError('Не удалось создать заказ. Проверьте данные и попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  if (order) {
    return (
      <Container className="page-shell checkout-success">
        <CheckCircle2 />
        <span className="eyebrow">Заказ создан</span>
        <h1>Спасибо за заказ!</h1>
        <p>Номер заказа: <strong>{order.number}</strong></p>
        <p>Сейчас заказ создан в демонстрационном режиме. После подключения бэкенда данные будут сохраняться в базе, а покупателю придёт подтверждение.</p>
        <div><Link className="button button--primary" to="/catalog">Продолжить покупки</Link><Link className="button button--secondary" to="/account">Личный кабинет</Link></div>
      </Container>
    );
  }

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Корзина', to: '/cart' }, { label: 'Оформление заказа' }]} />
      <div className="page-heading"><div><span className="eyebrow">Последний шаг</span><h1>Оформление заказа</h1><p>Заполните контактные данные и выберите способ получения.</p></div></div>
      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-form">
          <fieldset>
            <legend>1. Покупатель</legend>
            <div className="form-grid">
              <label><span>Имя *</span><input name="firstName" required /></label>
              <label><span>Фамилия *</span><input name="lastName" required /></label>
              <label><span>Телефон *</span><input name="phone" type="tel" required placeholder="+7 900 000-00-00" /></label>
              <label><span>E-mail *</span><input name="email" type="email" required /></label>
            </div>
          </fieldset>
          <fieldset>
            <legend>2. Доставка</legend>
            <div className="radio-card-grid">
              <label className="radio-card"><input type="radio" name="deliveryMethod" value="cdek" defaultChecked /><span><strong>СДЭК</strong><small>Пункт выдачи или курьер</small></span></label>
              <label className="radio-card"><input type="radio" name="deliveryMethod" value="post" /><span><strong>Почта России</strong><small>Отделение рядом с вами</small></span></label>
              <label className="radio-card"><input type="radio" name="deliveryMethod" value="pickup" /><span><strong>Самовывоз</strong><small>По согласованию</small></span></label>
            </div>
            <div className="form-grid">
              <label><span>Город *</span><input name="city" required /></label>
              <label><span>Адрес или пункт выдачи *</span><input name="address" required /></label>
              <label className="form-grid__wide"><span>Комментарий</span><textarea name="comment" rows={3} /></label>
            </div>
          </fieldset>
          <fieldset>
            <legend>3. Оплата</legend>
            <div className="radio-card-grid">
              <label className="radio-card"><input type="radio" name="paymentMethod" value="card" defaultChecked /><span><strong>Картой онлайн</strong><small>Подключится вместе с платёжным сервисом</small></span></label>
              <label className="radio-card"><input type="radio" name="paymentMethod" value="on-delivery" /><span><strong>При получении</strong><small>Для доступных способов доставки</small></span></label>
              <label className="radio-card"><input type="radio" name="paymentMethod" value="invoice" /><span><strong>По счёту</strong><small>Для юридических лиц</small></span></label>
            </div>
          </fieldset>
        </div>
        <aside className="order-summary checkout-summary">
          <h2><ShoppingBag size={20} /> Заказ</h2>
          <div className="checkout-products">
            {lines.map((line) => <div key={line.product.id}><span>{line.product.title} × {line.quantity}</span><strong>{formatPrice(line.product.price * line.quantity)}</strong></div>)}
          </div>
          <dl><div><dt>Товары</dt><dd>{formatPrice(subtotal)}</dd></div><div><dt>Доставка</dt><dd>{deliveryPrice ? formatPrice(deliveryPrice) : 'Бесплатно'}</dd></div></dl>
          <div className="order-summary__total"><span>Итого</span><strong>{formatPrice(total)}</strong></div>
          <label className="consent-row"><input type="checkbox" required /><span>Согласен с офертой и обработкой персональных данных</span></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit" fullWidth disabled={loading}>{loading && <LoaderCircle className="spin" size={18} />} Оформить заказ</Button>
        </aside>
      </form>
    </Container>
  );
}
