import { apiRequest, resolveApiAssetUrl } from '@/api/client';
import { articles, brands, categories, products, promotions } from '@/data/mockData';
import type { Article, Brand, CatalogFilters, Category, HomeAdvantage, HomeData, Product, Promotion } from '@/types/catalog';

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';
const delay = (ms = 180) => new Promise((resolve) => window.setTimeout(resolve, ms));

interface HomeProductDto {
  id: number;
  name: string;
  shortDescription: string;
  price: number;
  oldPrice?: number | null;
  mainImageUrl?: string | null;
  averageRating: number;
  reviewCount: number;
  stockQuantity: number;
  isInStock: boolean;
  isNew: boolean;
  isOnSale: boolean;
  slug: string;
  materialName?: string | null;
  brandName?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
}

interface HomeResponseDto {
  totalProducts: number;
  averageRating: number;
  totalOrders: number;
  regionsCount: number;
  newProducts?: HomeProductDto[];
  advantages?: HomeAdvantage[];
  companyName?: string;
  contactPhone?: string;
  contactEmail?: string;
  guaranteeMonths: number;
  readySketches: number;
}

function mapHomeProduct(product: HomeProductDto): Product {
  const badges: Product['badges'] = [];
  const imageUrl = resolveApiAssetUrl(product.mainImageUrl);

  if (product.isNew) badges.push('new');
  if (product.isOnSale) badges.push('sale');

  return {
    id: String(product.id),
    slug: product.slug,
    sku: `KELO-${product.id}`,
    title: product.name,
    shortDescription: product.shortDescription,
    description: product.shortDescription,
    categoryId: product.categoryId ? String(product.categoryId) : '',
    categoryName: product.categoryName || 'Каталог КЕЛО',
    price: product.price,
    oldPrice: product.oldPrice ?? undefined,
    images: imageUrl ? [imageUrl] : [],
    material: product.materialName || 'Дерево',
    finish: '',
    dimensions: '',
    weight: '',
    availability: product.isInStock ? 'in-stock' : 'out-of-stock',
    stock: product.stockQuantity,
    badges,
    rating: product.averageRating,
    reviewCount: product.reviewCount,
    specifications: [],
  };
}

function filterMockProducts(filters: CatalogFilters = {}): Product[] {
  let result = [...products];

  if (filters.query) {
    const query = filters.query.trim().toLocaleLowerCase('ru-RU');
    result = result.filter((product) =>
      [product.title, product.shortDescription, product.categoryName, product.material, product.sku]
        .join(' ')
        .toLocaleLowerCase('ru-RU')
        .includes(query),
    );
  }

  if (filters.category) {
    result = result.filter((product) => product.categoryId === filters.category);
  }

  if (filters.materials?.length) {
    result = result.filter((product) => filters.materials?.includes(product.material));
  }

  if (filters.availability?.length) {
    result = result.filter((product) => filters.availability?.includes(product.availability));
  }

  if (typeof filters.minPrice === 'number') {
    result = result.filter((product) => product.price >= filters.minPrice!);
  }

  if (typeof filters.maxPrice === 'number') {
    result = result.filter((product) => product.price <= filters.maxPrice!);
  }

  if (filters.badge) {
    result = result.filter((product) => product.badges.includes(filters.badge!));
  }

  switch (filters.sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      result.sort((a, b) => Number(b.badges.includes('new')) - Number(a.badges.includes('new')));
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    default:
      result.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  return result;
}

export const catalogService = {
  async getHomeData(): Promise<HomeData> {
    const response = await apiRequest<HomeResponseDto>('/Home');

    return {
      totalProducts: response.totalProducts,
      averageRating: response.averageRating,
      totalOrders: response.totalOrders,
      regionsCount: response.regionsCount,
      newProducts: (response.newProducts ?? []).map(mapHomeProduct),
      advantages: response.advantages ?? [],
      companyName: response.companyName ?? 'КЕЛО — дерево с характером',
      contactPhone: response.contactPhone ?? '',
      contactEmail: response.contactEmail ?? '',
      guaranteeMonths: response.guaranteeMonths,
      readySketches: response.readySketches,
    };
  },

  async getProducts(filters: CatalogFilters = {}): Promise<Product[]> {
    if (!useMocks) {
      const params = new URLSearchParams();
      if (filters.query) params.set('query', filters.query);
      if (filters.category) params.set('category', filters.category);
      filters.materials?.forEach((material) => params.append('materials', material));
      filters.availability?.forEach((availability) => params.append('availability', availability));
      if (typeof filters.minPrice === 'number') params.set('minPrice', String(filters.minPrice));
      if (typeof filters.maxPrice === 'number') params.set('maxPrice', String(filters.maxPrice));
      if (filters.badge) params.set('badge', filters.badge);
      if (filters.sort) params.set('sort', filters.sort);
      const queryString = params.toString();
      return apiRequest<Product[]>(`/products${queryString ? `?${queryString}` : ''}`);
    }
    await delay();
    return filterMockProducts(filters);
  },

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    if (!useMocks) return apiRequest<Product>(`/products/${slug}`);
    await delay();
    return products.find((product) => product.slug === slug);
  },

  async getCategories(): Promise<Category[]> {
    if (!useMocks) return apiRequest<Category[]>('/categories');
    await delay(100);
    return categories;
  },

  async getPromotions(): Promise<Promotion[]> {
    if (!useMocks) return apiRequest<Promotion[]>('/promotions');
    await delay(100);
    return promotions;
  },

  async getArticles(): Promise<Article[]> {
    if (!useMocks) return apiRequest<Article[]>('/articles');
    await delay(100);
    return articles;
  },

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    if (!useMocks) return apiRequest<Article>(`/articles/${slug}`);
    await delay(100);
    return articles.find((article) => article.slug === slug);
  },

  async getBrands(): Promise<Brand[]> {
    if (!useMocks) return apiRequest<Brand[]>('/brands');
    await delay(100);
    return brands;
  },
};
