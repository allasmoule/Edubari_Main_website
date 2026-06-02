import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
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
