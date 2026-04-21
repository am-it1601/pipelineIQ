import InvitationDirectoryCard from "@//components/user_management/invitations/InvitationDirectoryCard";
import { InviteMemberDialog } from "@//components/user_management/invitations/InviteMemberDialog";
import UserDirectoryCard from "@//components/user_management/UserDirectoryCard";
import PageHeader from "@/components/custom/PageHeader";

const UserManagementPage = () => {
    return (
        <div className="animate-fade-in page-wrapper">
            <PageHeader
                title="Users & Access Control"
                subtitle="Manage users, roles, and permissions with complete control over platform access."
                showDivider
                action={<InviteMemberDialog />}
            />
            <section className="section-wrapper">
                <UserDirectoryCard />
            </section>
            <section className="section-wrapper">
                <InvitationDirectoryCard />
            </section>
        </div>
    );
};

export default UserManagementPage;
