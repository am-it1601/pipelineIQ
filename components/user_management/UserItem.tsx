import { UserWithDetails } from "@/lib/auth/types/auth.types";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import UserActionMenu from "./user.action";

const UserItem = ({ user }: { user: UserWithDetails }) => {
  return (
    <Item key={user.user.id} variant="muted" className="hover:bg-sidebar-accent">
      <ItemMedia>
        <Avatar className="size-10">
          <AvatarFallback>{user.user.avatar_initials}</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="flex items-center gap-2">
          {user.user.full_name}
          {user.user.status !== "active" && (
            <Badge variant="outline" className="text-xs capitalize">
              {user.user.status}
            </Badge>
          )}
          {user.auth.banned_until && (
            <Badge variant="destructive" className="text-xs">
              Banned
            </Badge>
          )}
        </ItemTitle>
        <ItemDescription>
          {user.user.email}
          {user.groups.length > 0 && (
            <span className="ml-2 text-muted-foreground/60">
              · {user.groups.map((g) => g.display_name).join(", ")}
            </span>
          )}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <UserActionMenu user={user.user} banned={user.auth.banned_until} />
      </ItemActions>
    </Item>
  );
};

export default UserItem;
