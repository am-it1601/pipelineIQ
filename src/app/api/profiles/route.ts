import { UpworkProfileFormValues, upworkProfileSchema } from "@/forms/profile.schema";
import { createProfileRecord, getProfiles } from "@/lib/services/profiles.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") ?? undefined;

        const supabase = createAdminClient();
        const active = status === "active" ? true : status === "inactive" ? false : undefined;

        const profiles = await getProfiles(supabase, { active });
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
