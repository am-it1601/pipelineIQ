import { UpworkProfile } from "@/types/types";
import { Empty } from "../ui/empty";
import { ProfileCard } from "./ProfileCard";

const ProfileGridView = ({ profiles }: { profiles: UpworkProfile[] }) => {
  return (
    <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,370px))] justify-center">
      {profiles.length > 0 ? (
        profiles.map((p) => <ProfileCard profileInfo={p} key={`${p.id}_${p.profile_name}`} />)
      ) : (
        <Empty />
      )}
    </div>
  );
};

export default ProfileGridView;
