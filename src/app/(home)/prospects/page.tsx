import PageHeader from "@/components/custom/PageHeader";
import ProspectDirectory from "@/components/prospects/ProspectDirectory";

const ProspectPage = () => {
    return (
        <div className="animate-fade-in page-wrapper">
            <PageHeader
                title="Leads & Prospects"
                subtitle="
                Manage your potential clients and business opportunities in one place. Track interactions, set reminders, and convert prospects into loyal customers with ease."
                showDivider
            />
            <section className="section-wrapper w-full">
                <ProspectDirectory type="active" />
            </section>
        </div>
    );
};

export default ProspectPage;
