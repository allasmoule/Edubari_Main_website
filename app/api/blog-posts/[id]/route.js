import { NextResponse } from "next/server";
import { execute, isUniqueViolation } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { BLOG_POST_ALIASES, BLOG_POST_FIELDS, normalizeKeys, pickFields, slugify, updateRow } from "@/lib/crud";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const fields = pickFields(normalizeKeys(await request.json(), BLOG_POST_ALIASES), BLOG_POST_FIELDS);
    if (fields.title === null || fields.title === "" || fields.content === null || fields.content === "") {
      return NextResponse.json({ error: "Title and content cannot be empty" }, { status: 400 });
    }
    if (fields.slug !== undefined) {
      fields.slug = slugify(fields.slug);
      if (!fields.slug) delete fields.slug;
    }
    const updated = await updateRow("blog_posts", id, fields);
    if (!updated) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
    }
    console.error("Error updating blog post:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const { rowCount } = await execute("DELETE FROM blog_posts WHERE id = ?", [id]);
    if (!rowCount) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
