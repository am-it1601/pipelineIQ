import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { getInvitationsList } from "@/lib/actions_old/invitation.actions";

import EmptyInvitations from "@/components/empty/EmptyInvitations";

import PageHeader from "@/blocks/shared/PageHeader";
import { InviteMemberDialog } from "@/components/invitations/InviteMemberDialog";
import RoasterTable from "@/components/roaster/RoasterTable";
import { getUsers } from "@/lib/action/user.action";
import { ChevronDownIcon } from "lucide-react";
import InvitationTable from "../../../components/invitations/InvitationTable";

export default async function RoasterPage() {
  const roaster = await getUsers();
  const invitations = await getInvitationsList();

  const pendingCount = invitations.filter((i) => i.status === "pending").length;
  const memberCount = roaster.filter((m) => m.status == "active").length;

  return (
    <div className="animate-fade-in page-wrapper">
      <PageHeader
        title="Team Roaster"
        subtitle={`You have ${memberCount} active members and ${pendingCount} pending invitations.`}
        action={<InviteMemberDialog />}
      />
      <section className="section-wrapper max-h-50vh">
        <RoasterTable roaster={roaster} />
      </section>
      <section className="section-wrapper max-h-50vh">
        <Collapsible>
          <CollapsibleTrigger className="w-full cursor-pointer">
            <div className="flex-between gap-4 px-2">
              <h4>Pending Invitations</h4>
              <Badge variant="default" className="rounded-full px-2 text-sm font-semibold py-3">
                {pendingCount}
              </Badge>
              <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180" />
            </div>
            <Separator className="h-px mt-2" />
          </CollapsibleTrigger>
          <CollapsibleContent className="py-4">
            {invitations.length > 0 ? (
              <InvitationTable invitations={invitations} />
            ) : (
              <EmptyInvitations />
            )}
          </CollapsibleContent>
        </Collapsible>
      </section>
    </div>
  );
}
