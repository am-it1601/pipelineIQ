import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        return NextResponse.json({});
    } catch (error) {
        console.error("Error fetching prospects:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
