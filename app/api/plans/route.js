import { NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";
import { getCachedPlans, setCachedPlans, invalidatePlansCache } from "@/lib/plansCache";

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

function mapPlanFromDb(row) {
  if (!row) return null;
  const parsedRow = parseRowJsonFields(row);
  return {
    ...parsedRow,
    id: parsedRow.id,
    _id: parsedRow.id,
    name: parsedRow.plan_name || "Default Plan",
    plan_name: parsedRow.plan_name,
    durationDays: parsedRow.duration_days || 30,
    duration_days: parsedRow.duration_days || 30,
    maxStudents: parsedRow.max_students || 200,
    max_students: parsedRow.max_students || 200,
    maxInstructors: parsedRow.max_instructors || 10,
    max_instructors: parsedRow.max_instructors || 10,
    maxBatches: parsedRow.max_batches || 1,
    max_batches: parsedRow.max_batches || 1,
    monthlyAiCredits: parsedRow.monthly_ai_credits || 0,
    monthly_ai_credits: parsedRow.monthly_ai_credits || 0,
    showBranding: Boolean(parsedRow.show_branding ?? true),
    show_branding: Boolean(parsedRow.show_branding ?? true),
    active: Boolean(parsedRow.is_active ?? true),
    is_active: Boolean(parsedRow.is_active ?? true),
    sortOrder: parsedRow.sort_order || 0,
    sort_order: parsedRow.sort_order || 0,
    featureGates: parsedRow.feature_gates || {},
    feature_gates: parsedRow.feature_gates || {},
    price: Number(parsedRow.price || 0),
    oldPrice: parsedRow.old_price ? Number(parsedRow.old_price) : null,
    priceLabel: parsedRow.price_label || `৳${Number(parsedRow.price || 0).toLocaleString()}/${parsedRow.duration_days === 365 ? 'year' : 'month'}`,
    duration: parsedRow.duration || (parsedRow.duration_days === 365 ? 'Yearly' : parsedRow.duration_days === 30 ? 'Monthly' : `${parsedRow.duration_days} Days`),
    features: Array.isArray(parsedRow.features) ? parsedRow.features : [],
    popular: Boolean(parsedRow.popular ?? false),
    badge: parsedRow.badge || null,
    planTier: parsedRow.plan_tier || 'free',
    plan_tier: parsedRow.plan_tier || 'free',
    planType: parsedRow.plan_type || 'single_teacher',
    plan_type: parsedRow.plan_type || 'single_teacher',
  };
}

const DEFAULT_PLANS = [
  // --- 6 School ERP Packages (From Poster/Image) ---
  {
    id: "erp-pkg-01",
    _id: "erp-pkg-01",
    name: "Package 01",
    plan_name: "Package 01",
    planType: "school_erp",
    plan_type: "school_erp",
    planTier: "starter",
    plan_tier: "starter",
    duration: "Monthly",
    durationDays: 30,
    duration_days: 30,
    price: 500,
    oldPrice: 700,
    priceLabel: "৳500 / month",
    price_label: "৳500 / month",
    maxStudents: 300,
    max_students: 300,
    maxInstructors: 20,
    max_instructors: 20,
    badge: "Under 300 Students",
    popular: false,
    active: true,
    is_active: true,
    sortOrder: 1,
    sort_order: 1,
    features: [
      "Student Management",
      "Teacher Management",
      "Class, Exam & Routine",
      "Attendance & Fees",
      "Notice & Communication",
      "Library & Facility",
      "Reports & Analytics",
      "School Website Full Free"
    ]
  },
  {
    id: "erp-pkg-02",
    _id: "erp-pkg-02",
    name: "Package 02",
    plan_name: "Package 02",
    planType: "school_erp",
    plan_type: "school_erp",
    planTier: "starter",
    plan_tier: "starter",
    duration: "Monthly",
    durationDays: 30,
    duration_days: 30,
    price: 700,
    oldPrice: 900,
    priceLabel: "৳700 / month",
    price_label: "৳700 / month",
    maxStudents: 500,
    max_students: 500,
    maxInstructors: 30,
    max_instructors: 30,
    badge: "300 - 500 Students",
    popular: false,
    active: true,
    is_active: true,
    sortOrder: 2,
    sort_order: 2,
    features: [
      "Student Management",
      "Teacher Management",
      "Class, Exam & Routine",
      "Attendance & Fees",
      "Notice & Communication",
      "Library & Facility",
      "Reports & Analytics",
      "School Website Full Free"
    ]
  },
  {
    id: "erp-pkg-03",
    _id: "erp-pkg-03",
    name: "Package 03",
    plan_name: "Package 03",
    planType: "school_erp",
    plan_type: "school_erp",
    planTier: "professional",
    plan_tier: "professional",
    duration: "Monthly",
    durationDays: 30,
    duration_days: 30,
    price: 1000,
    oldPrice: 1500,
    priceLabel: "৳1,000 / month",
    price_label: "৳1,000 / month",
    maxStudents: 1000,
    max_students: 1000,
    maxInstructors: 50,
    max_instructors: 50,
    badge: "500 - 1,000 Students",
    popular: true,
    active: true,
    is_active: true,
    sortOrder: 3,
    sort_order: 3,
    features: [
      "Student Management",
      "Teacher Management",
      "Class, Exam & Routine",
      "Attendance & Fees",
      "Notice & Communication",
      "Library & Facility",
      "Reports & Analytics",
      "School Website Full Free"
    ]
  },
  {
    id: "erp-pkg-04",
    _id: "erp-pkg-04",
    name: "Package 04",
    plan_name: "Package 04",
    planType: "school_erp",
    plan_type: "school_erp",
    planTier: "business",
    plan_tier: "business",
    duration: "Monthly",
    durationDays: 30,
    duration_days: 30,
    price: 2000,
    oldPrice: 2500,
    priceLabel: "৳2,000 / month",
    price_label: "৳2,000 / month",
    maxStudents: 1500,
    max_students: 1500,
    maxInstructors: 75,
    max_instructors: 75,
    badge: "1,000 - 1,500 Students",
    popular: false,
    active: true,
    is_active: true,
    sortOrder: 4,
    sort_order: 4,
    features: [
      "Student Management",
      "Teacher Management",
      "Class, Exam & Routine",
      "Attendance & Fees",
      "Notice & Communication",
      "Library & Facility",
      "Reports & Analytics",
      "School Website Full Free"
    ]
  },
  {
    id: "erp-pkg-05",
    _id: "erp-pkg-05",
    name: "Package 05",
    plan_name: "Package 05",
    planType: "school_erp",
    plan_type: "school_erp",
    planTier: "business",
    plan_tier: "business",
    duration: "Monthly",
    durationDays: 30,
    duration_days: 30,
    price: 3000,
    oldPrice: 3800,
    priceLabel: "৳3,000 / month",
    price_label: "৳3,000 / month",
    maxStudents: 2000,
    max_students: 2000,
    maxInstructors: 100,
    max_instructors: 100,
    badge: "1,500 - 2,000 Students",
    popular: false,
    active: true,
    is_active: true,
    sortOrder: 5,
    sort_order: 5,
    features: [
      "Student Management",
      "Teacher Management",
      "Class, Exam & Routine",
      "Attendance & Fees",
      "Notice & Communication",
      "Library & Facility",
      "Reports & Analytics",
      "School Website Full Free"
    ]
  },
  {
    id: "erp-pkg-06",
    _id: "erp-pkg-06",
    name: "Package 06",
    plan_name: "Package 06",
    planType: "school_erp",
    plan_type: "school_erp",
    planTier: "enterprise",
    plan_tier: "enterprise",
    duration: "Monthly",
    durationDays: 30,
    duration_days: 30,
    price: 4000,
    oldPrice: 5000,
    priceLabel: "৳4,000 / month",
    price_label: "৳4,000 / month",
    maxStudents: 5000,
    max_students: 5000,
    maxInstructors: 200,
    max_instructors: 200,
    badge: "2,000 - 5,000 Students",
    popular: false,
    active: true,
    is_active: true,
    sortOrder: 6,
    sort_order: 6,
    features: [
      "Student Management",
      "Teacher Management",
      "Class, Exam & Routine",
      "Attendance & Fees",
      "Notice & Communication",
      "Library & Facility",
      "Reports & Analytics",
      "School Website Full Free"
    ]
  },

  // --- Single Teacher LMS Plans ---
  {
    id: "f0000000-0000-0000-0000-000000000001",
    _id: "f0000000-0000-0000-0000-000000000001",
    name: "EDUBARI Free",
    plan_name: "EDUBARI Free",
    planType: "single_teacher",
    plan_type: "single_teacher",
    planTier: "free",
    plan_tier: "free",
    duration: "Yearly",
    durationDays: 365,
    duration_days: 365,
    price: 0,
    priceLabel: "৳0 / year",
    price_label: "৳0 / year",
    maxStudents: 20,
    max_students: 20,
    maxInstructors: 1,
    max_instructors: 1,
    badge: "FREE",
    popular: false,
    active: true,
    is_active: true,
    sortOrder: 10,
    sort_order: 10,
    features: [
      "Limited Personal Website",
      "Personal Profile",
      "Limited Student Management",
      "1 Batch Management",
      "Basic Class & Exam System",
      "Basic Attendance",
      "Basic Payment Tracking",
      "2 AI Credits / Month"
    ]
  },
  {
    id: "f0000000-0000-0000-0000-000000000002",
    _id: "f0000000-0000-0000-0000-000000000002",
    name: "EDUBARI Starter",
    plan_name: "EDUBARI Starter",
    planType: "single_teacher",
    plan_type: "single_teacher",
    planTier: "starter",
    plan_tier: "starter",
    duration: "Monthly",
    durationDays: 30,
    duration_days: 30,
    price: 250,
    priceLabel: "৳250 / month",
    price_label: "৳250 / month",
    maxStudents: 100,
    max_students: 100,
    maxInstructors: 1,
    max_instructors: 1,
    badge: "STARTER",
    popular: false,
    active: true,
    is_active: true,
    sortOrder: 11,
    sort_order: 11,
    features: [
      "Personal Digital Academy",
      "Personal Website & Profile",
      "Student & Batch Management",
      "Monthly Payment & Due Tracking",
      "Online & Recorded Class",
      "Exam, Result & Assignment",
      "Auto Attendance",
      "10 AI Credits / Month"
    ]
  },
  {
    id: "f0000000-0000-0000-0000-000000000003",
    _id: "f0000000-0000-0000-0000-000000000003",
    name: "EDUBARI Professional",
    plan_name: "EDUBARI Professional",
    planType: "single_teacher",
    plan_type: "single_teacher",
    planTier: "professional",
    plan_tier: "professional",
    duration: "Monthly",
    durationDays: 30,
    duration_days: 30,
    price: 350,
    priceLabel: "৳350 / month",
    price_label: "৳350 / month",
    maxStudents: 300,
    max_students: 300,
    maxInstructors: 1,
    max_instructors: 1,
    badge: "POPULAR",
    popular: true,
    active: true,
    is_active: true,
    sortOrder: 12,
    sort_order: 12,
    features: [
      "Starter Plan-এর সকল সুবিধা",
      "অধিক Student & Batch",
      "Advanced Student Analytics",
      "Guardian Portal",
      "Smart Payment Tracking",
      "Advanced AI Tools",
      "15 AI Credits / Month"
    ]
  }
];

export async function GET() {
  const cached = getCachedPlans();
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const rows = await query("SELECT * FROM plans ORDER BY sort_order ASC, price ASC");
    if (rows && Array.isArray(rows) && rows.length > 0) {
      const dbPlans = rows.map(mapPlanFromDb);
      const dbIds = new Set(dbPlans.map((p) => p.id || p._id));
      const missingDefaults = DEFAULT_PLANS.filter((p) => !dbIds.has(p.id));
      const result = [...dbPlans, ...missingDefaults];
      setCachedPlans(result);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.warn("Error fetching plans from DB, falling back to defaults:", error?.message);
  }
  setCachedPlans(DEFAULT_PLANS);
  return NextResponse.json(DEFAULT_PLANS);
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const body = await request.json();

    const planId = crypto.randomUUID();
    const planName = body.name || body.plan_name || "New Plan";
    const durationDays = body.durationDays !== undefined ? Number(body.durationDays) : (body.duration_days !== undefined ? Number(body.duration_days) : 30);
    const maxStudents = body.maxStudents !== undefined ? Number(body.maxStudents) : (body.max_students !== undefined ? Number(body.max_students) : 200);
    const maxInstructors = body.maxInstructors !== undefined ? Number(body.maxInstructors) : (body.max_instructors !== undefined ? Number(body.max_instructors) : 10);
    const price = Number(body.price || 0);
    const oldPrice = body.oldPrice ? Number(body.oldPrice) : (body.old_price ? Number(body.old_price) : null);
    const priceLabel = body.priceLabel || body.price_label || `৳${price.toLocaleString()}/month`;
    const duration = body.duration || (durationDays === 365 ? 'Yearly' : durationDays === 30 ? 'Monthly' : `${durationDays} Days`);
    const description = body.description || "";
    const features = JSON.stringify(Array.isArray(body.features) ? body.features : []);
    const isActive = Boolean(body.active ?? body.is_active ?? true);
    const popular = Boolean(body.popular ?? false);
    const badge = body.badge || null;
    const planTier = body.planTier || body.plan_tier || 'free';
    const planType = body.planType || body.plan_type || 'single_teacher';
    const maxBatches = body.maxBatches !== undefined ? Number(body.maxBatches) : (body.max_batches !== undefined ? Number(body.max_batches) : 1);
    const monthlyAiCredits = body.monthlyAiCredits !== undefined ? Number(body.monthlyAiCredits) : (body.monthly_ai_credits !== undefined ? Number(body.monthly_ai_credits) : 0);
    const showBranding = Boolean(body.showBranding ?? body.show_branding ?? true);
    const sortOrder = body.sortOrder !== undefined ? Number(body.sortOrder) : (body.sort_order !== undefined ? Number(body.sort_order) : 0);
    const featureGates = JSON.stringify(body.featureGates || body.feature_gates || {});

    await execute(
      `INSERT INTO plans 
       (id, plan_name, duration_days, max_students, max_instructors, price, old_price, price_label, duration, description, features, is_active, popular, badge, plan_tier, plan_type, max_batches, monthly_ai_credits, show_branding, sort_order, feature_gates) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        planId,
        planName,
        durationDays,
        maxStudents,
        maxInstructors,
        price,
        oldPrice,
        priceLabel,
        duration,
        description,
        features,
        isActive,
        popular,
        badge,
        planTier,
        planType,
        maxBatches,
        monthlyAiCredits,
        showBranding,
        sortOrder,
        featureGates,
      ]
    );

    invalidatePlansCache();
    const created = await queryOne("SELECT * FROM plans WHERE id = ?", [planId]);
    return NextResponse.json(mapPlanFromDb(created), { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}


