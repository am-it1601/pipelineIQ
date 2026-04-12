import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const InvitationDirectoryCard = () => {
  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">Pending Invitations</CardTitle>
        <CardDescription>
          Track sent invitations, review assigned roles or groups, and manage pending user
          onboarding.
        </CardDescription>
        <Separator orientation="horizontal" decorative className="h-px" />
      </CardHeader>
      <CardContent>Test</CardContent>
    </Card>
  );
};

export default InvitationDirectoryCard;
