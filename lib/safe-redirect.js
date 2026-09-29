/**
 * Only redirect a customer back to a site we trust: the institution's own domain (or a
 * subdomain of it), this website, or a host listed in ALLOWED_REDIRECT_HOSTS
 * (comma separated, e.g. "edubari.bd" also allows "lms.edubari.bd").
 * Anything else — another site, javascript: URLs, malformed input — returns null.
 */
function hostMatches(host, allowed) {
  const h = String(host || "").toLowerCase();
  const a = String(allowed || "").toLowerCase().replace(/^\*\./, "").trim();
  return Boolean(a) && (h === a || h.endsWith(`.${a}`));
}

export function cleanDomain(value) {
  let d = String(value || "").trim().toLowerCase();
  if (d.includes("://")) d = d.split("://")[1];
  return d.split("/")[0].split(":")[0];
}

export function safeRedirectUrl(url, { domain } = {}) {
  let parsed;
  try {
    parsed = new URL(String(url || ""));
  } catch {
    return null;
  }
  // http only outside production, or to the viewer's own machine (a local ERP install / test)
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(parsed.hostname) || parsed.hostname.endsWith(".localhost");
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && (process.env.NODE_ENV !== "production" || local))) {
    return null;
  }
  const allowed = [
    domain ? cleanDomain(domain) : null,
    process.env.NEXT_PUBLIC_SITE_URL ? cleanDomain(process.env.NEXT_PUBLIC_SITE_URL) : null,
    ...(process.env.ALLOWED_REDIRECT_HOSTS || "").split(","),
  ].filter(Boolean);
  return allowed.some((a) => hostMatches(parsed.hostname, a)) ? parsed.toString() : null;
}

/** Add query parameters to an already-validated URL */
export function withParams(url, params) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  }
  return u.toString();
}
