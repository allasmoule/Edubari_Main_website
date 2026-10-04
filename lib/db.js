import mysql from "mysql2/promise";

const primaryHost = process.env.DB_HOST || "127.0.0.1";
const port = Number(process.env.DB_PORT) || 3306;
const primaryUser = process.env.DB_USER || "root";
const primaryPassword = process.env.DB_PASSWORD || "";
const primaryDb = process.env.DB_NAME || "edubari_website";

function createPool(host, user = primaryUser, password = primaryPassword, database = primaryDb) {
  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 2000,
    queueLimit: 0,
  });
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
 * Execute a SQL query and return rows.
 */
export async function query(sql, params = []) {
  try {
    const [rows] = await activePool.query(sql, params);
    return rows;
  } catch (error) {
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR") {
      const fallbackRes = await tryFallback(sql, params, false);
      if (fallbackRes !== null) return fallbackRes;
    }
    console.error("MySQL Query Error:", error.message, "SQL:", sql);
    if (error.code === "ECONNREFUSED") {
      const dbErr = new Error("Database connection refused (ECONNREFUSED). Please make sure your MySQL database server (XAMPP/Laragon) is running on port 3306.");
      dbErr.code = "ECONNREFUSED";
      throw dbErr;
    }
    throw error;
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
 * Execute an INSERT, UPDATE, or DELETE query and return result headers.
 */
export async function execute(sql, params = []) {
  try {
    const [result] = await activePool.execute(sql, params);
    return result;
  } catch (error) {
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR") {
      const fallbackRes = await tryFallback(sql, params, true);
      if (fallbackRes !== null) return fallbackRes;
    }
    console.error("MySQL Execute Error:", error.message, "SQL:", sql);
    if (error.code === "ECONNREFUSED") {
      const dbErr = new Error("Database connection refused (ECONNREFUSED). Please make sure your MySQL database server (XAMPP/Laragon) is running on port 3306.");
      dbErr.code = "ECONNREFUSED";
      throw dbErr;
    }
    throw error;
  }
}

export default activePool;
