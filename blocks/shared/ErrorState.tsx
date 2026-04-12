import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { OctagonAlert } from "lucide-react";

const ErrorState = ({ message }: { message?: string }) => {
  return (
    <Empty className="bg-sidebar-accent">
      <EmptyHeader>
        <EmptyMedia className="animate-[wiggle_500ms_ease-in-out_infinite]">
          <OctagonAlert className="h-12 w-12 text-destructive" />
        </EmptyMedia>
        <EmptyTitle className="text-2xl">Oops! This Was Not Part of the Plan</EmptyTitle>
        <EmptyDescription>
          Something Went Wrong. Please contact Administrator for support.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent></EmptyContent>
    </Empty>
  );
};

export default ErrorState;
