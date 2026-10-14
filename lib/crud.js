import { queryOne } from "./db";

/**
 * Small helpers for the admin content tables (banners, blog posts, team ...).
 *
 * Only keys listed in a route's field spec ever reach SQL — a request body can never choose
 * column names (the old banner/order inserts built column lists from Object.keys(body), which
 * allowed SQL injection and writing any column). Table and column names here always come from
 * code, and are checked against a strict pattern as a second line of defence.
 */

const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

function ident(name) {
  if (!IDENTIFIER.test(name)) throw new Error(`Invalid SQL identifier: ${name}`);
  return name;
}

export const asText = (max = 10000) => (value) => (value === null || value === undefined ? null : String(value).slice(0, max));
export const asBool = (value) => value === true || value === 1 || value === "1" || value === "true";
export const asInt = (fallback = 0) => (value) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

/** { column: value } for the spec keys present in body, each passed through its converter. */
export function pickFields(body, spec) {
  const out = {};
  for (const [key, convert] of Object.entries(spec)) {
    if (body && body[key] !== undefined) out[key] = convert(body[key]);
  }
  return out;
}

/** INSERT and return the new row. */
export async function insertRow(table, data) {
  const cols = Object.keys(data).map(ident);
  return queryOne(
    `INSERT INTO ${ident(table)} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")}) RETURNING *`,
    cols.map((c) => data[c])
  );
}

/** UPDATE by id and return the row (null when it does not exist). An empty update just reads it. */
export async function updateRow(table, id, data) {
  const cols = Object.keys(data).map(ident);
  if (!cols.length) return queryOne(`SELECT * FROM ${ident(table)} WHERE id = ?`, [id]);
  return queryOne(
    `UPDATE ${ident(table)} SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE id = ? RETURNING *`,
    [...cols.map((c) => data[c]), id]
  );
}

/* ---------------- field specs (what the admin forms may set) ---------------- */

export const BANNER_FIELDS = {
  title: asText(255),
  subtitle: asText(),
  image: asText(),
  alt: asText(255),
  order_index: asInt(1),
  active: asBool,
};

export const WORK_PROOF_FIELDS = {
  title: asText(255),
  description: asText(),
  image_url: asText(),
  client_name: asText(255),
  project_url: asText(),
  order_index: asInt(1),
  active: asBool,
};

export const WORK_PROOF_ALIASES = { imageUrl: "image_url", clientName: "client_name", projectUrl: "project_url", orderIndex: "order_index" };

export const BLOG_POST_FIELDS = {
  title: asText(255),
  slug: asText(255),
  category: asText(100),
  excerpt: asText(),
  content: asText(1_000_000),
  cover_image: asText(),
  author_name: asText(100),
  read_time: asText(50),
  active: asBool,
};

export const BLOG_POST_ALIASES = { coverImage: "cover_image", authorName: "author_name", readTime: "read_time" };

export const TEAM_MEMBER_FIELDS = {
  name: asText(255),
  description: asText(),
  image_url: asText(),
  order_index: asInt(1),
  active: asBool,
};

/** Accept the camelCase names some admin forms send, then keep only known columns. */
export function normalizeKeys(body, aliases) {
  const out = { ...(body || {}) };
  for (const [from, to] of Object.entries(aliases)) {
    if (out[to] === undefined && out[from] !== undefined) out[to] = out[from];
  }
  return out;
}

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
