import { useState, type FormEvent } from 'react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { feedbackService, type FeedbackRequest } from '@/services/feedbackService';
import { Button } from '@/components/ui/Button';

interface RequestFormProps {
  kind: FeedbackRequest['kind'];
  title?: string;
  submitLabel?: string;
}

export function RequestForm({ kind, title, submitLabel = 'Отправить заявку' }: RequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setError('');
    const formData = new FormData(event.currentTarget);

    try {
      await feedbackService.send({
        name: String(formData.get('name') ?? ''),
        phone: String(formData.get('phone') ?? ''),
        email: String(formData.get('email') ?? ''),
        message: String(formData.get('message') ?? ''),
        kind,
      });
      setSuccess(true);
      form.reset();
    } catch {
      setError('Не удалось отправить форму. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={38} />
        <h3>Заявка принята</h3>
        <p>Сейчас форма работает на тестовых данных. После подключения бэкенда заявка будет отправляться менеджеру.</p>
        <Button variant="secondary" type="button" onClick={() => setSuccess(false)}>Отправить ещё одну</Button>
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
          <span>E-mail</span>
          <input name="email" type="email" placeholder="mail@example.ru" />
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
