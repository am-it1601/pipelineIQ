/**
 * Server-side in-memory store for lead entries, BD members, and Upwork profiles.
 * In a production scenario, replace these with Supabase/Prisma/DB calls.
 * This module is imported ONLY in Next.js API routes (server-side).
 */

import type { LeadLogEntry, BDMember, UpworkProfile } from '@/lib/types';
import { LEAD_ENTRIES } from '@/lib/data/leadEntries';
import { BD_MEMBERS } from '@/lib/data/bdMembers';
import { UPWORK_PROFILES } from '@/lib/data/upworkProfiles';

// In-memory store (survives across requests in the same Node.js process)
let leads: LeadLogEntry[] = [...LEAD_ENTRIES];
let members: BDMember[] = [...BD_MEMBERS];
let profiles: UpworkProfile[] = [...UPWORK_PROFILES];

// ─── Lead CRUD ────────────────────────────────────────────────────────────────
export const leadsStore = {
  getAll: () => leads,
  getById: (id: string) => leads.find((l) => l.id === id),
  create: (entry: LeadLogEntry) => {
    leads = [entry, ...leads];
    return entry;
  },
  update: (id: string, patch: Partial<LeadLogEntry>) => {
    leads = leads.map((l) => (l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l));
    return leads.find((l) => l.id === id);
  },
  delete: (id: string) => {
    leads = leads.filter((l) => l.id !== id);
  },
};

// ─── BD Members CRUD ──────────────────────────────────────────────────────────
export const membersStore = {
  getAll: () => members,
  getById: (id: string) => members.find((m) => m.id === id),
  create: (member: BDMember) => {
    members = [...members, member];
    return member;
  },
  update: (id: string, patch: Partial<BDMember>) => {
    members = members.map((m) => (m.id === id ? { ...m, ...patch } : m));
    return members.find((m) => m.id === id);
  },
  delete: (id: string) => {
    members = members.filter((m) => m.id !== id);
  },
};

// ─── Upwork Profiles CRUD ─────────────────────────────────────────────────────
export const profilesStore = {
  getAll: () => profiles,
  getById: (id: string) => profiles.find((p) => p.id === id),
  create: (profile: UpworkProfile) => {
    profiles = [...profiles, profile];
    return profile;
  },
  update: (id: string, patch: Partial<UpworkProfile>) => {
    profiles = profiles.map((p) => (p.id === id ? { ...p, ...patch } : p));
    return profiles.find((p) => p.id === id);
  },
  delete: (id: string) => {
    profiles = profiles.filter((p) => p.id !== id);
  },
};
