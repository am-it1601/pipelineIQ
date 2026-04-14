"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleDollarSign, Link, NotepadText, Tags, Target, UserCircle } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import { Controller, useForm } from "react-hook-form";
import { BadgeInput } from "../custom/BadgeInput";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { UpworkProfileFormInput, upworkProfileSchema } from "./profile.schema";

type UpworkProfileFormProps = {
  onSubmit: (data: UpworkProfileFormInput) => Promise<void> | void;
  onSubmitNew: (data: UpworkProfileFormInput) => Promise<void> | void;
};

export type UpworkProfileFormRef = {
  submit: () => void;
  submitNew: () => void;
};

const UpworkProfileForm = forwardRef<UpworkProfileFormRef, UpworkProfileFormProps>(
  ({ onSubmit, onSubmitNew }, ref) => {
    const form = useForm<UpworkProfileFormInput>({
      resolver: zodResolver(upworkProfileSchema),
      shouldUnregister: true,
      mode: "all",
      defaultValues: {
        profile_name: "",
        profile_link: "",
        bio: "",
        focus_area: "",
        skill_tags: [],
        rate_per_hour: "",
      },
    });

    useImperativeHandle(ref, () => ({
      submit: () => form.handleSubmit(onSubmit)(),
      submitNew: () => form.handleSubmit(onSubmitNew)(),
    }));

    return (
      <form
        id="form__upwork_profile"
        className="flex flex-col justify-between items-center no-scrollbar overflow-y-scroll px-2 h-full"
      >
        <FieldSet className="w-full gap-2 ">
          <FieldGroup className="w-full grid grid-col-2 md:grid-cols-3 gap-4">
            <Controller
              control={form.control}
              name="profile_name"
              render={({ field, fieldState }) => (
                <Field className="w-full" data-invalid={fieldState.invalid} data-required={true}>
                  <FieldLabel
                    htmlFor="lead_date"
                    className="text-xs font-semibold"
                    aria-invalid={fieldState.invalid}
                  >
                    <UserCircle className="size-4" />
                    Profile Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="profile_name"
                    aria-invalid={fieldState.invalid}
                    className="shadow bg-transparent border-border"
                  />
                  {fieldState.error && (
                    <FieldError className="field_error">{fieldState.error.message}</FieldError>
                  )}
                  <FieldDescription className="field_description">
                    Enter the full name of the professional or resource. This is for internal
                    reference and can be the same as the name on the upwork profile
                  </FieldDescription>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="profile_link"
              render={({ field, fieldState }) => (
                <Field className="w-full" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile_link" className="text-xs font-semibold">
                    <Link className="size-4" />
                    Upwork Profile Link
                  </FieldLabel>
                  <Input
                    {...field}
                    id="profile_link"
                    aria-invalid={fieldState.invalid}
                    className="shadow-2xs"
                  />
                  {fieldState.error && (
                    <FieldError className="field_error">{fieldState.error.message}</FieldError>
                  )}
                  <FieldDescription className="field_description">
                    Provide the direct Upwork profile URL of the resource. This will help in quick
                    reference and validation of the profile details.
                  </FieldDescription>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="rate_per_hour"
              render={({ field, fieldState }) => (
                <Field className="w-full" data-invalid={fieldState.invalid} data-required={true}>
                  <FieldLabel
                    htmlFor="rate_per_hour"
                    className="text-xs font-semibold"
                    aria-invalid={fieldState.invalid}
                  >
                    <CircleDollarSign className="size-4" />
                    Rate per Hour
                  </FieldLabel>
                  <Input
                    {...field}
                    value={(field.value as number | undefined) ?? ""}
                    id="rate_per_hour"
                    aria-invalid={fieldState.invalid}
                    aria-required={true}
                  />
                  {fieldState.error && (
                    <FieldError className="field_error">{fieldState.error.message}</FieldError>
                  )}
                  <FieldDescription className="field_description">
                    Enter the current hourly rate of the freelancer as mentioned on their Upwork
                    profile. Required for budget calculations and comparisons with other profiles.
                  </FieldDescription>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="focus_area"
              render={({ field, fieldState }) => (
                <Field className="w-full col-span-3" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="focus_area" className="text-xs font-semibold">
                    <Target className="size-4" />
                    Focus Area
                  </FieldLabel>
                  <Input {...field} id="focus_area" aria-invalid={fieldState.invalid} />
                  {fieldState.error && (
                    <FieldError className="field_error">{fieldState.error.message}</FieldError>
                  )}
                  <FieldDescription className="field_description">
                    Focus area of the freelancer, as per upwork profile. This helps in understanding
                    the primary expertise and specialization of the freelancer.
                  </FieldDescription>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="bio"
              render={({ field, fieldState }) => (
                <Field className="w-full col-span-3">
                  <FieldLabel
                    htmlFor="lead_date"
                    className="text-xs font-semibold"
                    aria-required={true}
                    aria-invalid={fieldState.invalid}
                  >
                    <NotepadText className="size-4" />
                    Bio
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="profile_name"
                    aria-invalid={fieldState.invalid}
                    aria-required={true}
                    rows={5}
                  />
                  {fieldState.error && (
                    <FieldError className="field_error">{fieldState.error.message}</FieldError>
                  )}
                  <FieldDescription className="field_description">
                    Write a concise professional summary covering the individual’s experience,
                    strengths, and domain relevance. This should be based on the bio/overview
                    section of their Upwork profile
                  </FieldDescription>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="skill_tags"
              render={({ field, fieldState }) => (
                <Field className="w-full col-span-3" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="skill_tags" className="text-xs font-semibold">
                    <Tags className="size-4" />
                    Skill Tags
                  </FieldLabel>
                  <BadgeInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter skills separated by commas (max 15)"
                    maxBadges={15}
                  />
                  {fieldState.error && (
                    <FieldError className="field_error">{fieldState.error.message}</FieldError>
                  )}
                  <FieldDescription className="field_description">
                    Skills or tags associated with the freelancer, as per upwork profile. Enter up
                    to 15 skills separated by commas.
                  </FieldDescription>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
      </form>
    );
  }
);

UpworkProfileForm.displayName = "UpworkProfileForm";

export default UpworkProfileForm;
