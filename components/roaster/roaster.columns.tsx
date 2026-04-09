"use client";
import { BDMember } from "@/types/types";
import { ColumnDef } from "@tanstack/react-table";
import { CircleCheck, OctagonX } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import RoasterAction from "./RoasterAction";

export const TEAM_ROASTER_COLUMNS: ColumnDef<BDMember>[] = [
  {
    accessorKey: "full_name",
    header: () => "User Name",
    meta: { className: "w-0" },
    cell: ({ row }) => {
      const full_name = row.getValue<string>("full_name");
      const avatar_initials = row.original.avatar_initials;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="font-semibold">{avatar_initials}</AvatarFallback>
          </Avatar>
          <span className="font-semibold">{full_name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: () => "Email",
    meta: { className: "w-0 tracking-wider" },
  },
  {
    accessorKey: "status",
    header: () => "Status",
    meta: { className: "w-0" },
    cell: ({ row }) => {
      const status = row.getValue<string>("status");

      return status === "active" ? (
        <CircleCheck className="h-6 w-6 fill-green-600 text-primary-foreground border-none" />
      ) : (
        <OctagonX className="w-6 h-6 fill-red-600 text-primary-foreground border-none" />
      );
    },
  },
  {
    accessorKey: "id",
    meta: { className: "w-0" },
    header: "Actions",
    cell: ({ row }) => {
      const status = row.original.status === "active";
      return <RoasterAction id={row.getValue<string>("id")} status={status} />;
    },
  },
];
