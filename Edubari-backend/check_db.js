const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://masumaakterakhi:Admin123@mycluster.jrulyye.mongodb.net/EdubariClient?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("EdubariClient");
    const collections = await database.listCollections().toArray();
    console.log("Collections in EdubariClient:", collections.map(c => c.name));

    const blogPosts = await database.collection("blogPosts").find({}).toArray();
    console.log("Total Blog Posts found:", blogPosts.length);
    if(blogPosts.length > 0) {
        console.log("First Blog Title:", blogPosts[0].title);
    }
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
