"use client";

import { ZapIcon } from "lucide-react";
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

type AddLeadDialogProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Root>,
  "open" | "onOpenChange" | "children"
> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
};

const AddLeadDialog = ({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  ...rootProps
}: AddLeadDialogProps) => {
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

  return (
    <Dialog {...rootProps} open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm" className="gap-2">
              <ZapIcon className="size-4" />
              Add New Lead
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="shadow-lg md:min-h-[60vh] md:min-w-[55vw] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-primary text-xl flex items-center gap-2">
            <ZapIcon className="size-5" />
            Create New Lead
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to quickly add a new lead to your pipeline.
          </DialogDescription>
          <Separator className="h-px mt-2" />
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] px-1">
          <LeadFormBody onClose={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadDialog;
