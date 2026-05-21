import { create } from 'zustand';
import { Coordinates } from '../../domain/entities/User';
import { LocationRepositoryImpl } from '../../data/repositories/LocationRepositoryImpl';

const locationRepo = new LocationRepositoryImpl();

interface LocationState {
  currentLocation: Coordinates | null;
  currentAddress: string;
  isTracking: boolean;
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LocationActions {
  requestPermissions: () => Promise<void>;
  getCurrentLocation: () => Promise<void>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  reset: () => void;
}

/** Store de geolocalización */
export const useLocationStore = create<LocationState & LocationActions>()((set, get) => ({
  currentLocation: null,
  currentAddress: '',
  isTracking: false,
  hasPermission: false,
  isLoading: false,
  error: null,

  requestPermissions: async () => {
    const hasPermission = await locationRepo.requestPermissions();
    set({ hasPermission });
  },

  getCurrentLocation: async () => {
    set({ isLoading: true, error: null });
    try {
      const location = await locationRepo.getCurrentLocation();
      const address = await locationRepo.reverseGeocode(location);
      set({ currentLocation: location, currentAddress: address, isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  startTracking: async () => {
    if (get().isTracking) return;
    set({ isTracking: true });
    await locationRepo.startTracking(async (coords) => {
      const address = await locationRepo.reverseGeocode(coords);
      set({ currentLocation: coords, currentAddress: address });
    });
  },

  stopTracking: () => {
    locationRepo.stopTracking();
    set({ isTracking: false });
  },

  reset: () => set({ currentLocation: null, currentAddress: '', isTracking: false, error: null }),
}));
