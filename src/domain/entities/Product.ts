import { Coordinates } from './User';

/** Compatibilidad vehicular del producto */
export interface VehicleCompatibility {
  brand: string;
  model: string;
  yearFrom: number;
  yearTo: number;
}

/** Proveedor simplificado dentro de producto */
export interface ProductProvider {
  id: string;
  name: string;
  rating: number;
  distance?: number;
  location: Coordinates;
}

/** Entidad de autoparte */
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  brand: string;
  origin: 'NACIONAL' | 'IMPORTADO';
  condition: 'NUEVO' | 'USADO';
  compatibility: VehicleCompatibility[];
  provider: ProductProvider;
  stock: number;
  rating: number;
  reviewCount: number;
  description?: string;
  specifications?: Record<string, string>;
}

/** Item en el carrito de compras */
export interface CartItem {
  product: Product;
  quantity: number;
}
