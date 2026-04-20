import { z } from "zod";
import { optionalNumberFromInput, upworkUrlSchema } from "./shared.schema";

export const upworkProfileSchema = z
    .object({
        name: z.string().trim().min(1, "Name is required.").max(200, "Profile Name must be 200 characters or less."),
        url: z.string().trim().min(1, "Proofile Url is required"),
        title: z.string().trim(),
        skill_tags: z.array(z.string().trim().min(1)).max(15, "Maximum 15 skills allowed").optional().default([]), // Convert array to comma-separated string
        bio: z.string().optional(),
        rate_per_hour: optionalNumberFromInput,
    })
    .superRefine((data, ctx) => {
        if (!data.url || data.url.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["profile_link"],
                message: "Upwork link is required",
            });
        } else {
            const parsed = upworkUrlSchema.safeParse(data.url);
            if (!parsed.success) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["url"],
                    message: parsed.error.issues[0]?.message ?? "Invalid Upwork link.",
                });
            }
        }
    });

export type UpworkProfileFormInput = z.input<typeof upworkProfileSchema>;
export type UpworkProfileFormValues = z.output<typeof upworkProfileSchema>;

/**
 * Partial update schema used by PATCH /api/profiles/[id].
 * Every field is optional so callers can send status-only patches
 * (e.g. `{ is_active: false }`) without providing the full profile.
 */
export const upworkProfileUpdateSchema = z
    .object({
        name: z.string().trim().min(1, "Name is required.").max(200, "Profile Name must be 200 characters or less.").optional(),
        url: z.string().trim().min(1, "Proofile Url is required").optional(),
        title: z.string().trim().optional(),
        skill_tags: z.array(z.string().trim().min(1)).max(15, "Maximum 15 skills allowed").optional(),
        bio: z.string().optional(),
        rate_per_hour: optionalNumberFromInput.optional(),
        is_active: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.url === undefined) return;
        const parsed = upworkUrlSchema.safeParse(data.url);
        if (!parsed.success) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["url"],
                message: parsed.error.issues[0]?.message ?? "Invalid Upwork link.",
            });
        }
    });

export type UpworkProfileUpdateInput = z.input<typeof upworkProfileUpdateSchema>;
export type UpworkProfileUpdateValues = z.output<typeof upworkProfileUpdateSchema>;
