import { create } from 'zustand';

interface DriverState {
  isShiftActive: boolean;
  driverReputation: number;
  vantomBalance: number;
  toggleShift: () => void;
  setDriverReputation: (reputation: number) => void;
  setVantomBalance: (balance: number) => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  isShiftActive: false,
  driverReputation: 4.8,
  vantomBalance: 1250.50,
  toggleShift: () => set((state) => ({ isShiftActive: !state.isShiftActive })),
  setDriverReputation: (reputation) => set({ driverReputation: reputation }),
  setVantomBalance: (balance) => set({ vantomBalance: balance }),
}));
