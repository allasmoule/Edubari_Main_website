import { NextResponse } from "next/server";

/**
 * /api/admin-setup — retired.
 *
 * Resetting the admin password over HTTP with a shared key (sent in the URL, so it ended up in
 * proxy and access logs) is replaced by command-line tools that only someone on the server can run:
 *   npm run admin:reset -- --email you@example.com     create / reset an admin (asks for nothing on the web)
 *   npm run admin:unlock                                 clear the login rate limit
 *   npm run db:status                                    database connection + migration status
 */
function retired() {
  return NextResponse.json({ error: "This endpoint has been removed. Use `npm run admin:reset` on the server." }, { status: 410 });
}

export const GET = retired;
export const POST = retired;
