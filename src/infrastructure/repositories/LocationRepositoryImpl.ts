import * as ExpoLocation from 'expo-location';
import { ILocationRepository } from '../../domain/repositories/ILocationRepository';
import { Coordinates } from '../../domain/entities/User';

/** Implementación del repositorio de geolocalización */
export class LocationRepositoryImpl implements ILocationRepository {
  private watchSubscription: ExpoLocation.LocationSubscription | null = null;

  async requestPermissions(): Promise<boolean> {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== 'granted') return false;
    // Solicitar permiso de fondo para tracking activo
    const { status: bgStatus } = await ExpoLocation.requestBackgroundPermissionsAsync();
    return bgStatus === 'granted' || status === 'granted';
  }

  async getCurrentLocation(): Promise<Coordinates> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) throw new Error('Permiso de ubicación denegado.');
    const location = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.High,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }

  async startTracking(callback: (coords: Coordinates) => void): Promise<() => void> {
    this.watchSubscription = await ExpoLocation.watchPositionAsync(
      {
        accuracy: ExpoLocation.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );
    return () => this.stopTracking();
  }

  stopTracking(): void {
    this.watchSubscription?.remove();
    this.watchSubscription = null;
  }

  async reverseGeocode(coords: Coordinates): Promise<string> {
    const [result] = await ExpoLocation.reverseGeocodeAsync(coords);
    if (!result) return 'Ubicación desconocida';
    const parts = [result.street, result.district, result.city].filter(Boolean);
    return parts.join(', ') || 'Ubicación actual';
  }

  /** Cálculo de distancia Haversine en kilómetros */
  calculateDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371;
    const dLat = this._toRad(to.latitude - from.latitude);
    const dLon = this._toRad(to.longitude - from.longitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this._toRad(from.latitude)) *
        Math.cos(this._toRad(to.latitude)) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  private _toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}
