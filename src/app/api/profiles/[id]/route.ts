import { upworkProfileUpdateSchema } from "@/forms/profile.schema";
import { deleteProfileRecord, getProfileById, updateProfileRecord } from "@/lib/services/profiles.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();
        const profile = await getProfileById(supabase, id);
        return NextResponse.json(profile);
    } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Partial validation: accepts full edits from the form as well as
        // status-only toggles (e.g. { is_active: false }).
        const validatedData = upworkProfileUpdateSchema.parse(body);

        const supabase = createAdminClient();
        const updated = await updateProfileRecord(supabase, id, validatedData);
        return NextResponse.json(updated);
    } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const zodError = error as any;
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: zodError.errors,
                },
                { status: 400 }
            );
        }

        const message = error instanceof Error ? error.message : "Update failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();
        await deleteProfileRecord(supabase, id);
        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Delete failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}