import type { User } from '@/lib/types';

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Rohit Sharma',
    email: 'rohit@maverics.io',
    role: 'admin',
    bdMemberId: null,
    avatarInitials: 'RS',
  },
  {
    id: 'u2',
    name: 'Priya Mehta',
    email: 'priya@maverics.io',
    role: 'bd',
    bdMemberId: 'bd1',
    avatarInitials: 'PM',
  },
  {
    id: 'u3',
    name: 'Arjun Nair',
    email: 'arjun@maverics.io',
    role: 'bd',
    bdMemberId: 'bd2',
    avatarInitials: 'AN',
  },
  {
    id: 'u4',
    name: 'Sneha Kapoor',
    email: 'sneha@maverics.io',
    role: 'bd',
    bdMemberId: 'bd3',
    avatarInitials: 'SK',
  },
  {
    id: 'u5',
    name: 'Vikram Das',
    email: 'vikram@maverics.io',
    role: 'bd',
    bdMemberId: 'bd4',
    avatarInitials: 'VD',
  },
];
