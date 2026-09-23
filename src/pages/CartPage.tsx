import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { useCartQuery, useRemoveFromCart, useUpdateCart } from '@/hooks/useCart';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatPrice } from '@/lib/formatters';
import { discountService, type DiscountValidation } from '@/services/discountService';
import { useAuthStore } from '@/store/useAuthStore';

export function CartPage() {
  useDocumentTitle('Корзина');
  const user = useAuthStore((state) => state.user);
  const cartQuery = useCartQuery();
  const updateMutation = useUpdateCart();
  const removeMutation = useRemoveFromCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<DiscountValidation | null>(null);
  const promoMutation = useMutation({
    mutationFn: () => discountService.validate(promoCode.trim(), cartQuery.data?.subtotal ?? 0),
    onSuccess: setPromoResult,
    onError: (error) => setPromoResult({
      isValid: false,
      message: error instanceof ApiError ? error.message : 'Не удалось проверить промокод.',
    }),
  });

  if (!user) {
    return (
      <Container className="page-shell">
        <Breadcrumbs items={[{ label: 'Корзина' }]} />
        <EmptyState
          icon={<ShoppingBag />}
          title="Войдите, чтобы пользоваться корзиной"
          description="Текущий backend хранит корзину в учётной записи покупателя. После входа она будет доступна на любом устройстве."
          action={<Link className="button button--primary" to="/account?returnTo=%2Fcart">Войти или зарегистрироваться</Link>}
        />
      </Container>
    );
  }

  if (cartQuery.isPending) {
    return <Container className="page-shell center-message"><h1>Загружаем корзину…</h1></Container>;
  }

  if (cartQuery.isError) {
    return (
      <Container className="page-shell center-message">
        <h1>Не удалось загрузить корзину</h1>
        <p>{cartQuery.error instanceof Error ? cartQuery.error.message : 'Повторите запрос.'}</p>
        <button className="button button--primary" type="button" onClick={() => void cartQuery.refetch()}>Повторить</button>
      </Container>
    );
  }

  const cart = cartQuery.data;
  const lines = cart?.items ?? [];

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Корзина' }]} />
      <div className="page-heading"><div><span className="eyebrow">Ваш заказ</span><h1>Корзина</h1><p>{lines.length ? `${cart?.totalItems ?? 0} товаров готовы к оформлению` : 'Добавьте товары из каталога'}</p></div></div>
      {!lines.length ? (
        <EmptyState icon={<ShoppingBag />} title="Корзина пока пуста" description="Выберите пряничные формы, доски или подарочные наборы в каталоге." action={<Link className="button button--primary" to="/catalog">Перейти в каталог</Link>} />
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {lines.map((item) => (
              <article className="cart-line" key={item.id}>
                <ImagePlaceholder src={item.imageUrl} alt={item.productName} compact />
                <div className="cart-line__info">
                  <span>{item.variantName ? `Вариант: ${item.variantName}` : 'КЕЛО'}</span>
                  <h2>{item.productName}</h2>
                  <small>{formatPrice(item.unitPrice)} за штуку</small>
                </div>
                <QuantityControl
                  value={item.quantity}
                  onChange={(quantity) => updateMutation.mutate(
                    { cartItemId: item.id, quantity },
                    { onError: (error) => window.alert(error instanceof Error ? error.message : 'Не удалось изменить количество.') },
                  )}
                  max={item.maxQuantity || 1}
                />
                <strong className="cart-line__price">{formatPrice(item.totalPrice)}</strong>
                <button
                  className="icon-button"
                  type="button"
                  disabled={removeMutation.isPending}
                  onClick={() => removeMutation.mutate(item.id)}
                  aria-label="Удалить товар"
                ><Trash2 size={19} /></button>
              </article>
            ))}
          </div>
          <aside className="order-summary">
            <h2>Ваш заказ</h2>
            <dl>
              <div><dt>Товары</dt><dd>{formatPrice(cart?.subtotal ?? 0)}</dd></div>
              <div><dt>Доставка</dt><dd>{cart?.shippingCost === 0 ? 'Бесплатно' : formatPrice(cart?.shippingCost ?? 0)}</dd></div>
            </dl>
            {!cart?.isFreeShipping && <p className="order-summary__hint">Добавьте товаров на {formatPrice(Math.max(0, 7000 - (cart?.subtotal ?? 0)))}, чтобы получить бесплатную доставку.</p>}
            <label>
              <span>Промокод</span>
              <div className="promo-input">
                <input value={promoCode} onChange={(event) => { setPromoCode(event.target.value); setPromoResult(null); }} placeholder="Введите код" />
                <button type="button" disabled={!promoCode.trim() || promoMutation.isPending} onClick={() => promoMutation.mutate()}>{promoMutation.isPending ? 'Проверяем…' : 'Проверить'}</button>
              </div>
            </label>
            {promoResult && <p className={promoResult.isValid ? 'promo-result is-success' : 'promo-result is-error'}>{promoResult.message}{promoResult.isValid && promoResult.description ? `: ${promoResult.description}` : ''}{promoResult.isValid ? '. Сумма заказа не изменена: текущий backend пока не принимает промокод при оформлении.' : ''}</p>}
            <div className="order-summary__total"><span>Итого</span><strong>{formatPrice(cart?.total ?? 0)}</strong></div>
            <Link className="button button--primary button--full" to="/checkout">Перейти к оформлению</Link>
            <Link className="text-link text-link--center" to="/catalog">Продолжить покупки</Link>
          </aside>
        </div>
      )}
    </Container>
  );
}
