import { useQuery } from '@tanstack/react-query';
import { catalogService } from '@/services/catalogService';
import type { CatalogFilters } from '@/types/catalog';

export const useHomeData = () =>
  useQuery({ queryKey: ['home'], queryFn: () => catalogService.getHomeData() });

export const useProducts = (filters: CatalogFilters = {}) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => catalogService.getProducts(filters),
  });

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: ['product', slug],
    queryFn: () => catalogService.getProductBySlug(slug),
    enabled: Boolean(slug),
  });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: () => catalogService.getCategories() });

export const usePromotions = () =>
  useQuery({ queryKey: ['promotions'], queryFn: () => catalogService.getPromotions() });

export const useArticles = () =>
  useQuery({ queryKey: ['articles'], queryFn: () => catalogService.getArticles() });

export const useArticle = (slug: string) =>
  useQuery({
    queryKey: ['article', slug],
    queryFn: () => catalogService.getArticleBySlug(slug),
    enabled: Boolean(slug),
  });

export const useBrands = () =>
  useQuery({ queryKey: ['brands'], queryFn: () => catalogService.getBrands() });
