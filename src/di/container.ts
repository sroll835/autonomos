import { IAuthRepository } from '../domain/repositories/IAuthRepository';
import { IOrderRepository } from '../domain/repositories/IOrderRepository';
import { IProductRepository } from '../domain/repositories/IProductRepository';
import { IServiceRepository } from '../domain/repositories/IServiceRepository';
import { ILocationRepository } from '../domain/repositories/ILocationRepository';
import { IEmergencyRepository } from '../domain/repositories/IEmergencyRepository';

import { AuthRepositoryImpl } from '../data/repositories/AuthRepositoryImpl';
import { OrderRepositoryImpl } from '../data/repositories/OrderRepositoryImpl';
import { ProductRepositoryImpl } from '../data/repositories/ProductRepositoryImpl';
import { ServiceRepositoryImpl } from '../data/repositories/ServiceRepositoryImpl';
import { LocationRepositoryImpl } from '../data/repositories/LocationRepositoryImpl';
import { EmergencyRepositoryImpl } from '../data/repositories/EmergencyRepositoryImpl';

const auth: IAuthRepository = new AuthRepositoryImpl();
const order: IOrderRepository = new OrderRepositoryImpl();
const product: IProductRepository = new ProductRepositoryImpl();
const service: IServiceRepository = new ServiceRepositoryImpl();
const location: ILocationRepository = new LocationRepositoryImpl();
const emergency: IEmergencyRepository = new EmergencyRepositoryImpl();

export const container = {
  repos: {
    auth,
    order,
    product,
    service,
    location,
    emergency,
  },
};
