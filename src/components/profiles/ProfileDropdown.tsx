"use client";
import { getUpworkProfiles } from "@/lib/actions_old/profile.action";
import { UpworkProfile } from "@/types/types";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type ProfileDropdownProps = {
  onChangeHandler: (value: string) => void;
  value: any;
  disabled?: boolean;
};

const ProfileDropdown = ({ onChangeHandler, value, disabled }: ProfileDropdownProps) => {
  const [profiles, setProfiles] = useState<UpworkProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("ProfileDropdown Mounted");
    const loadProfiles = async () => {
      try {
        const profileList = await getUpworkProfiles({ active: true });
        profileList && setProfiles(profileList);
      } catch (error) {
        console.error("Failed to load profiles:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfiles();
  }, []);

  return (
    <Select onValueChange={onChangeHandler} value={value || ""} disabled={loading || disabled}>
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Loading profiles..." : "Select profile"} />
      </SelectTrigger>
      <SelectContent>
        {profiles.map((profile) => (
          <SelectItem key={profile.id} value={profile.id}>
            {profile.profile_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
export default ProfileDropdown;
