const mysql = require("mysql2/promise");
const fs = require("fs");
const crypto = require("crypto");

// Load .env if present
if (fs.existsSync("./.env")) {
  const content = fs.readFileSync("./.env", "utf8");
  content.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      if (key && !key.startsWith("#")) {
        process.env[key] = val;
      }
    }
  });
}

const SCRYPT_KEYLEN = 64;
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

async function runSeed() {
  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "edubari_website";

  console.log(`📡 Connecting to MySQL: ${user}@${host}:${port}/${database}...`);

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true,
    });

    console.log("✅ MySQL Connected!");

    // 1. Ensure schema exists if tables missing
    const [tables] = await connection.query("SHOW TABLES");
    if (tables.length === 0) {
      console.log("⚠️ Database is empty! Importing schema_mysql.sql...");
      if (fs.existsSync("./schema_mysql.sql")) {
        const sqlSchema = fs.readFileSync("./schema_mysql.sql", "utf8");
        await connection.query(sqlSchema);
        console.log("✅ Schema & default seed imported from schema_mysql.sql!");
      } else {
        console.error("❌ schema_mysql.sql file not found!");
      }
    }

    // 2. Admin User Seed
    const adminEmail = "botbari@edubari.bd";
    const adminPass = "Edu@@@@1234";
    const adminHash = hashPassword(adminPass);
    const adminId = "3dfd52ed-c3e8-4973-997f-906169626880";

    console.log(`🌱 Seeding Admin user (${adminEmail})...`);
    await connection.query(
      `INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password\`, \`role\`)
       VALUES (?, 'Edubari Admin', ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`password\` = VALUES(\`password\`), \`role\` = 'admin';`,
      [adminId, adminEmail, adminHash]
    );
    console.log(`✅ Admin user seeded! Email: ${adminEmail} | Pass: ${adminPass}`);

    // 3. Package Plans Seed
    console.log("🌱 Seeding SaaS & School ERP Package Plans...");
    const plans = [
      // Single Teacher SaaS Plans
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
      // School ERP Plans
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
      await connection.query(
        `INSERT INTO \`plans\` 
         (\`id\`, \`plan_name\`, \`plan_type\`, \`duration_days\`, \`max_students\`, \`max_instructors\`, \`price\`, \`features\`, \`plan_tier\`, \`max_batches\`, \`monthly_ai_credits\`, \`show_branding\`, \`is_active\`, \`sort_order\`, \`feature_gates\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE \`plan_name\` = VALUES(\`plan_name\`), \`price\` = VALUES(\`price\`), \`features\` = VALUES(\`features\`);`,
        p
      );
    }
    console.log("✅ All Packages & Plans Seeded!");

    // 4. AI Packages Seed
    console.log("🌱 Seeding AI Packages...");
    const aiPacks = [
      ["b0000000-0000-0000-0000-000000000001", "Starter Pack", 5, 99.00, 30, true, false, "BDT"],
      ["b0000000-0000-0000-0000-000000000002", "Pro Pack", 10, 179.00, 30, true, true, "BDT"],
      ["b0000000-0000-0000-0000-000000000003", "Power Pack", 20, 299.00, 30, true, false, "BDT"]
    ];

    for (const ap of aiPacks) {
      await connection.query(
        `INSERT INTO \`ai_packages\` (\`id\`, \`name\`, \`credits\`, \`price\`, \`validity_days\`, \`is_active\`, \`highlight\`, \`currency\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`price\` = VALUES(\`price\`);`,
        ap
      );
    }
    console.log("✅ AI Packages Seeded!");

    await connection.end();
    console.log("\n🎉 ALL SEEDS COMPLETED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Seed Failed:", err);
  }
}

runSeed();
