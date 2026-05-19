import { Product } from '../entities/Product';

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  condition?: 'NUEVO' | 'USADO';
  origin?: 'NACIONAL' | 'IMPORTADO';
  minPrice?: number;
  maxPrice?: number;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/** Contrato del repositorio de productos */
export interface IProductRepository {
  getProducts(filters: ProductFilters, page: number, limit: number): Promise<PaginatedResult<Product>>;
  getProductById(id: string): Promise<Product>;
  getProductsByProvider(providerId: string): Promise<Product[]>;
  compareProviders(productName: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
}
