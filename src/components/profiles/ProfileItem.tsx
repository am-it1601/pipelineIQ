import { cn, formatCurrency } from "@/lib/utils";
import { UpworkProfile } from "@/types/types";
import { Avatar, AvatarBadge, AvatarFallback } from "../ui/avatar";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import ProfileActionMenu from "./ProfileActionMenu";

const ProfileItem = ({ profile }: { profile: UpworkProfile }) => {
    return (
        <Item variant="muted">
            <ItemMedia>
                <Avatar size="lg">
                    <AvatarFallback className="border-2 border-primary/50 text-primary">AA</AvatarFallback>
                    <AvatarBadge className={cn(!!profile.is_active ? "bg-jungle_green-500!" : "bg-muted")} />
                </Avatar>
            </ItemMedia>
            <ItemContent className="gap-1 max-w-5xl">
                <ItemTitle>
                    <span className="md:text-lg text-primary font-semibold">{profile.name}</span>
                    <span className="text-muted-foreground font-sans font-semibold">{profile.title}</span>
                </ItemTitle>
                <ItemDescription className="text-xs italic line-clamp-1 text-ellipsis text-muted-foreground">
                    {profile.bio || "No description provided."}
                </ItemDescription>
            </ItemContent>
            <ItemActions className="justify-around basis-1/4">
                <div className="flex flex-col items-center justify-between gap-0.5 p-2.5 text-primary font-extrabold whitespace-nowrap align-top border bg-card shadow border-primary/10 rounded-2xl">
                    <div className="text-xl">{formatCurrency(profile.rate_per_hour ?? 0)}</div>
                    <div className="text-xs text-muted-foreground font-normal tracking-wider">/hour</div>
                </div>
                <ProfileActionMenu profile={profile} />
            </ItemActions>
        </Item>
    );
};

export default ProfileItem;
