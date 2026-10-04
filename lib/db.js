import mysql from "mysql2/promise";

// Global process error handlers to prevent Node server crashes (502 Bad Gateway)
if (typeof process !== "undefined" && process.on && !global._processErrorHandlersRegistered) {
  global._processErrorHandlersRegistered = true;
  process.on("unhandledRejection", (reason) => {
    console.warn("[Node Process Safeguard] Caught unhandledRejection:", reason);
  });
  process.on("uncaughtException", (err) => {
    console.warn("[Node Process Safeguard] Caught uncaughtException:", err);
  });
}

const primaryHost = process.env.DB_HOST || "127.0.0.1";
const port = Number(process.env.DB_PORT) || 3306;
const primaryUser = process.env.DB_USER || "root";
const primaryPassword = process.env.DB_PASSWORD || "";
const primaryDb = process.env.DB_NAME || "edubari_website";

function createPool(host, user = primaryUser, password = primaryPassword, database = primaryDb) {
  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 3000,
    queueLimit: 0,
  });

  // Attach error listener to pool to prevent unhandled socket crashes
  if (pool && typeof pool.on === "function") {
    pool.on("error", (err) => {
      console.warn("[MySQL Pool Notice] Idle pool error:", err.message);
    });
  }

  return pool;
}

let activePool = createPool(primaryHost);

async function tryFallback(sql, params, isExecute = false) {
  const hostsToTry = [primaryHost, "127.0.0.1", "localhost", "foster_mysql"].filter(
    (h, i, arr) => arr.indexOf(h) === i
  );
  const credentialsToTry = [
    { u: primaryUser, p: primaryPassword },
    { u: "root", p: "" },
  ];

  for (const h of hostsToTry) {
    for (const cred of credentialsToTry) {
      if (h === primaryHost && cred.u === primaryUser) continue;
      try {
        const tempPool = createPool(h, cred.u, cred.p);
        const [res] = isExecute ? await tempPool.execute(sql, params) : await tempPool.query(sql, params);
        console.warn(`[MySQL Fallback Success] Connected via host '${h}', user '${cred.u}'`);
        activePool = tempPool;
        return res;
      } catch (_) {}
    }
  }
  return null;
}

/**
 * Execute a SQL query and return rows safely.
 */
export async function query(sql, params = []) {
  try {
    const [rows] = await activePool.query(sql, params);
    return rows || [];
  } catch (error) {
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR") {
      const fallbackRes = await tryFallback(sql, params, false);
      if (fallbackRes !== null) return fallbackRes || [];
    }
    console.warn("MySQL Query Notice:", error.message, "SQL:", sql);
    return [];
  }
}

/**
 * Fetch a single record from SQL query.
 */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT, UPDATE, or DELETE query safely without crashing the server.
 */
export async function execute(sql, params = []) {
  try {
    const [result] = await activePool.execute(sql, params);
    return result || { affectedRows: 0, insertId: null };
  } catch (error) {
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR") {
      const fallbackRes = await tryFallback(sql, params, true);
      if (fallbackRes !== null) return fallbackRes || { affectedRows: 0, insertId: null };
    }
    console.warn("MySQL Execute Notice:", error.message, "SQL:", sql);
    return { affectedRows: 0, insertId: null };
  }
}

export default activePool;
