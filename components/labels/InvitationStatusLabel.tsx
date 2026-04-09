import { cn } from "@/lib/utils";
import { InvitationStatus } from "@/types/types";
import { CheckCircle2, Clock, ShieldAlert, XCircle } from "lucide-react";
import { Badge } from "../ui/badge";

const configs: Record<
  InvitationStatus,
  { icon: React.ReactNode; label: string; className: string }
> = {
  pending: {
    icon: <Clock className="h-3 w-3" />,
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  },
  accepted: {
    icon: <CheckCircle2 className="h-3 w-3" />,
    label: "Accepted",
    className:
      "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/40",
  },
  expired: {
    icon: <XCircle className="h-3 w-3" />,
    label: "Expired",
    className:
      "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800/40",
  },
  revoked: {
    icon: <ShieldAlert className="h-3 w-3" />,
    label: "Revoked",
    className:
      "bg-gray-50 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  },
};

const InvitationStatusLabel = ({ status }: { status: InvitationStatus }) => {
  const config = configs[status];
  return (
    <Badge className={cn(config.className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

export default InvitationStatusLabel;
