import type { ReactNode } from 'react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!user || !token) {
    return <Navigate replace to={`/account?returnTo=${encodeURIComponent(location.pathname)}`} />;
  }

  if (!user.isAdmin) {
    return (
      <main className="admin-access-denied">
        <div>
          <span><ShieldAlert /></span>
          <p className="admin-kicker">Закрытый раздел</p>
          <h1>Недостаточно прав</h1>
          <p>Админ-панель доступна только пользователям с ролью <strong>Admin</strong> в JWT-токене.</p>
          <Link className="button button--primary" to="/account"><ArrowLeft size={18} /> Вернуться в кабинет</Link>
        </div>
      </main>
    );
  }

  return children;
}

