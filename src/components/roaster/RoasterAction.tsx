import { toggleActivation } from "@/lib/action/user.action";
import { EllipsisVertical, Power, PowerOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const RoasterAction = ({ id, status }: { id: string; status: boolean }) => {
  const handleDeactivate = async () => {
    console.log(`Deactivating user with id: ${id}`);
    try {
      await toggleActivation(id, !status);
      toast.success(`User has been ${status ? "deactivated" : "activated"} successfully.`);
    } catch (error) {
      toast.error("Failed to update user status. Please try again.");
    }
  };

  const handleDelete = () => {
    console.log(`Deleting user with id: ${id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleDeactivate}>
            {status ? <PowerOff className="size-4" /> : <Power className="size-4" />}
            {status ? "Deactivate User" : "Activate User"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete}>
            <Trash2 className="size-4 text-destructive" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoasterAction;
