import { useState, type FormEvent } from 'react';
import { LogOut, Package, Percent, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ApiError } from '@/api/client';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { getJwtRoles } from '@/lib/jwt';

export function AccountPage() {
  useDocumentTitle('Личный кабинет');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const logout = useAuthStore((state) => state.logout);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      let response;
      if (tab === 'register') {
        response = await authService.register({
          email,
          password,
          firstName: String(data.get('firstName') ?? '').trim(),
          lastName: String(data.get('lastName') ?? '').trim(),
        });
      } else {
        response = await authService.login({ email, password });
      }

      setSession(response);
      const isAdmin = getJwtRoles(response.accessToken)
        .some((role) => role.toLocaleLowerCase() === 'admin');
      const returnTo = searchParams.get('returnTo');
      if (isAdmin) navigate(returnTo?.startsWith('/admin') ? returnTo : '/admin');
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

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Личный кабинет' }]} />
      <div className="page-heading"><div><span className="eyebrow">Профиль покупателя</span><h1>Личный кабинет</h1><p>История заказов, персональные скидки и сохранённые данные.</p></div></div>
      {user ? (
        <div className="account-layout">
          <aside className="account-sidebar">
            <div className="account-avatar"><UserRound /></div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
            <button type="button" onClick={logout}><LogOut size={17} /> Выйти</button>
          </aside>
          <div className="account-content">
            <div className="demo-note">Авторизация подключена к серверу. Заказы, адреса и скидки появятся после подключения соответствующих разделов API.</div>
            <div className="account-card-grid">
              <article><Package /><span>Заказы</span><strong>0</strong><p>История заказов появится после первого оформления.</p></article>
              <article><Percent /><span>Персональная скидка</span><strong>0%</strong><p>Уровень скидки будет рассчитываться бэкендом.</p></article>
            </div>
            {user.isAdmin && (
              <section className="account-admin-card">
                <div><ShieldCheck /><span><strong>Доступ администратора</strong><small>Управление магазином и просмотр данных backend.</small></span></div>
                <Link className="button button--primary" to="/admin">Открыть админ-панель</Link>
              </section>
            )}
            <section className="profile-form-section">
              <h2>Контактные данные</h2>
              <div className="form-grid"><label><span>Имя</span><input defaultValue={user.name} /></label><label><span>E-mail</span><input defaultValue={user.email} /></label><label><span>Телефон</span><input placeholder="+7 900 000-00-00" /></label><label><span>Город</span><input placeholder="Ваш город" /></label></div>
              <Button type="button">Сохранить изменения</Button>
            </section>
          </div>
        </div>
      ) : (
        <div className="auth-layout">
          <div className="auth-benefits">
            <UserRound />
            <h2>Зачем нужен аккаунт</h2>
            <ul className="check-list"><li>История и статусы заказов</li><li>Быстрое повторное оформление</li><li>Персональные акции и скидки</li><li>Сохранённые адреса доставки</li></ul>
          </div>
          <div className="auth-card">
            <div className="auth-tabs"><button className={tab === 'login' ? 'is-active' : ''} type="button" onClick={() => setTab('login')}>Вход</button><button className={tab === 'register' ? 'is-active' : ''} type="button" onClick={() => setTab('register')}>Регистрация</button></div>
            <form onSubmit={submit}>
              {tab === 'register' && (
                <div className="auth-name-fields">
                  <label><span>Имя</span><input name="firstName" autoComplete="given-name" required /></label>
                  <label><span>Фамилия</span><input name="lastName" autoComplete="family-name" required /></label>
                </div>
              )}
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
    </Container>
  );
}
