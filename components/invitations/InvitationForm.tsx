import { zodResolver } from "@hookform/resolvers/zod";
import { CircleX, KeyRound, Mail, Send } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import GroupSelectDropdown from "@/components/dropdowns/GroupSelectDropdown";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldError, FieldLabel, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
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
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      groupSlug: "team_member",
    },
  });

  return (
    <>
      <form onSubmit={handleSubmit(onInvite)} className="space-y-4">
        <FieldSet>
          {/* Email */}
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
                  className="cn-input"
                />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
                <FieldDescription className="field_description">
                  The email address of the person you want to invite.
                </FieldDescription>
              </Field>
            )}
          />

          {/* Group — Dynamic dropdown */}
          <Controller
            name="groupSlug"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="invite-group" className="text-xs font-semibold">
                  <KeyRound className="w-4 h-4" />
                  User Group
                </FieldLabel>
                <GroupSelectDropdown
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select a group"
                />
                {errors.groupSlug && <FieldError>{errors.groupSlug.message}</FieldError>}
                <FieldDescription className="field_description">
                  Determines the permissions the user will have on the platform.
                </FieldDescription>
              </Field>
            )}
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
