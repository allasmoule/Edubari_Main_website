#!/usr/bin/env node
/**
 * One-time data move: the old MySQL database → the new PostgreSQL database.
 *
 *   npm run db:import-mysql                  dry run: reads MySQL, converts every row, reports, writes nothing
 *   npm run db:import-mysql -- --commit      copies the data (all tables in ONE transaction)
 *
 * Source (MySQL):  MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 *                  (falls back to the old DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME)
 *                  MYSQL_TIMEZONE — zone the old app wrote DATETIMEs in (default "Z" = UTC, which is
 *                  what the old Docker container used; use "+06:00" if it ran on Bangladesh time)
 * Target (PostgreSQL): DATABASE_URL, or PGHOST / PGPORT / PGUSER / PGPASSWORD / PGDATABASE
 *
 * Safety:
 *   - MySQL is only read, never changed. Keep it until the new site has run correctly for a while.
 *   - The PostgreSQL schema is migrated first; the target tables must be empty (refuses otherwise,
 *     so running it twice cannot duplicate or overwrite anything).
 *   - Every row is converted and checked before anything is written; with --commit everything is
 *     inserted in a single transaction, then row counts are compared table by table. Any error
 *     rolls the whole import back.
 *   - A MySQL column with no place in the new schema stops the import (nothing is silently lost),
 *     unless you pass --skip-unknown-columns after checking the report.
 *
 * Data fixes applied on the way (all listed in the report):
 *   - subscription_requests.transaction_id "N/A" / "" → NULL (the column is UNIQUE)
 *   - a school with several is_current subscriptions keeps only the newest as current
 *   - JSON stored as text (MariaDB) is parsed; invalid dates (0000-00-00) become NULL
 */
const mysql = require("mysql2/promise");
const { Client } = require("pg");
const { loadEnv, pgConfig } = require("./lib/env");
const { migrate } = require("./db-migrate");

// Parents before children (foreign keys). Throttle tables are short-lived state and are not copied.
const TABLES = [
  "users",
  "clients",
  "plans",
  "ai_packages",
  "subscriptions",
  "erp_connections",
  "subscription_payments",
  "subscription_requests",
  "work_proofs",
  "blog_posts",
  "contact_messages",
  "banners",
  "team_members",
  "feature_videos",
  "collected_leads",
  "ai_purchase_requests",
  "domain_ai_credits",
  "domain_ai_transactions",
];
const NOT_COPIED = ["admin_login_attempts", "erp_request_nonces"];
const BATCH = 200;

const flags = new Set(process.argv.slice(2));
const COMMIT = flags.has("--commit");
const SKIP_UNKNOWN = flags.has("--skip-unknown-columns");

function mysqlConfig() {
  const env = process.env;
  return {
    host: env.MYSQL_HOST || env.DB_HOST || "127.0.0.1",
    port: Number(env.MYSQL_PORT || env.DB_PORT) || 3306,
    user: env.MYSQL_USER || env.DB_USER || "root",
    password: env.MYSQL_PASSWORD ?? env.DB_PASSWORD ?? "",
    database: env.MYSQL_DATABASE || env.DB_NAME || "edubari",
    timezone: env.MYSQL_TIMEZONE || "Z",
    dateStrings: false,
    supportBigNumbers: true,
    bigNumberStrings: true,
    decimalNumbers: false,
    charset: "utf8mb4",
  };
}

/* ---------------- value conversion ---------------- */

function toBool(value) {
  if (value === null || value === undefined) return null;
  if (Buffer.isBuffer(value)) return value.length > 0 && value[0] !== 0;
  if (typeof value === "string") return !["0", "", "false", "f", "no"].includes(value.trim().toLowerCase());
  return Boolean(Number(value));
}

function toJson(value, where) {
  if (value === null || value === undefined) return null;
  if (Buffer.isBuffer(value)) value = value.toString("utf8");
  if (typeof value === "string") {
    if (value.trim() === "") return null;
    try {
      return JSON.stringify(JSON.parse(value));
    } catch {
      where.notes.push(`${where.table}.${where.column} row ${where.id}: not valid JSON, kept as a JSON string`);
      return JSON.stringify(value);
    }
  }
  return JSON.stringify(value);
}

function toTimestamp(value, where) {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1900) {
    where.notes.push(`${where.table}.${where.column} row ${where.id}: invalid date ${String(value)} → NULL`);
    return null;
  }
  return date;
}

function convert(value, pgType, where) {
  if (value === null || value === undefined) return null;
  switch (pgType) {
    case "boolean":
      return toBool(value);
    case "jsonb":
    case "json":
      return toJson(value, where);
    case "timestamp with time zone":
    case "timestamp without time zone":
    case "date":
      return toTimestamp(value, where);
    case "integer":
    case "bigint":
    case "smallint":
      return Buffer.isBuffer(value) ? Number(value.toString()) : Number(value);
    case "numeric":
      return String(value);
    default:
      return Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
  }
}

/* ---------------- table-specific clean-ups ---------------- */

function cleanRows(table, rows, report) {
  if (table === "subscription_requests") {
    const seen = new Set();
    for (const row of rows) {
      const trx = row.transaction_id === null || row.transaction_id === undefined ? "" : String(row.transaction_id).trim();
      if (!trx || trx.toUpperCase() === "N/A" || seen.has(trx)) {
        if (trx && seen.has(trx)) report.fixes.push(`subscription_requests ${row.id}: duplicate transaction_id ${trx} → NULL`);
        row.transaction_id = null;
      } else {
        seen.add(trx);
      }
    }
  }
  if (table === "subscriptions") {
    // Only one current subscription per school: keep the newest (by end date, then creation)
    const byClient = new Map();
    for (const row of rows.filter((r) => toBool(r.is_current))) {
      if (!byClient.has(row.client_id)) byClient.set(row.client_id, []);
      byClient.get(row.client_id).push(row);
    }
    for (const [clientId, list] of byClient) {
      if (list.length < 2) continue;
      list.sort((a, b) => new Date(b.end_date) - new Date(a.end_date) || new Date(b.created_at) - new Date(a.created_at));
      for (const extra of list.slice(1)) {
        extra.is_current = 0;
        report.fixes.push(`subscriptions: client ${clientId} had ${list.length} current subscriptions; ${extra.id} set to not current`);
      }
    }
  }
  return rows;
}

/* ---------------- main ---------------- */

async function pgColumns(pg, table) {
  const { rows } = await pg.query(
    `SELECT column_name, data_type, is_nullable FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = $1 ORDER BY ordinal_position`,
    [table]
  );
  return new Map(rows.map((r) => [r.column_name, r]));
}

async function main() {
  loadEnv();
  const report = { fixes: [], notes: [], skippedColumns: [], tables: [] };

  console.log(COMMIT ? "Mode: COMMIT (data will be written)" : "Mode: DRY RUN (nothing is written; add --commit to import)");

  const my = await mysql.createConnection(mysqlConfig());
  console.log(`MySQL source: ${my.config.user}@${my.config.host}:${my.config.port}/${my.config.database}`);

  if (COMMIT) await migrate({ log: (m) => console.log(`[schema] ${m}`) });

  const pg = new Client(pgConfig());
  await pg.connect();

  try {
    const [mysqlTableRows] = await my.query("SHOW TABLES");
    const mysqlTables = new Set(mysqlTableRows.map((r) => Object.values(r)[0]));
    const extraTables = [...mysqlTables].filter((t) => !TABLES.includes(t) && !NOT_COPIED.includes(t));
    if (extraTables.length) {
      report.notes.push(`MySQL tables with no place in the new schema (not copied): ${extraTables.join(", ")}`);
    }

    const prepared = [];
    for (const table of TABLES) {
      if (!mysqlTables.has(table)) {
        report.tables.push({ table, source: 0, note: "not in MySQL — skipped" });
        continue;
      }
      const target = await pgColumns(pg, table);
      if (!target.size) throw new Error(`PostgreSQL table ${table} does not exist. Run npm run db:migrate first.`);

      const [rows] = await my.query(`SELECT * FROM \`${table}\``);
      const [sourceCols] = await my.query(`SHOW COLUMNS FROM \`${table}\``);
      const unknown = sourceCols.map((c) => c.Field).filter((c) => !target.has(c));
      if (unknown.length) {
        const nonEmpty = unknown.filter((c) => rows.some((r) => r[c] !== null && r[c] !== ""));
        report.skippedColumns.push(`${table}: ${unknown.join(", ")}${nonEmpty.length ? ` (has data: ${nonEmpty.join(", ")})` : " (all empty)"}`);
        if (nonEmpty.length && !SKIP_UNKNOWN) {
          throw new Error(
            `MySQL ${table} has columns the new schema does not have, with data: ${nonEmpty.join(", ")}. ` +
              "Add them in a new migration, or re-run with --skip-unknown-columns to leave them out."
          );
        }
      }

      const cols = sourceCols.map((c) => c.Field).filter((c) => target.has(c));
      const missingRequired = [...target.values()].filter(
        (c) => !cols.includes(c.column_name) && c.is_nullable === "NO" && !["created_at", "updated_at", "submitted_at"].includes(c.column_name)
      );
      if (missingRequired.length && rows.length) {
        // e.g. blog_posts.category on an old table: the column default fills it
        report.notes.push(`${table}: not in MySQL, filled by the PostgreSQL default: ${missingRequired.map((c) => c.column_name).join(", ")}`);
      }

      cleanRows(table, rows, report);
      const values = rows.map((row) =>
        cols.map((col) => convert(row[col], target.get(col).data_type, { table, column: col, id: row.id ?? "?", notes: report.notes }))
      );
      prepared.push({ table, cols, values });
      report.tables.push({ table, source: rows.length });
    }

    if (COMMIT) {
      await pg.query("BEGIN");
      try {
        for (const { table } of prepared) {
          const { rows } = await pg.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
          if (rows[0].n > 0) {
            throw new Error(`PostgreSQL table ${table} already has ${rows[0].n} rows. The import only runs into empty tables.`);
          }
        }
        for (const { table, cols, values } of prepared) {
          for (let i = 0; i < values.length; i += BATCH) {
            const chunk = values.slice(i, i + BATCH);
            const params = [];
            const tuples = chunk.map((row) => `(${row.map((v) => `$${params.push(v)}`).join(", ")})`);
            await pg.query(`INSERT INTO ${table} (${cols.join(", ")}) VALUES ${tuples.join(", ")}`, params);
          }
        }
        // Verify inside the transaction: every table must hold exactly what MySQL had
        for (const entry of report.tables) {
          if (!prepared.find((p) => p.table === entry.table)) continue;
          const { rows } = await pg.query(`SELECT COUNT(*)::int AS n FROM ${entry.table}`);
          entry.target = rows[0].n;
          if (entry.target !== entry.source) {
            throw new Error(`Row count mismatch in ${entry.table}: MySQL ${entry.source}, PostgreSQL ${entry.target}`);
          }
        }
        await pg.query("COMMIT");
      } catch (error) {
        await pg.query("ROLLBACK").catch(() => {});
        throw error;
      }
    }

    console.log("\nTable                     MySQL rows   PostgreSQL rows");
    for (const t of report.tables) {
      const target = t.target === undefined ? (COMMIT ? "-" : "(dry run)") : t.target;
      console.log(`${t.table.padEnd(26)}${String(t.source).padStart(10)}   ${String(target).padStart(15)}${t.note ? `   ${t.note}` : ""}`);
    }
    for (const [title, list] of [
      ["Data fixes", report.fixes],
      ["Columns not copied", report.skippedColumns],
      ["Notes", report.notes],
    ]) {
      if (!list.length) continue;
      console.log(`\n${title}:`);
      for (const line of list) console.log(`  - ${line}`);
    }
    console.log(COMMIT ? "\nImport committed. MySQL was not changed." : "\nDry run finished — nothing was written. Re-run with --commit to import.");
  } finally {
    await pg.end().catch(() => {});
    await my.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error(`\nImport stopped, nothing was written: ${error.message}`);
  process.exit(1);
});
