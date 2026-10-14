#!/usr/bin/env node
/**
 * Admin account tools — run on the server (replaces the old /api/admin-setup web endpoint).
 *
 *   npm run admin:reset -- --email you@example.com
 *       Create the admin, or set a new password for an existing one. The password is read from
 *       ADMIN_NEW_PASSWORD, or typed at the prompt (hidden). It never appears in a URL or log.
 *   npm run admin:unlock
 *       Clear the failed-login rate limit for every IP.
 */
const crypto = require("crypto");
const readline = require("readline");
const { Client } = require("pg");
const { loadEnv, pgConfig } = require("./lib/env");

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => {
      if (text.includes(question)) rl.output.write(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function reset(db) {
  const email = String(arg("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Pass a valid --email");
  const password = process.env.ADMIN_NEW_PASSWORD || (await askHidden(`New password for ${email}: `));
  if (String(password).length < 12) throw new Error("Password must be at least 12 characters");

  const existing = await db.query("SELECT id FROM users WHERE LOWER(email) = $1", [email]);
  if (existing.rowCount) {
    await db.query("UPDATE users SET password = $1, role = 'admin' WHERE id = $2", [hashPassword(password), existing.rows[0].id]);
    console.log(`Password updated for ${email}`);
  } else {
    await db.query("INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, 'admin')", [
      crypto.randomUUID(),
      email.split("@")[0],
      email,
      hashPassword(password),
    ]);
    console.log(`Admin created: ${email}`);
  }
}

async function unlock(db) {
  const { rowCount } = await db.query("DELETE FROM admin_login_attempts");
  console.log(`Cleared ${rowCount} login rate-limit record(s).`);
}

async function main() {
  loadEnv();
  const command = process.argv[2];
  const action = { reset, unlock }[command];
  if (!action) throw new Error("Usage: node scripts/admin.js reset --email you@example.com | unlock");
  const db = new Client(pgConfig());
  await db.connect();
  try {
    await action(db);
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
