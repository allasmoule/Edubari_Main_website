import { supabaseAdmin } from "./supabase";

let cachedUseRelational = null;

/**
 * Automatically detects whether relational tables exist in Supabase (Option A).
 * Falls back to using the app_state generic key-value table (Option B) if not found.
 */
export async function checkOptionMode() {
  if (cachedUseRelational !== null) {
    return cachedUseRelational;
  }

  try {
    const { error } = await supabaseAdmin
      .from("ai_packages")
      .select("id")
      .limit(1);

    if (error && (error.code === "PGRST205" || error.message.includes("does not exist"))) {
      console.log("[AI-DB] Custom relational tables not found. Using Option B (app_state JSON state) fallback.");
      cachedUseRelational = false;
    } else {
      console.log("[AI-DB] Custom relational tables found! Using Option A (Relational schema).");
      cachedUseRelational = true;
    }
  } catch (err) {
    console.error("[AI-DB] Error detecting table configuration, defaulting to Option B:", err);
    cachedUseRelational = false;
  }

  return cachedUseRelational;
}

/**
 * Gets all AI subscription packages.
 */
export async function getAiPackages() {
  const isRelational = await checkOptionMode();

  if (isRelational) {
    const { data, error } = await supabaseAdmin
      .from("ai_packages")
      .select("*")
      .order("price", { ascending: true });

    if (error) {
      console.error("Error fetching packages (Relational):", error);
      return getDefaultPackages();
    }
    return data.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      credits: pkg.credits,
      price: pkg.price,
      validityDays: pkg.validity_days || 30,
      currency: pkg.currency || "BDT",
      isActive: pkg.is_active !== false,
      highlight: pkg.highlight || false,
    }));
  } else {
    // Option B: Query app_state for admin_settings
    const { data, error } = await supabaseAdmin
      .from("app_state")
      .select("value")
      .eq("key", "admin_settings")
      .single();

    if (error || !data || !data.value) {
      console.log("No admin settings found in app_state, using defaults.");
      return getDefaultPackages();
    }

    const packages = data.value.aiSubscriptionPackages;
    if (!packages || !Array.isArray(packages)) {
      return getDefaultPackages();
    }
    return packages;
  }
}

/**
 * Saves or updates an AI subscription package.
 */
export async function saveAiPackage(pkg) {
  const isRelational = await checkOptionMode();

  if (isRelational) {
    const dbRecord = {
      name: pkg.name,
      credits: Number(pkg.credits),
      price: Number(pkg.price),
      validity_days: Number(pkg.validityDays),
      currency: pkg.currency || "BDT",
      is_active: pkg.isActive !== false,
      highlight: !!pkg.highlight,
    };

    if (pkg.id && !pkg.id.startsWith("pkg_")) {
      // Update
      const { data, error } = await supabaseAdmin
        .from("ai_packages")
        .update(dbRecord)
        .eq("id", pkg.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // Insert
      const { data, error } = await supabaseAdmin
        .from("ai_packages")
        .insert([dbRecord])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  } else {
    // Option B: Load settings, update array, and save
    const { data, error } = await supabaseAdmin
      .from("app_state")
      .select("value")
      .eq("key", "admin_settings")
      .single();

    let settings = data?.value || {};
    let packages = settings.aiSubscriptionPackages || [];

    const newPkg = {
      id: pkg.id || `pkg_${Math.random().toString(36).substr(2, 9)}`,
      name: pkg.name,
      credits: Number(pkg.credits),
      price: Number(pkg.price),
      validityDays: Number(pkg.validityDays),
      currency: pkg.currency || "BDT",
      isActive: pkg.isActive !== false,
      highlight: !!pkg.highlight,
      createdAt: pkg.createdAt || new Date().toISOString(),
    };

    const idx = packages.findIndex(p => p.id === newPkg.id);
    if (idx >= 0) {
      packages[idx] = { ...packages[idx], ...newPkg };
    } else {
      packages.push(newPkg);
    }

    settings.aiSubscriptionPackages = packages;

    const { error: updateError } = await supabaseAdmin
      .from("app_state")
      .upsert({ key: "admin_settings", value: settings });

    if (updateError) throw updateError;
    return newPkg;
  }
}

/**
 * Gets all AI purchase requests.
 */
export async function getAiPurchaseRequests() {
  const isRelational = await checkOptionMode();

  if (isRelational) {
    const { data, error } = await supabaseAdmin
      .from("ai_purchase_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests (Relational):", error);
      return [];
    }

    return data.map(req => ({
      id: req.id,
      domain: req.domain, 
      userName: req.user_name || "School Owner",
      userPhone: req.user_phone || "N/A",
      packageId: req.package_id,
      packageName: req.package_name || "Custom Plan",
      credits: req.credits || 0,
      price: req.price || 0,
      currency: req.currency || "BDT",
      paymentMethod: req.payment_method,
      transactionId: req.transaction_id,
      status: req.status,
      submittedAt: req.created_at,
      processedAt: req.processed_at,
    }));
  } else {
    // Option B: Query app_state
    const { data, error } = await supabaseAdmin
      .from("app_state")
      .select("value")
      .eq("key", "admin_settings")
      .single();

    if (error || !data || !data.value) {
      return [];
    }

    return data.value.aiPurchaseRequests || [];
  }
}

/**
 * Creates a new AI purchase request.
 */
export async function createAiPurchaseRequest(req) {
  const isRelational = await checkOptionMode();

  if (isRelational) {
    const dbRecord = {
      domain: req.domain, 
      user_name: req.userName,
      user_phone: req.userPhone,
      package_id: req.packageId && !req.packageId.startsWith("pkg_") ? req.packageId : null,
      package_name: req.packageName,
      credits: Number(req.credits),
      price: Number(req.price),
      currency: req.currency || "BDT",
      payment_method: req.paymentMethod,
      transaction_id: req.transactionId,
      status: req.status || "pending",
    };

    const { data, error } = await supabaseAdmin
      .from("ai_purchase_requests")
      .insert([dbRecord])
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Option B: Load settings, prepend to requests, save
    const { data, error } = await supabaseAdmin
      .from("app_state")
      .select("value")
      .eq("key", "admin_settings")
      .single();

    let settings = data?.value || {};
    let requests = settings.aiPurchaseRequests || [];

    const newReq = {
      id: req.id || `req_${Math.random().toString(36).substr(2, 9)}`,
      domain: req.domain, 
      userName: req.userName || "School Owner",
      userPhone: req.userPhone || "N/A",
      packageId: req.packageId,
      packageName: req.packageName,
      credits: Number(req.credits),
      price: Number(req.price),
      currency: req.currency || "BDT",
      paymentMethod: req.paymentMethod,
      transactionId: req.transactionId,
      status: req.status || "pending",
      submittedAt: new Date().toISOString(),
    };

    // Prepend to requests list
    requests = [newReq, ...requests];
    settings.aiPurchaseRequests = requests;

    const { error: updateError } = await supabaseAdmin
      .from("app_state")
      .upsert({ key: "admin_settings", value: settings });

    if (updateError) throw updateError;
    return newReq;
  }
}

/**
 * Updates a purchase request status (approves or rejects).
 * If approved, active credits are calculated and added to the customer's domain ledger.
 * This directly complies with your table schemas (domain_ai_credits & domain_ai_transactions) 
 * and calls the Supabase add_domain_credits RPC safely.
 */
export async function updatePurchaseRequestStatus(requestId, status, reason = "") {
  const isRelational = await checkOptionMode();
  const processedAt = new Date().toISOString();

  let targetRequest = null;

  if (isRelational) {
    // 1. Fetch the request to get package, credits, and domain details
    const { data: reqData, error: reqErr } = await supabaseAdmin
      .from("ai_purchase_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (reqErr || !reqData) throw new Error("Purchase request not found");
    targetRequest = reqData;

    // 2. Update status of the request
    const { error: updateErr } = await supabaseAdmin
      .from("ai_purchase_requests")
      .update({ status, processed_at: processedAt })
      .eq("id", requestId);

    if (updateErr) throw updateErr;

    // 3. If approved, add credits using RPC and insert transaction audit log
    if (status === "approved") {
      const validityDays = 30; // default 30 days

      // Call public.add_domain_credits RPC function safely (Updates domain_ai_credits table)
      const { error: creditError } = await supabaseAdmin.rpc("add_domain_credits", {
        target_domain: reqData.domain,
        credits_to_add: Number(reqData.credits),
        validity_days: validityDays
      });

      if (creditError) {
        console.error("RPC credit addition failed, falling back to direct table inserts:", creditError);
        // Fallback: If RPC doesn't exist yet, insert directly into domain_ai_credits
        const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();
        const { data: creditData } = await supabaseAdmin
          .from("domain_ai_credits")
          .select("*")
          .eq("domain", reqData.domain)
          .single();

        if (creditData) {
          await supabaseAdmin
            .from("domain_ai_credits")
            .update({
              remaining_credits: Number(creditData.remaining_credits) + Number(reqData.credits),
              total_credits_purchased: Number(creditData.total_credits_purchased) + Number(reqData.credits),
              expires_at: expiresAt,
              updated_at: new Date().toISOString()
            })
            .eq("domain", reqData.domain);
        } else {
          await supabaseAdmin
            .from("domain_ai_credits")
            .insert([{
              domain: reqData.domain,
              remaining_credits: Number(reqData.credits),
              total_credits_purchased: Number(reqData.credits),
              expires_at: expiresAt,
            }]);
        }
      }

      // 4. Log the billing transaction inside domain_ai_transactions
      await supabaseAdmin.from("domain_ai_transactions").insert({
        domain: reqData.domain,
        teacher_id: "00000000-0000-0000-0000-000000000000", // Central billing UUID
        teacher_name: "Central Billing System",
        type: "purchase",
        feature: "billing",
        amount: Number(reqData.credits),
        description: `Successfully purchased ${reqData.credits} credits via ${reqData.payment_method}`
      });
    }
  } else {
    // Option B: Load settings, find and update request in the list
    const { data, error } = await supabaseAdmin
      .from("app_state")
      .select("value")
      .eq("key", "admin_settings")
      .single();

    if (error || !data || !data.value) throw new Error("Settings not found");

    let settings = data.value;
    let requests = settings.aiPurchaseRequests || [];
    const idx = requests.findIndex(r => r.id === requestId);

    if (idx === -1) throw new Error("Purchase request not found in settings");
    requests[idx].status = status;
    requests[idx].processedAt = processedAt;
    
    targetRequest = requests[idx];

    // If approved, push to domain ledgers map inside settings
    if (status === "approved") {
      const validityDays = 30; // default 30 days
      const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

      if (!settings.clientAiCredits) {
        settings.clientAiCredits = {};
      }

      const domain = targetRequest.domain;
      const existingLedger = settings.clientAiCredits[domain] || {
        remainingCredits: 0,
        totalCredits: 0,
      };

      settings.clientAiCredits[domain] = {
        remainingCredits: Number(existingLedger.remainingCredits) + Number(targetRequest.credits),
        totalCredits: Number(targetRequest.credits),
        packageId: targetRequest.packageId,
        packageName: targetRequest.packageName,
        purchasedAt: processedAt,
        expiresAt,
      };

      // Also append to audit transactions log inside option B for parity
      if (!settings.domainAiTransactions) {
        settings.domainAiTransactions = [];
      }
      settings.domainAiTransactions.push({
        domain: targetRequest.domain,
        teacherId: "00000000-0000-0000-0000-000000000000",
        teacherName: "Central Billing System",
        type: "purchase",
        feature: "billing",
        amount: Number(targetRequest.credits),
        description: `Successfully purchased ${targetRequest.credits} credits via ${targetRequest.paymentMethod}`,
        createdAt: processedAt,
      });
    }

    settings.aiPurchaseRequests = requests;

    const { error: updateError } = await supabaseAdmin
      .from("app_state")
      .upsert({ key: "admin_settings", value: settings });

    if (updateError) throw updateError;
  }

  return targetRequest;
}

/**
 * Gets the credit ledger for a specific domain.
 */
export async function getDomainCredits(domain) {
  const isRelational = await checkOptionMode();

  if (isRelational) {
    const { data, error } = await supabaseAdmin
      .from("domain_ai_credits")
      .select("*")
      .eq("domain", domain)
      .single();

    if (error || !data) {
      return { remainingCredits: 0, totalCredits: 0, expiresAt: null };
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { remainingCredits: 0, totalCredits: 0, expiresAt: data.expires_at, isExpired: true };
    }

    return {
      remainingCredits: data.remaining_credits,
      totalCredits: data.total_credits_purchased,
      expiresAt: data.expires_at,
      isExpired: false
    };
  } else {
    // Option B: Load settings and extract ledger
    const { data, error } = await supabaseAdmin
      .from("app_state")
      .select("value")
      .eq("key", "admin_settings")
      .single();

    if (error || !data || !data.value || !data.value.clientAiCredits) {
      return { remainingCredits: 0, totalCredits: 0, expiresAt: null };
    }

    const ledger = data.value.clientAiCredits[domain];
    if (!ledger) {
      return { remainingCredits: 0, totalCredits: 0, expiresAt: null };
    }

    // Check expiry
    if (new Date(ledger.expiresAt) < new Date()) {
      return { remainingCredits: 0, totalCredits: 0, expiresAt: ledger.expiresAt, isExpired: true };
    }

    return ledger;
  }
}

/**
 * SUPER-ADMIN: Get all school domain balances.
 */
export async function getDomainBalances() {
  const isRelational = await checkOptionMode();

  if (isRelational) {
    const { data, error } = await supabaseAdmin
      .from("domain_ai_credits")
      .select("*")
      .order("domain", { ascending: true });

    if (error) {
      console.error("Error fetching balances (Relational):", error);
      return [];
    }

    return data.map(item => ({
      domain: item.domain,
      remainingCredits: item.remaining_credits,
      totalCredits: item.total_credits_purchased,
      expiresAt: item.expires_at,
      updatedAt: item.updated_at
    }));
  } else {
    const { data, error } = await supabaseAdmin
      .from("app_state")
      .select("value")
      .eq("key", "admin_settings")
      .single();

    if (error || !data || !data.value || !data.value.clientAiCredits) {
      return [];
    }

    return Object.entries(data.value.clientAiCredits).map(([domain, ledger]) => ({
      domain,
      remainingCredits: ledger.remainingCredits,
      totalCredits: ledger.totalCredits,
      expiresAt: ledger.expiresAt,
      updatedAt: ledger.purchasedAt
    }));
  }
}

/**
 * SUPER-ADMIN: Get all transaction audit logs.
 */
export async function getDomainTransactions() {
  const isRelational = await checkOptionMode();

  if (isRelational) {
    const { data, error } = await supabaseAdmin
      .from("domain_ai_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions (Relational):", error);
      return [];
    }

    return data.map(item => ({
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
  } else {
    const { data, error } = await supabaseAdmin
      .from("app_state")
      .select("value")
      .eq("key", "admin_settings")
      .single();

    if (error || !data || !data.value || !data.value.domainAiTransactions) {
      return [];
    }

    return data.value.domainAiTransactions;
  }
}

/**
 * Default packages helper.
 * Starter: 15 credits, Pro: 50 credits, Power: 100 credits.
 */
function getDefaultPackages() {
  return [
    { id: "pkg_starter", name: "Starter Pack", credits: 15, validityDays: 30, price: 99, currency: "BDT", isActive: true },
    { id: "pkg_pro", name: "Pro Pack", credits: 50, validityDays: 30, price: 179, currency: "BDT", isActive: true, highlight: true },
    { id: "pkg_unlimited", name: "Power Pack", credits: 100, validityDays: 30, price: 299, currency: "BDT", isActive: true },
  ];
}
