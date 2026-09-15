import { apiRequest, resolveApiAssetUrl } from '@/api/client';

export interface AdminProduct {
  id: number;
  name: string;
  shortDescription?: string | null;
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

export interface AdminOrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  productSku: string | null;
}

export interface AdminOrderDetails {
  id: number;
  orderNumber: string;
  orderDate: string;
  updatedAt: string | null;
  status: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingMethod: string;
  shippingAddress: string;
  comment: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  orderItems: AdminOrderItem[];
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  } | null;
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
  sourceMainImageUrl: string | null;
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

export interface AdminCategory {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  productCount: number;
  imageUrl: string | null;
  displayOrder: number;
}

export interface AdminCategoryInput {
  name: string;
  description: string;
  parentCategoryId: number | null;
  displayOrder: number;
}

export interface AdminBrand {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  logoUrl: string | null;
  sourceLogoUrl: string | null;
  productCount: number;
  isActive: boolean;
}

export interface AdminBrandsData {
  brands: AdminBrand[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminBrandInput {
  name: string;
  description: string;
  isActive: boolean;
  logo: File | null;
  logoUrl: string | null;
  removeLogo: boolean;
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
  shortDescription: string | null;
  content: string;
  slug: string;
  category: string | null;
  featuredImageUrl: string | null;
  readTimeMinutes: number;
  publishedAt: string;
  updatedAt: string | null;
  isPublished: boolean;
  authorName: string | null;
  tags: string[];
}

export interface AdminBlogPostInput {
  title: string;
  shortDescription: string;
  content: string;
  category: string;
  readTimeMinutes: number;
  isPublished: boolean;
  tags: string[];
  featuredImage: File | null;
  removeFeaturedImage: boolean;
}

export interface BlogAdminData {
  posts: AdminBlogPost[];
  totalPosts: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categories: string[];
}

function normalizeProduct(product: AdminProduct): AdminProduct {
  return { ...product, mainImageUrl: resolveApiAssetUrl(product.mainImageUrl) ?? null };
}

function normalizeProductDetails(product: Omit<AdminProductDetails, 'sourceMainImageUrl'>): AdminProductDetails {
  return {
    ...product,
    sourceMainImageUrl: product.mainImageUrl,
    mainImageUrl: resolveApiAssetUrl(product.mainImageUrl) ?? null,
  };
}

function normalizeBrand(brand: Omit<AdminBrand, 'sourceLogoUrl'>): AdminBrand {
  return {
    ...brand,
    sourceLogoUrl: brand.logoUrl,
    logoUrl: resolveApiAssetUrl(brand.logoUrl) ?? null,
  };
}

function normalizeBlogPost(post: AdminBlogPost): AdminBlogPost {
  return {
    ...post,
    featuredImageUrl: resolveApiAssetUrl(post.featuredImageUrl) ?? null,
    tags: post.tags ?? [],
  };
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

function createBrandFormData(brand: AdminBrandInput): FormData {
  const formData = new FormData();
  formData.append('Name', brand.name);
  formData.append('Description', brand.description);
  formData.append('IsActive', String(brand.isActive));
  if (brand.logo) formData.append('Logo', brand.logo);
  if (brand.logoUrl) formData.append('LogoUrl', brand.logoUrl);
  formData.append('RemoveLogo', String(brand.removeLogo));
  return formData;
}

function createBlogFormData(post: AdminBlogPostInput): FormData {
  const formData = new FormData();
  formData.append('Title', post.title);
  formData.append('ShortDescription', post.shortDescription);
  formData.append('Content', post.content);
  formData.append('Category', post.category);
  formData.append('ReadTimeMinutes', String(post.readTimeMinutes));
  formData.append('IsPublished', String(post.isPublished));
  post.tags.forEach((tag) => formData.append('Tags', tag));
  if (post.featuredImage) formData.append('FeaturedImage', post.featuredImage);
  formData.append('RemoveFeaturedImage', String(post.removeFeaturedImage));
  return formData;
}

export const adminService = {
  getStats(): Promise<AdminStats> {
    return apiRequest<AdminStats>('/admin/stats');
  },

  async getProducts(): Promise<CatalogAdminData> {
    const data = await apiRequest<CatalogAdminData>('/admin/products?page=1&pageSize=100');
    return { ...data, products: data.products.map(normalizeProduct) };
  },

  async getProduct(id: number): Promise<AdminProductDetails> {
    const product = await apiRequest<Omit<AdminProductDetails, 'sourceMainImageUrl'>>(`/admin/products/${id}`);
    return normalizeProductDetails(product);
  },

  async getProductOptions(): Promise<AdminProductOptions> {
    const [categories, brandsData, catalogData] = await Promise.all([
      apiRequest<AdminCategory[]>('/admin/categories'),
      apiRequest<{ brands: Array<Omit<AdminBrand, 'sourceLogoUrl'>> }>('/admin/brands?page=1&pageSize=100'),
      apiRequest<CatalogOptionsData>('/Catalog/products?Page=1&PageSize=1'),
    ]);

    return {
      categories: categories.map(({ id, name }) => ({ id, name })),
      brands: brandsData.brands.map(({ id, name }) => ({ id, name })),
      materials: catalogData.materials,
    };
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

  getOrder(id: number): Promise<AdminOrderDetails> {
    return apiRequest<AdminOrderDetails>(`/admin/orders/${id}`);
  },

  updateOrderStatus(id: number, status: string): Promise<{ message: string }> {
    return apiRequest(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  },

  getUsers(): Promise<AdminUsersData> {
    return apiRequest<AdminUsersData>('/admin/users?page=1&pageSize=100');
  },

  getCategories(): Promise<AdminCategory[]> {
    return apiRequest<AdminCategory[]>('/admin/categories');
  },

  getCategory(id: number): Promise<AdminCategory> {
    return apiRequest<AdminCategory>(`/admin/categories/${id}`);
  },

  createCategory(category: AdminCategoryInput): Promise<AdminCategory> {
    return apiRequest<AdminCategory>('/admin/categories', { method: 'POST', body: JSON.stringify(category) });
  },

  updateCategory(id: number, category: AdminCategoryInput): Promise<AdminCategory> {
    return apiRequest<AdminCategory>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...category, id }),
    });
  },

  deleteCategory(id: number): Promise<{ message: string }> {
    return apiRequest(`/admin/categories/${id}`, { method: 'DELETE' });
  },

  async getBrands(): Promise<AdminBrandsData> {
    const data = await apiRequest<Omit<AdminBrandsData, 'brands'> & { brands: Array<Omit<AdminBrand, 'sourceLogoUrl'>> }>('/admin/brands?page=1&pageSize=100');
    return { ...data, brands: data.brands.map(normalizeBrand) };
  },

  async getBrand(id: number): Promise<AdminBrand> {
    const brand = await apiRequest<Omit<AdminBrand, 'sourceLogoUrl'>>(`/admin/brand/${id}`);
    return normalizeBrand(brand);
  },

  async createBrand(brand: AdminBrandInput): Promise<void> {
    await apiRequest('/admin/create-brand', { method: 'POST', body: createBrandFormData(brand) });
  },

  async updateBrand(id: number, brand: AdminBrandInput): Promise<void> {
    const formData = createBrandFormData(brand);
    formData.append('Id', String(id));
    await apiRequest('/admin/update-brand', { method: 'PUT', body: formData });
  },

  deleteBrand(id: number): Promise<{ message: string }> {
    return apiRequest(`/admin/delete-brand/${id}`, { method: 'DELETE' });
  },

  getDiscounts(): Promise<AdminDiscount[]> {
    return apiRequest<AdminDiscount[]>('/Discount');
  },

  async getBlogPosts(): Promise<BlogAdminData> {
    const [data, categories] = await Promise.all([
      apiRequest<{ posts: AdminBlogPost[]; total: number; page: number; pageSize: number; totalPages: number }>('/admin/BlogPostsList?page=1&pageSize=100'),
      apiRequest<string[]>('/admin/blog-categories'),
    ]);
    return {
      posts: data.posts.map(normalizeBlogPost),
      totalPosts: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
      categories,
    };
  },

  async getBlogPost(id: number): Promise<AdminBlogPost> {
    return normalizeBlogPost(await apiRequest<AdminBlogPost>(`/admin/GetBlogPost/${id}`));
  },

  async createBlogPost(post: AdminBlogPostInput): Promise<void> {
    await apiRequest('/admin/CreateBlogPost', { method: 'POST', body: createBlogFormData(post) });
  },

  async updateBlogPost(id: number, post: AdminBlogPostInput): Promise<void> {
    const formData = createBlogFormData(post);
    formData.append('Id', String(id));
    await apiRequest(`/admin/UpdateBlogPost/${id}`, { method: 'PUT', body: formData });
  },

  deleteBlogPost(id: number): Promise<{ message: string }> {
    return apiRequest(`/admin/DeleteBlogPost/${id}`, { method: 'DELETE' });
  },
};
