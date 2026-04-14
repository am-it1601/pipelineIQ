import { z } from "zod";

// Zod validation schema for invitation form
export const inviteSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  groupSlug: z.string().min(1, "Please select a group"),
});

export type InviteFormData = z.infer<typeof inviteSchema>;
