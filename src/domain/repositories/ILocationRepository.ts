import { Coordinates } from '../entities/User';

/** Contrato del repositorio de geolocalización */
export interface ILocationRepository {
  getCurrentLocation(): Promise<Coordinates>;
  startTracking(callback: (coords: Coordinates) => void): Promise<() => void>;
  stopTracking(): void;
  reverseGeocode(coords: Coordinates): Promise<string>;
  calculateDistance(from: Coordinates, to: Coordinates): number;
  requestPermissions(): Promise<boolean>;
}
