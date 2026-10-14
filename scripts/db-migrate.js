#!/usr/bin/env node
/**
 * Versioned PostgreSQL schema migrations.
 *
 *   npm run db:migrate          apply every pending migrations/NNNN_name.sql, in order
 *   npm run db:status           list applied / pending migrations, change nothing
 *
 * How it stays safe:
 *   - each file runs in its own transaction together with its schema_migrations row, so a failing
 *     migration leaves the database exactly as it was (PostgreSQL DDL is transactional)
 *   - a PostgreSQL advisory lock stops two servers (e.g. two containers starting) migrating at once
 *   - the SHA-256 of every applied file is stored; if an applied file is edited later the runner
 *     refuses to continue, because production and the repository would no longer match
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { loadEnv, pgConfig } = require("./lib/env");

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");
const LOCK_ID = 7426011; // arbitrary constant shared by every instance of this app

function readMigrations() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d{4}_[a-z0-9_]+\.sql$/.test(f))
    .sort()
    .map((file) => {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      return { version: file.slice(0, 4), name: file, sql, checksum: crypto.createHash("sha256").update(sql).digest("hex") };
    });
}

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version     VARCHAR(4)   PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      checksum    CHAR(64)     NOT NULL,
      applied_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )`);
}

/** Returns { applied: [...], pending: [...] }; throws when an applied file was changed or removed. */
async function plan(client) {
  const files = readMigrations();
  const { rows } = await client.query("SELECT version, name, checksum, applied_at FROM schema_migrations ORDER BY version");
  const applied = new Map(rows.map((r) => [r.version, r]));
  for (const row of rows) {
    const file = files.find((f) => f.version === row.version);
    if (!file) throw new Error(`Migration ${row.name} is applied in the database but missing from migrations/`);
    if (file.checksum !== row.checksum.trim()) {
      throw new Error(`Migration ${row.name} was edited after it was applied. Revert the edit and add a new migration instead.`);
    }
  }
  return { applied: rows, pending: files.filter((f) => !applied.has(f.version)) };
}

async function migrate({ log = console.log } = {}) {
  const client = new Client(pgConfig());
  await client.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
    await ensureTable(client);
    const { pending } = await plan(client);
    if (!pending.length) {
      log("Database schema is up to date.");
      return 0;
    }
    for (const m of pending) {
      log(`Applying ${m.name} ...`);
      try {
        await client.query("BEGIN");
        await client.query(m.sql);
        await client.query("INSERT INTO schema_migrations (version, name, checksum) VALUES ($1, $2, $3)", [m.version, m.name, m.checksum]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw new Error(`${m.name} failed and was rolled back: ${error.message}`);
      }
    }
    log(`Applied ${pending.length} migration(s).`);
    return pending.length;
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => {});
    await client.end();
  }
}

async function status() {
  const client = new Client(pgConfig());
  await client.connect();
  try {
    await ensureTable(client);
    const { applied, pending } = await plan(client);
    for (const r of applied) console.log(`  applied  ${r.name}  (${new Date(r.applied_at).toISOString()})`);
    for (const m of pending) console.log(`  pending  ${m.name}`);
    if (!applied.length && !pending.length) console.log("  no migrations found");
  } finally {
    await client.end();
  }
}

module.exports = { migrate };

if (require.main === module) {
  loadEnv();
  const run = process.argv.includes("--status") ? status : migrate;
  run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(`Migration error: ${error.message}`);
      process.exit(1);
    });
}
