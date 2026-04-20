import { cn } from "@/lib/utils";
import { UpworkProfile } from "@/types/types";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";

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
            <ItemActions className="justify-between basis-1/4">
                <p className="flex-1 text-center">15$/hour</p>
                <Button variant="outline" size="icon-xs">
                    <Trash2 className="size-4" />
                </Button>
            </ItemActions>
        </Item>
    );
};

export default ProfileItem;
