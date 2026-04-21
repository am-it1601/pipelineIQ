import PageHeader from "@/components/custom/PageHeader";

export default function GroupsSettingsPage() {
    return (
        <div className="animate-fade-in page-wrapper">
            <PageHeader
                title="Groups & Permissions"
                subtitle="Manage user groups, roles, and fine-grained permission assignments."
                showDivider
            />
            <section className="section-wrapper">
                <p className="text-muted-foreground text-sm">Group management will be available here soon.</p>
            </section>
        </div>
    );
}
