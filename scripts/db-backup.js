#!/usr/bin/env node
/**
 * Back up the PostgreSQL database with pg_dump (custom format, compressed).
 *
 *   npm run db:backup                    → backups/edubari-2026-10-15T08-30-00.dump
 *   npm run db:backup -- --out file.dump
 *
 * Restore into an empty database:  pg_restore --clean --if-exists --no-owner -d <database> file.dump
 * Take one before every deploy that adds a migration. Needs pg_dump on the PATH (inside Docker:
 * `docker exec edubari_postgres pg_dump -U <user> -Fc <db> > backup.dump` works too).
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { loadEnv } = require("./lib/env");

loadEnv();

const outArg = process.argv.indexOf("--out");
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const out = outArg > -1 ? process.argv[outArg + 1] : path.join("backups", `edubari-${stamp}.dump`);
fs.mkdirSync(path.dirname(out), { recursive: true });

// pg_dump reads DATABASE_URL as its database argument, or the PG* variables from the environment
const args = ["--format=custom", "--no-owner", "--file", out];
if (process.env.DATABASE_URL) args.push("--dbname", process.env.DATABASE_URL);

const result = spawnSync("pg_dump", args, { stdio: "inherit", env: process.env });
if (result.error) {
  console.error(`Could not run pg_dump (${result.error.message}). Install the PostgreSQL client tools or use docker exec.`);
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status);
console.log(`Backup written to ${out}`);
