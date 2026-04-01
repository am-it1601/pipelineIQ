import { BID_TYPES, ENGAGEMENT_TYPES, LEAD_SOURCES } from "@/lib/constants";
import { z } from "zod";

const leadSourceSchema = z.enum(LEAD_SOURCES, {
   message: "Please select a valid lead source." });

const engagementTypeSchema = z.enum(ENGAGEMENT_TYPES, { message: "Please select a valid engagement type." });

const bidTypeSchema = z.enum(BID_TYPES, { message: "Please select a valid bid type." });

const upworkUrlSchema = z
  .string()
  .trim()
  .url("Please enter a valid URL.")
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        url.hostname === "upwork.com" ||
        url.hostname === "www.upwork.com"
      );
    } catch {
      return false;
    }
  }, "Only upwork.com links are allowed.");

const numberFromInput = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "string") return Number(value);
  return value;
}, z.number({
    error: "Please enter a valid number."
}));

const optionalNumberFromInput = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "string") return Number(value);
  return value;
}, z.number("Please enter a valid number.").or(z.undefined()));

export const leadFormSchema = z
  .object({
    lead_date: z
      .string()
      .trim()
      .min(1, "Date submitted is required.")
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Please enter a valid date.",
      })
      .refine((value) => {
        const inputDate = new Date(value);
        const today = new Date();

        inputDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return inputDate <= today;
      }, "Future dates are not allowed."),

    lead_source: leadSourceSchema,

    lead_title: z
      .string()
      .trim()
      .min(1, "Title is required.")
      .max(200, "Title must be 200 characters or less."),

    engagement_type: engagementTypeSchema,

    lead_upwork_link: z.string().trim().optional(),
    lead_connect: optionalNumberFromInput,
    bid_type: bidTypeSchema.optional(),

    proposed_hourly_rate: optionalNumberFromInput,
    proposed_duration: optionalNumberFromInput,
    lead_budget: optionalNumberFromInput,

    lead_remarks: z
      .string()
      .trim()
      .max(2000, "Remarks must be 2000 characters or less.")
      .optional(),

    assigned_to_id: z
      .string()
      .min(1, "Please assign this lead to a member."),
  })
  .superRefine((data, ctx) => {
    const isUpwork = data.lead_source === "Upwork";
    const isHourly = data.engagement_type === "Hourly";
    const isFixed = data.engagement_type === "Fixed";

    // Upwork-specific validation
    if (isUpwork) {
      if (!data.lead_upwork_link || data.lead_upwork_link.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lead_upwork_link"],
          message: "Upwork link is required when source is Upwork.",
        });
      } else {
        const parsed = upworkUrlSchema.safeParse(data.lead_upwork_link);
        if (!parsed.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["lead_upwork_link"],
            message: parsed.error.issues[0]?.message ?? "Invalid Upwork link.",
          });
        }
      }

      if (data.lead_connect === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lead_connect"],
          message: "Connect used is required when source is Upwork.",
        });
      } else if (data.lead_connect < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lead_connect"],
          message: "Connect used cannot be negative.",
        });
      }

      if (!data.bid_type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bid_type"],
          message: "Bid type is required when source is Upwork.",
        });
      }
    }

    // Hourly-specific validation
    if (isHourly) {
      if (data.proposed_hourly_rate === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["proposed_hourly_rate"],
          message: "Proposed hourly rate is required for hourly engagement.",
        });
      } else if (data.proposed_hourly_rate <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["proposed_hourly_rate"],
          message: "Proposed hourly rate must be greater than 0.",
        });
      }

      if (data.proposed_duration === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["proposed_duration"],
          message: "Proposed duration is required for hourly engagement.",
        });
      } else if (data.proposed_duration <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["proposed_duration"],
          message: "Proposed duration must be greater than 0.",
        });
      }
    }

    // Fixed-specific validation
    if (isFixed) {
      if (data.lead_budget === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lead_budget"],
          message: "Lead budget is required for fixed engagement.",
        });
      } else if (data.lead_budget <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lead_budget"],
          message: "Lead budget must be greater than 0.",
        });
      }
    }
  });


export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormValues = z.output<typeof leadFormSchema>;