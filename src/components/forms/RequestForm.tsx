import { useState, type FormEvent } from 'react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { feedbackService, type FeedbackRequest } from '@/services/feedbackService';
import { customOrderService } from '@/services/customOrderService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';

interface RequestFormProps {
  kind: FeedbackRequest['kind'];
  title?: string;
  submitLabel?: string;
}

export function RequestForm({ kind, title, submitLabel = 'Отправить заявку' }: RequestFormProps) {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setError('');
    const formData = new FormData(event.currentTarget);

    try {
      const request = {
        name: String(formData.get('name') ?? '').trim(),
        phone: String(formData.get('phone') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        message: String(formData.get('message') ?? '').trim(),
      };
      if (kind === 'custom-order') {
        const response = await customOrderService.create({
          name: request.name,
          phone: request.phone,
          email: request.email || undefined,
          description: request.message,
        });
        setSuccessMessage(response.message);
      } else {
        await feedbackService.send({ ...request, kind });
        setSuccessMessage('Сообщение подготовлено в вашей почтовой программе. Отправьте письмо, чтобы мы его получили.');
      }
      setSuccess(true);
      form.reset();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Не удалось отправить форму. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={38} />
        <h3>Заявка принята</h3>
        <p>{successMessage}</p>
        <Button variant="secondary" type="button" onClick={() => setSuccess(false)}>Отправить ещё одну</Button>
      </div>
    );
  }

  if (kind === 'custom-order' && !user) {
    return (
      <div className="form-success">
        <h3>Войдите, чтобы отправить заявку</h3>
        <p>Backend привязывает индивидуальный заказ к учётной записи. После входа заявка и её статус появятся в личном кабинете.</p>
        <Link className="button button--primary" to="/account?returnTo=%2Fcustom-order%23custom-form">Войти или зарегистрироваться</Link>
      </div>
    );
  }

  return (
    <form className="request-form" onSubmit={submit}>
      {title && <h2>{title}</h2>}
      <div className="form-grid">
        <label>
          <span>Имя *</span>
          <input name="name" required placeholder="Как к вам обращаться" />
        </label>
        <label>
          <span>Телефон *</span>
          <input name="phone" type="tel" required placeholder="+7 900 000-00-00" />
        </label>
        <label className="form-grid__wide">
          <span>E-mail{kind === 'custom-order' ? ' *' : ''}</span>
          <input name="email" type="email" required={kind === 'custom-order'} defaultValue={kind === 'custom-order' ? user?.email : ''} placeholder="mail@example.ru" />
        </label>
        <label className="form-grid__wide">
          <span>Комментарий *</span>
          <textarea name="message" required rows={5} placeholder="Расскажите, что вам нужно" />
        </label>
      </div>
      <label className="consent-row">
        <input type="checkbox" required />
        <span>Согласен на обработку персональных данных</span>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading && <LoaderCircle className="spin" size={18} />}
        {submitLabel}
      </Button>
    </form>
  );
}
