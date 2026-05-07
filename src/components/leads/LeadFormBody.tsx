"use client";

import { Separator } from "@/components/ui/separator";
import { BID_TYPES, ENGAGEMENT_TYPES, LEAD_SOURCES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  BoltIcon,
  Calendar,
  CalendarCheck,
  CircleDollarSignIcon,
  Clock2Icon,
  DollarSignIcon,
  FlagTriangleRight,
  FunnelIcon,
  HandCoinsIcon,
  LinkIcon,
  NotebookTextIcon,
  NotepadText,
  RocketIcon,
  SaveIcon,
  UserIcon,
  ZapIcon,
} from "lucide-react";
import { Controller } from "react-hook-form";
import { useLeadForm } from "../../hooks/useLeadForm";
import { Button } from "../ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "../ui/field";
import { Input } from "../ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "../ui/input-group";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import UserDropDown from "../users/UserDropDown";

import { LeadLogEntry } from "@/types/types";

interface LeadFormBodyProps {
  onClose?: () => void;
  initialLead?: LeadLogEntry;
}

/**
 * Pure form body for creating or editing a lead.
 * Can be embedded in any container (Dialog, Sheet, Page, etc.).
 */
export const LeadFormBody = ({ onClose, initialLead }: LeadFormBodyProps) => {
  const { form, engagement_type, lead_source, computedLeadBudget, onSubmit, isSubmitting, isEditing } =
    useLeadForm(initialLead);
  const isUpwork = lead_source === "Upwork";

  return (
    <form
      id="lead__form"
      className="flex flex-col h-full overflow-hidden"
      onSubmit={form.handleSubmit((data) => onSubmit(data, onClose))}
    >
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
      <FieldSet className="w-full gap-4">
        {/* Row 1: Date + Source */}
        <FieldGroup className="w-full grid grid-cols-2 gap-4">
          <Controller
            control={form.control}
            name="lead_date"
            render={({ field }) => (
              <Field className="w-full">
                <FieldLabel htmlFor="lead_date" className="text-xs font-semibold">
                  <Calendar className="size-4" />
                  Date Submitted
                </FieldLabel>
                <Input {...field} id="lead_date" type="date" />
                <FieldDescription className="field_description">
                  The date the lead was submitted or added to the system.
                </FieldDescription>
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="lead_source"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="lead_source" className="text-xs font-semibold">
                  <FunnelIcon className="size-4" />
                  Source
                </FieldLabel>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription className="field_description">
                  The origin of the lead, such as Upwork, LinkedIn, Referral, etc.
                </FieldDescription>
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
              </Field>
            )}
          />
        </FieldGroup>

        <FieldSeparator className="h-px" />

        {/* Row 2: Assigned To + Lead Title */}
        <FieldGroup className="mt-2">
          <Controller
            control={form.control}
            name="assigned_to_id"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="assigned_to_id" className="text-xs font-semibold">
                  <UserIcon className="w-4 h-4" />
                  Assigned To
                </FieldLabel>
                <UserDropDown value={field.value} onChangeHandler={field.onChange} />
                <FieldDescription className="field_description">
                  The user to whom the lead is assigned.
                </FieldDescription>
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="lead_title"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="lead_title"
                  aria-invalid={fieldState.invalid}
                  className="text-xs font-semibold"
                >
                  <NotebookTextIcon className="w-4 h-4" />
                  Lead Title
                </FieldLabel>
                <Input
                  {...field}
                  id="lead_title"
                  name="lead_title"
                  type="text"
                  placeholder="Lead title or project name"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  autoCapitalize="words"
                />
                <FieldDescription className="field_description flex justify-between flex-wrap-reverse">
                  A brief title to identify the lead, usually the project title.
                  {fieldState.error && (
                    <FieldError className="text-xs text-right font-semibold">
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </FieldDescription>
              </Field>
            )}
          />

          {/* Upwork-specific fields */}
          {isUpwork && (
            <>
              <Controller
                control={form.control}
                name="lead_upwork_link"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lead_upwork_link" className="text-xs font-semibold">
                      <LinkIcon className="w-4 h-4" />
                      Upwork Link
                    </FieldLabel>
                    <Input
                      {...field}
                      name="lead_upwork_link"
                      id="lead_upwork_link"
                      type="text"
                      placeholder="https://www.upwork.com/jobs/view/..."
                    />
                    <FieldDescription className="field_description flex justify-between flex-wrap-reverse">
                      The link to the Upwork job posting.
                      {fieldState.error && (
                        <FieldError className="text-xs text-right font-semibold">
                          {fieldState.error.message}
                        </FieldError>
                      )}
                    </FieldDescription>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="lead_connect"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lead_connect" className="text-xs font-semibold">
                      <HandCoinsIcon className="size-4" />
                      Connects Used
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="lead_connect"
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        placeholder="0"
                        value={(field.value as number | string) || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? undefined : Number(e.target.value)
                          )
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                      <InputGroupAddon>
                        <BoltIcon />
                      </InputGroupAddon>
                      <InputGroupAddon align="inline-end">Connects</InputGroupAddon>
                    </InputGroup>
                    <FieldDescription className="field_description flex justify-between flex-wrap-reverse">
                      The number of Upwork connects used to submit the proposal for this lead.
                      {fieldState.error && (
                        <FieldError className="text-xs text-right font-semibold">
                          {fieldState.error.message}
                        </FieldError>
                      )}
                    </FieldDescription>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="bid_type"
                render={({ field, fieldState }) => (
                  <FieldSet data-invalid={fieldState.invalid} className="w-full">
                    <FieldLegend variant="label" className="flex gap-2 text-xs font-semibold">
                      <ZapIcon className="size-4" />
                      Submission Type
                    </FieldLegend>
                    <FieldDescription className="field_description">
                      Indicates whether the lead was submitted as a regular proposal or a boosted
                      proposal on Upwork.
                    </FieldDescription>
                    <RadioGroup
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      className="flex gap-4"
                    >
                      {BID_TYPES.map((bt) => (
                        <FieldLabel htmlFor={`bid_type_${bt.toLowerCase()}`} key={bt}>
                          <Field orientation="horizontal">
                            <FieldContent className="gap-2">
                              <FieldTitle className="font-semibold">
                                {bt === "Boosted" ? (
                                  <RocketIcon className="w-4 h-4" />
                                ) : (
                                  <BoltIcon className="w-4 h-4" />
                                )}
                                {bt}
                              </FieldTitle>
                              <FieldDescription className="field_description">
                                {bt === "Boosted"
                                  ? "Submitted as a boosted proposal, which increases visibility and chances of winning the contract."
                                  : "Submitted as a regular proposal without any additional promotion."}
                              </FieldDescription>
                            </FieldContent>
                            <RadioGroupItem value={bt} id={`bid_type_${bt.toLowerCase()}`} />
                          </Field>
                        </FieldLabel>
                      ))}
                    </RadioGroup>
                  </FieldSet>
                )}
              />
            </>
          )}
        </FieldGroup>

        <FieldSeparator className="h-px" />

        {/* Engagement Type + Budget */}
        <FieldGroup>
          <Controller
            control={form.control}
            name="engagement_type"
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid} className="w-full gap-5">
                <FieldLegend variant="label" className="flex gap-2 text-xs font-semibold">
                  <FlagTriangleRight className="size-4" />
                  Engagement Type
                </FieldLegend>
                <FieldDescription className="field_description">
                  The type of engagement for the lead, it may be hourly or fixed-price contract.
                </FieldDescription>
                <RadioGroup
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  className="flex gap-4"
                >
                  {ENGAGEMENT_TYPES.map((et) => (
                    <FieldLabel htmlFor={`engagement_type_${et.toLowerCase()}`} key={et}>
                      <Field orientation="horizontal">
                        <FieldContent className="gap-2">
                          <FieldTitle className="font-semibold">
                            {et === "Hourly" ? (
                              <Clock2Icon className="w-4 h-4" />
                            ) : (
                              <DollarSignIcon className="w-4 h-4" />
                            )}
                            {et}
                          </FieldTitle>
                          <FieldDescription className="field_description">
                            {et === "Hourly"
                              ? "where the client pays based on the time spent on the project."
                              : "A fixed-price engagement proposal. Paid after completion."}
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value={et} id={`engagement_type_${et.toLowerCase()}`} />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
              </FieldSet>
            )}
          />

          <FieldGroup
            className={cn(
              engagement_type === "Hourly" &&
                "border border-primary bg-card/10 shadow-lg rounded-lg px-4 py-6"
            )}
          >
            {engagement_type === "Hourly" && (
              <div className="grid grid-cols-2 md:grid-col-2 gap-4">
                <Controller
                  control={form.control}
                  name="proposed_hourly_rate"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="proposed_hourly_rate" className="text-xs font-semibold">
                        Proposed Hourly Rate
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id="proposed_hourly_rate"
                          type="number"
                          min={1}
                          max={1000}
                          step={1}
                          placeholder="$20"
                          value={(field.value as number | string) || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? undefined : Number(e.target.value)
                            )
                          }
                        />
                        <InputGroupAddon>
                          <CircleDollarSignIcon />
                        </InputGroupAddon>
                        <InputGroupAddon align="inline-end">/hour</InputGroupAddon>
                      </InputGroup>
                      <FieldDescription className="field_description">
                        The hourly rate proposed for an hourly engagement.
                      </FieldDescription>
                      {fieldState.error && (
                        <FieldError className="text-xs text-right font-semibold">
                          {fieldState.error.message}
                        </FieldError>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="proposed_duration"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="proposed_duration" className="text-xs font-semibold">
                        Proposed Duration
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id="proposed_duration"
                          type="number"
                          min={1}
                          max={100}
                          step={0.5}
                          placeholder="1 Month"
                          value={(field.value as number | string) || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? undefined : Number(e.target.value)
                            )
                          }
                        />
                        <InputGroupAddon>
                          <CalendarCheck />
                        </InputGroupAddon>
                        <InputGroupAddon align="inline-end">Months</InputGroupAddon>
                      </InputGroup>
                      <FieldDescription className="field_description">
                        The estimated duration for the hourly engagement, usually in months.
                      </FieldDescription>
                      {fieldState.error && (
                        <FieldError className="text-xs text-right font-semibold">
                          {fieldState.error.message}
                        </FieldError>
                      )}
                    </Field>
                  )}
                />
              </div>
            )}

            <Controller
              control={form.control}
              name="lead_budget"
              render={({ field, fieldState }) => (
                <FieldContent className="gap-4">
                  <FieldTitle className="font-semibold">
                    Proposed Budget{" "}
                    {engagement_type === "Hourly" &&
                      computedLeadBudget &&
                      `($${computedLeadBudget})`}
                  </FieldTitle>
                  <FieldDescription className="field_description">
                    {engagement_type === "Hourly"
                      ? "The total contract value is automatically calculated based on your hourly rate and proposed duration."
                      : "Enter the proposed budget for this fixed-price project."}
                  </FieldDescription>
                  <Field data-invalid={fieldState.invalid} orientation="responsive" className="w-full">
                    <FieldLabel htmlFor="lead_budget" className="text-xs font-semibold">
                      <CircleDollarSignIcon />
                      {`Total Contract Value ${engagement_type === "Hourly" ? "(auto)" : ""}`}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="lead_budget"
                        type="number"
                        name={field.name}
                        value={(field.value as number | string) || ""}
                        onChange={(e) => {
                          const num =
                            e.target.value === "" ? undefined : Number(e.target.value);
                          field.onChange(num);
                        }}
                        onBlur={field.onBlur}
                        disabled={engagement_type === "Hourly"}
                        min={1}
                        max={1000000}
                        step={1}
                        placeholder={
                          engagement_type === "Hourly" ? "Calculating..." : "Enter amount"
                        }
                        className="w-60"
                      />
                      <InputGroupAddon>
                        <CircleDollarSignIcon />
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.error && (
                      <FieldError className="text-xs text-right font-semibold">
                        {fieldState.error.message}
                      </FieldError>
                    )}
                  </Field>
                </FieldContent>
              )}
            />
          </FieldGroup>

          <FieldSeparator className="h-px" />

          {/* Remarks */}
          <Controller
            control={form.control}
            name="lead_remarks"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="w-full">
                <FieldLabel htmlFor="lead_remarks" className="text-xs font-semibold">
                  <NotepadText className="size-4" />
                  Remarks
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="lead_remarks"
                    placeholder="Enter remarks..."
                    rows={4}
                  />
                </InputGroup>
                <FieldDescription className="field_description">
                  Additional notes or comments about the lead, such as specific client requirements,
                  communication details, or follow-up actions.
                </FieldDescription>
                {fieldState.error && (
                  <FieldError className="text-xs text-right font-semibold">
                    {fieldState.error.message}
                  </FieldError>
                )}
              </Field>
            )}
          />
        </FieldGroup>
        </FieldSet>
      </div>

      <Separator className="h-px" />

      {/* Footer actions */}
      <div className="flex gap-2 justify-end px-4 py-4 bg-background">
        {onClose && (
          <Button type="button" variant="destructive" size="sm" onClick={onClose}>
            Cancel
          </Button>
        )}
        {!isEditing && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={!form.formState.isValid || !form.formState.isDirty || isSubmitting}
            onClick={form.handleSubmit((data) => onSubmit(data))}
          >
            <SaveIcon className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save & New"}
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!form.formState.isValid || !form.formState.isDirty || isSubmitting}
        >
          <SaveIcon className="h-4 w-4" />
          {isSubmitting ? "Saving..." : isEditing ? "Update Lead" : "Save & Exit"}
        </Button>
      </div>
    </form>
  );
};

export default LeadFormBody;
