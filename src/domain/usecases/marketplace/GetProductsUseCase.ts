import { IProductRepository, ProductFilters, PaginatedResult } from '../../repositories/IProductRepository';
import { Product } from '../../entities/Product';

/** Caso de uso: obtener productos del marketplace */
export class GetProductsUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(filters: ProductFilters, page = 1, limit = 10): Promise<PaginatedResult<Product>> {
    return this.productRepo.getProducts(filters, page, limit);
  }
}
