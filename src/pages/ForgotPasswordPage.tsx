import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { authService } from '@/services/authService';

export function ForgotPasswordPage() {
  useDocumentTitle('Восстановление пароля');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    setError('');
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Не удалось отправить запрос. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Восстановление пароля' }]} />
      <section className="auth-card auth-recovery">
        <KeyRound className="auth-recovery__icon" aria-hidden="true" />
        <h1>Восстановление пароля</h1>
        {sent ? (
          <>
            <p className="profile-feedback is-success" role="status">Если аккаунт с таким адресом существует, письмо со ссылкой отправлено. Проверьте также папку «Спам».</p>
            <Link className="button button--primary" to="/account">Вернуться ко входу</Link>
          </>
        ) : (
          <>
            <p>Укажите e-mail, который использовали при регистрации. Мы отправим ссылку для смены пароля.</p>
            <form onSubmit={submit}>
              <label><span>E-mail</span><input name="email" type="email" autoComplete="email" required placeholder="mail@example.ru" /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Отправляем…' : 'Отправить ссылку'}</Button>
            </form>
            <Link className="text-link auth-recovery__back" to="/account">Вспомнили пароль? Войти</Link>
          </>
        )}
      </section>
    </Container>
  );
}
