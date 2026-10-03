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
    // 5. Blog Posts Seed
    console.log("🌱 Seeding 7 Edubari Blog Posts...");
    const sampleBlogPosts = [
      {
        id: "b1000000-0000-0000-0000-000000000001",
        title: "স্মার্ট স্কুল ম্যানেজমেন্ট সিস্টেম: ডিজিটাল বাংলাদেশের শিক্ষাপ্রতিষ্ঠান",
        slug: "smart-school-management-system-future-of-education",
        category: "EdTech",
        cover_image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
        excerpt: "কীভাবে স্মার্ট স্কুল ম্যানেজমেন্ট সিস্টেম এডুবাড়ি ব্যবহার করে আপনার স্কুলের ভর্তি, ফি কালেকশন, এটেন্ডেন্স ও রেজাল্ট অটোমেট করবেন।",
        content: `## ডিজিটাল যুগের শিক্ষাপ্রতিষ্ঠান এবং এডুবাড়ি

একবিংশ শতাব্দীতে শিক্ষা প্রতিষ্ঠান পরিচালনায় ম্যানুয়াল কাগজ-কলমের হিসাব এবং রেজিস্টার খাতা ব্যবহারের দিন শেষ। আধুনিক ডিজিটাল বাংলাদেশে একটি আধুনিক বিদ্যালয় বা কোচিং সেন্টার পরিচালনায় এডুবাড়ি (Edubari) এনেছে যুগান্তকারী সমাধান।

### স্মার্ট স্কুল ম্যানেজমেন্টের মূল সুবিধাসমূহ

- **কেন্দ্রীয় ড্যাশবোর্ড:** এক পলকেই প্রতিষ্ঠানের শিক্ষার্থী, শিক্ষক ও আর্থিক হিসাবের বিবরণ।
- **স্বয়ংক্রিয় এটেন্ডেন্স ও এসএমএস:** অনুপস্থিত শিক্ষার্থীর অভিভাবকের কাছে অটোমেটিক এসএমএস নোটিফিকেশন।
- **অনলাইন ফি আদায়:** বিকাশ, নগদ ও ব্যাংকের মাধ্যমে ফি গ্রহণ এবং ডিজিটাল রসিদ জেনারেশন।

> "প্রযুক্তির সঠিক ব্যবহারে প্রতিষ্ঠানের পরিচালন ব্যয় ৪০% পর্যন্ত কমানো সম্ভব এবং শতভাগ স্বচ্ছতা নিশ্চিত করা যায়।"

## কেন এডুবাড়ি বেছে নেবেন?

এডুবাড়ি শুধু একটি ক্লাউড সফটওয়্যার নয়, এটি আপনার শিক্ষাপ্রতিষ্ঠানের একটি স্মার্ট পার্টনার। খুব সহজ ইন্টারফেস হওয়ায় যেকোনো শিক্ষক বা স্টাফ কয়েক মিনিটেই এটি ব্যবহার শিখতে পারেন।`,
        author_name: "এডুবাড়ি টিম",
        read_time: "4 min read",
        tags: JSON.stringify(["EdTech", "School", "Management", "Digital Learning"]),
        active: true
      },
      {
        id: "b1000000-0000-0000-0000-000000000002",
        title: "ডিজিটাল বায়োমেট্রিক এটেন্ডেন্স ও তাতক্ষণিক অভিভাবক এসএমএস",
        slug: "automated-biometric-digital-attendance-system",
        category: "Attendance",
        cover_image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
        excerpt: "বায়োমেট্রিক এবং আরএফআইডি (RFID) কার্ডের মাধ্যমে শিক্ষার্থীদের নিখুঁত উপস্থিতি নিশ্চিত করুন ও অভিভাবকদের নিশ্চিন্ত রাখুন।",
        content: `## শিক্ষার্থীদের উপস্থিতি নিশ্চিতে ডিজিটাল প্রযুক্তির ভূমিকা

প্রতিনিয়ত শিক্ষার্থীরা যথাসময়ে ক্লাসে পৌঁছাল কিনা তা নিশ্চিত করা অভিভাবক এবং স্কুল কর্তৃপক্ষ উভয়ের জন্যই একটি বড় দুশ্চিন্তার বিষয়। ডিজিটাল বায়োমেট্রিক ও আরএফআইডি পান্চিং সিস্টেমের মাধ্যমে এই সমস্যার স্থায়ী সমাধান করা সম্ভব।

### বায়োমেট্রিক ডিভাইসের কার্যপ্রণালী

১. শিক্ষার্থী স্কুলে প্রবেশ করার সময় ডিভাইসে ফিঙ্গারপ্রিন্ট বা আইডি কার্ড পাঞ্চ করে।
২. এডুবাড়ি ক্লাউড সার্ভার তাৎক্ষণিকভাবে পাঞ্চ করার সময় সার্ভারে ডাটা প্রসেস করে।
৩. অভিভাবকদের মোবাইলে অটোমেটিক এসএমএস চলে যায়: *"আপনার সন্তান সফলভাবে বিদ্যালয়ে প্রবেশ করেছে।"*

> "তাতক্ষণিক অভিভাবক এসএমএস অ্যালার্টের ফলে শিক্ষার্থীদের ক্লাসে উপস্থিতি আগের চেয়ে ৯৫% বৃদ্ধি পায়।"

## উপস্থিতি রিপোর্ট জেনারেশন

শিক্ষকরা এক ক্লিকেই মাস শেষে উপস্থিতি শতাংশ হিসাব করতে পারেন, যা রেজাল্ট কার্ডের সাথে অটোমেটিক যুক্ত হয়ে যায়।`,
        author_name: "সাইফ আহমেদ",
        read_time: "5 min read",
        tags: JSON.stringify(["Attendance", "Biometric", "SMS Alert", "School"]),
        active: true
      },
      {
        id: "b1000000-0000-0000-0000-000000000003",
        title: "অনলাইন ফি কালেকশন ও অটোমেটেড একাউন্টিং সফটওয়্যার",
        slug: "online-fee-collection-automated-financial-management",
        category: "Fee",
        cover_image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
        excerpt: "স্কুল ও ক্যাডেট কলেজের বেতন, পরীক্ষার ফি ও বকেয়া আদায়ে বিকাশ-রকেট-নগদ গেটওয়ে ইন্টিগ্রেশন এবং স্বচ্ছ হিসাবরক্ষণ।",
        content: `## নগদ টাকার ঝামেলা ছাড়াই ডিজিটাল ফি আদায়

টিউশন ফি সংগ্রহে লম্বা লাইন ধরা কিংবা ক্যাশ টাকা হারিয়ে যাওয়ার ঝুঁকি এখন অতীত। এডুবাড়ি অনলাইন ফি কালেকশন মডিউল ব্যবহার করে অভিভাবকরা ঘরে বসেই যেকোনো মোবাইল ব্যাংকিং থেকে স্কুলের ফি প্রদান করতে পারেন।

### এডুবাড়ি ফি মডিউলের আকর্ষণীয় ফিচারসমূহ

- **স্বয়ংক্রিয় বকেয়া রিমাইন্ডার:** মাস শেষে বা পরীক্ষার আগে অভিভাবকদের কাছে বকেয়া ফি এর মানি রিমাইন্ডার মেসেজ।
- **ডিজিটাল ই-রসিদ:** ফি জমাদানের সাথে সাথে অভিভাবকের ফোনে ডাউনলোডযোগ্য ই-রসিদ লিংক পাঠানো।
- **শিক্ষকদের বেতন ও ভাউচার:** প্রতিষ্ঠানের আয়-ব্যয় এবং শিক্ষকদের মাসভিত্তিক স্যালারি রিপোর্ট প্রসেসিং।

> "অনলাইন পেমেন্ট গেটওয়ের মাধ্যমে প্রতিষ্ঠানগুলো গড়ে ৩০% দ্রুত বকেয়া ফি আদায় করতে সক্ষম হয়।"

## স্বচ্ছ রিপোর্ট ও অ্যাকাউন্টস অ্যানালিটিক্স

অ্যাকাউন্ট্যান্ট এক ক্লিকেই দৈনিক, সাপ্তাহিক বা বাৎসরিক আয়-ব্যয়ের লাভ-ক্ষতি স্টেটমেন্ট পিডিএফ (PDF) বা এক্সেল আকারে বের করতে পারেন।`,
        author_name: "তানভীর হোসেন",
        read_time: "6 min read",
        tags: JSON.stringify(["Fee", "Online Payment", "bKash", "Accounting"]),
        active: true
      },
      {
        id: "b1000000-0000-0000-0000-000000000004",
        title: "অটোমেটেড ডিজিটাল রেজাল্ট প্রসেসিং ও গ্রেডশিট জেনারেটর",
        slug: "digital-exam-result-management-system",
        category: "Results",
        cover_image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
        excerpt: "ভুলমুক্ত রেজাল্ট তৈরি, জিপিএ (GPA) গ্রেডিং এবং প্রগ্রেসিভ রিপোর্ট কার্ড মাত্র এক ক্লিকে জেনারেট করার স্মার্ট উপায়।",
        content: `## পরীক্ষা ও রেজাল্ট প্রসেসিংয়ে নতুন দিগন্ত

পরীক্ষার পর শত শত শিক্ষার্থীর নম্বর যোগ করা, জিপিএ হিসাব করা এবং মেরিট লিস্ট সাজানো শিক্ষকদের জন্য একটি অত্যন্ত পরিশ্রমের কাজ। এডুবাড়ির রেজাল্ট ম্যানেজমেন্ট সিস্টেম এই পুরো প্রক্রিয়াকে করে তোলে অবিশ্বাস্য রকম দ্রুত ও নিখুঁত।

### রেজাল্ট সিস্টেমের মূল সুবিধাসমূহ

- **কাস্টম গ্রেডিং স্কেল:** সরকারি জিবিএ নীতি অথবা প্রতিষ্ঠানের নিজস্ব গ্রেডিং রুলস অনুযায়ী হিসাব।
- **ট্যাবুলেশন শীট ও মেরিট লিস্ট:** ক্লাস ও সেকশন ভিত্তিক ১ম, ২য়, ৩য় পজিশন স্বয়ংক্রিয়ভাবে নির্ধারণ।
- **কিউআর কোডসহ ট্রান্সক্রিপ্ট:** নকল প্রতিরোধে রেজাল্ট কার্ডে সিকিউর QR Code যুক্ত করা।

> "এডুবাড়ি ব্যবহারের মাধ্যমে শিক্ষকরা রেজাল্ট তৈরির দীর্ঘ ক্লান্তিকর সময় থেকে মুক্তি পেয়ে পাঠদানে মনোযোগ দিতে পারেন।"

## অনলাইন রেজাল্ট পোর্টাল

শিক্ষার্থী ও অভিভাবকরা নিজ নিজ রোল ও রেজিস্ট্রেশন নম্বর দিয়ে এডুবাড়ি ওয়েবসাইটের রেজাল্ট পোর্টাল থেকে তাৎক্ষণিক রেজাল্ট দেখতে পারেন।`,
        author_name: "ফারজানা চৌধুরী",
        read_time: "5 min read",
        tags: JSON.stringify(["Results", "Exam", "Grade Sheet", "Automation"]),
        active: true
      },
      {
        id: "b1000000-0000-0000-0000-000000000005",
        title: "শিক্ষায় কৃত্রিম বুদ্ধিমত্তা: এআই চালিত স্মার্ট প্রেজেন্টেশন ও লার্নিং",
        slug: "artificial-intelligence-in-modern-school-management",
        category: "AI",
        cover_image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
        excerpt: "এডুবাড়ির ইনবিল্ট AI টুলস দিয়ে কীভাবে শিক্ষকরা চোখের পলকে প্রেজেন্টেশন স্লাইড এবং কুইজ তৈরি করতে পারেন।",
        content: `## আধুনিক শ্রেণীকক্ষে AI প্রযুক্তির বিপ্লব

আর্টিফিশিয়াল ইন্টেলিজেন্স বা কৃত্রিম বুদ্ধিমত্তা এখন আর কল্পবিজ্ঞান নয়, এটি এখন বাস্তব শ্রেণীকক্ষের অঙ্গ। এডুবাড়ি তার প্লাটফর্মে যুক্ত করেছে অত্যাধুনিক AI ইন্টিগ্রেশন।

### এডুবাড়ি AI টুলসের চমকপ্রদ ব্যবহার

- **AI পাওয়ারপয়েন্ট স্লাইড মেকার:** যেকোনো টপিক লিখে দিলে এআই সুন্দর লেআউটসহ স্লাইড তৈরি করে দেয়।
- **স্মার্ট কুইজ ও প্রশ্ন ব্যাংক:** অধ্যায় ভিত্তিক সিলেবাস দিয়ে কয়েক সেকেন্ডে বহুনির্বাচনী বা সৃজনশীল প্রশ্নপত্র তৈরি।
- **লার্নিং অ্যানালিটিক্স:** কোন শিক্ষার্থী কোন বিষয়ে দুর্বল তা এআই অ্যানালাইসিস করে সুপারিশ দেয়।

> "AI প্রযুক্তি শিক্ষককে প্রতিস্থাপন করবে না, কিন্তু যেসব শিক্ষক AI ব্যবহার করবেন তারা অন্যদের চেয়ে শতধাপ এগিয়ে থাকবেন।"

## ভবিষ্যৎ শিক্ষা ব্যবস্থা ও এডুবাড়ি

আমরা বিশ্বাস করি প্রতিটি প্রতিষ্ঠানের কাছে AI প্রযুক্তি সহজলভ্য করা আমাদের মূল লক্ষ্য, যা শিক্ষার্থীদের মেধা বিকাশে যুগান্তকারী ভূমিকা রাখবে।`,
        author_name: "এডুবাড়ি এআই ল্যাব",
        read_time: "4 min read",
        tags: JSON.stringify(["AI", "EdTech", "Digital Learning", "Innovation"]),
        active: true
      },
      {
        id: "b1000000-0000-0000-0000-000000000006",
        title: "অভিভাবক ও শিক্ষকের সরাসরি যোগাযোগ: স্মার্ট নোটিশ ও অ্যাপ পোর্টাল",
        slug: "teacher-parent-instant-communication-portal",
        category: "Teachers",
        cover_image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
        excerpt: "স্কুলের নোটিশ, ছুটির তথ্য, হোমওয়ার্ক এবং জরুরি ঘোষণা মুহূর্তে সব অভিভাবকের কাছে পৌঁছে দেওয়ার উপায়।",
        content: `## শক্তিশালী শিক্ষক-অভিভাবক বন্ধন

একটি প্রতিষ্ঠানের সাফল্যের পেছনে শিক্ষক ও অভিভাবকের পারস্পরিক সুসম্পর্ক ও নিয়মিত যোগাযোগ অপরিহার্য। এডুবাড়ি এনেছে অল-ইন-ওয়ান নোটিশ বোর্ড ও কমিউনিকেশন সিস্টেম।

### কমিউনিকেশন মডিউলের বৈশিষ্ট্যসমূহ

- **বাল্ক এসএমএস গেটওয়ে:** এক ক্লিকে পুরো স্কুল বা নির্দিষ্ট ক্লাসের অভিভাবকদের বার্তা পাঠানো।
- **ডিজিটাল হোমওয়ার্ক ও অ্যাসাইনমেন্ট:** ক্লাসের বিষয় ও বাড়ির কাজ ড্যাশবোর্ডে পোস্ট করার সাথে সাথে নোটিফিকেশন।
- **গার্ডিয়ান পোর্টাল অ্যাপ:** অভিভাবকরা সন্তানের উপস্থিতি, প্রাপ্ত নম্বর এবং ফি বাকি তথ্য লাইভ দেখতে পারেন।

> "সঠিক সময়ে তথ্যের আদান-প্রদান শিক্ষার্থীর একাডেমিক শৃঙ্খলা ও মনোযোগী আচরণ নিশ্চিত করে।"

## কাগজের অপচয় রোধ

কাগজে নোটিশ ছেপে বিতরণ করার দিন শেষ। এডুবাড়ির মাধ্যমে পরিবেশবান্ধব ডিজিটাল নোটিশ বোর্ডে সব আপডেট সংরক্ষিত থাকে।`,
        author_name: "রফিকুল ইসলাম",
        read_time: "4 min read",
        tags: JSON.stringify(["Teachers", "Parents", "SMS Portal", "Notice"]),
        active: true
      },
      {
        id: "b1000000-0000-0000-0000-000000000007",
        title: "অনলাইন রুটিন, অ্যাসাইনমেন্ট সাবমিশন ও ক্লাস সিডিউলিং",
        slug: "online-routine-class-schedule-assignment-management",
        category: "Online Class",
        cover_image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
        excerpt: "শিক্ষক ও শিক্ষার্থীদের সুবিধার্থে রুটিন সংঘাতমুক্ত অনলাইন-অফলাইন ক্লাস শিডিউল এবং ডিজিটালি অ্যাসাইনমেন্ট জমা নেওয়া।",
        content: `## আধুনিক ডিজিটাল ক্লাস রুটিন ও অ্যাসাইনমেন্ট ট্র্যাকিং

প্রতিষ্ঠানে শিক্ষক ও সেকশন বাড়ার সাথে সাথে ক্লাসের সময়সূচি বা রুটিন মিলানো এক জটিল চ্যালেঞ্জ। এডুবাড়ি স্মার্ট রুটিন জেনারেটর এই কাজকে করে দেয় একদম সহজ।

### ডিজিটাল রুটিন ও অ্যাসাইনমেন্টের সুবিধাসমূহ

- **সংঘাতহীন অটো-রুটিন:** একই সময়ে কোন শিক্ষকের দুটি ক্লাস পড়ে যাওয়া রোধ করে।
- **অনলাইন অ্যাসাইনমেন্ট জমা:** শিক্ষার্থীরা পিডিএফ বা ছবি আকারে অ্যাসাইনমেন্ট আপলোড করতে পারে।
- **রেকোর্ডেড ক্লাস ও লাইভ লিঙ্ক:** জুম বা গুগল মিটের লিঙ্ক যুক্ত করে হাইব্রিড ক্লাসের সুব্যবস্থা।

> "ডিজিটাল রুটিন ও অনলাইন পোর্টালের মাধ্যমে লাইভ ক্লাস ও অফলাইন সেশনের সমন্বয় ঘটানো এখন সময়ের সেরা সমাধান।"

## সমাপনী কথা

আজই আপনার শিক্ষাপ্রতিষ্ঠানকে ডিজিটাল করতে এডুবাড়ি ডেমো ট্রায়াল গ্রহণ করুন এবং স্মার্ট স্কুলিং উপভোগ করুন।`,
        author_name: "এডুবাড়ি টেক টিম",
        read_time: "5 min read",
        tags: JSON.stringify(["Online Class", "Routine", "Assignment", "Students"]),
        active: true
      }
    ];

    for (const post of sampleBlogPosts) {
      await connection.query(
        `INSERT INTO \`blog_posts\` 
         (\`id\`, \`title\`, \`slug\`, \`category\`, \`cover_image\`, \`excerpt\`, \`content\`, \`author_name\`, \`read_time\`, \`tags\`, \`active\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`), \`cover_image\` = VALUES(\`cover_image\`), \`content\` = VALUES(\`content\`);`,
        [post.id, post.title, post.slug, post.category, post.cover_image, post.excerpt, post.content, post.author_name, post.read_time, post.tags, post.active]
      );
    }
    console.log("✅ 7 Blog Posts Seeded!");

    await connection.end();
    console.log("\n🎉 ALL SEEDS COMPLETED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Seed Failed:", err);
  }
}

runSeed();
