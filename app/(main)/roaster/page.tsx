import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { getInvitationsList } from "@/lib/actions/invitation.actions";
import { getBDMembers } from "@/lib/actions/user.actions";

import EmptyInvitations from "@/components/empty/EmptyInvitations";

import { InviteMemberDialog } from "@/components/invitations/InviteMemberDialog";
import RoasterTable from "@/components/roaster/RoasterTable";
import { ChevronDownIcon } from "lucide-react";
import InvitationTable from "../../../components/invitations/InvitationTable";

export default async function RoasterPage() {
  const roaster = await getBDMembers();
  const invitations = await getInvitationsList();

  const pendingCount = invitations.filter((i) => i.status === "pending").length;
  const memberCount = roaster.filter((m) => m.status == "active").length;

  return (
    <div className="animate-fade-in flex flex-col gap-2 py-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Team Roster</CardTitle>
          <CardAction>
            <InviteMemberDialog />
          </CardAction>
          <CardDescription>Manage your team members and invitations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="my-2 h-px" />
          <RoasterTable roaster={roaster} />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Collapsible className="w-full rounded-md data-[state=open]:bg-muted">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between gap-4 px-2">
                <Badge variant="default" className="rounded-full px-2 text-sm font-semibold py-3">
                  {pendingCount}
                </Badge>
                <CardTitle className="text-xl">Pending Invitations</CardTitle>
                <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col items-center gap-2 p-2.5 text-sm w-full">
              <Separator className="h-px mt-2 min-w-full" />
              {invitations.length > 0 ? (
                <InvitationTable invitations={invitations} />
              ) : (
                <EmptyInvitations />
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}
