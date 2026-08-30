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

export interface AdminProductInput {
  name: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  oldPrice: number | null;
  costPrice: number | null;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number | null;
  isNew: boolean;
  isActive: boolean;
  categoryId: number;
  brandId: number;
  materialId: number;
  imageFile: File | null;
  removeImage: boolean;
}

export interface UpdateAdminProduct extends AdminProductInput {
  id: number;
  mainImageUrl: string | null;
  slug: string;
}

export interface AdminProductDetails {
  id: number;
  name: string;
  shortDescription: string | null;
  fullDescription: string | null;
  price: number;
  oldPrice: number | null;
  costPrice: number | null;
  sku: string | null;
  stockQuantity: number;
  lowStockThreshold: number | null;
  isNew: boolean;
  isActive: boolean;
  mainImageUrl: string | null;
  slug: string;
  categoryId: number | null;
  brandId: number | null;
  materialId: number | null;
}

export interface AdminProductOption {
  id: number;
  name: string;
}

export interface AdminProductOptions {
  categories: AdminProductOption[];
  brands: AdminProductOption[];
  materials: AdminProductOption[];
}

interface AdminBrandsData {
  brands: AdminProductOption[];
}

interface CatalogOptionsData {
  materials: AdminProductOption[];
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

function createProductFormData(product: AdminProductInput): FormData {
  const formData = new FormData();
  formData.append('Name', product.name);
  formData.append('ShortDescription', product.shortDescription);
  formData.append('FullDescription', product.fullDescription);
  formData.append('Price', String(product.price));
  if (product.oldPrice !== null) formData.append('OldPrice', String(product.oldPrice));
  if (product.costPrice !== null) formData.append('CostPrice', String(product.costPrice));
  formData.append('Sku', product.sku);
  formData.append('StockQuantity', String(product.stockQuantity));
  if (product.lowStockThreshold !== null) formData.append('LowStockThreshold', String(product.lowStockThreshold));
  formData.append('IsNew', String(product.isNew));
  formData.append('IsActive', String(product.isActive));
  formData.append('CategoryId', String(product.categoryId));
  formData.append('BrandId', String(product.brandId));
  formData.append('MaterialId', String(product.materialId));
  if (product.imageFile) formData.append('ImageFile', product.imageFile);
  return formData;
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

  async getProductOptions(): Promise<AdminProductOptions> {
    const [categories, brandsData, catalogData] = await Promise.all([
      apiRequest<AdminProductOption[]>('/admin/categories'),
      apiRequest<AdminBrandsData>('/admin/brands?page=1&pageSize=100'),
      apiRequest<CatalogOptionsData>('/catalog/products?page=1&pageSize=1'),
    ]);

    return { categories, brands: brandsData.brands, materials: catalogData.materials };
  },

  async createProduct(product: AdminProductInput): Promise<void> {
    await apiRequest('/admin/products', { method: 'POST', body: createProductFormData(product) });
  },

  async updateProduct(product: UpdateAdminProduct): Promise<void> {
    const formData = createProductFormData(product);
    formData.append('Id', String(product.id));
    formData.append('Slug', product.slug);
    if (product.mainImageUrl) formData.append('MainImageUrl', product.mainImageUrl);
    formData.append('RemoveImage', String(product.removeImage));
    await apiRequest(`/admin/products/${product.id}`, { method: 'PUT', body: formData });
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
