'use client';
import { useMembersStore } from '@/store/membersStore';
import { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type DropdownProps = {
  onChangeHandler: (value: string) => void;
  value: any;
  disabled?: boolean;
};

const UserDropDown = ({ onChangeHandler, value, disabled }: DropdownProps) => {
  const members = useMembersStore((s) => s.members);
  const loading = useMembersStore((s) => s.loading);
  const fetchIfNeeded = useMembersStore((s) => s.fetchIfNeeded);

  useEffect(() => {
    fetchIfNeeded();
  }, [fetchIfNeeded]);

  return (
    <Select
      value={value || ''}
      onValueChange={(v) => onChangeHandler(v === '__all__' ? '' : v)}
      disabled={loading || disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={loading ? 'Loading members...' : 'All Members'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All Members</SelectItem>
        {members.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
export default UserDropDown;
