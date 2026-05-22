const { MongoClient } = require("mongodb");
require("dotenv").config();

// Backend-er actual URI theke database name parse kora holo
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/EdubariClient";
const client = new MongoClient(uri);

const blogs = [
  {
    title: "How School Management Software Improves Efficiency and Productivity",
    slug: "school-management-software-efficiency",
    excerpt: "Explore how automation and digital transformation can reduce manual work and improve overall institutional efficiency.",
    category: "School Management",
    author: { name: "Sarah Johnson", avatar: "SJ" },
    date: "May 20, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2026&auto=format&fit=crop",
    body: "### Efficiency in Education\nModern software solutions are transforming how schools operate...",
    createdAt: new Date()
  },
  {
    title: "10 Ways to Streamline School Administration",
    slug: "streamline-school-administration",
    excerpt: "Practical strategies that help administrators save time, reduce paperwork, and focus on what matters most.",
    category: "School Management",
    author: { name: "Michael Brown", avatar: "MB" },
    date: "May 18, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1523240715639-99a26362193b?q=80&w=2070&auto=format&fit=crop",
    body: "### Streamlining Admin Tasks\nFrom automated attendance to digital gradebooks...",
    createdAt: new Date()
  },
  {
    title: "Improving Student Performance with Data-Driven Insights",
    slug: "improving-student-performance-data",
    excerpt: "Learn how data analytics helps teachers identify weak areas and improve learning outcomes for every student.",
    category: "Student Success",
    author: { name: "Emma Davis", avatar: "ED" },
    date: "May 15, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=2070&auto=format&fit=crop",
    body: "### Data-Driven Education\nUsing analytics to track student progress is the future...",
    createdAt: new Date()
  },
  {
    title: "Why Data Security is Crucial for Educational Institutions",
    slug: "data-security-educational-institutions",
    excerpt: "Understand the importance of protecting student and institution data in the digital age and how to stay safe.",
    category: "Technology",
    author: { name: "James Wilson", avatar: "JW" },
    date: "May 14, 2026",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
    body: "### Security Matters\nProtecting sensitive data is a top priority for any digital school...",
    createdAt: new Date()
  },
  {
    title: "Strengthening Parent-Teacher Communication in Schools",
    slug: "strengthening-parent-teacher-communication",
    excerpt: "Best practices and tools to build strong connections between parents and teachers for student development.",
    category: "Tips & Guide",
    author: { name: "Olivia Martin", avatar: "OM" },
    date: "May 12, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop",
    body: "### Better Communication\nBridging the gap between home and school is essential...",
    createdAt: new Date()
  }
];

async function run() {
  try {
    await client.connect();
    // Database name 'EdubariClient' specifically use kora holo
    const database = client.db("EdubariClient");
    const blogPostsCollection = database.collection("blogPosts");
    
    await blogPostsCollection.deleteMany({});
    await blogPostsCollection.insertMany(blogs);
    console.log("Database seeded successfully in EdubariClient!");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
