import LeadContent from "@//components/leads/LeadContent";
import { Suspense } from "react";

export const LeadsPage = ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <Suspense
        fallback={<div className="p-8 text-center text-muted-foreground">Loading leads…</div>}
      >
        <LeadContent />
      </Suspense>
    </div>
  );
};

export default LeadsPage;
