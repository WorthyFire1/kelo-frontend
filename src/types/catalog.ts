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

export interface ProductSpecification {
  label: string;
  value: string;
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
  category: 'Советы' | 'Истории' | 'Новости' | 'Уход за деревом';
  publishedAt: string;
  readingTime: number;
  image?: string;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  description: string;
  image?: string;
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
  materials?: string[];
  availability?: Availability[];
  minPrice?: number;
  maxPrice?: number;
  badge?: ProductBadge;
  sort?: 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
}

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface OrderDelivery {
  method: 'cdek' | 'post' | 'courier' | 'pickup';
  city: string;
  address: string;
  comment?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  customer: OrderCustomer;
  delivery: OrderDelivery;
  paymentMethod: 'card' | 'on-delivery' | 'invoice';
  items: OrderItem[];
  promoCode?: string;
}

export interface CreatedOrder {
  id: string;
  number: string;
  status: 'created';
  total: number;
  createdAt: string;
}
