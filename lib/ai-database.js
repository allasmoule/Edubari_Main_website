import { query, queryOne, execute, withTransaction } from "./db";
import { getCachedAiPackages, setCachedAiPackages, invalidateAiPackagesCache } from "./plansCache";

function generateUuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Gets all AI subscription packages.
 */
export async function getAiPackages() {
  const cached = getCachedAiPackages();
  if (cached) return cached;

  try {
    const rows = await query(
      "SELECT * FROM ai_packages ORDER BY price ASC"
    );
    if (!rows || rows.length === 0) {
      const defs = getDefaultPackages();
      setCachedAiPackages(defs);
      return defs;
    }
    const result = rows.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      credits: pkg.credits,
      price: Number(pkg.price),
      validityDays: pkg.validity_days || 30,
      currency: pkg.currency || "BDT",
      isActive: Boolean(pkg.is_active),
      highlight: Boolean(pkg.highlight),
    }));
    setCachedAiPackages(result);
    return result;
  } catch (error) {
    console.error("[AI-DB] Error fetching packages:", error.message);
    const defs = getDefaultPackages();
    setCachedAiPackages(defs);
    return defs;
  }
}

/**
 * Saves or updates an AI subscription package.
 */
export async function saveAiPackage(pkg) {
  const pkgId = pkg.id && !pkg.id.startsWith("pkg_") ? pkg.id : generateUuid();
  const name = pkg.name;
  const credits = Number(pkg.credits);
  const price = Number(pkg.price);
  const validityDays = Number(pkg.validityDays) || 30;
  const currency = pkg.currency || "BDT";
  const isActive = pkg.isActive !== false;
  const highlight = Boolean(pkg.highlight);

  const existing = await queryOne("SELECT id FROM ai_packages WHERE id = ?", [pkgId]);

  if (existing) {
    await execute(
      `UPDATE ai_packages 
       SET name = ?, credits = ?, price = ?, validity_days = ?, currency = ?, is_active = ?, highlight = ? 
       WHERE id = ?`,
      [name, credits, price, validityDays, currency, isActive, highlight, pkgId]
    );
  } else {
    await execute(
      `INSERT INTO ai_packages (id, name, credits, price, validity_days, currency, is_active, highlight) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [pkgId, name, credits, price, validityDays, currency, isActive, highlight]
    );
  }

  invalidateAiPackagesCache();
  return { id: pkgId, name, credits, price, validityDays, currency, isActive, highlight };
}

/**
 * Gets all AI purchase requests.
 */
export async function getAiPurchaseRequests() {
  try {
    const rows = await query(
      "SELECT * FROM ai_purchase_requests ORDER BY created_at DESC"
    );
    return rows.map((req) => ({
      id: req.id,
      domain: req.domain,
      userName: req.user_name || "School Owner",
      userPhone: req.user_phone || "N/A",
      packageId: req.package_id,
      packageName: req.package_name || "Custom Plan",
      credits: req.credits || 0,
      price: Number(req.price) || 0,
      currency: req.currency || "BDT",
      paymentMethod: req.payment_method,
      transactionId: req.transaction_id,
      status: req.status,
      submittedAt: req.created_at,
      processedAt: req.processed_at,
    }));
  } catch (error) {
    console.error("[AI-DB] Error fetching purchase requests:", error.message);
    return [];
  }
}

/**
 * Creates a new AI purchase request.
 */
export async function createAiPurchaseRequest(req) {
  const requestId = generateUuid();
  const domain = req.domain;
  const userName = req.userName || "School Owner";
  const userPhone = req.userPhone || "N/A";
  const packageId = req.packageId && !req.packageId.startsWith("pkg_") ? req.packageId : null;
  const packageName = req.packageName || "AI Package";
  const credits = Number(req.credits);
  const price = Number(req.price);
  const currency = req.currency || "BDT";
  const paymentMethod = req.paymentMethod;
  const transactionId = req.transactionId;
  const status = req.status || "pending";

  await execute(
    `INSERT INTO ai_purchase_requests 
     (id, domain, package_id, package_name, user_name, user_phone, credits, price, currency, payment_method, transaction_id, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [requestId, domain, packageId, packageName, userName, userPhone, credits, price, currency, paymentMethod, transactionId, status]
  );

  return { id: requestId, domain, userName, userPhone, packageId, packageName, credits, price, currency, paymentMethod, transactionId, status };
}

/**
 * Updates a purchase request status (approves or rejects).
 * If approved, active credits are added to domain_ai_credits and logged in domain_ai_transactions.
 */
export async function updatePurchaseRequestStatus(requestId, status, reason = "") {
  if (status !== "approved" && status !== "rejected") {
    throw new Error("Status must be approved or rejected");
  }
  // One transaction: the request row is locked, so a double click / two admins cannot add the credits twice
  return withTransaction(async (tx) => {
    const reqData = await tx.queryOne("SELECT * FROM ai_purchase_requests WHERE id = ? FOR UPDATE", [requestId]);
    if (!reqData) {
      throw new Error("Purchase request not found");
    }
    if (reqData.status && reqData.status !== "pending") {
      throw new Error(`Purchase request already processed (${reqData.status})`);
    }

    const processedAt = new Date();
    await tx.execute("UPDATE ai_purchase_requests SET status = ?, processed_at = ? WHERE id = ?", [status, processedAt, requestId]);

    if (status === "approved") {
      const validityDays = 30; // default 30 days
      const addedCredits = Number(reqData.credits);
      const domain = reqData.domain;

      await tx.execute(
        `INSERT INTO domain_ai_credits AS d (id, domain, remaining_credits, total_credits_purchased, expires_at)
         VALUES (?, ?, ?, ?, NOW() + make_interval(days => ?::int))
         ON CONFLICT (domain) DO UPDATE SET
           remaining_credits = d.remaining_credits + EXCLUDED.remaining_credits,
           total_credits_purchased = d.total_credits_purchased + EXCLUDED.total_credits_purchased,
           expires_at = EXCLUDED.expires_at`,
        [generateUuid(), domain, addedCredits, addedCredits, validityDays]
      );

      await tx.execute(
        `INSERT INTO domain_ai_transactions
         (id, domain, teacher_id, teacher_name, type, feature, amount, description)
         VALUES (?, ?, ?, ?, 'purchase', 'billing', ?, ?)`,
        [
          generateUuid(),
          domain,
          "00000000-0000-0000-0000-000000000000",
          "Central Billing System",
          addedCredits,
          `Successfully purchased ${addedCredits} credits via ${reqData.payment_method || "bKash/Nagad"}`,
        ]
      );
    }

    return { ...reqData, status, processed_at: processedAt };
  });
}

/**
 * Gets the credit ledger for a specific domain.
 */
export async function getDomainCredits(domain) {
  try {
    const data = await queryOne("SELECT * FROM domain_ai_credits WHERE domain = ?", [domain]);
    if (!data) {
      return { remainingCredits: 0, totalCredits: 0, expiresAt: null, isExpired: false };
    }

    const isExpired = data.expires_at ? new Date(data.expires_at) < new Date() : false;
    return {
      remainingCredits: isExpired ? 0 : data.remaining_credits,
      totalCredits: data.total_credits_purchased,
      expiresAt: data.expires_at,
      isExpired
    };
  } catch (error) {
    console.error("[AI-DB] Error fetching domain credits:", error.message);
    return { remainingCredits: 0, totalCredits: 0, expiresAt: null, isExpired: false };
  }
}

/**
 * Get all school domain balances for Super-Admin.
 */
export async function getDomainBalances() {
  try {
    const rows = await query("SELECT * FROM domain_ai_credits ORDER BY domain ASC");
    return rows.map((item) => ({
      domain: item.domain,
      remainingCredits: item.remaining_credits,
      totalCredits: item.total_credits_purchased,
      expiresAt: item.expires_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error("[AI-DB] Error fetching domain balances:", error.message);
    return [];
  }
}

/**
 * Get all transaction audit logs for Super-Admin.
 */
export async function getDomainTransactions() {
  try {
    const rows = await query("SELECT * FROM domain_ai_transactions ORDER BY created_at DESC");
    return rows.map((item) => ({
      id: item.id,
      domain: item.domain,
      teacherId: item.teacher_id,
      teacherName: item.teacher_name,
      type: item.type,
      feature: item.feature,
      amount: item.amount,
      description: item.description,
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error("[AI-DB] Error fetching domain transactions:", error.message);
    return [];
  }
}

/**
 * Default packages helper.
 */
function getDefaultPackages() {
  return [
    { id: "b0000000-0000-0000-0000-000000000001", name: "Starter Pack", credits: 5, validityDays: 30, price: 99, currency: "BDT", isActive: true },
    { id: "b0000000-0000-0000-0000-000000000002", name: "Pro Pack", credits: 10, validityDays: 30, price: 179, currency: "BDT", isActive: true, highlight: true },
    { id: "b0000000-0000-0000-0000-000000000003", name: "Power Pack", credits: 20, validityDays: 30, price: 299, currency: "BDT", isActive: true },
  ];
}
