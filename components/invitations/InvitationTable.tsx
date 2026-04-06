"use client";

import Datatable from "@/components/custom/Datatable";
import { INVITATION_COLUMNS } from "@/components/invitations/invitation.columns";
import { Invitation } from "@/lib/types";

const InvitationTable = ({ invitations }: { invitations: Invitation[] }) => {
  return <Datatable columns={INVITATION_COLUMNS} data={invitations} />;
};

export default InvitationTable;
