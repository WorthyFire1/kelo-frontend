import { apiRequest } from '@/api/client';

export interface AdminProduct {
  id: number;
  name: string;
  shortDescription?: string;
  price: number;
  oldPrice?: number | null;
  mainImageUrl?: string | null;
  averageRating?: number;
  reviewCount?: number;
  stockQuantity: number;
  isInStock?: boolean;
  isActive?: boolean;
  isNew: boolean;
  isOnSale?: boolean;
  slug: string;
  materialName: string | null;
  brandName: string | null;
  categoryName: string | null;
}

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalCategories: number;
  revenue: number;
  newOrders: number;
}

export interface CatalogAdminData {
  products: AdminProduct[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: string;
  total: number;
  customerName: string;
  paymentMethod: string;
  shippingMethod: string;
  itemsCount: number;
}

export interface AdminOrdersData {
  orders: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastLoginAt: string | null;
  phoneNumber: string | null;
}

export interface AdminUsersData {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateAdminProduct {
  name: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  sku: string;
  stockQuantity: number;
  isInStock: boolean;
  isOnSale: boolean;
  isNew: boolean;
  isActive: boolean;
  mainImageUrl: string;
}

export interface AdminProductDetails extends CreateAdminProduct {
  id: number;
  oldPrice: number | null;
  costPrice: number | null;
  lowStockThreshold: number | null;
  slug: string;
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string | null;
  categoryId: number | null;
  brandId: number | null;
  materialId: number | null;
}

export interface AdminDiscount {
  id: number;
  code: string;
  name: string;
  description: string;
  type: string;
  amount: number;
  minOrderAmount: number | null;
  validFrom: string | null;
  validTo: string | null;
  isActive: boolean;
}

export interface AdminBlogPost {
  id: number;
  title: string;
  shortDescription: string;
  slug: string;
  category: string | null;
  featuredImageUrl: string | null;
  readTimeMinutes: number;
  publishedAt: string;
  authorName: string | null;
}

export interface BlogAdminData {
  posts: AdminBlogPost[];
  totalPosts: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categories: string[];
}

export const adminService = {
  getStats(): Promise<AdminStats> {
    return apiRequest<AdminStats>('/admin/stats');
  },

  getProducts(): Promise<CatalogAdminData> {
    return apiRequest<CatalogAdminData>('/admin/products?page=1&pageSize=100');
  },

  getProduct(id: number): Promise<AdminProductDetails> {
    return apiRequest<AdminProductDetails>(`/admin/products/${id}`);
  },

  createProduct(product: CreateAdminProduct): Promise<{ message: string; productId: number }> {
    return apiRequest('/admin/products', { method: 'POST', body: JSON.stringify(product) });
  },

  updateProduct(product: AdminProductDetails): Promise<{ message: string }> {
    const body: AdminProductDetails = {
      id: product.id,
      name: product.name,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      price: product.price,
      oldPrice: product.oldPrice,
      costPrice: product.costPrice,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      isInStock: product.isInStock,
      isOnSale: product.isOnSale,
      isNew: product.isNew,
      isActive: product.isActive,
      mainImageUrl: product.mainImageUrl,
      slug: product.slug,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryId: product.categoryId,
      brandId: product.brandId,
      materialId: product.materialId,
    };

    return apiRequest(`/admin/products/${product.id}`, { method: 'PUT', body: JSON.stringify(body) });
  },

  deleteProduct(id: number): Promise<{ message: string }> {
    return apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
  },

  getOrders(status?: string): Promise<AdminOrdersData> {
    const params = new URLSearchParams({ page: '1', pageSize: '100' });
    if (status) params.set('status', status);
    return apiRequest<AdminOrdersData>(`/admin/orders?${params.toString()}`);
  },

  updateOrderStatus(id: number, status: string): Promise<{ message: string }> {
    return apiRequest(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  },

  getUsers(): Promise<AdminUsersData> {
    return apiRequest<AdminUsersData>('/admin/users?page=1&pageSize=100');
  },

  getDiscounts(): Promise<AdminDiscount[]> {
    return apiRequest<AdminDiscount[]>('/discount');
  },

  getBlogPosts(): Promise<BlogAdminData> {
    return apiRequest<BlogAdminData>('/blog?page=1&pageSize=100');
  },
};
