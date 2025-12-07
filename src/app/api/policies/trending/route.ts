import { NextResponse } from "next/server";
import { supabase } from "@/shared/lib/supabaseClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  try {
    // Supabase RPC 호출 (트렌딩 정책 조회)
    const { data, error } = await supabase.rpc("get_trending_policies", {
      limit_count: limit,
    });

    if (error) {
      console.error("Error fetching trending policies:", error);
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
