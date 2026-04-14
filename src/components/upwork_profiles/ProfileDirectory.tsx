"use client";
import { useProfileList } from "@/hooks/profiles";
import { Grid, List } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ItemGroup } from "../ui/item";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ProfileItem from "./ProfileItem";

const ProfileDirectory = ({ defaultView }: { defaultView: "list" | "card" }) => {
  const { isLoading, data } = useProfileList();
  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle>Profile Directory</CardTitle>
        <CardDescription>
          Manage all linked Upwork profiles, review key details, and keep profile information
          organized centrally.
        </CardDescription>
        <Separator orientation="horizontal" decorative className="h-px" />
        <CardAction></CardAction>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultView ?? "list"} className="w-full flex-col">
          <TabsList className="place-items-end" variant="line">
            <TabsTrigger value="list">
              <List className="size-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="card">
              <Grid className="size-4" />
              Grid View
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <ItemGroup className="max-w-full">
              <ProfileItem />
            </ItemGroup>
          </TabsContent>
          <TabsContent value="card">Card View</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProfileDirectory;
