import { apiRequest, resolveApiAssetUrl } from '@/api/client';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
  maxQuantity: number;
  variantName?: string | null;
}

export interface CartData {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  isFreeShipping: boolean;
  totalItems: number;
}

interface ApiCartItem extends Omit<CartItem, 'imageUrl'> {
  imageUrl?: string | null;
}

interface ApiCartData extends Omit<CartData, 'items'> {
  items: ApiCartItem[];
}

function normalizeCart(data: ApiCartData): CartData {
  return {
    ...data,
    items: data.items.map((item) => ({
      ...item,
      imageUrl: resolveApiAssetUrl(item.imageUrl),
    })),
  };
}

export const cartService = {
  async getCart(): Promise<CartData> {
    return normalizeCart(await apiRequest<ApiCartData>('/Cart/GetCart'));
  },

  add(productId: number, quantity = 1, variantName?: string): Promise<{ message: string }> {
    return apiRequest('/Cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, variantName: variantName?.trim() || 'Стандартный' }),
    });
  },

  update(cartItemId: number, quantity: number): Promise<{ message: string }> {
    return apiRequest('/Cart/update', {
      method: 'PUT',
      body: JSON.stringify({ cartItemId, quantity }),
    });
  },

  remove(cartItemId: number): Promise<{ message: string }> {
    return apiRequest(`/Cart/${cartItemId}`, { method: 'DELETE' });
  },

  clear(): Promise<{ message: string }> {
    return apiRequest('/Cart/clear', { method: 'DELETE' });
  },
};
