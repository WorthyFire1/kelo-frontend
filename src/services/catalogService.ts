import { apiRequest, resolveApiAssetUrl } from '@/api/client';
import type {
  Article,
  ArticlePageResult,
  Brand,
  CatalogPageResult,
  CatalogFilterOption,
  CatalogFilters,
  Category,
  HomeAdvantage,
  HomeData,
  Product,
  ProductDetails,
  ProductReview,
  Promotion,
} from '@/types/catalog';

const defaultCatalogPageSize = 12;

interface ApiProductDto {
  id: number;
  name: string;
  shortDescription?: string | null;
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
  brandId?: number | null;
  categoryId?: number | null;
  categoryName?: string | null;
}

interface ApiCategoryDto {
  id: number;
  name: string;
  description?: string | null;
  slug: string;
  productCount: number;
  imageUrl?: string | null;
  displayOrder: number;
}

interface ApiMaterialDto {
  id: number;
  name: string;
  description?: string | null;
  productCount: number;
}

interface ApiBrandDto {
  id: number;
  name: string;
  description?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
  productCount: number;
}

interface ApiCatalogResponseDto {
  products?: ApiProductDto[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  materials?: ApiMaterialDto[];
  brands?: ApiBrandDto[];
}

interface ApiProductFullDto extends ApiProductDto {
  fullDescription?: string | null;
  images?: string[] | null;
  specifications?: Record<string, string> | null;
  tags?: string[] | null;
  variants?: Array<{
    id: number;
    name: string;
    size: string;
    additionalPrice?: number | null;
    stockQuantity: number;
    sku: string;
  }> | null;
}

interface ApiProductDetailsResponseDto {
  product: ApiProductFullDto;
  averageRating: number;
  reviewCount: number;
  reviews?: ProductReview[];
  relatedProducts?: ApiProductDto[];
}

interface ApiDiscountDto {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  type: string;
  amount: number;
  minOrderAmount?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
  isActive: boolean;
}

interface HomeResponseDto {
  totalProducts: number;
  averageRating: number;
  totalOrders: number;
  regionsCount: number;
  newProducts?: ApiProductDto[];
  advantages?: HomeAdvantage[];
  companyName?: string;
  contactPhone?: string;
  contactEmail?: string;
  guaranteeMonths: number;
  readySketches: number;
}

interface ApiBlogPostDto {
  id: number;
  title: string;
  shortDescription?: string | null;
  content?: string | null;
  slug: string;
  featuredImageUrl?: string | null;
  category?: string | null;
  readTimeMinutes: number;
  publishedAt: string;
}

interface ApiBlogListResponseDto {
  posts?: ApiBlogPostDto[];
  totalPosts: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categories?: string[];
}

const sortValues: Record<NonNullable<CatalogFilters['sort']>, string> = {
  popular: 'popularity',
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
  newest: 'newest',
  rating: 'rating',
};

const articleDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function formatArticleDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : articleDateFormatter.format(date);
}

function splitArticleContent(content?: string | null): string[] {
  return (content ?? '')
    .split(/\r?\n\s*\r?\n|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function mapArticle(post: ApiBlogPostDto): Article {
  return {
    id: String(post.id),
    slug: post.slug,
    title: post.title,
    excerpt: post.shortDescription ?? '',
    content: splitArticleContent(post.content),
    category: post.category || 'Без категории',
    publishedAt: formatArticleDate(post.publishedAt),
    readingTime: post.readTimeMinutes,
    image: resolveApiAssetUrl(post.featuredImageUrl),
  };
}

function mapBrand(brand: ApiBrandDto): Brand {
  return {
    id: String(brand.id),
    slug: brand.slug || String(brand.id),
    name: brand.name,
    description: brand.description ?? '',
    image: resolveApiAssetUrl(brand.logoUrl),
    productCount: brand.productCount,
  };
}

function mapCategory(category: ApiCategoryDto): Category {
  return {
    id: String(category.id),
    slug: category.slug,
    name: category.name,
    description: category.description ?? '',
    productCount: category.productCount,
    image: resolveApiAssetUrl(category.imageUrl),
    accent: 'Категория КЕЛО',
  };
}

async function fetchCategories(): Promise<Category[]> {
  const response = await apiRequest<ApiCategoryDto[]>('/Catalog/categories');
  return response.map(mapCategory);
}

function mapProduct(product: ApiProductDto, categories: Category[], details?: ApiProductFullDto): Product {
  const badges: Product['badges'] = [];
  if (product.isNew) badges.push('new');
  if (product.isOnSale) badges.push('sale');

  const category = categories.find((item) => item.name === product.categoryName);
  const imageCandidates = [product.mainImageUrl, ...(details?.images ?? [])];
  const images = imageCandidates
    .map((image) => resolveApiAssetUrl(image))
    .filter((image): image is string => Boolean(image))
    .filter((image, index, values) => values.indexOf(image) === index);
  const specifications = Object.entries(details?.specifications ?? {}).map(([label, value]) => ({ label, value }));
  const getSpecification = (...fragments: string[]) =>
    specifications.find((specification) => {
      const label = specification.label.toLocaleLowerCase('ru-RU');
      return fragments.some((fragment) => label.includes(fragment));
    })?.value ?? '';

  return {
    id: String(product.id),
    slug: product.slug,
    sku: 'KELO-' + product.id,
    title: product.name,
    shortDescription: product.shortDescription ?? '',
    description: details?.fullDescription || product.shortDescription || '',
    categoryId: product.categoryId ? String(product.categoryId) : category?.id ?? '',
    categoryName: product.categoryName || category?.name || 'Каталог КЕЛО',
    brandId: product.brandId ? String(product.brandId) : undefined,
    brandName: product.brandName ?? undefined,
    price: product.price,
    oldPrice: product.oldPrice ?? undefined,
    images,
    material: product.materialName || 'Не указан',
    finish: getSpecification('покрыт', 'отделк'),
    dimensions: getSpecification('размер', 'габарит'),
    weight: getSpecification('вес', 'масса'),
    availability: product.isInStock ? 'in-stock' : 'out-of-stock',
    stock: product.stockQuantity,
    badges,
    rating: product.averageRating,
    reviewCount: product.reviewCount,
    specifications,
    variants: (details?.variants ?? []).map((variant) => ({
      id: variant.id,
      name: variant.name,
      size: variant.size,
      additionalPrice: variant.additionalPrice ?? undefined,
      stockQuantity: variant.stockQuantity,
      sku: variant.sku,
    })),
  };
}

function createCatalogParams(
  filters: CatalogFilters,
  page: number,
  pageSize: number,
  materialId?: number,
): URLSearchParams {
  const params = new URLSearchParams({
    Page: String(page),
    PageSize: String(pageSize),
    SortBy: sortValues[filters.sort ?? 'popular'],
  });

  if (filters.query?.trim()) params.set('SearchTerm', filters.query.trim());
  if (filters.category) params.set('CategoryId', filters.category);
  if (filters.brand) params.set('BrandId', filters.brand);
  if (materialId) params.set('MaterialId', String(materialId));
  if (typeof filters.minPrice === 'number') params.set('MinPrice', String(filters.minPrice));
  if (typeof filters.maxPrice === 'number') params.set('MaxPrice', String(filters.maxPrice));
  if (filters.availability?.length === 1 && filters.availability[0] === 'in-stock') {
    params.set('OnlyInStock', 'true');
  }

  return params;
}

function sortProducts(products: Product[], sort: CatalogFilters['sort']): Product[] {
  const result = [...products];

  switch (sort) {
    case 'price-asc':
      return result.sort((first, second) => first.price - second.price);
    case 'price-desc':
      return result.sort((first, second) => second.price - first.price);
    case 'rating':
      return result.sort((first, second) => second.rating - first.rating);
    case 'newest':
      return result.sort((first, second) => Number(second.id) - Number(first.id));
    default:
      return result.sort((first, second) => second.reviewCount - first.reviewCount);
  }
}

export const catalogService = {
  async getHomeData(): Promise<HomeData> {
    const [response, categoriesResponse] = await Promise.all([
      apiRequest<HomeResponseDto>('/Home'),
      fetchCategories(),
    ]);

    return {
      totalProducts: response.totalProducts,
      averageRating: response.averageRating,
      totalOrders: response.totalOrders,
      regionsCount: response.regionsCount,
      newProducts: (response.newProducts ?? []).map((product) => mapProduct(product, categoriesResponse)),
      advantages: response.advantages ?? [],
      companyName: response.companyName ?? 'КЕЛО — дерево с характером',
      contactPhone: response.contactPhone ?? '',
      contactEmail: response.contactEmail ?? '',
      guaranteeMonths: response.guaranteeMonths,
      readySketches: response.readySketches,
    };
  },

  async getCatalogPage(
    filters: CatalogFilters = {},
    page = 1,
    pageSize = defaultCatalogPageSize,
  ): Promise<CatalogPageResult> {
    const materialIds = (filters.materials ?? [])
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0);

    const requiresClientPagination = filters.sort === 'popular'
      || materialIds.length > 1
      || filters.availability?.includes('out-of-stock')
      || Boolean(filters.badge);
    const requestPage = requiresClientPagination ? 1 : page;
    const requestPageSize = requiresClientPagination ? 1000 : pageSize;
    const params = createCatalogParams(
      filters,
      requestPage,
      requestPageSize,
      materialIds.length === 1 ? materialIds[0] : undefined,
    );
    const [response, categoriesResponse] = await Promise.all([
      apiRequest<ApiCatalogResponseDto>('/Catalog/products?' + params.toString()),
      fetchCategories(),
    ]);

    let result = (response.products ?? []).map((product) => mapProduct(product, categoriesResponse));

    if (materialIds.length > 1) {
      const materialNames = new Set(
        (response.materials ?? [])
          .filter((material) => materialIds.includes(material.id))
          .map((material) => material.name),
      );
      result = result.filter((product) => materialNames.has(product.material));
    }

    if (filters.availability?.length) {
      result = result.filter((product) => filters.availability?.includes(product.availability));
    }

    if (filters.badge) {
      result = result.filter((product) => product.badges.includes(filters.badge!));
    }

    result = sortProducts(result, filters.sort);

    if (!requiresClientPagination) {
      return {
        products: result,
        totalItems: response.totalItems,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
      };
    }

    const start = (page - 1) * pageSize;
    return {
      products: result.slice(start, start + pageSize),
      totalItems: result.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(result.length / pageSize)),
    };
  },

  async getProducts(filters: CatalogFilters = {}): Promise<Product[]> {
    const result = await catalogService.getCatalogPage(filters, 1, 100);
    return result.products;
  },

  async getProductBySlug(slug: string): Promise<ProductDetails> {
    const [response, categoriesResponse] = await Promise.all([
      apiRequest<ApiProductDetailsResponseDto>('/Product/' + encodeURIComponent(slug)),
      fetchCategories(),
    ]);

    const product = mapProduct(
      {
        ...response.product,
        averageRating: response.averageRating,
        reviewCount: response.reviewCount,
      },
      categoriesResponse,
      response.product,
    );

    return {
      product,
      reviews: response.reviews ?? [],
      relatedProducts: (response.relatedProducts ?? []).map((item) => mapProduct(item, categoriesResponse)),
    };
  },

  async getCategories(): Promise<Category[]> {
    return fetchCategories();
  },

  async getCatalogMaterials(): Promise<CatalogFilterOption[]> {
    const response = await apiRequest<ApiCatalogResponseDto>('/Catalog/products?Page=1&PageSize=1');
    return (response.materials ?? []).map((material) => ({
      id: String(material.id),
      name: material.name,
      productCount: material.productCount,
    }));
  },

  async getPromotions(): Promise<Promotion[]> {
    const discounts = await apiRequest<ApiDiscountDto[]>('/Discount');
    return discounts.map((discount) => ({
      id: String(discount.id),
      slug: discount.code.toLocaleLowerCase('ru-RU'),
      title: discount.name,
      description: discount.description ?? '',
      label: discount.type === 'Percentage' ? `−${discount.amount}%` : `−${discount.amount} ₽`,
      validUntil: discount.validTo ? formatArticleDate(discount.validTo) : 'без ограничения срока',
      productIds: [],
    }));
  },

  async getArticles(): Promise<Article[]> {
    const response = await catalogService.getArticlesPage(1, 3);
    return response.articles;
  },

  async getArticlesPage(page = 1, pageSize = 9, category?: string): Promise<ArticlePageResult> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (category) params.set('category', category);
    const response = await apiRequest<ApiBlogListResponseDto>('/Blog?' + params.toString());
    return {
      articles: (response.posts ?? []).map(mapArticle),
      categories: response.categories ?? [],
      totalItems: response.totalPosts,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
    };
  },

  async getArticleBySlug(slug: string): Promise<Article> {
    const response = await apiRequest<ApiBlogPostDto>('/Blog/' + encodeURIComponent(slug));
    return mapArticle(response);
  },

  async getBrands(): Promise<Brand[]> {
    const response = await apiRequest<ApiBrandDto[]>('/Brand');
    return response.map(mapBrand);
  },

  async getBrandBySlug(slug: string): Promise<Brand> {
    const response = await apiRequest<ApiBrandDto>('/Brand/' + encodeURIComponent(slug));
    return mapBrand(response);
  },

  async addProductReview(productId: string, rating: number, comment: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/Product/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },
};
