import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, KeyRound, LogOut, Package, ShieldCheck, Star, UserRound, WalletCards, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatPrice } from '@/lib/formatters';
import { authService } from '@/services/authService';
import { customOrderService } from '@/services/customOrderService';
import { orderService } from '@/services/orderService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/useAuthStore';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const orderStatusLabels: Record<string, string> = {
  New: 'Новый',
  Processing: 'В обработке',
  Shipped: 'Отправлен',
  Delivered: 'Доставлен',
  Cancelled: 'Отменён',
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export function AccountPage() {
  useDocumentTitle('Личный кабинет');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedCustomOrderId, setSelectedCustomOrderId] = useState<number | null>(null);

  const profileQuery = useQuery({
    queryKey: ['user', 'profile', user?.id],
    queryFn: userService.getProfile,
    enabled: Boolean(user),
  });
  const statsQuery = useQuery({
    queryKey: ['user', 'stats', user?.id],
    queryFn: userService.getStats,
    enabled: Boolean(user),
  });
  const ordersQuery = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: orderService.getOrders,
    enabled: Boolean(user),
  });
  const statusesQuery = useQuery({
    queryKey: ['order', 'statuses'],
    queryFn: orderService.getStatuses,
    enabled: Boolean(user),
  });
  const orderQuery = useQuery({
    queryKey: ['order', user?.id, selectedOrderId],
    queryFn: () => orderService.getOrder(selectedOrderId as number),
    enabled: Boolean(user) && selectedOrderId !== null,
  });
  const customOrdersQuery = useQuery({
    queryKey: ['custom-orders', user?.id],
    queryFn: customOrderService.getOrders,
    enabled: Boolean(user),
  });
  const customOrderQuery = useQuery({
    queryKey: ['custom-order', user?.id, selectedCustomOrderId],
    queryFn: () => customOrderService.getOrder(selectedCustomOrderId as number),
    enabled: Boolean(user) && selectedCustomOrderId !== null,
  });
  const cancelMutation = useMutation({
    mutationFn: orderService.cancelOrder,
    onSuccess: async () => {
      setSelectedOrderId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['user', 'stats', user?.id] }),
      ]);
    },
  });

  useEffect(() => {
    setProfileMessage('');
    setProfileError('');
    setPasswordMessage('');
    setPasswordError('');
  }, [user?.id]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');

    if (tab === 'register' && password !== String(data.get('passwordConfirmation') ?? '')) {
      setError('Пароли не совпадают.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = tab === 'register'
        ? await authService.register({
          email,
          password,
          firstName: String(data.get('firstName') ?? '').trim(),
          lastName: String(data.get('lastName') ?? '').trim(),
        })
        : await authService.login({ email, password });

      setSession(response);
      const requestedPath = searchParams.get('returnTo');
      const returnTo = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/account';
      navigate(returnTo, { replace: true });
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        setError('Неверный e-mail или пароль.');
      } else if (requestError instanceof ApiError && requestError.status === 400) {
        setError(requestError.message || (tab === 'register' ? 'Не удалось зарегистрироваться. Проверьте данные.' : 'Проверьте введённые данные.'));
      } else {
        setError('Не удалось связаться с сервером. Попробуйте ещё раз.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || profileQuery.isPending || profileQuery.isFetching) return;
    const data = new FormData(event.currentTarget);
    const profile = {
      firstName: String(data.get('firstName') ?? '').trim(),
      lastName: String(data.get('lastName') ?? '').trim(),
      email: String(data.get('profileEmail') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
    };

    setProfileMessage('');
    setProfileError('');
    setIsProfileSaving(true);
    try {
      const response = await userService.updateProfile(profile);
      updateUser(profile);
      setProfileMessage(response.message || 'Изменения сохранены.');
      await queryClient.invalidateQueries({ queryKey: ['user', 'profile', user.id] });
    } catch (requestError) {
      setProfileError(requestError instanceof ApiError ? requestError.message : 'Не удалось сохранить изменения. Попробуйте ещё раз.');
    } finally {
      setIsProfileSaving(false);
    }
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const request = {
      currentPassword: String(data.get('currentPassword') ?? ''),
      newPassword: String(data.get('newPassword') ?? ''),
      confirmPassword: String(data.get('confirmPassword') ?? ''),
    };
    if (request.newPassword !== request.confirmPassword) {
      setPasswordError('Новые пароли не совпадают.');
      return;
    }

    setPasswordMessage('');
    setPasswordError('');
    try {
      const response = await userService.changePassword(request);
      setPasswordMessage(response.message);
      form.reset();
    } catch (requestError) {
      setPasswordError(requestError instanceof ApiError ? requestError.message : 'Не удалось изменить пароль.');
    }
  };

  const handleLogout = () => {
    queryClient.removeQueries({ queryKey: ['user'] });
    queryClient.removeQueries({ queryKey: ['orders'] });
    queryClient.removeQueries({ queryKey: ['custom-orders'] });
    queryClient.removeQueries({ queryKey: ['cart'] });
    queryClient.removeQueries({ queryKey: ['wishlist'] });
    logout();
  };

  const roleLabel = user?.isAdmin ? 'Администратор' : 'Пользователь';
  const profile = profileQuery.data;
  const stats = statsQuery.data;
  const isProfileLoading = profileQuery.isPending || profileQuery.isFetching;
  const getOrderStatusLabel = (status: string) => statusesQuery.data?.find((item) => item.value === status)?.displayName ?? orderStatusLabels[status] ?? status;

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Личный кабинет' }]} />
      <div className="page-heading"><div><span className="eyebrow">Профиль покупателя</span><h1>Личный кабинет</h1><p>История заказов, заявки и сохранённые данные.</p></div></div>
      {user ? (
        <div className="account-layout">
          <aside className="account-sidebar">
            <div className="account-avatar"><UserRound /></div>
            <strong>{user.name}</strong>
            <span className="account-email">{user.email}</span>
            <span className="account-role">{roleLabel}</span>
            <nav><a href="#orders">Заказы</a><a href="#custom-orders">Индивидуальные заявки</a><a href="#profile">Профиль</a><a href="#password">Пароль</a></nav>
            <button type="button" onClick={handleLogout}><LogOut size={17} /> Выйти</button>
          </aside>
          <div className="account-content">
            <div className="account-card-grid account-card-grid--stats">
              <article><Package /><span>Заказы</span><strong>{stats?.ordersCount ?? '—'}</strong><p>Оформлено в магазине.</p></article>
              <article><Heart /><span>Избранное</span><strong>{stats?.wishlistCount ?? '—'}</strong><p>Сохранённых товаров.</p></article>
              <article><Star /><span>Отзывы</span><strong>{stats?.reviewsCount ?? '—'}</strong><p>Отправлено на сайт.</p></article>
              <article><WalletCards /><span>Покупки</span><strong>{stats ? formatPrice(stats.totalSpent) : '—'}</strong><p>По доставленным заказам.</p></article>
            </div>

            {user.isAdmin && (
              <section className="account-admin-card">
                <div><ShieldCheck /><span><strong>Доступ администратора</strong><small>Управление магазином и данными backend.</small></span></div>
                <Link className="button button--primary" to="/admin">Открыть админ-панель</Link>
              </section>
            )}

            <section className="account-section" id="orders">
              <div className="account-section__heading"><div><span className="eyebrow">Покупки</span><h2>Мои заказы</h2></div><Link className="text-link" to="/catalog">В каталог</Link></div>
              {ordersQuery.isPending ? <p>Загружаем заказы…</p> : ordersQuery.isError ? <p className="profile-feedback is-error">{ordersQuery.error instanceof Error ? ordersQuery.error.message : 'Не удалось загрузить заказы.'}</p> : ordersQuery.data?.length ? (
                <div className="account-order-list">
                  {ordersQuery.data.map((order) => (
                    <article key={order.id}>
                      <div><span>{formatDate(order.orderDate)}</span><strong>{order.orderNumber}</strong><small>{getOrderStatusLabel(order.status)}</small></div>
                      <strong>{formatPrice(order.total)}</strong>
                      <div className="account-order-actions">
                        <button type="button" onClick={() => setSelectedOrderId(order.id)}>Подробнее</button>
                        {['New', 'Processing'].includes(order.status) && <button className="is-danger" type="button" disabled={cancelMutation.isPending} onClick={() => window.confirm(`Отменить заказ ${order.orderNumber}?`) && cancelMutation.mutate(order.id)}>Отменить</button>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : <p className="account-empty">Заказов пока нет. Добавьте товары в корзину и оформите первую покупку.</p>}
              {cancelMutation.isError && <p className="profile-feedback is-error">{cancelMutation.error instanceof Error ? cancelMutation.error.message : 'Не удалось отменить заказ.'}</p>}
            </section>

            <section className="account-section" id="custom-orders">
              <div className="account-section__heading"><div><span className="eyebrow">Проекты</span><h2>Индивидуальные заявки</h2></div><Link className="text-link" to="/custom-order">Новая заявка</Link></div>
              {customOrdersQuery.isPending ? <p>Загружаем заявки…</p> : customOrdersQuery.isError ? <p className="profile-feedback is-error">{customOrdersQuery.error instanceof Error ? customOrdersQuery.error.message : 'Не удалось загрузить заявки.'}</p> : customOrdersQuery.data?.length ? (
                <div className="account-order-list">
                  {customOrdersQuery.data.map((request) => <article key={request.id}><div><span>{formatDate(request.createdAt)}</span><strong>Заявка №{request.id}</strong><small>{request.statusName}</small></div><p>{request.description}</p><button type="button" onClick={() => setSelectedCustomOrderId(request.id)}>Подробнее</button></article>)}
                </div>
              ) : <p className="account-empty">У вас пока нет заявок на индивидуальное изготовление.</p>}
            </section>

            <form className="profile-form-section" id="profile" key={profile ? `${user.id}-${profile.firstName}-${profile.lastName}-${profile.email}-${profile.phone}` : `${user.id}-profile`} onSubmit={saveProfile}>
              <h2>Контактные данные</h2>
              <div className="form-grid">
                <label><span>Имя</span><input name="firstName" required defaultValue={profile?.firstName ?? user.firstName} /></label>
                <label><span>Фамилия</span><input name="lastName" required defaultValue={profile?.lastName ?? user.lastName} /></label>
                <label><span>E-mail</span><input name="profileEmail" type="email" required defaultValue={profile?.email ?? user.email} /></label>
                <label><span>Телефон</span><input name="phone" type="tel" defaultValue={profile?.phone || user.phone || ''} placeholder="+7 900 000-00-00" /></label>
              </div>
              {profileMessage && <div className="profile-feedback is-success" role="status">{profileMessage}</div>}
              {profileError && <div className="profile-feedback is-error" role="alert">{profileError}</div>}
              <Button type="submit" disabled={isProfileLoading || isProfileSaving}>{isProfileLoading ? 'Загружаем...' : isProfileSaving ? 'Сохраняем...' : 'Сохранить изменения'}</Button>
            </form>

            <form className="profile-form-section" id="password" onSubmit={changePassword}>
              <div className="account-section__heading"><div><KeyRound /><h2>Смена пароля</h2></div></div>
              <div className="form-grid">
                <label className="form-grid__wide"><span>Текущий пароль</span><input name="currentPassword" type="password" required /></label>
                <label><span>Новый пароль</span><input name="newPassword" type="password" required minLength={6} /></label>
                <label><span>Повторите новый пароль</span><input name="confirmPassword" type="password" required minLength={6} /></label>
              </div>
              {passwordMessage && <div className="profile-feedback is-success" role="status">{passwordMessage}</div>}
              {passwordError && <div className="profile-feedback is-error" role="alert">{passwordError}</div>}
              <Button type="submit">Изменить пароль</Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="auth-layout">
          <div className="auth-benefits">
            <UserRound />
            <h2>Зачем нужен аккаунт</h2>
            <ul className="check-list"><li>Корзина и избранное на любом устройстве</li><li>История и статусы заказов</li><li>Отмена заказа до отправки</li><li>История индивидуальных заявок</li></ul>
          </div>
          <div className="auth-card">
            <div className="auth-tabs"><button className={tab === 'login' ? 'is-active' : ''} type="button" onClick={() => setTab('login')}>Вход</button><button className={tab === 'register' ? 'is-active' : ''} type="button" onClick={() => setTab('register')}>Регистрация</button></div>
            <form onSubmit={submit}>
              {tab === 'register' && <div className="auth-name-fields"><label><span>Имя</span><input name="firstName" autoComplete="given-name" required /></label><label><span>Фамилия</span><input name="lastName" autoComplete="family-name" required /></label></div>}
              <label><span>E-mail</span><input name="email" type="email" required placeholder="mail@example.ru" /></label>
              <label><span>Пароль</span><input name="password" type="password" required minLength={6} /></label>
              {tab === 'register' && <label><span>Повторите пароль</span><input name="passwordConfirmation" type="password" required minLength={6} /></label>}
              {error && <div className="form-error" role="alert">{error}</div>}
              <Button fullWidth type="submit" disabled={isSubmitting}>{isSubmitting ? 'Подождите...' : tab === 'login' ? 'Войти' : 'Создать аккаунт'}</Button>
            </form>
            <p>Данные передаются на сервер КЕЛО. После регистрации вход выполняется автоматически.</p>
          </div>
        </div>
      )}

      {selectedOrderId !== null && (
        <div className="account-modal" role="dialog" aria-modal="true" aria-label="Детали заказа">
          <button className="account-modal__overlay" type="button" onClick={() => setSelectedOrderId(null)} aria-label="Закрыть" />
          <div className="account-modal__panel"><button className="account-modal__close" type="button" onClick={() => setSelectedOrderId(null)}><X /></button><span className="eyebrow">Заказ</span>
            {orderQuery.isPending ? <p>Загружаем…</p> : orderQuery.data ? <><h2>{orderQuery.data.orderNumber}</h2><dl className="account-detail-grid"><div><dt>Статус</dt><dd>{getOrderStatusLabel(orderQuery.data.status)}</dd></div><div><dt>Дата</dt><dd>{formatDate(orderQuery.data.orderDate)}</dd></div><div><dt>Доставка</dt><dd>{orderQuery.data.shippingMethod}</dd></div><div><dt>Оплата</dt><dd>{orderQuery.data.paymentMethod}</dd></div><div className="form-grid__wide"><dt>Адрес</dt><dd>{orderQuery.data.shippingAddress}</dd></div></dl><div className="account-detail-items">{orderQuery.data.items.map((item, index) => <div key={`${item.productName}-${index}`}><span>{item.productName} × {item.quantity}</span><strong>{formatPrice(item.totalPrice)}</strong></div>)}</div><div className="account-detail-total"><span>Итого</span><strong>{formatPrice(orderQuery.data.total)}</strong></div></> : <p className="profile-feedback is-error">Не удалось загрузить заказ.</p>}
          </div>
        </div>
      )}

      {selectedCustomOrderId !== null && (
        <div className="account-modal" role="dialog" aria-modal="true" aria-label="Детали заявки">
          <button className="account-modal__overlay" type="button" onClick={() => setSelectedCustomOrderId(null)} aria-label="Закрыть" />
          <div className="account-modal__panel"><button className="account-modal__close" type="button" onClick={() => setSelectedCustomOrderId(null)}><X /></button><span className="eyebrow">Индивидуальный заказ</span>
            {customOrderQuery.isPending ? <p>Загружаем…</p> : customOrderQuery.data ? <><h2>Заявка №{customOrderQuery.data.id}</h2><dl className="account-detail-grid"><div><dt>Статус</dt><dd>{customOrderQuery.data.statusName}</dd></div><div><dt>Дата</dt><dd>{formatDate(customOrderQuery.data.createdAt)}</dd></div><div><dt>Оценка</dt><dd>{customOrderQuery.data.estimatedPrice ? formatPrice(customOrderQuery.data.estimatedPrice) : 'Ещё не рассчитана'}</dd></div><div className="form-grid__wide"><dt>Описание</dt><dd>{customOrderQuery.data.description}</dd></div><div className="form-grid__wide"><dt>Комментарий менеджера</dt><dd>{customOrderQuery.data.adminComment || 'Пока нет'}</dd></div></dl></> : <p className="profile-feedback is-error">Не удалось загрузить заявку.</p>}
          </div>
        </div>
      )}
    </Container>
  );
}
