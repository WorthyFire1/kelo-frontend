export type ProductBadge = 'new' | 'hit' | 'recommended' | 'sale';
export type Availability = 'in-stock' | 'made-to-order' | 'out-of-stock';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  productCount: number;
  image?: string;
  accent: string;
}

export interface CatalogFilterOption {
  id: string;
  name: string;
  productCount: number;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductVariant {
  id: number;
  name: string;
  size: string;
  additionalPrice?: number;
  stockQuantity: number;
  sku: string;
}

export interface ProductReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  title: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  categoryName: string;
  brandId?: string;
  brandName?: string;
  price: number;
  oldPrice?: number;
  images: string[];
  material: string;
  finish: string;
  dimensions: string;
  weight: string;
  availability: Availability;
  stock: number;
  badges: ProductBadge[];
  rating: number;
  reviewCount: number;
  specifications: ProductSpecification[];
  variants?: ProductVariant[];
}

export interface ProductDetails {
  product: Product;
  reviews: ProductReview[];
  relatedProducts: Product[];
}

export interface CatalogPageResult {
  products: Product[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Promotion {
  id: string;
  slug: string;
  title: string;
  description: string;
  label: string;
  validUntil: string;
  image?: string;
  productIds: string[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  publishedAt: string;
  readingTime: number;
  image?: string;
}

export interface ArticlePageResult {
  articles: Article[];
  categories: string[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  description: string;
  image?: string;
  productCount: number;
}

export interface HomeAdvantage {
  icon: string;
  title: string;
  description: string;
}

export interface HomeData {
  totalProducts: number;
  averageRating: number;
  totalOrders: number;
  regionsCount: number;
  newProducts: Product[];
  advantages: HomeAdvantage[];
  companyName: string;
  contactPhone: string;
  contactEmail: string;
  guaranteeMonths: number;
  readySketches: number;
}

export interface CatalogFilters {
  query?: string;
  category?: string;
  brand?: string;
  materials?: string[];
  availability?: Availability[];
  minPrice?: number;
  maxPrice?: number;
  badge?: ProductBadge;
  sort?: 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
}
