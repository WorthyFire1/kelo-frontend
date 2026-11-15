import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { authService } from '@/services/authService';

export function ResetPasswordPage() {
  useDocumentTitle('Новый пароль');
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email')?.trim() ?? '';
  const token = searchParams.get('token') ?? '';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !email || !token) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const newPassword = String(data.get('newPassword') ?? '');
    const confirmPassword = String(data.get('confirmPassword') ?? '');
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await authService.resetPassword({ email, token, newPassword, confirmPassword });
      form.reset();
      setCompleted(true);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Не удалось изменить пароль. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Новый пароль' }]} />
      <section className="auth-card auth-recovery">
        <KeyRound className="auth-recovery__icon" aria-hidden="true" />
        {completed ? (
          <>
            <h1>Пароль изменён</h1>
            <p className="profile-feedback is-success" role="status">Теперь можно войти с новым паролем.</p>
            <Link className="button button--primary" to="/account">Войти в аккаунт</Link>
          </>
        ) : email && token ? (
          <>
            <h1>Создайте новый пароль</h1>
            <p>Для аккаунта {email}. Новый пароль должен содержать не менее 6 символов.</p>
            <form onSubmit={submit}>
              <label><span>Новый пароль</span><input name="newPassword" type="password" autoComplete="new-password" minLength={6} required /></label>
              <label><span>Повторите новый пароль</span><input name="confirmPassword" type="password" autoComplete="new-password" minLength={6} required /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Сохраняем…' : 'Сменить пароль'}</Button>
            </form>
          </>
        ) : (
          <>
            <h1>Ссылка неполная</h1>
            <p>В ссылке нет данных для смены пароля. Запросите новое письмо и откройте ссылку из него.</p>
            <Link className="button button--primary" to="/forgot-password">Запросить новую ссылку</Link>
          </>
        )}
      </section>
    </Container>
  );
}
