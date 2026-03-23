import type { BDMember } from '@/lib/types';

export const BD_MEMBERS: BDMember[] = [
  {
    id: 'bd1',
    name: 'Priya Mehta',
    status: 'active',
    monthlyTarget: 60,
    incentiveEligible: true,
    joinDate: '2024-01-15',
  },
  {
    id: 'bd2',
    name: 'Arjun Nair',
    status: 'active',
    monthlyTarget: 50,
    incentiveEligible: true,
    joinDate: '2024-03-01',
  },
  {
    id: 'bd3',
    name: 'Sneha Kapoor',
    status: 'active',
    monthlyTarget: 55,
    incentiveEligible: true,
    joinDate: '2024-06-10',
  },
  {
    id: 'bd4',
    name: 'Vikram Das',
    status: 'inactive',
    monthlyTarget: 40,
    incentiveEligible: false,
    joinDate: '2024-09-20',
  },
];
