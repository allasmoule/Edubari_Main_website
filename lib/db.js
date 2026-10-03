import mysql from "mysql2/promise";

const primaryHost = process.env.DB_HOST || "localhost";
const port = Number(process.env.DB_PORT) || 3306;
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD || "";
const database = process.env.DB_NAME || "edubari";

function createPoolForHost(host) {
  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

let activePool = createPoolForHost(primaryHost);
let fallbackPool = null;

function getActivePool() {
  return activePool;
}

/**
 * Execute a SQL query and return rows.
 */
export async function query(sql, params = []) {
  try {
    const [rows] = await activePool.query(sql, params);
    return rows;
  } catch (error) {
    if (
      (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") &&
      primaryHost !== "localhost" &&
      primaryHost !== "127.0.0.1"
    ) {
      if (!fallbackPool) {
        console.warn(`[MySQL] Host '${primaryHost}' failed (${error.code}). Falling back to 'localhost'...`);
        fallbackPool = createPoolForHost("localhost");
      }
      activePool = fallbackPool;
      const [rows] = await activePool.query(sql, params);
      return rows;
    }
    console.error("MySQL Query Error:", error.message, "SQL:", sql);
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
    if (
      (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") &&
      primaryHost !== "localhost" &&
      primaryHost !== "127.0.0.1"
    ) {
      if (!fallbackPool) {
        console.warn(`[MySQL] Host '${primaryHost}' failed (${error.code}). Falling back to 'localhost'...`);
        fallbackPool = createPoolForHost("localhost");
      }
      activePool = fallbackPool;
      const [result] = await activePool.execute(sql, params);
      return result;
    }
    console.error("MySQL Execute Error:", error.message, "SQL:", sql);
    throw error;
  }
}

export default activePool;
