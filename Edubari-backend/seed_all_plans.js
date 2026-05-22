require("dotenv").config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/EdubariClient";
const client = new MongoClient(uri);

async function seed() {
  try {
    await client.connect();
    const db = client.db("EdubariClient");
    const plansCol = db.collection("plans");

    const plans = [
      {
        name: "EduStarter",
        subtitle: "Plan pro minimal typograph",
        price: 565,
        yearlyPrice: 5424,
        features: ["Premium Institution", "Advanced Support", "Overmized Login", "Featured Features"],
        buttonText: "Select Plan",
        type: "regular",
        popular: false,
        active: true,
        createdAt: new Date()
      },
      {
        name: "EduAssist",
        subtitle: "Nirves momminizind typograph",
        price: 775,
        yearlyPrice: 7440,
        popular: true,
        features: ["Premium Institution", "Advanced Support", "Customized Errorcasting", "Overmized Login", "Featured Features", "Money-Back Guarantee"],
        buttonText: "Select Plan",
        type: "regular",
        active: true,
        createdAt: new Date()
      },
      {
        name: "EduGrowth",
        subtitle: "Nuuyvor wowminsad typographs",
        price: "Custom Pricing",
        features: ["Premium Institution", "Advanced Support", "Customized Entoncoting", "Overmized Login", "Featured Features", "Money-Back Guarantee"],
        buttonText: "Contact Sales",
        type: "contact",
        active: true,
        createdAt: new Date()
      },
      {
        name: "EduPro",
        subtitle: "Multi Department, One EduBari",
        price: 1995,
        yearlyPrice: 19152,
        popular: true,
        highlighted: true,
        features: ["Unlimited teachers", "Multiple classes", "Parent portal", "Advanced reports", "Advanced Support"],
        buttonText: "Get Started",
        type: "regular",
        active: true,
        createdAt: new Date()
      },
      {
        name: "EduEnterprise",
        subtitle: "Multi Campus Ecosystem",
        price: "Custom",
        features: ["Unlimited campuses", "Super admin dash", "API Integration", "White-label solution"],
        buttonText: "Contact Sales",
        type: "contact",
        active: true,
        createdAt: new Date()
      },
      {
        name: "Custom Plan",
        subtitle: "Tailored to your needs",
        price: "Quote",
        isDashed: true,
        description: "Looking for a specific set of features? Our team can build a custom package specifically for your unique institutional structure.",
        features: [],
        buttonText: "Request Quote",
        type: "contact",
        active: true,
        createdAt: new Date()
      }
    ];

    await plansCol.deleteMany({}); 
    await plansCol.insertMany(plans);
    console.log("SUCCESS: All 6 plans have been added to the database.");
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await client.close();
  }
}
seed();
