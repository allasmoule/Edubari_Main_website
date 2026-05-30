const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

if (fs.existsSync("./.env.local")) {
  const content = fs.readFileSync("./.env.local", "utf8");
  content.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      process.env[parts[0].trim()] = parts.slice(1).join("=").trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  try {
    // Try to query institution_name from subscriptions
    const { data: selectInst, error: errInst } = await supabase.from("subscriptions").select("institution_name").limit(1);
    console.log("Select institution_name:", selectInst, errInst);

    // Let's query information_schema or all tables if possible
    const { data: tables, error: errTables } = await supabase.rpc("get_tables");
    console.log("RPC tables:", tables, errTables);
  } catch (err) {
    console.error("Error checking schema:", err);
  }
}

checkSchema();
