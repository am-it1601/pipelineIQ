"use client";

import { UserWithDetails } from "@/lib/auth/types/auth.types";
import {
  useBanUser,
  useUnbanUser,
  useDeleteUser,
  useSendMagicLink,
  useSendPasswordReset,
  useAdminResetUserMfa,
} from "@/hooks/api_hooks/auth.mutations";
import {
  BanIcon,
  CirclePlay,
  EllipsisVertical,
  KeyRound,
  Loader2,
  Send,
  ShieldOff,
  TrashIcon,
  WandSparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";

const UserActionMenu = ({ user }: { user: UserWithDetails }) => {
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const deleteUser = useDeleteUser();
  const sendMagicLink = useSendMagicLink();
  const sendPasswordReset = useSendPasswordReset();
  const resetMfa = useAdminResetUserMfa();

  const isBusy =
    banUser.isPending ||
    unbanUser.isPending ||
    deleteUser.isPending ||
    sendMagicLink.isPending ||
    sendPasswordReset.isPending ||
    resetMfa.isPending;

  const isDisabled = user.banned_until != null;

  const handleToggleDisable = () => {
    const action = isDisabled ? unbanUser : banUser;
    action.mutate(user.id, {
      onSuccess: () =>
        toast.success(isDisabled ? "User enabled" : "User disabled"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleSendMagicLink = () => {
    sendMagicLink.mutate(user.id, {
      onSuccess: () => toast.success("Magic link sent"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleSendPasswordReset = () => {
    sendPasswordReset.mutate(user.id, {
      onSuccess: () => toast.success("Password reset link sent"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleResetMfa = () => {
    resetMfa.mutate(user.id, {
      onSuccess: (data) =>
        toast.success(`MFA reset — ${data.deletedCount} factor(s) removed`),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleDelete = () => {
    deleteUser.mutate(user.id, {
      onSuccess: () => toast.success("User deleted"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        disabled={isBusy}
      >
        {isBusy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <EllipsisVertical className="size-4" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 font-heading" align="start">
        {/* Status Management */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleToggleDisable}>
            {isDisabled ? (
              <>
                <CirclePlay className="dropdown-menu__icon" />
                Enable User
              </>
            ) : (
              <>
                <BanIcon className="dropdown-menu__icon" />
                Disable User
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Authentication */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Authentication</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleSendMagicLink}>
            <WandSparkles className="dropdown-menu__icon" />
            Send Magic Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendPasswordReset}>
            <Send className="dropdown-menu__icon" />
            Send Password Reset
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleResetMfa}>
            <ShieldOff className="dropdown-menu__icon" />
            Reset MFA
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Access Control */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Access Control</DropdownMenuLabel>
          <DropdownMenuItem disabled>
            <KeyRound className="dropdown-menu__icon" />
            Manage Groups
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Danger Zone */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Danger Zone</DropdownMenuLabel>
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <TrashIcon className="size-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActionMenu;
