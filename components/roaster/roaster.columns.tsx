"use client";
import { BDMember } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { CircleCheck, Mail, OctagonX, User } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import RoasterAction from "./RoasterAction";

export const TEAM_ROASTER_COLUMNS: ColumnDef<BDMember>[] = [
  {
    accessorKey: "full_name",
    header: () => (
      <div className="flex items-center gap-1">
        <User className="h-4 w-4" />
        <span>Member Name</span>
      </div>
    ),
    meta: { className: "w-0" },
    cell: ({ row }) => {
      const full_name = row.getValue<string>("full_name");
      const avatar_initials = row.original.avatar_initials;
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback className="font-semibold text-primary text-xs bg-accent">
              {avatar_initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold">{full_name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: () => (
      <div className="flex items-center gap-1">
        <Mail className="h-4 w-4" />
        <span>Email</span>
      </div>
    ),
    meta: { className: "w-0 tracking-wider" },
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="flex items-center gap-1 place-content-center">
        <OctagonX className="h-4 w-4" />
        <span>Status</span>
      </div>
    ),
    meta: { className: "w-0" },
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      return (
        <div className="flex place-content-center">
          {status === "active" ? (
            <CircleCheck className="h-6 w-6 fill-green-600 text-primary-foreground border-none" />
          ) : (
            <OctagonX className="w-6 h-6 fill-red-600 text-primary-foreground border-none" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "id",
    meta: { className: "w-0" },
    header: () => (
      <div className="flex items-center gap-1 place-content-center">
        <span>Actions</span>
      </div>
    ),
    cell: ({ row }) => {
      return <RoasterAction />;
    },
  },
];
