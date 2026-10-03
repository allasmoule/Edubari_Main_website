import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

import { SAMPLE_BLOG_POSTS } from "@/lib/blogData";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return NextResponse.json(data);
    }
    return NextResponse.json(SAMPLE_BLOG_POSTS);
  } catch (error) {
    console.warn("Falling back to sample blog posts due to error:", error?.message);
    return NextResponse.json(SAMPLE_BLOG_POSTS);
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const mappedPost = {
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      content: body.content,
      excerpt: body.excerpt || null,
      cover_image: body.cover_image || body.coverImage || null,
      author_name: body.author_name || body.authorName || "Admin",
      active: typeof body.active === "boolean" ? body.active : true
    };

    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .insert([mappedPost])
      .select();

    if (error) throw error;
    return NextResponse.json({ message: "Blog post created", blogPostId: data[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
