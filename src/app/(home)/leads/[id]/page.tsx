import { getLeadById } from "@/lib/services/leads.service";
import { createAdminClient } from "@/lib/supabase/admin";
import LeadDetailView from "@/components/leads/LeadDetailView";
import { notFound } from "next/navigation";

interface LeadPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadPageProps) {
  const { id } = await params;
  
  try {
    const supabase = createAdminClient();
    const initialLead = await getLeadById(supabase, id);

    return (
      <div className="page-wrapper">
        <LeadDetailView id={id} initialData={initialLead} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching lead:", error);
    return notFound();
  }
}
