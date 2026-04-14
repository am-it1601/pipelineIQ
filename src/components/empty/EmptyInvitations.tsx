import { ListChecks } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";

const EmptyInvitations = () => {
  return (
    <Empty className="bg-muted/30">
      <EmptyHeader>
        <EmptyMedia>
          <ListChecks className="h-8 w-8 animate-bounce" />
        </EmptyMedia>
        <EmptyTitle>No Pending Invitations</EmptyTitle>
        <EmptyDescription className="max-w-xs text-center">
          You have no pending invitations. All your team members are active and ready to
          collaborate.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export default EmptyInvitations;
