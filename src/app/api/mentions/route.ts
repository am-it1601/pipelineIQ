import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: users, error } = await supabase
      .from("users")
      .select("id, full_name, avatar_initials")
      .order("full_name", { ascending: true })
      .limit(100);

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch mentionable users";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
