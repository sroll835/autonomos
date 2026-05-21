import apiClient from '../../infrastructure/api/client';
import { ENDPOINTS } from '../../infrastructure/api/endpoints';
import { IProductRepository, ProductFilters, PaginatedResult } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';

export class ProductRepositoryImpl implements IProductRepository {
  async getProducts(filters: ProductFilters, page: number, limit: number): Promise<PaginatedResult<Product>> {
    const { data } = await apiClient.get<PaginatedResult<Product>>(ENDPOINTS.PRODUCTS.LIST, {
      params: { ...filters, page, limit },
    });
    return data;
  }

  async getProductById(id: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(ENDPOINTS.PRODUCTS.DETAIL(id));
    return data;
  }

  async getProductsByProvider(providerId: string): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>(ENDPOINTS.PRODUCTS.LIST, {
      params: { providerId },
    });
    return data;
  }

  async compareProviders(productName: string): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>(ENDPOINTS.PRODUCTS.COMPARE, {
      params: { name: productName },
    });
    return data;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>(ENDPOINTS.PRODUCTS.SEARCH, {
      params: { q: query },
    });
    return data;
  }
}
