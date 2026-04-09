import { z } from "zod";
import { optionalNumberFromInput, upworkUrlSchema } from "../leads/lead.schema";

export const upworkProfileSchema = z
  .object({
    profile_name: z
      .string()
      .trim()
      .min(1, "Profile Name is required.")
      .max(200, "Profile Name must be 200 characters or less."),
    profile_link: z.string().trim(),
    focus_area: z.string().trim(),
    skill_tags: z
      .array(z.string().trim().min(1))
      .max(15, "Maximum 15 skills allowed")
      .optional()
      .default([]), // Convert array to comma-separated string
    bio: z.string().optional(),
    rate_per_hour: optionalNumberFromInput,
  })
  .superRefine((data, ctx) => {
    if (!data.profile_link || data.profile_link.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["profile_link"],
        message: "Upwork link is required",
      });
    } else {
      const parsed = upworkUrlSchema.safeParse(data.profile_link);
      if (!parsed.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["profile_link"],
          message: parsed.error.issues[0]?.message ?? "Invalid Upwork link.",
        });
      }
    }
  });

export type UpworkProfileFormInput = z.input<typeof upworkProfileSchema>;
export type UpworkProfileFormValues = z.output<typeof upworkProfileSchema>;
