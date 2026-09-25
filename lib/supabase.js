import crypto from "crypto";

function generateUuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function parseRowJsonFields(row) {
  if (!row) return row;
  const newRow = { ...row };
  for (const key of Object.keys(newRow)) {
    const val = newRow[key];
    if (typeof val === "string") {
      const trimmed = val.trim();
      if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        try {
          newRow[key] = JSON.parse(val);
        } catch (_) {}
      }
    }
  }
  return newRow;
}

class MysqlQueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.action = "SELECT";
    this.selectCols = "*";
    this.whereConditions = [];
    this.whereParams = [];
    this.orderBy = "";
    this.limitVal = null;
    this.isSingle = false;
    this.dataToInsert = null;
    this.dataToUpdate = null;
  }

  select(cols = "*") {
    this.selectCols = cols;
    return this;
  }

  where(col, op, val) {
    this.whereConditions.push(`\`${col}\` ${op} ?`);
    this.whereParams.push(val);
    return this;
  }

  eq(col, val) {
    return this.where(col, "=", val);
  }

  order(col, { ascending = true } = {}) {
    this.orderBy = `ORDER BY \`${col}\` ${ascending ? "ASC" : "DESC"}`;
    return this;
  }

  limit(n) {
    this.limitVal = Number(n);
    return this;
  }

  single() {
    this.isSingle = true;
    this.limitVal = 1;
    return this;
  }

  insert(data) {
    this.action = "INSERT";
    this.dataToInsert = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data) {
    this.action = "UPDATE";
    this.dataToUpdate = data;
    return this;
  }

  upsert(data) {
    this.action = "UPSERT";
    this.dataToInsert = Array.isArray(data) ? data : [data];
    return this;
  }

  delete() {
    this.action = "DELETE";
    return this;
  }

  async then(resolve, reject) {
    try {
      const res = await this._execute();
      return resolve(res);
    } catch (err) {
      if (reject) return reject(err);
      return resolve({ data: null, error: err });
    }
  }

  async _execute() {
    // If in browser, fallback or fetch via API if needed
    if (typeof window !== "undefined") {
      console.warn(`[Client DB Call] Queries on '${this.tableName}' should be performed via /api routes.`);
      return { data: [], error: null };
    }

    // Require DB dynamically only on Node.js server
    const { query, execute } = require("./db");

    try {
      if (this.action === "SELECT") {
        let sql = `SELECT ${this.selectCols} FROM \`${this.tableName}\``;
        if (this.whereConditions.length > 0) {
          sql += ` WHERE ${this.whereConditions.join(" AND ")}`;
        }
        if (this.orderBy) {
          sql += ` ${this.orderBy}`;
        }
        if (this.limitVal !== null) {
          sql += ` LIMIT ${this.limitVal}`;
        }

        const rows = await query(sql, this.whereParams);
        let parsedRows = rows.map((r) => parseRowJsonFields(r));

        if (this.isSingle) {
          if (parsedRows.length === 0) {
            return { data: null, error: { message: "No row found", code: "PGRST116" } };
          }
          return { data: parsedRows[0], error: null };
        }
        return { data: parsedRows, error: null };
      }

      if (this.action === "INSERT" || this.action === "UPSERT") {
        const results = [];
        for (const item of this.dataToInsert) {
          const row = { ...item };
          if (!row.id) {
            row.id = generateUuid();
          }
          const keys = Object.keys(row);
          const cols = keys.map((k) => `\`${k}\``).join(", ");
          const placeholders = keys.map(() => "?").join(", ");
          const values = keys.map((k) => {
            const v = row[k];
            if (v !== null && typeof v === "object") {
              return JSON.stringify(v);
            }
            return v;
          });

          if (this.action === "UPSERT") {
            const updateClause = keys.map((k) => `\`${k}\` = VALUES(\`${k}\`)`).join(", ");
            const sql = `INSERT INTO \`${this.tableName}\` (${cols}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClause}`;
            await execute(sql, values);
          } else {
            const sql = `INSERT INTO \`${this.tableName}\` (${cols}) VALUES (${placeholders})`;
            await execute(sql, values);
          }
          results.push(parseRowJsonFields(row));
        }

        return { data: results, error: null };
      }

      if (this.action === "UPDATE") {
        const keys = Object.keys(this.dataToUpdate);
        const setClause = keys.map((k) => `\`${k}\` = ?`).join(", ");
        const setValues = keys.map((k) => {
          const v = this.dataToUpdate[k];
          if (v !== null && typeof v === "object") {
            return JSON.stringify(v);
          }
          return v;
        });

        let sql = `UPDATE \`${this.tableName}\` SET ${setClause}`;
        if (this.whereConditions.length > 0) {
          sql += ` WHERE ${this.whereConditions.join(" AND ")}`;
        }
        await execute(sql, [...setValues, ...this.whereParams]);

        let selectSql = `SELECT * FROM \`${this.tableName}\``;
        if (this.whereConditions.length > 0) {
          selectSql += ` WHERE ${this.whereConditions.join(" AND ")}`;
        }
        const updatedRows = await query(selectSql, this.whereParams);
        const parsedRows = updatedRows.map((r) => parseRowJsonFields(r));

        if (this.isSingle) {
          return { data: parsedRows[0] || null, error: null };
        }
        return { data: parsedRows, error: null };
      }

      if (this.action === "DELETE") {
        let sql = `DELETE FROM \`${this.tableName}\``;
        if (this.whereConditions.length > 0) {
          sql += ` WHERE ${this.whereConditions.join(" AND ")}`;
        }
        await execute(sql, this.whereParams);
        return { data: [], error: null };
      }
    } catch (err) {
      console.error(`[MySQL Shim Error] ${this.tableName} ${this.action}:`, err);
      return { data: null, error: err };
    }
  }
}

class MysqlClient {
  from(tableName) {
    return new MysqlQueryBuilder(tableName);
  }

  async rpc(funcName, params = {}) {
    if (typeof window !== "undefined") return { data: null, error: null };
    const { queryOne, execute } = require("./db");

    if (funcName === "add_domain_credits") {
      const { target_domain, credits_to_add, validity_days } = params;
      const existing = await queryOne("SELECT * FROM domain_ai_credits WHERE domain = ?", [target_domain]);
      if (existing) {
        await execute(
          `UPDATE domain_ai_credits 
           SET remaining_credits = remaining_credits + ?, 
               total_credits_purchased = total_credits_purchased + ?, 
               expires_at = DATE_ADD(NOW(), INTERVAL ? DAY) 
           WHERE domain = ?`,
          [credits_to_add, credits_to_add, validity_days || 30, target_domain]
        );
      } else {
        await execute(
          `INSERT INTO domain_ai_credits (id, domain, remaining_credits, total_credits_purchased, expires_at) 
           VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
          [generateUuid(), target_domain, credits_to_add, credits_to_add, validity_days || 30]
        );
      }
      return { data: null, error: null };
    }
    return { data: null, error: new Error(`RPC ${funcName} not supported`) };
  }

  auth = {
    signInWithPassword: async ({ email, password }) => {
      if (typeof window !== "undefined") {
        try {
          const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "login", email, password }),
          });
          const json = await res.json();
          if (json.error) {
            return { data: null, error: { message: json.error } };
          }
          if (json.data?.session) {
            localStorage.setItem("edubari_session", JSON.stringify(json.data.session));
          }
          return json;
        } catch (err) {
          return { data: null, error: err };
        }
      } else {
        const { queryOne } = require("./db");
        const crypto = require("crypto");
        const hashed = crypto.createHash("sha256").update(password).digest("hex");
        const user = await queryOne(
          "SELECT * FROM users WHERE email = ? AND (password = ? OR password = ?)",
          [email, hashed, password]
        );
        if (!user) {
          return { data: null, error: { message: "Invalid email or password" } };
        }
        const session = {
          access_token: `token_${user.id}_${Date.now()}`,
          user: { id: user.id, email: user.email, user_metadata: { name: user.name, role: user.role } },
        };
        return { data: { user: session.user, session }, error: null };
      }
    },

    getSession: async () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("edubari_session");
        if (stored) {
          try {
            return { data: { session: JSON.parse(stored) }, error: null };
          } catch (_) {}
        }
      }
      return { data: { session: null }, error: null };
    },

    getUser: async () => {
      const { data } = await this.auth.getSession();
      return { data: { user: data.session?.user || null }, error: null };
    },

    onAuthStateChange: (callback) => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("edubari_session");
        const session = stored ? JSON.parse(stored) : null;
        callback("SIGNED_IN", session);
      }
      return { data: { subscription: { unsubscribe: () => {} } } };
    },

    signOut: async () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("edubari_session");
      }
      return { error: null };
    },

    resetPasswordForEmail: async (email, options) => {
      console.log("Password reset requested for:", email);
      return { data: {}, error: null };
    },

    admin: {
      createUser: async ({ email, password, user_metadata = {} }) => {
        if (typeof window !== "undefined") {
          const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "create_user", email, password, name: user_metadata.name }),
          });
          return res.json();
        } else {
          const { execute } = require("./db");
          const crypto = require("crypto");
          const userId = generateUuid();
          const hashed = crypto.createHash("sha256").update(password).digest("hex");
          const name = user_metadata.name || email.split("@")[0];
          await execute(
            "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
            [userId, name, email, hashed, "admin"]
          );
          return { data: { user: { id: userId, email, user_metadata } }, error: null };
        }
      },
    },
  };
}

export const supabase = new MysqlClient();
export const supabaseAdmin = new MysqlClient();
export default supabase;
