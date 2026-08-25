import { apiRequest } from '@/api/client';
import type { CreateOrderRequest, CreatedOrder } from '@/types/catalog';

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';

export const orderService = {
  async createOrder(request: CreateOrderRequest): Promise<CreatedOrder> {
    if (!useMocks) {
      return apiRequest<CreatedOrder>('/orders', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    }

    await new Promise((resolve) => window.setTimeout(resolve, 650));
    const total = request.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      id: crypto.randomUUID(),
      number: `KL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'created',
      total,
      createdAt: new Date().toISOString(),
    };
  },
};
