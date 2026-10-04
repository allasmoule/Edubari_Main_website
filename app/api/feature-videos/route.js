import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const timeoutPromise = new Promise((resolve) =>
    setTimeout(() => resolve({ data: [] }), 1500)
  );

  try {
    const fetchPromise = supabase.from("feature_videos").select("*");
    const res = await Promise.race([fetchPromise, timeoutPromise]);
    const data = res?.data || [];

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=600, s-maxage=3600" },
    });
  } catch (err) {
    console.error("Error fetching feature videos:", err);
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, max-age=600, s-maxage=3600" },
    });
  }
}

export async function POST(req) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  try {
    const body = await req.json();
    const { feature_title, video_url } = body;

    if (!feature_title) {
      return NextResponse.json(
        { error: "feature_title is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("feature_videos")
      .upsert(
        { feature_title, video_url, updated_at: new Date().toISOString() },
        { onConflict: "feature_title" }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error saving feature video:", err);
    return NextResponse.json(
      { error: "Failed to save feature video" },
      { status: 500 }
    );
  }
}
