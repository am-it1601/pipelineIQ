import PageHeader from "@/blocks/shared/PageHeader";

export default function GeneralSettingsPage() {
  return (
    <div className="animate-fade-in page-wrapper">
      <PageHeader
        title="General Settings"
        subtitle="Configure application-wide preferences and workspace settings."
        showDivider
      />
      <section className="section-wrapper">
        <p className="text-muted-foreground text-sm">
          General settings will be available here soon.
        </p>
      </section>
    </div>
  );
}
