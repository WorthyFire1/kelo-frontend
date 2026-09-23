import { apiRequest, resolveApiAssetUrl } from '@/api/client';

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: string;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  shippingMethod: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  paymentMethod: string;
  shippingMethod: string;
  shippingAddress: string;
  comment?: string;
}

export interface CreatedOrder {
  orderId: number;
  orderNumber: string;
  total: number;
  message: string;
}

export interface OrderOption {
  value: string;
  displayName: string;
  description?: string;
}

interface ApiOrderItem extends Omit<OrderItem, 'imageUrl'> {
  imageUrl?: string | null;
}

interface ApiOrder extends Omit<Order, 'items'> {
  items?: ApiOrderItem[];
}

function normalizeOrder(order: ApiOrder): Order {
  return {
    ...order,
    items: (order.items ?? []).map((item) => ({
      ...item,
      imageUrl: resolveApiAssetUrl(item.imageUrl),
    })),
  };
}

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const orders = await apiRequest<ApiOrder[]>('/Order');
    return orders.map(normalizeOrder);
  },

  async getOrder(id: number): Promise<Order> {
    return normalizeOrder(await apiRequest<ApiOrder>(`/Order/${id}`));
  },

  createOrder(request: CreateOrderRequest): Promise<CreatedOrder> {
    return apiRequest('/Order', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  cancelOrder(id: number): Promise<{ message: string }> {
    return apiRequest(`/Order/${id}/cancel`, { method: 'PUT' });
  },

  getStatuses(): Promise<OrderOption[]> {
    return apiRequest('/Order/statuses');
  },

  getPaymentMethods(): Promise<OrderOption[]> {
    return apiRequest('/Order/payment-methods');
  },

  getShippingMethods(): Promise<OrderOption[]> {
    return apiRequest('/Order/shipping-methods');
  },
};
