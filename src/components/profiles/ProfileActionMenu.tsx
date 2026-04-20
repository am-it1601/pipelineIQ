"use client";

import type { UpworkProfile } from "@/types/types";
import { BanIcon, CirclePlay, EllipsisVertical, PencilIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
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

    const handleDelete = () => {};
    const handleToggleDisable = () => {};
    const isDisabled = !profile.is_active;

    // Prevent Radix from restoring focus to the trigger when the menu closes
    // because we immediately want focus to move into the dialog.
    const openEditDialog = () => {
        setIsEditOpen(true);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    <EllipsisVertical className="size-4" />
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
                        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                            <TrashIcon className="size-4" />
                            Delete Profile
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <AddNewProfileCard profile={profile} open={isEditOpen} onOpenChange={setIsEditOpen} />
        </>
    );
};

export default ProfileActionMenu;