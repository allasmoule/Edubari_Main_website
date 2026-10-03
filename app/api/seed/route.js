import { NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function GET(request) {
  return handleSeed(request);
}

export async function POST(request) {
  return handleSeed(request);
}

async function handleSeed(request) {
  const results = [];
  try {
    // 1. Ensure required tables exist
    await execute(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) DEFAULT 'admin',
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.push("Ensured 'users' table exists");

    await execute(`
      CREATE TABLE IF NOT EXISTS \`plans\` (
        \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
        \`plan_name\` VARCHAR(255) NOT NULL,
        \`plan_type\` ENUM('single_teacher', 'school_erp') NOT NULL DEFAULT 'single_teacher',
        \`duration_days\` INT NOT NULL,
        \`max_students\` INT NOT NULL,
        \`max_instructors\` INT NOT NULL,
        \`price\` DECIMAL(10, 2) NOT NULL,
        \`features\` JSON NOT NULL,
        \`plan_tier\` VARCHAR(50) DEFAULT 'free',
        \`max_batches\` INT DEFAULT 1,
        \`monthly_ai_credits\` INT DEFAULT 0,
        \`show_branding\` BOOLEAN DEFAULT TRUE,
        \`is_active\` BOOLEAN DEFAULT TRUE,
        \`sort_order\` INT DEFAULT 0,
        \`feature_gates\` JSON DEFAULT NULL,
        \`old_price\` DECIMAL(10, 2) DEFAULT NULL,
        \`price_label\` VARCHAR(255) DEFAULT NULL,
        \`duration\` VARCHAR(100) DEFAULT NULL,
        \`description\` TEXT DEFAULT NULL,
        \`popular\` BOOLEAN DEFAULT FALSE,
        \`badge\` VARCHAR(100) DEFAULT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.push("Ensured 'plans' table exists");

    await execute(`
      CREATE TABLE IF NOT EXISTS \`ai_packages\` (
        \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`credits\` INT NOT NULL,
        \`price\` DECIMAL(10, 2) NOT NULL,
        \`validity_days\` INT DEFAULT 30,
        \`is_active\` BOOLEAN DEFAULT TRUE,
        \`highlight\` BOOLEAN DEFAULT FALSE,
        \`currency\` VARCHAR(10) DEFAULT 'BDT',
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.push("Ensured 'ai_packages' table exists");

    await execute(`
      CREATE TABLE IF NOT EXISTS \`admin_login_attempts\` (
        \`ip\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`attempts\` INT NOT NULL DEFAULT 0,
        \`reset_at\` DATETIME NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.push("Ensured 'admin_login_attempts' table exists");

    // 2. Admin User Seed
    const adminEmail = "botbari@edubari.bd";
    const adminPass = "Edu@@@@1234";
    const adminHash = hashPassword(adminPass);
    const adminId = "3dfd52ed-c3e8-4973-997f-906169626880";

    await execute(
      `INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password\`, \`role\`)
       VALUES (?, 'Edubari Admin', ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`password\` = VALUES(\`password\`), \`role\` = 'admin'`,
      [adminId, adminEmail, adminHash]
    );
    results.push(`Seeded Admin user: ${adminEmail}`);

    // 3. SaaS & School ERP Plans Seed
    const plans = [
      [
        "f0000000-0000-0000-0000-000000000001",
        "EDUBARI Free",
        "single_teacher",
        365,
        20,
        1,
        0.00,
        JSON.stringify(["Limited Personal Website", "Personal Profile", "Limited Student Management", "1 Batch Management", "Basic Class & Exam System", "Basic Attendance", "Basic Payment Tracking", "Limited Online Class", "Limited AI Presentation Maker", "Powered by EDUBARI Branding", "2 AI Credits / Month"]),
        "free", 1, 2, true, true, 1,
        JSON.stringify({ personal_website: true, online_class: true, recorded_class: false, ai_presentation: true, ai_presentation_limited: true, guardian_portal: false, advanced_analytics: false, multi_teacher: false, salary_management: false, custom_branding: false, course_management: false, student_performance: false, assignment_system: false, payment_tracking: true })
      ],
      [
        "f0000000-0000-0000-0000-000000000002",
        "EDUBARI Starter",
        "single_teacher",
        30,
        100,
        1,
        250.00,
        JSON.stringify(["Personal Digital Academy", "Personal Website & Profile", "Student & Batch Management", "Monthly Payment & Due Tracking", "Online & Recorded Class", "Exam, Result & Assignment", "Auto Attendance", "AI Presentation Maker", "Student Performance Tracking", "Course Management", "10 AI Credits / Month"]),
        "starter", 5, 10, false, true, 2,
        JSON.stringify({ personal_website: true, online_class: true, recorded_class: true, ai_presentation: true, ai_presentation_limited: false, guardian_portal: false, advanced_analytics: false, multi_teacher: false, salary_management: false, custom_branding: false, course_management: true, student_performance: true, assignment_system: true, payment_tracking: true })
      ],
      [
        "f0000000-0000-0000-0000-000000000003",
        "EDUBARI Professional",
        "single_teacher",
        30,
        300,
        1,
        350.00,
        JSON.stringify(["Starter Plan-এর সকল সুবিধা", "অধিক Student & Batch", "Advanced Student Analytics", "Guardian Portal", "Smart Payment Tracking", "Advanced AI Tools", "Personal Branded Platform", "Online + Offline Class", "Advanced Reports & Analytics", "Priority Support", "15 AI Credits / Month"]),
        "professional", 15, 15, false, true, 3,
        JSON.stringify({ personal_website: true, online_class: true, recorded_class: true, ai_presentation: true, ai_presentation_limited: false, guardian_portal: true, advanced_analytics: true, multi_teacher: false, salary_management: false, custom_branding: false, course_management: true, student_performance: true, assignment_system: true, payment_tracking: true, payment_tracking_advanced: true })
      ],
      [
        "f0000000-0000-0000-0000-000000000004",
        "EDUBARI Business",
        "single_teacher",
        30,
        500,
        10,
        550.00,
        JSON.stringify(["Multiple Teacher Management", "Student & Batch Management", "Batch-wise Payment System", "Teacher Activity Tracking", "Student Performance Tracking", "Guardian Portal & Notification", "Teacher Salary Management", "Online + Offline Class", "Exam, Assignment & Result", "AI Presentation Maker", "Branded Website & Platform", "Advanced Analytics", "30 AI Credits / Month"]),
        "business", 30, 30, false, true, 4,
        JSON.stringify({ personal_website: true, online_class: true, recorded_class: true, ai_presentation: true, ai_presentation_limited: false, guardian_portal: true, advanced_analytics: true, multi_teacher: true, salary_management: true, custom_branding: false, course_management: true, student_performance: true, assignment_system: true, payment_tracking: true, payment_tracking_advanced: true })
      ],
      [
        "f0000000-0000-0000-0000-000000000005",
        "EDUBARI Enterprise",
        "single_teacher",
        30,
        2000,
        50,
        700.00,
        JSON.stringify(["Complete Institution Management", "Multiple Teacher & Student Management", "Department & Campus Management", "Teacher Class Tracking", "Auto Attendance System", "Student Performance Analytics", "Guardian Monitoring", "Payment & Salary Management", "AI-Powered Education Tools", "Custom Website & App", "Central Digital Dashboard", "Upazila & District Level Monitoring", "Advanced Analytics & Reports", "Dedicated Support", "Custom Development & Integration", "50 AI Credits / Month"]),
        "enterprise", 999, 50, false, true, 5,
        JSON.stringify({ personal_website: true, online_class: true, recorded_class: true, ai_presentation: true, ai_presentation_limited: false, guardian_portal: true, advanced_analytics: true, multi_teacher: true, salary_management: true, custom_branding: true, course_management: true, student_performance: true, assignment_system: true, payment_tracking: true, payment_tracking_advanced: true, custom_development: true })
      ],
      [
        "e0000000-0000-0000-0000-000000000001",
        "ERP Basic School",
        "school_erp",
        365,
        300,
        10,
        2000.00,
        JSON.stringify(["School ERP API Connection", "Up to 300 Students", "10 Teachers", "Basic Attendance & Exam", "Student Payment Tracking", "Guardian SMS Alerts", "20 AI Credits / Month"]),
        "starter", 20, 20, true, true, 10,
        JSON.stringify({ multi_teacher: true, guardian_portal: true, salary_management: false, advanced_analytics: false, ai_presentation: true, custom_branding: false, erp_api_access: true })
      ],
      [
        "e0000000-0000-0000-0000-000000000002",
        "ERP Standard School",
        "school_erp",
        365,
        1000,
        30,
        4500.00,
        JSON.stringify(["School ERP API Connection", "Up to 1000 Students", "30 Teachers", "Full Attendance & Exam System", "Advanced Payment Management", "Teacher Salary System", "Guardian Portal", "Advanced Analytics", "50 AI Credits / Month"]),
        "professional", 50, 50, false, true, 11,
        JSON.stringify({ multi_teacher: true, guardian_portal: true, salary_management: true, advanced_analytics: true, ai_presentation: true, custom_branding: false, erp_api_access: true })
      ],
      [
        "e0000000-0000-0000-0000-000000000003",
        "ERP Enterprise School",
        "school_erp",
        365,
        5000,
        100,
        8000.00,
        JSON.stringify(["School ERP API Connection", "Up to 5000 Students", "100 Teachers", "Multi-Campus Management", "Department Management", "Full Salary & HR System", "District Level Monitoring", "Custom Branding & Domain", "Priority Support", "100 AI Credits / Month"]),
        "enterprise", 999, 100, false, true, 12,
        JSON.stringify({ multi_teacher: true, guardian_portal: true, salary_management: true, advanced_analytics: true, ai_presentation: true, custom_branding: true, erp_api_access: true, multi_campus: true, custom_development: true })
      ]
    ];

    for (const p of plans) {
      await execute(
        `INSERT INTO \`plans\` 
         (\`id\`, \`plan_name\`, \`plan_type\`, \`duration_days\`, \`max_students\`, \`max_instructors\`, \`price\`, \`features\`, \`plan_tier\`, \`max_batches\`, \`monthly_ai_credits\`, \`show_branding\`, \`is_active\`, \`sort_order\`, \`feature_gates\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE \`plan_name\` = VALUES(\`plan_name\`), \`price\` = VALUES(\`price\`), \`features\` = VALUES(\`features\`)`,
        p
      );
    }
    results.push(`Seeded ${plans.length} subscription plans`);

    // 4. AI Packages Seed
    const aiPacks = [
      ["b0000000-0000-0000-0000-000000000001", "Starter Pack", 5, 99.00, 30, true, false, "BDT"],
      ["b0000000-0000-0000-0000-000000000002", "Pro Pack", 10, 179.00, 30, true, true, "BDT"],
      ["b0000000-0000-0000-0000-000000000003", "Power Pack", 20, 299.00, 30, true, false, "BDT"]
    ];

    for (const ap of aiPacks) {
      await execute(
        `INSERT INTO \`ai_packages\` (\`id\`, \`name\`, \`credits\`, \`price\`, \`validity_days\`, \`is_active\`, \`highlight\`, \`currency\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`price\` = VALUES(\`price\`)`,
        ap
      );
    }
    results.push(`Seeded ${aiPacks.length} AI packages`);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      admin: { email: adminEmail, password: adminPass },
      details: results,
    });
  } catch (error) {
    const errorMsg = error?.message || error?.sqlMessage || error?.code || String(error);
    console.error("Seed Route Error:", errorMsg, error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
