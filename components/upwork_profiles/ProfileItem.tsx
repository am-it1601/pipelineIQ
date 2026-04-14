import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";

const ProfileItem = () => {
  return (
    <Item variant="muted">
      <ItemMedia>
        <Avatar size="lg">
          <AvatarFallback>AA</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent className="gap-1">
        <ItemTitle className="text-xl font-semibold">Amit Agarwal</ItemTitle>
        <ItemDescription>
          <div className="flex-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-lg text-foreground font-semibold">Full Stack Developer</span>
              <p className="text-xs italic line-clamp-1 text-ellipsis text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget
                dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes,
                nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium
                quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet
                nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae,
                justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus.
                Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula,
                porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in,
                viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet.
                Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur
                ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus
                eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed
                ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas
                nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus.
                Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed
                fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo
                eget bibendum sodales, augue velit cursus nunc,
              </p>
            </div>
            <p>15$/hour</p>
          </div>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="icon-xs">
          <Trash2 className="size-4" />
        </Button>
      </ItemActions>
    </Item>
  );
};

export default ProfileItem;
