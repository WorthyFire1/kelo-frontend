import { apiRequest } from '@/api/client';

export interface CustomOrder {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  description: string;
  statusName: string;
  createdAt: string;
  estimatedPrice?: number | null;
  adminComment?: string | null;
}

export interface CustomOrderInfo {
  startingPrice: number;
  minProductionDays: number;
  maxProductionDays: number;
  minMacetDays: number;
  steps: Array<{ number: number; title: string; description: string }>;
  whatCanOrder: string[];
}

export interface CreateCustomOrderRequest {
  name: string;
  phone: string;
  email?: string;
  description: string;
}

export const customOrderService = {
  getOrders(): Promise<CustomOrder[]> {
    return apiRequest('/CustomOrder');
  },

  getOrder(id: number): Promise<CustomOrder> {
    return apiRequest(`/CustomOrder/${id}`);
  },

  create(request: CreateCustomOrderRequest): Promise<{ orderId: number; message: string }> {
    return apiRequest('/CustomOrder', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  getInfo(): Promise<CustomOrderInfo> {
    return apiRequest('/CustomOrder/info');
  },
};
