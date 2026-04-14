"use client";
import { DialogRoot } from "@base-ui/react";
import { BookmarkPlus, CircleCheckIcon, CirclePlus, LoaderIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import UpworkProfileForm, { type UpworkProfileFormRef } from "./UpworkProfileForm";
import { UpworkProfileFormValues } from "./profile.schema";

type AddNewProfileCardProps = {
  triggerType: "card" | "button";
} & DialogRoot.Props;

const AddNewProfileCard = ({ triggerType = "button", ...props }: AddNewProfileCardProps) => {
  const formRef = useRef<UpworkProfileFormRef>(null);

  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSave = (data: UpworkProfileFormValues) => {
    console.log("Form submitted with data:", data);
    saveProfile(data);
    setDialogOpen(false);
    setTimeout(() => {
      setSuccess(false);
      setDialogOpen(false);
    }, 2000);
    // TODO: Call API to save profile
  };

  const handleSaveAndNew = (data: UpworkProfileFormValues) => {
    console.log("Form submitted and new with data:", data);
    saveProfile(data);
    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  };

  const saveProfile = async (data: UpworkProfileFormValues) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setApiError(responseData.error || "Failed to add profile");
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog {...props} open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger>
        {triggerType === "button" ? <ButtonTypeTrigger /> : <CardTypeTrigger />}
      </DialogTrigger>
      <DialogContent className="md:min-w-[50vw] md:min-h-[50vh] shadow-lg" showCloseButton={false}>
        <DialogHeader className="p-2">
          <DialogTitle className="text-xl font-semibold inline-flex items-center gap-2">
            <BookmarkPlus className="size-6 text-primary" />
            Add new Upwork Profile
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/70 tracking-wide capitalize font-normal">
            Enter Details to add new Upwork Profile
          </DialogDescription>
          <Separator className="h-[0.5px]" />
        </DialogHeader>
        {!loading && !apiError && !success && (
          <div className="max-h-[50vh] overflow-y-auto px-2 -mx-2 no-scrollbar">
            <UpworkProfileForm ref={formRef} onSubmit={handleSave} onSubmitNew={handleSaveAndNew} />
          </div>
        )}
        {success && (
          <div className="max-h-[50vh] overflow-y-auto px-2 -mx-2 no-scrollbar flex flex-col items-center justify-center gap-4">
            <CircleCheckIcon className="size-12 animate-out text-primary" />
            <p className="text-secondary">Profile added successfully!</p>
          </div>
        )}
        {loading && (
          <div className="max-h-[50vh] overflow-y-auto px-2 -mx-2 no-scrollbar flex flex-col items-center justify-center gap-4">
            <LoaderIcon className="size-12 animate-spin text-primary" />
            <p className="text-secondary">Saving profile...</p>
          </div>
        )}
        <DialogFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            Close
          </Button>
          <div className="inline-flex gap-2">
            <Button disabled={loading} onClick={() => formRef.current?.submitNew()}>
              Save & Add Another
            </Button>
            <Button disabled={loading} onClick={() => formRef.current?.submit()}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CardTypeTrigger = () => (
  <Card className="w-90 h-full shadow hover:shadow-lg p-4 group">
    <CardContent className="flex flex-col gap-2 rounded-[5%] hover:text-primary hover:border-primary items-center justify-center border-accent border-2 border-dashed h-full">
      <CirclePlus className="size-16 text-accent group-hover:text-primary" />
      <p className="text-xl">Add new Profile</p>
    </CardContent>
  </Card>
);

const ButtonTypeTrigger = () => <Button>Add new Profile</Button>;

export default AddNewProfileCard;
