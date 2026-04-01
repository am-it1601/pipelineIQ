'use client'
import { getBDMembers } from '@/lib/actions/user.actions';
import { BDMember } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type DropdownProps = {
  onChangeHandler: (value: string) => void;
  value: any;
  disabled?: boolean;
};

const UserDropDown = ({ onChangeHandler, value, disabled }: DropdownProps) => {

  const [members, setMembers] = useState<BDMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const memberList = await getBDMembers({ active: true });
        memberList && setMembers(memberList);
      } catch (error) {
        console.error("Failed to load members:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, []);

  return (
    <Select
      value={value || ""}
      onValueChange={(v) => onChangeHandler(v === "__all__" ? "" : v)}
      disabled={loading || disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Loading members..." : "All Members"} />
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
