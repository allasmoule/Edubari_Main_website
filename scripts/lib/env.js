const fs = require("fs");
const path = require("path");

/**
 * Load ./.env for command-line scripts (Next.js does this itself for the app).
 * Variables already set in the environment win, so Docker / CI values are never overridden.
 */
function loadEnv(file = path.join(process.cwd(), ".env")) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

/** pg connection settings: DATABASE_URL, otherwise the standard PGHOST / PGUSER / ... variables. */
function pgConfig(extra = {}) {
  return process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL, ...extra } : { ...extra };
}

module.exports = { loadEnv, pgConfig };
