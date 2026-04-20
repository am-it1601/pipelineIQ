import PageHeader from "@/components/custom/PageHeader";
import AddNewProfileCard from "@/components/profiles/AddNewProfileCard";
import ProfileDirectory from "@/components/profiles/ProfileDirectory";

const page = () => {
    return (
        <div className="animate-fade-in page-wrapper">
            <PageHeader
                title="Upwork Profile Directory"
                subtitle="Manage all your Upwork profiles, monitor key details, and keep profile settings organized centrally."
                showDivider
                action={<AddNewProfileCard />}
            />
            <section className="section-wrapper w-full">
                <ProfileDirectory defaultView={"card"} />
            </section>
        </div>
    );
};

export default page;
