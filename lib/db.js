import pg from "pg";

/**
 * PostgreSQL access for the whole app.
 *
 * Connection: DATABASE_URL, or the standard PGHOST / PGPORT / PGUSER / PGPASSWORD / PGDATABASE
 * (and PGSSLMODE) variables. Schema changes live in migrations/ and run with `npm run db:migrate`.
 *
 * Queries use `?` placeholders (converted to $1, $2 ... here) and always pass values as
 * parameters. Errors are thrown, never swallowed: a database problem must surface as a 500, not
 * as "no rows" (which would show a paying school as unregistered or lose an order silently).
 *
 *   const rows = await query("SELECT * FROM plans WHERE id = ?", [id]);
 *   const row  = await queryOne(...);            // first row or null
 *   const { rowCount } = await execute(...);     // INSERT / UPDATE / DELETE
 *   await withTransaction(async (tx) => { await tx.execute(...); ... });
 */

const { Pool, types } = pg;

// COUNT(*) and other BIGINTs come back as numbers (values here stay far below 2^53).
// NUMERIC (prices) stays a string, exactly like DECIMAL did with mysql2.
types.setTypeParser(types.builtins.INT8, (value) => (value === null ? null : Number(value)));

function createPool() {
  const pool = new Pool({
    ...(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {}),
    max: Number(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS) || 15_000,
    application_name: "edubari-website",
  });
  // An idle connection dropped by the server must not crash the process; the pool replaces it.
  pool.on("error", (error) => console.error("[db] idle client error:", error.message));
  return pool;
}

// One pool per process (Next.js dev hot-reload would otherwise open a new pool on every edit)
const globalForDb = globalThis;
export const pool = globalForDb.__edubariPgPool || (globalForDb.__edubariPgPool = createPool());

const converted = new Map();

/**
 * Turn `?` placeholders into $1, $2 ... Skips quoted strings, quoted identifiers and comments,
 * so a literal '?' inside SQL text is left alone.
 */
export function toPositional(sql) {
  const cached = converted.get(sql);
  if (cached) return cached;

  let out = "";
  let n = 0;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'" || ch === '"') {
      const end = sql.indexOf(ch, i + 1);
      const stop = end === -1 ? sql.length : end + 1;
      out += sql.slice(i, stop);
      i = stop - 1;
    } else if (ch === "-" && sql[i + 1] === "-") {
      const end = sql.indexOf("\n", i);
      const stop = end === -1 ? sql.length : end;
      out += sql.slice(i, stop);
      i = stop - 1;
    } else if (ch === "/" && sql[i + 1] === "*") {
      const end = sql.indexOf("*/", i + 2);
      const stop = end === -1 ? sql.length : end + 2;
      out += sql.slice(i, stop);
      i = stop - 1;
    } else if (ch === "?") {
      out += `$${++n}`;
    } else {
      out += ch;
    }
  }

  if (converted.size > 1000) converted.clear();
  converted.set(sql, out);
  return out;
}

function runner(target) {
  const run = (sql, params = []) => target.query(toPositional(sql), params);
  return {
    async query(sql, params) {
      return (await run(sql, params)).rows;
    },
    async queryOne(sql, params) {
      return (await run(sql, params)).rows[0] || null;
    },
    async execute(sql, params) {
      const result = await run(sql, params);
      return { rowCount: result.rowCount, affectedRows: result.rowCount, rows: result.rows };
    },
  };
}

const poolRunner = runner(pool);

/** All matching rows. */
export const query = poolRunner.query;
/** The first matching row, or null. */
export const queryOne = poolRunner.queryOne;
/** INSERT / UPDATE / DELETE: { rowCount, rows } (rows only with RETURNING). */
export const execute = poolRunner.execute;

/**
 * Run `fn(tx)` inside one transaction on one connection. tx has query / queryOne / execute.
 * Commits when fn resolves, rolls back (and rethrows) when it throws.
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(runner(client));
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/** Unique constraint hit (duplicate email, domain, transaction id ...). */
export function isUniqueViolation(error) {
  return error?.code === "23505";
}

/** Row still referenced by another table (e.g. deleting a plan that subscriptions use). */
export function isForeignKeyViolation(error) {
  // 23503 = foreign_key_violation, 23001 = restrict_violation (ON DELETE RESTRICT)
  return error?.code === "23503" || error?.code === "23001";
}

/** CHECK constraint failed (e.g. an unknown status value). */
export function isCheckViolation(error) {
  return error?.code === "23514";
}
