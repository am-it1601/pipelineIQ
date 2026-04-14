import type { Invitation, InvitationStatus } from "@/types/types";
import { ColumnDef } from "@tanstack/react-table";
import { Mail } from "lucide-react";
import DateDisplay from "../DateDisplay";
import InvitationStatusLabel from "../labels/InvitationStatusLabel";
import RoleLabel from "../labels/RoleLabel";
import { Avatar, AvatarFallback } from "../ui/avatar";
import InvitationActions from "./InvitationActions";

export const INVITATION_COLUMNS: ColumnDef<Invitation>[] = [
  {
    accessorKey: "email",
    header: () => (
      <div className="flex items-center gap-1">
        <Mail className="h-4 w-4" />
        <span>Invitee</span>
      </div>
    ),
    cell: ({ row }) => {
      const email = row.getValue<string>("email");
      const role = row.original.role;
      const initials = email.split("@")[0].substring(0, 2).toUpperCase();
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px] font-semibold text-primary bg-accent">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm tracking-wide">{email}</span>
          <RoleLabel role={role} />
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { className: "w-0" },
    cell: ({ row }) => <InvitationStatusLabel status={row.getValue<InvitationStatus>("status")} />,
  },
  {
    accessorKey: "invited_by",
    header: "Invited By",
    meta: { className: "w-0" },
    cell: ({ row }) => {
      const invitedBy = row.original.invited_by;
      return (
        <Avatar>
          <AvatarFallback>{invitedBy?.avatar_initials ?? "—"}</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Sent On",
    meta: { className: "w-0" },
    cell: ({ row }) => {
      return <DateDisplay date={row.getValue("created_at")} />;
    },
  },
  {
    id: "actions",
    header: () => (
      <div className="flex items-center gap-1 place-content-center">
        <span>Actions</span>
      </div>
    ),
    meta: { className: "w-0" },
    cell: ({ row }) => (
      <InvitationActions invitationId={row.original.id} status={row.original.status} />
    ),
  },
];
