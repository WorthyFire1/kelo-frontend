import { apiRequest } from '@/api/client';
import type { CreatedOrder } from '@/services/orderService';

const onlinePaymentMethods = new Set(['card', 'tbank', 'tinkoff', 'online', 'onlinecard', 'onlinepayment']);

export function isOnlinePaymentMethod(value: string): boolean {
  return onlinePaymentMethods.has(value.toLowerCase());
}

function paymentRedirectUrl(response: unknown): string {
  let value: unknown = response;

  if (response && typeof response === 'object') {
    const data = response as Record<string, unknown>;
    if (data.success === false || data.Success === false) {
      throw new Error(typeof data.message === 'string' ? data.message : 'Не удалось получить ссылку для оплаты.');
    }
    value = Object.entries(data).find(([key]) => ['paymenturl', 'redirecturl', 'url', 'paymentlink'].includes(key.toLowerCase()))?.[1];
  }

  if (typeof value !== 'string') {
    throw new Error('Сервер не вернул ссылку для оплаты. Заказ уже создан, попробуйте получить ссылку ещё раз.');
  }

  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return url.toString();
  } catch {
    // Неполный или некорректный адрес нельзя использовать для перехода на оплату.
  }
  throw new Error('Сервер вернул некорректную ссылку для оплаты. Заказ уже создан.');
}

export const paymentService = {
  async createPayment(order: CreatedOrder): Promise<string> {
    const response = await apiRequest<unknown>('/Payment/create', {
      method: 'POST',
      body: JSON.stringify({
        orderId: order.orderId,
        amount: order.total,
        description: `Оплата заказа ${order.orderNumber}`,
      }),
    });
    return paymentRedirectUrl(response);
  },
};
