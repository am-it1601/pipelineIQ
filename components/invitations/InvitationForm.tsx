import { zodResolver } from "@hookform/resolvers/zod";
import { CircleX, KeyRound, Mail, Send, ShieldUser, UserRound } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "../ui/button";
import { Field, FieldDescription, FieldError, FieldLabel, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { InviteFormData, inviteSchema } from "./invitation.form";

const InvitationForm = ({
  onInvite,
  onCancel,
}: {
  onInvite: (data: InviteFormData) => void;
  onCancel: () => void;
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      role: "bd",
    },
  });

  return (
    <>
      <form onSubmit={handleSubmit(onInvite)} className="space-y-4">
        <FieldSet>
          {/* Email  */}
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="invitee_email">
                  <Mail className="size-4" />
                  Email Address
                </FieldLabel>
                <Input
                  {...field}
                  name="invitee_email"
                  id="invitee_email"
                  type="text"
                  placeholder="Enter email address"
                  aria-invalid={fieldState.invalid}
                />

                {errors.email && <FieldError>{errors.email.message}</FieldError>}
                <FieldDescription className="field_description">
                  The email address of the person you want to invite.
                </FieldDescription>
              </Field>
            )}
          />
          {/* Role */}
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assigned_to_id" className="text-xs font-semibold">
                    <KeyRound className="w-4 h-4" />
                    User Role
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectTrigger id="invite-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bd">
                        <UserRound className="size-4 fill-primary text-primary-foreground hover:fill-none" />
                        Member
                      </SelectItem>
                      <SelectItem value="admin">
                        <ShieldUser className="size-4 fill-primary text-primary-foreground hover:fill-none" />
                        Administrator
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <FieldError>{errors.role.message}</FieldError>}
                  <FieldDescription className="field_description">
                    {watch("role") === "admin"
                      ? "Admins have full access to manage the platform."
                      : "BD Members can manage leads assigned to them."}
                  </FieldDescription>
                </Field>
              );
            }}
          />
        </FieldSet>
        <Separator className="my-1 h-px" />
        <div className="place-self-end flex gap-4">
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              reset();
              onCancel();
            }}
          >
            <CircleX className="size-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={!isValid}>
            <Send className="size-4" />
            Invite
          </Button>
        </div>
      </form>
    </>
  );
};

export default InvitationForm;
