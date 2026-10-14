import { NextResponse } from "next/server";

/**
 * /api/seed — retired.
 *
 * It had no authentication: one GET reset the admin password to a value published in this
 * repository and returned it in the response, so anyone could take over the admin panel.
 * Seeding is now a command-line step on the server:  npm run db:seed
 */
function retired() {
  return NextResponse.json({ error: "This endpoint has been removed. Run `npm run db:seed` on the server." }, { status: 410 });
}

export const GET = retired;
export const POST = retired;
