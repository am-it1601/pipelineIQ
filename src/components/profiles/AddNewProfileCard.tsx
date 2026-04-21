"use client";

import { UpworkProfileFormInput } from "@/forms/profile.schema";
import { useCreateProfile, useUpdateProfile } from "@/hooks/http/profiles";
import type { UpworkProfile } from "@/types/types";
import { CircleCheckIcon, CirclePlusIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import State from "../custom/State";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { AddProfileForm } from "./AddProfileForm";

type AddNewProfileCardProps = Omit<
    React.ComponentProps<typeof DialogPrimitive.Root>,
    "open" | "onOpenChange" | "children"
> & {
    /** Pass a profile to open the dialog in edit mode. */
    profile?: UpworkProfile;
    /** Controlled open state. When omitted, the dialog is self-managed and renders its trigger. */
    open?: boolean;
    /** Controlled open-change handler. */
    onOpenChange?: (open: boolean) => void;
    /** Custom trigger node. Only rendered when the dialog is uncontrolled. */
    trigger?: ReactNode;
};

const AddNewProfileCard = ({
    profile,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    trigger,
    ...rootProps
}: AddNewProfileCardProps) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const setOpen = (next: boolean) => {
        if (isControlled) controlledOnOpenChange?.(next);
        else setUncontrolledOpen(next);
    };

    const isEdit = !!profile;

    const createMutation = useCreateProfile();
    const updateMutation = useUpdateProfile(profile?.id ?? "");
    const { mutateAsync, isPending, isSuccess, isIdle, reset } = isEdit ? updateMutation : createMutation;

    const initialValues = useMemo<UpworkProfileFormInput | undefined>(() => {
        if (!profile) return undefined;
        return {
            name: profile.name ?? "",
            url: profile.url ?? "",
            title: profile.title ?? "",
            bio: profile.bio ?? "",
            skill_tags: profile.skill_tags ?? [],
            rate_per_hour:
                profile.rate_per_hour !== null && profile.rate_per_hour !== undefined
                    ? String(profile.rate_per_hour)
                    : "",
        };
    }, [profile]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isPending) return;
        if (!nextOpen) reset();
        setOpen(nextOpen);
    };

    const handleCancel = () => {
        if (isPending) return;
        setOpen(false);
    };

    const handleSubmit = async (values: UpworkProfileFormInput, action: "new" | "exit") => {
        try {
            await mutateAsync(values);

            const successMessage = isEdit
                ? "Profile updated successfully."
                : action === "new"
                  ? "Profile saved. You can add another one now."
                  : "Profile saved successfully.";

            toast.success(successMessage);

            if (isEdit || action === "exit") {
                setTimeout(() => {
                    reset();
                    setOpen(false);
                }, 2000);
            } else {
                setTimeout(() => {
                    reset();
                }, 1000);
            }

            return true;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : isEdit
                      ? "Something went wrong while updating the profile."
                      : "Something went wrong while saving the profile.";
            toast.error(message);
            return false;
        }
    };

    const title = isEdit ? "Edit Upwork Profile" : "Add new Upwork Profile";
    const description = isEdit
        ? "Update the details of this Upwork profile."
        : "Enter details to add a new Upwork profile.";
    const pendingTitle = isEdit ? "Updating Profile..." : "Saving Profile...";
    const pendingDescription = isEdit
        ? "Your changes are being saved. Please wait."
        : "Your new Upwork profile is being saved. Please wait.";
    const successTitle = isEdit ? "Profile Updated!" : "Profile Added!";
    const successDescription = isEdit
        ? "The Upwork profile has been updated successfully."
        : "The new Upwork profile has been added successfully.";
    const successIcon = isEdit ? CircleCheckIcon : CirclePlusIcon;

    return (
        <Dialog {...rootProps} open={open} onOpenChange={handleOpenChange}>
            {!isControlled && <DialogTrigger asChild>{trigger ?? <Button>Add new Profile</Button>}</DialogTrigger>}

            <DialogContent className="shadow-lg md:min-h-[50vh] md:min-w-[50vw]" showCloseButton={false}>
                <DialogHeader className="px-3">
                    <DialogTitle className="text-primary text-xl">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                    <Separator className="sm:h-px" />
                </DialogHeader>

                <div className="no-scrollbar -mx-2 flex max-h-[50vh] w-full flex-col items-center justify-center gap-4 overflow-y-auto px-2">
                    {isIdle && (
                        <AddProfileForm
                            mode={isEdit ? "edit" : "create"}
                            initialValues={initialValues}
                            onCancel={handleCancel}
                            onSubmit={handleSubmit}
                            isSubmitting={isPending}
                        />
                    )}
                    {isPending && <State variant="pending" title={pendingTitle} description={pendingDescription} />}
                    {isSuccess && (
                        <State
                            variant="success"
                            title={successTitle}
                            description={successDescription}
                            icon={successIcon}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddNewProfileCard;
