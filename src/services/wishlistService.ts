import { apiRequest, resolveApiAssetUrl } from '@/api/client';

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  oldPrice?: number | null;
  mainImageUrl?: string;
  averageRating: number;
  reviewCount: number;
  isInStock: boolean;
  slug: string;
  addedAt: string;
}

interface ApiWishlistItem extends Omit<WishlistItem, 'mainImageUrl'> {
  mainImageUrl?: string | null;
}

export const wishlistService = {
  async getWishlist(): Promise<WishlistItem[]> {
    const items = await apiRequest<ApiWishlistItem[]>('/Wishlist');
    return items.map((item) => ({
      ...item,
      mainImageUrl: resolveApiAssetUrl(item.mainImageUrl),
    }));
  },

  add(productId: number): Promise<{ message: string }> {
    return apiRequest('/Wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  remove(productId: number): Promise<{ message: string }> {
    return apiRequest(`/Wishlist/${productId}`, { method: 'DELETE' });
  },

  clear(): Promise<{ message: string }> {
    return apiRequest('/Wishlist', { method: 'DELETE' });
  },

  check(productId: number): Promise<{ inWishlist: boolean }> {
    return apiRequest(`/Wishlist/check/${productId}`);
  },
};
