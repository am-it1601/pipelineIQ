import AddNewProfileCard from "@//components/profiles/AddNewProfileCard";
import ProfileGridView from "@//components/profiles/ProfileGridView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@//components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@//components/ui/tabs";
import { getUpworkProfiles } from "@/lib/actions_old/profile.action";
import { UpworkProfile } from "@/types/types";

import { LayoutGrid, ListIcon } from "lucide-react";

const page = async () => {
  const profiles: UpworkProfile[] = await getUpworkProfiles();
  console.log(profiles);
  return (
    <div className="animate-fade-in flex flex-col gap-2 py-2">
      <Tabs defaultValue="overview" className="flex flex-col gap-4">
        <div className="flex justify-between gap-4">
          <AddNewProfileCard triggerType="button" />
          <TabsList className="place-self-end-safe bg-gray-700/50">
            <TabsTrigger value="grid">
              <LayoutGrid className="size-4" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <ListIcon className="size-4" />
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="w-full space-y-4">
          <TabsContent value="grid">
            <ProfileGridView profiles={profiles} />
          </TabsContent>
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Track performance and user engagement metrics. Monitor trends and identify growth
                  opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Page views are up 25% compared to last month.
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default page;
