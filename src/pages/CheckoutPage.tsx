import { useRef, useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, CreditCard, LoaderCircle, ShoppingBag } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { CdekPickupSelector } from '@/components/checkout/CdekPickupSelector';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useCartQuery, cartQueryKey } from '@/hooks/useCart';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatPrice } from '@/lib/formatters';
import type { CdekCity, CdekDeliveryPoint } from '@/services/cdekService';
import { orderService, type CreatedOrder } from '@/services/orderService';
import { isOnlinePaymentMethod, paymentService } from '@/services/paymentService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/useAuthStore';

export function CheckoutPage() {
  useDocumentTitle('Оформление заказа');
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const cartQuery = useCartQuery();
  const profileQuery = useQuery({
    queryKey: ['user', 'profile', user?.id],
    queryFn: userService.getProfile,
    enabled: Boolean(user),
  });
  const paymentMethodsQuery = useQuery({
    queryKey: ['order', 'payment-methods'],
    queryFn: orderService.getPaymentMethods,
    enabled: Boolean(user),
  });
  const shippingMethodsQuery = useQuery({
    queryKey: ['order', 'shipping-methods'],
    queryFn: orderService.getShippingMethods,
    enabled: Boolean(user),
  });
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const [onlinePaymentRequired, setOnlinePaymentRequired] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState('');
  const [orderStateUnknown, setOrderStateUnknown] = useState(false);
  const checkoutInFlight = useRef(false);
  const paymentInFlight = useRef(false);
  const [shippingMethod, setShippingMethod] = useState('SDEK');
  const [cdekCity, setCdekCity] = useState<CdekCity | null>(null);
  const [cdekPoint, setCdekPoint] = useState<CdekDeliveryPoint | null>(null);

  if (!user) return <Navigate to="/account?returnTo=%2Fcheckout" replace />;

  const cart = cartQuery.data;
  if (!cartQuery.isPending && !cartQuery.isError && !cart?.items.length && !order && !orderStateUnknown) {
    return <Navigate to="/cart" replace />;
  }

  const selectedPaymentMethod = paymentMethod || paymentMethodsQuery.data?.[0]?.value || '';

  const startPayment = async (created: CreatedOrder) => {
    if (paymentInFlight.current) return;
    paymentInFlight.current = true;
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const paymentUrl = await paymentService.createPayment(created);
      window.location.assign(paymentUrl);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Не удалось открыть оплату.';
      setPaymentError(`${message} Заказ уже создан. Не оформляйте его повторно; обратитесь в магазин, чтобы продолжить оплату.`);
    } finally {
      paymentInFlight.current = false;
      setPaymentLoading(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkoutInFlight.current || order || orderStateUnknown) return;
    setError('');
    const formData = new FormData(event.currentTarget);
    const selectedShippingMethod = String(formData.get('shippingMethod') ?? '');
    if (selectedShippingMethod === 'SDEK' && (!cdekCity || !cdekPoint)) {
      setError('Выберите город и пункт выдачи СДЭК на карте или в списке.');
      return;
    }
    if (!selectedPaymentMethod) {
      setError('Выберите способ оплаты.');
      return;
    }

    checkoutInFlight.current = true;
    setLoading(true);

    const profile = {
      firstName: String(formData.get('firstName') ?? '').trim(),
      lastName: String(formData.get('lastName') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
    };

    let orderRequestStarted = false;
    try {
      await userService.updateProfile(profile);
      updateUser(profile);
      const city = String(formData.get('city') ?? '').trim();
      const address = String(formData.get('address') ?? '').trim();
      orderRequestStarted = true;
      const created = await orderService.createOrder({
        paymentMethod: selectedPaymentMethod,
        shippingMethod: selectedShippingMethod,
        // Адрес сохраняем для отображения; коды города и ПВЗ передаём отдельными полями API.
        shippingAddress: selectedShippingMethod === 'SDEK' && cdekCity && cdekPoint
          ? `${cdekCity.city}, ПВЗ СДЭК ${cdekPoint.code}, ${cdekPoint.address || cdekPoint.name}`
          : [city, address].filter(Boolean).join(', '),
        ...(selectedShippingMethod === 'SDEK' && cdekCity && cdekPoint
          ? { cdekCityCode: cdekCity.code, cdekDeliveryPointCode: cdekPoint.code }
          : {}),
        comment: String(formData.get('comment') ?? '').trim(),
      });
      setOrder(created);
      const needsOnlinePayment = isOnlinePaymentMethod(selectedPaymentMethod) && created.total > 0;
      setOnlinePaymentRequired(needsOnlinePayment);
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: cartQueryKey(user.id) }),
        queryClient.invalidateQueries({ queryKey: ['orders', user.id] }),
        queryClient.invalidateQueries({ queryKey: ['user', 'stats', user.id] }),
        queryClient.invalidateQueries({ queryKey: ['user', 'profile', user.id] }),
      ]);
      if (needsOnlinePayment) void startPayment(created);
    } catch (requestError) {
      if (orderRequestStarted && requestError instanceof ApiError && requestError.status >= 500) {
        setOrderStateUnknown(true);
        setError('Сервер не подтвердил создание заказа. Проверьте «Мои заказы» в личном кабинете перед повторным оформлением.');
      } else {
        setError(requestError instanceof ApiError ? requestError.message : 'Не удалось создать заказ. Проверьте данные и попробуйте ещё раз.');
      }
    } finally {
      checkoutInFlight.current = false;
      setLoading(false);
    }
  };

  if (order) {
    return (
      <Container className="page-shell checkout-success">
        {onlinePaymentRequired ? <CreditCard /> : <CheckCircle2 />}
        <span className="eyebrow">Заказ создан</span>
        <h1>{onlinePaymentRequired ? 'Осталось оплатить заказ' : 'Спасибо за заказ!'}</h1>
        <p>Номер заказа: <strong>{order.orderNumber}</strong></p>
        <p>{onlinePaymentRequired ? 'Сумма к оплате' : order.message} — <strong>{formatPrice(order.total)}</strong>.</p>
        {onlinePaymentRequired && <p>{paymentLoading ? 'Открываем страницу банка…' : 'Заказ создан. Если переход в банк не произошёл, проверьте заказ в личном кабинете.'}</p>}
        {paymentError && <p className="form-error" role="alert">{paymentError}</p>}
        <div>
          <Link className="button button--secondary" to={`/account?orderId=${order.orderId}`}>Посмотреть заказ</Link>
          {!onlinePaymentRequired && <Link className="button button--primary" to="/catalog">Продолжить покупки</Link>}
        </div>
      </Container>
    );
  }

  if (cartQuery.isPending || profileQuery.isPending || paymentMethodsQuery.isPending || shippingMethodsQuery.isPending) {
    return <Container className="page-shell center-message"><LoaderCircle className="spin" /><h1>Готовим оформление…</h1></Container>;
  }

  if (cartQuery.isError || profileQuery.isError || paymentMethodsQuery.isError || shippingMethodsQuery.isError) {
    const requestError = cartQuery.error || profileQuery.error || paymentMethodsQuery.error || shippingMethodsQuery.error;
    return <Container className="page-shell center-message"><h1>Не удалось подготовить оформление</h1><p>{requestError instanceof Error ? requestError.message : 'Повторите запрос.'}</p><Link className="button button--primary" to="/cart">Вернуться в корзину</Link></Container>;
  }

  const profile = profileQuery.data;

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Корзина', to: '/cart' }, { label: 'Оформление заказа' }]} />
      <div className="page-heading"><div><span className="eyebrow">Последний шаг</span><h1>Оформление заказа</h1><p>Проверьте контактные данные и выберите способ получения.</p></div></div>
      <form className="checkout-layout" key={`${profile?.id ?? user.id}-${cart?.totalItems ?? 0}`} onSubmit={submit}>
        <div className="checkout-form">
          <fieldset>
            <legend>1. Покупатель</legend>
            <div className="form-grid">
              <label><span>Имя *</span><input name="firstName" required defaultValue={profile?.firstName ?? user.firstName} /></label>
              <label><span>Фамилия *</span><input name="lastName" required defaultValue={profile?.lastName ?? user.lastName} /></label>
              <label><span>Телефон *</span><input name="phone" type="tel" required defaultValue={profile?.phone ?? user.phone ?? ''} placeholder="+7 900 000-00-00" /></label>
              <label><span>E-mail *</span><input name="email" type="email" required defaultValue={profile?.email ?? user.email} /></label>
            </div>
          </fieldset>
          <fieldset>
            <legend>2. Доставка</legend>
            <div className="radio-card-grid">
              {shippingMethodsQuery.data?.map((method) => (
                <label className="radio-card" key={method.value}><input type="radio" name="shippingMethod" value={method.value} checked={shippingMethod === method.value} onChange={() => { setShippingMethod(method.value); setError(''); }} /><span><strong>{method.displayName}</strong><small>{method.description}</small></span></label>
              ))}
            </div>
            <div className="form-grid">
              {shippingMethod === 'SDEK' ? (
                <CdekPickupSelector city={cdekCity} point={cdekPoint} onChange={(selectedCity, selectedPoint) => { setCdekCity(selectedCity); setCdekPoint(selectedPoint); setError(''); }} />
              ) : (
                <>
                  <label><span>Город *</span><input name="city" required /></label>
                  <label><span>Адрес получения *</span><input name="address" required /></label>
                </>
              )}
              <label className="form-grid__wide"><span>Комментарий</span><textarea name="comment" rows={3} /></label>
            </div>
          </fieldset>
          <fieldset>
            <legend>3. Оплата</legend>
            <div className="radio-card-grid">
              {paymentMethodsQuery.data?.map((method) => (
                <label className="radio-card" key={method.value}><input type="radio" name="paymentMethod" value={method.value} checked={selectedPaymentMethod === method.value} onChange={() => { setPaymentMethod(method.value); setError(''); }} /><span><strong>{method.displayName}</strong></span></label>
              ))}
            </div>
          </fieldset>
        </div>
        <aside className="order-summary checkout-summary">
          <h2><ShoppingBag size={20} /> Заказ</h2>
          <div className="checkout-products">
            {cart?.items.map((item) => <div key={item.id}><span>{item.productName}{item.variantName ? ` (${item.variantName})` : ''} × {item.quantity}</span><strong>{formatPrice(item.totalPrice)}</strong></div>)}
          </div>
          <dl><div><dt>Товары</dt><dd>{formatPrice(cart?.subtotal ?? 0)}</dd></div><div><dt>Доставка</dt><dd>{cart?.shippingCost ? formatPrice(cart.shippingCost) : 'Бесплатно'}</dd></div></dl>
          <div className="order-summary__total"><span>Итого</span><strong>{formatPrice(cart?.total ?? 0)}</strong></div>
          <label className="consent-row"><input type="checkbox" required /><span>Согласен с офертой и обработкой персональных данных</span></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {orderStateUnknown && <Link className="text-link" to="/account">Проверить мои заказы</Link>}
          <Button type="submit" fullWidth disabled={loading || orderStateUnknown}>{loading && <LoaderCircle className="spin" size={18} />} {loading ? 'Оформляем…' : isOnlinePaymentMethod(selectedPaymentMethod) ? 'Оформить и оплатить' : 'Оформить заказ'}</Button>
        </aside>
      </form>
    </Container>
  );
}
