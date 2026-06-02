import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("feature_videos")
      .select("*");

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Error fetching feature videos:", err);
    return NextResponse.json(
      { error: "Failed to fetch feature videos" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
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
