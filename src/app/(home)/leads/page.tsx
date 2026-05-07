import PageHeader from "@/components/custom/PageHeader";
import LeadDialog from "@/components/leads/LeadDialog";
import LeadsTableWrapper from "@/components/leads/LeadsTableWrapper";

export default function LeadsPage() {
    return (
        <div className="animate-fade-in page-wrapper">
            <PageHeader
                title="Leads"
                subtitle="Manage and track all your leads from one place."
                action={<LeadDialog />}
            />

            <div className="section-wrapper">
                <LeadsTableWrapper />
            </div>
        </div>
    );
}
