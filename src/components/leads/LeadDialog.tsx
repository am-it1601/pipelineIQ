"use client";

import { PencilIcon, ZapIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ReactNode, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import LeadFormBody from "./LeadFormBody";
import { LeadLogEntry } from "@/types/types";

type LeadDialogProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Root>,
  "open" | "onOpenChange" | "children"
> & {
  /** Controlled open state. When omitted, the dialog is self-managed and renders its trigger. */
  open?: boolean;
  /** Controlled open-change handler. */
  onOpenChange?: (open: boolean) => void;
  /** Custom trigger node. Only rendered when the dialog is uncontrolled. */
  trigger?: ReactNode;
  /** Initial data for the form. If provided, the dialog will be in "Edit" mode. */
  lead?: LeadLogEntry;
};

const LeadDialog = ({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  lead,
  ...rootProps
}: LeadDialogProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (isControlled) controlledOnOpenChange?.(next);
    else setUncontrolledOpen(next);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
  };

  const isEditing = !!lead;

  return (
    <Dialog {...rootProps} open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm" className="gap-2" variant={isEditing ? "ghost" : "default"}>
              {isEditing ? <PencilIcon className="size-4" /> : <ZapIcon className="size-4" />}
              {isEditing ? "Edit Lead" : "Add New Lead"}
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="shadow-lg md:min-h-[60vh] md:min-w-[55vw] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-primary text-xl flex items-center gap-2">
            {isEditing ? <PencilIcon className="size-5" /> : <ZapIcon className="size-5" />}
            {isEditing ? "Lead Details" : "Create New Lead"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "View or update the details of this lead." 
              : "Fill in the details below to quickly add a new lead to your pipeline."}
          </DialogDescription>
          <Separator className="h-px mt-2" />
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] px-1">
          <LeadFormBody onClose={() => setOpen(false)} initialLead={lead} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDialog;
