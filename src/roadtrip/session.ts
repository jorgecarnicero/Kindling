import { create } from 'zustand';

/** Whether a road trip round is on screen right now (not saved; the play screen sets it). */
export const useRoadTripActive = create<{
  active: boolean;
  setActive: (active: boolean) => void;
}>()((set) => ({
  active: false,
  setActive: (active) => set({ active }),
}));
