import { UpworkProfileFormValues, upworkProfileSchema } from "@/components/profiles/profile.schema";
import { createProfileRecord, getProfiles } from "@/lib/services/profiles.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const profiles = await getProfiles(supabase);
    return NextResponse.json(profiles);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: UpworkProfileFormValues = await req.json();

    // Validate request body using Zod schema
    const { skill_tags, ...validatedData } = upworkProfileSchema.parse(body);

    const supabase = createAdminClient();
    const profile = await createProfileRecord(supabase, {
      ...validatedData,
      skill_tags: skill_tags.join(","), // Convert array to comma-separated string
      status: "active",
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as any;
      return NextResponse.json(
        {
          error: "Validation failed",
          details: zodError.errors,
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Insert failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
