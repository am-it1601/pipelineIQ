"use client";
import { useProfileList } from "@/hooks/profiles";
import State from "../custom/State";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Pagination } from "../ui/pagination";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import ProfileItem from "./ProfileItem";

const ProfileDirectory = ({ defaultView }: { defaultView: "list" | "card" }) => {
    const { isLoading, data, error, isError, isSuccess } = useProfileList();
    console.log("ProfileDirectory data:", data);
    return (
        <Card className="h-[70vh] overflow-hidden shadow">
            <CardHeader>
                <CardTitle>Profile Directory</CardTitle>
                <CardDescription>
                    Manage all linked Upwork profiles, review key details, and keep profile information organized
                    centrally.
                </CardDescription>
                <Separator orientation="horizontal" decorative className="h-px" />
            </CardHeader>
            <CardContent className="profile-card__content no-scrollbar">
                {(isError || error) && <State variant="error" title={`Loaded ${data?.length ?? 0} profiles`} />}
                {isLoading && (
                    <div className="space-y-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3">
                                <Skeleton className="size-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-col items-center gap-4 p-3">
                    {isSuccess && data && data.length === 0 && (
                        <State
                            variant="empty"
                            title="No Profiles Yet"
                            description="No Upwork profiles are available right now. Add a profile to get started."
                        />
                    )}
                    {isSuccess &&
                        data &&
                        data.length > 0 &&
                        data.map((profile) => <ProfileItem key={profile.id} profile={profile} />)}
                </div>
            </CardContent>
            <CardFooter>
                <Pagination></Pagination>
            </CardFooter>
        </Card>
    );
};

export default ProfileDirectory;
