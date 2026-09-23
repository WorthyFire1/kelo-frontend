import { useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    window.location.href = `mailto:kelo_creates@mail.ru?subject=${encodeURIComponent('Подписка на новости КЕЛО')}&body=${encodeURIComponent(`Прошу добавить адрес ${email.trim()} в рассылку КЕЛО.`)}`;
    setSent(true);
    setEmail('');
  };

  return (
    <section className="newsletter">
      <Container className="newsletter__inner">
        <div className="newsletter__icon"><Mail /></div>
        <div>
          <span className="eyebrow">Закрытые предложения</span>
          <h2>Новости, новые формы и скидки — без лишних писем</h2>
          <p>Подпишитесь, чтобы первыми увидеть новые коллекции и свободные даты для индивидуальных заказов.</p>
        </div>
        {sent ? (
          <div className="newsletter__success" role="status">Заявка подготовлена в почтовой программе. Отправьте письмо для подтверждения подписки.</div>
        ) : (
          <form onSubmit={submit}>
            <label className="sr-only" htmlFor="newsletter-email">Электронная почта</label>
            <input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Ваш e-mail" required />
            <button className="button button--primary" type="submit">Подписаться</button>
          </form>
        )}
      </Container>
    </section>
  );
}
