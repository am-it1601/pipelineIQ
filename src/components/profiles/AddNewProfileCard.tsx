"use client";

import { UpworkProfileFormInput } from "@/forms/profile.schema";
import { useCreateProfile } from "@/hooks/profiles";
import { CirclePlusIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useState } from "react";
import { toast } from "sonner";
import State from "../custom/State";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { AddProfileForm } from "./AddProfileForm";
type AddNewProfileCardProps = React.ComponentProps<typeof DialogPrimitive.Root>;

const AddNewProfileCard = (props: AddNewProfileCardProps) => {
    const [open, setIsOpen] = useState(false);

    const { mutateAsync, isPending, isSuccess, isIdle, reset } = useCreateProfile();

    const handleCancel = () => {
        if (isPending) return;
        setIsOpen(false);
    };

    const handleSubmit = async (values: UpworkProfileFormInput, action: "new" | "exit") => {
        try {
            await mutateAsync(values);

            toast.success(
                action === "new" ? "Profile saved. You can add another one now." : "Profile saved successfully."
            );

            if (action === "exit") {
                setTimeout(() => {
                    reset();
                    setIsOpen(false);
                }, 2000);
            } else {
                setTimeout(() => {
                    reset();
                }, 1000);
            }

            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Something went wrong while saving the profile.";
            toast.error(message);
            return false;
        }
    };

    return (
        <Dialog {...props} open={open} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Add new Profile</Button>
            </DialogTrigger>

            <DialogContent className="shadow-lg md:min-h-[50vh] md:min-w-[50vw]" showCloseButton={false}>
                <DialogHeader className="px-3">
                    <DialogTitle className="text-primary text-xl">Add new Upwork Profile</DialogTitle>
                    <DialogDescription>Enter details to add a new Upwork profile.</DialogDescription>
                    <Separator className="sm:h-px" />
                </DialogHeader>

                <div className="no-scrollbar -mx-2 flex max-h-[50vh] w-full flex-col items-center justify-center gap-4 overflow-y-auto px-2">
                    {isIdle && (
                        <AddProfileForm onCancel={handleCancel} onSubmit={handleSubmit} isSubmitting={isPending} />
                    )}
                    {isPending && (
                        <State
                            variant="pending"
                            title="Saving Profile..."
                            description="Your new Upwork profile is being saved. Please wait."
                        />
                    )}
                    {isSuccess && (
                        <State
                            variant="success"
                            title="Profile Added!"
                            description="The new Upwork profile has been added successfully."
                            icon={CirclePlusIcon}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddNewProfileCard;
