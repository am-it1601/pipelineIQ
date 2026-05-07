"use client";

import { getUsers } from "@/lib/action/user.action";
import { BDMember } from "@/types/types";
import { create } from "zustand";

interface MembersState {
    members: BDMember[];
    loading: boolean;
    fetched: boolean;
    fetchIfNeeded: () => Promise<void>;
}

export const useMembersStore = create<MembersState>()((set, get) => ({
    members: [],
    loading: false,
    fetched: false,

    fetchIfNeeded: async () => {
        if (get().fetched || get().loading) return;
        set({ loading: true });
        try {
            const members = await getUsers();
            set({ members, fetched: true });
        } catch (error) {
            console.error("Failed to fetch members:", error);
        } finally {
            set({ loading: false });
        }
    },
}));
