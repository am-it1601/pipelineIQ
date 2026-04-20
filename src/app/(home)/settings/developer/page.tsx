import PageHeader from "@/components/custom/PageHeader";

export default function DeveloperSettingsPage() {
    return (
        <div className="animate-fade-in page-wrapper">
            <PageHeader
                title="Developer Space"
                subtitle="API keys, webhooks, system logs, and developer utilities."
                showDivider
            />
            <section className="section-wrapper">
                <p className="text-muted-foreground text-sm">Developer tools will be available here soon.</p>
            </section>
        </div>
    );
}
