"use client";

import { useDeleteProfile, useUpdateProfile } from "@/hooks/profiles";
import type { UpworkProfile } from "@/types/types";
import { BanIcon, CirclePlay, EllipsisVertical, Loader2, PencilIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import AddNewProfileCard from "./AddNewProfileCard";

type ProfileActionMenuProps = {
    profile: UpworkProfile;
};

const ProfileActionMenu = ({ profile }: ProfileActionMenuProps) => {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const updateMutation = useUpdateProfile(profile.id);
    const deleteMutation = useDeleteProfile();

    const isDisabled = !profile.is_active;
    const isBusy = updateMutation.isPending || deleteMutation.isPending;

    const openEditDialog = () => {
        setIsEditOpen(true);
    };

    const handleToggleDisable = () => {
        const nextActive = isDisabled;
        updateMutation.mutate(
            { is_active: nextActive },
            {
                onSuccess: () => toast.success(nextActive ? "Profile activated." : "Profile deactivated."),
                onError: (err) => toast.error(err.message),
            }
        );
    };

    const handleDeleteConfirm = () => {
        deleteMutation.mutate(profile.id, {
            onSuccess: () => {
                toast.success("Profile deleted.");
                setIsDeleteOpen(false);
            },
            onError: (err) => toast.error(err.message),
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    disabled={isBusy}
                >
                    {isBusy ? <Loader2 className="size-4 animate-spin" /> : <EllipsisVertical className="size-4" />}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 font-heading" align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Action</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={openEditDialog}>
                            <PencilIcon className="dropdown-menu__icon" /> Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleToggleDisable}>
                            {isDisabled ? (
                                <>
                                    <CirclePlay className="dropdown-menu__icon" />
                                    Activate Profile
                                </>
                            ) : (
                                <>
                                    <BanIcon className="dropdown-menu__icon" />
                                    DeActivate Profile
                                </>
                            )}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Danger Zone</DropdownMenuLabel>
                        <DropdownMenuItem variant="destructive" onSelect={() => setIsDeleteOpen(true)}>
                            <TrashIcon className="size-4" />
                            Delete Profile
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <AddNewProfileCard profile={profile} open={isEditOpen} onOpenChange={setIsEditOpen} />

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this profile?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove <span className="font-medium text-foreground">{profile.name}</span>{" "}
                            and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteConfirm();
                            }}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Profile"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default ProfileActionMenu;
