import { create } from 'zustand';
import { Emergency, EmergencyContact, EmergencyType } from '../../domain/entities/Emergency';
import { Coordinates } from '../../domain/entities/User';
import { container } from '../../di/container';

const emergencyRepo = container.repos.emergency;

interface EmergencyState {
  activeEmergency: Emergency | null;
  history: Emergency[];
  contacts: EmergencyContact[];
  isLoading: boolean;
  error: string | null;
  countdown: number;
  isCountingDown: boolean;
}

interface EmergencyActions {
  startCountdown: () => void;
  cancelCountdown: () => void;
  triggerSOS: (type: EmergencyType, location: Coordinates, address: string) => Promise<void>;
  cancelEmergency: (id: string) => Promise<void>;
  updateLocation: (id: string, location: Coordinates) => Promise<void>;
  loadHistory: () => Promise<void>;
  loadContacts: () => Promise<void>;
  setActiveEmergency: (emergency: Emergency | null) => void;
  reset: () => void;
}

/** Store de emergencias SOS */
export const useEmergencyStore = create<EmergencyState & EmergencyActions>()((set, get) => ({
  activeEmergency: null,
  history: [],
  contacts: [],
  isLoading: false,
  error: null,
  countdown: 3,
  isCountingDown: false,

  startCountdown: () => {
    set({ isCountingDown: true, countdown: 3 });
    const interval = setInterval(() => {
      const { countdown, isCountingDown } = get();
      if (!isCountingDown) { clearInterval(interval); return; }
      if (countdown <= 1) {
        clearInterval(interval);
        set({ isCountingDown: false, countdown: 3 });
      } else {
        set({ countdown: countdown - 1 });
      }
    }, 1000);
  },

  cancelCountdown: () => set({ isCountingDown: false, countdown: 3 }),

  triggerSOS: async (type, location, address) => {
    set({ isLoading: true, error: null });
    try {
      const data = await emergencyRepo.create({ type, location, address });
      set({ activeEmergency: data, isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
      throw e;
    }
  },

  cancelEmergency: async (id) => {
    set({ isLoading: true });
    try {
      await emergencyRepo.cancel(id);
      set({ activeEmergency: null, isLoading: false });
    } catch (e: unknown) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  updateLocation: async (id, location) => {
    await emergencyRepo.updateLocation(id, location);
  },

  loadHistory: async () => {
    set({ isLoading: true });
    try {
      const data = await emergencyRepo.getHistory();
      set({ history: data, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  loadContacts: async () => {
    try {
      const data = await emergencyRepo.getContacts();
      set({ contacts: data });
    } catch { /* silencioso */ }
  },

  setActiveEmergency: (emergency) => set({ activeEmergency: emergency }),
  reset: () => set({ activeEmergency: null, error: null, countdown: 3, isCountingDown: false }),
}));
