import { UserRole } from "@/lib/types";
import { z } from "zod";

// Zod validation schema
export const inviteSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  role: z.enum(["bd", "admin"], {
    message: "Please select a valid role",
  }) as z.ZodType<UserRole>,
});

export type InviteFormData = z.infer<typeof inviteSchema>;
