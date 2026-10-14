import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const data = await query("SELECT * FROM feature_videos ORDER BY feature_title ASC");
    return NextResponse.json(data);
  } catch (err) {
    console.warn("Error fetching feature videos:", err?.message);
    return NextResponse.json([]);
  }
}

export async function POST(req) {
  const auth = await requireAdmin(req);
  if (auth.response) return auth.response;

  try {
    const body = await req.json();
    const featureTitle = String(body.feature_title || "").trim().slice(0, 255);
    const videoUrl = body.video_url ? String(body.video_url).trim() : null;

    if (!featureTitle) {
      return NextResponse.json({ error: "feature_title is required" }, { status: 400 });
    }
    if (videoUrl && !/^https?:\/\//i.test(videoUrl)) {
      return NextResponse.json({ error: "video_url must be an http(s) link" }, { status: 400 });
    }

    const row = await queryOne(
      `INSERT INTO feature_videos (id, feature_title, video_url)
       VALUES (?, ?, ?)
       ON CONFLICT (feature_title) DO UPDATE SET video_url = EXCLUDED.video_url
       RETURNING *`,
      [crypto.randomUUID(), featureTitle, videoUrl]
    );
    return NextResponse.json(row);
  } catch (err) {
    console.error("Error saving feature video:", err.message);
    return NextResponse.json({ error: "Failed to save feature video" }, { status: 500 });
  }
}
