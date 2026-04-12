import PageHeader from "@/blocks/shared/PageHeader";
import { InviteMemberDialog } from "@/components/invitations/InviteMemberDialog";
import InvitationDirectoryCard from "@/components/user_management/invitations/InvitationDirectoryCard";
import UserDirectoryCard from "@/components/user_management/UserDirectoryCard";

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
