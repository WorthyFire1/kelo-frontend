import { CircleAlert, Clock3 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface PaymentReturnPageProps {
  result: 'success' | 'fail';
}

export function PaymentReturnPage({ result }: PaymentReturnPageProps) {
  const successReturn = result === 'success';
  useDocumentTitle(successReturn ? 'Возврат из банка' : 'Оплата не завершена');
  const [searchParams] = useSearchParams();
  const rawOrderId = searchParams.get('orderId');
  const parsedOrderId = rawOrderId && /^\d+$/.test(rawOrderId) ? Number(rawOrderId) : null;
  const orderId = parsedOrderId && Number.isSafeInteger(parsedOrderId) && parsedOrderId > 0 ? parsedOrderId : null;
  const accountLink = orderId ? `/account?orderId=${orderId}` : '/account';

  return (
    <Container className={`page-shell checkout-success payment-return${successReturn ? '' : ' payment-return--failure'}`}>
      {successReturn ? <Clock3 aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}
      <span className="eyebrow">Оплата заказа</span>
      <h1>{successReturn ? 'Ожидаем подтверждение оплаты' : 'Оплата пока не подтверждена'}</h1>
      {orderId && <p>Заказ ID {orderId}</p>}
      <p>{successReturn
        ? 'Вы вернулись со страницы банка. Подтверждение оплаты поступает на сервер отдельно. Пока оно не получено, заказ нельзя считать оплаченным.'
        : 'Вы вернулись со страницы банка без подтверждения оплаты. Заказ уже мог быть создан; проверьте его в личном кабинете перед повторным оформлением.'}</p>
      <div>
        <Link className="button button--primary" to={accountLink}>Посмотреть заказ</Link>
        <Link className="button button--secondary" to="/catalog">Вернуться в каталог</Link>
      </div>
    </Container>
  );
}
