'use client';
import { getBDMembers } from '@/lib/actions/user.actions';
import type { BDMember } from '@/lib/types';
import { create } from 'zustand';

interface MembersState {
  members: BDMember[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  /** Fetches members from the server only if not already loaded. Safe to call from multiple components. */
  fetchIfNeeded: () => Promise<void>;
  /** Force a fresh fetch (e.g. after adding a new member). */
  refresh: () => Promise<void>;
}

const fetchMembers = async (): Promise<BDMember[]> => {
  return await getBDMembers({ active: true });
};

export const useMembersStore = create<MembersState>()((set, get) => ({
  members: [],
  loading: false,
  loaded: false,
  error: null,

  fetchIfNeeded: async () => {
    if (get().loaded || get().loading) return; // already cached or in-flight
    set({ loading: true, error: null });
    try {
      const members = await fetchMembers();
      set({ members, loaded: true });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load members' });
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    set({ loading: true, error: null, loaded: false });
    try {
      const members = await fetchMembers();
      set({ members, loaded: true });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load members' });
    } finally {
      set({ loading: false });
    }
  },
}));
