import { create } from 'zustand';

export interface LocationData {
  userId: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  address?: string;
  city?: string;
  timestamp?: string;
}

interface LocationState {
  myLocation: LocationData | null;
  friendsLocations: Map<number, LocationData>;
  isSharing: boolean;
  watchId: number | null;

  setMyLocation: (loc: LocationData) => void;
  updateFriendLocation: (loc: LocationData) => void;
  removeFriendLocation: (userId: number) => void;
  setSharing: (sharing: boolean) => void;
  setWatchId: (id: number | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  myLocation: null,
  friendsLocations: new Map(),
  isSharing: true,
  watchId: null,

  setMyLocation: (loc) => set({ myLocation: loc }),

  updateFriendLocation: (loc) =>
    set((state) => {
      const updated = new Map(state.friendsLocations);
      updated.set(loc.userId, loc);
      return { friendsLocations: updated };
    }),

  removeFriendLocation: (userId) =>
    set((state) => {
      const updated = new Map(state.friendsLocations);
      updated.delete(userId);
      return { friendsLocations: updated };
    }),

  setSharing: (sharing) => set({ isSharing: sharing }),
  setWatchId: (id) => set({ watchId: id }),
}));
