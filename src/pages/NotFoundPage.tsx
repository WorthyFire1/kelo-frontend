import { Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Страница не найдена');
  return (
    <Container className="not-found">
      <span>404</span>
      <h1>Такой страницы нет</h1>
      <p>Возможно, адрес изменился. Вернитесь на главную или найдите нужный товар в каталоге.</p>
      <div><Link className="button button--primary" to="/"><Home size={18} /> На главную</Link><Link className="button button--secondary" to="/catalog"><Search size={18} /> В каталог</Link></div>
    </Container>
  );
}
