const mysql = require("mysql2/promise");
const fs = require("fs");

if (fs.existsSync("./.env")) {
  const content = fs.readFileSync("./.env", "utf8");
  content.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      process.env[parts[0].trim()] = parts.slice(1).join("=").trim();
    }
  });
}

async function checkSchema() {
  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "edubari";

  console.log(`Testing MySQL connection to ${user}@${host}:${port}/${database}...`);

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
    });

    console.log("✅ Successfully connected to MySQL Database!");
    const [tables] = await connection.query("SHOW TABLES");
    console.log("Found tables count:", tables.length);
    console.log("Tables list:", tables.map((t) => Object.values(t)[0]));
    await connection.end();
  } catch (err) {
    console.error("❌ Could not connect to MySQL Server:");
    console.error(`   Error Message: ${err.message}`);
    console.error("👉 NOTE: Please start your MySQL Server (XAMPP / Laragon / MySQL Service) on port " + port + " and import schema.sql.");
  }
}

checkSchema();
