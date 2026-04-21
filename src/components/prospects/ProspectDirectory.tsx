"use client";
import { useProspectLists } from "@/hooks/http/prospects";
import { ChevronsUpDown, FunnelPlus, RotateCw } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

type ProspectDirectoryProps = {
    type?: "active" | "archived" | "watchlist";
};
const ProspectDirectory = ({ type }: ProspectDirectoryProps) => {
    const { isLoading, data: prospectList, refetch } = useProspectLists();
    return (
        <React.Fragment>
            <Card className="shadow">
                <Collapsible>
                    <CardHeader>
                        <CardTitle>Search Filters</CardTitle>
                        <CardAction>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                    <ChevronsUpDown />
                                    <span className="sr-only">Toggle details</span>
                                </Button>
                            </CollapsibleTrigger>
                        </CardAction>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent>
                            Search filters will go here. You can add various filters to narrow down your prospect list,
                            such as industry, location, company size, or any other relevant criteria. This will help you
                            quickly find the prospects that best match your target audience and business goals.
                        </CardContent>
                        <CardFooter className="gap-2 place-content-end">
                            <Button variant="outline" size="sm">
                                <RotateCw />
                                Reset
                            </Button>
                            <Button size="sm">
                                <FunnelPlus />
                                Apply
                            </Button>
                        </CardFooter>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
            <Card className="h-[60vh] overflow-hidden shadow items-center justify-between">
                {isLoading ? <div>Loading...</div> : <div>TO be fileed</div>}
            </Card>
        </React.Fragment>
    );
};

export default ProspectDirectory;
