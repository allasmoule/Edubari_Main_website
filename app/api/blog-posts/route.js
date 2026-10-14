import { NextResponse } from "next/server";
import { query, isUniqueViolation } from "@/lib/db";
import { getAdmin, requireAdmin } from "@/lib/auth";
import { SAMPLE_BLOG_POSTS } from "@/lib/blogData";
import { BLOG_POST_ALIASES, BLOG_POST_FIELDS, insertRow, normalizeKeys, pickFields, slugify } from "@/lib/crud";

/**
 * Public: active posts (the sample posts when there are none yet).
 * A signed-in admin gets every post from the database, hidden ones included.
 */
export async function GET(request) {
  const admin = await getAdmin(request).catch(() => null);
  try {
    const data = await query(`SELECT * FROM blog_posts ${admin ? "" : "WHERE active"} ORDER BY created_at DESC`);
    if (admin || data.length > 0) return NextResponse.json(data);
    return NextResponse.json(SAMPLE_BLOG_POSTS);
  } catch (error) {
    console.warn("Falling back to sample blog posts due to error:", error?.message);
    if (admin) return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    return NextResponse.json(SAMPLE_BLOG_POSTS);
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const fields = pickFields(normalizeKeys(await request.json(), BLOG_POST_ALIASES), BLOG_POST_FIELDS);
    if (!fields.title || !fields.content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }
    fields.slug = slugify(fields.slug || fields.title) || crypto.randomUUID();
    const created = await insertRow("blog_posts", { id: crypto.randomUUID(), ...fields });
    return NextResponse.json({ ...created, message: "Blog post created", blogPostId: created.id }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
    }
    console.error("Error creating blog post:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
