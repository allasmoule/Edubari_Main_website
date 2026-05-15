require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;
const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");

try {
  if (serviceAccount.project_id && serviceAccount.project_id !== "...") {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized successfully.");
  } else {
    console.log("ℹ️ Running in Development Mode (Firebase Auth Bypassed)");
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error.message);
}

const smtpPort = Number(process.env.SMTP_PORT || 587);
const hasMailConfig =
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.CONTACT_RECEIVER_EMAIL;

const mailTransporter = hasMailConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

const verifyAccessToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // If Firebase is not initialized, allow access in development
  if (!admin.apps.length || (serviceAccount.project_id === "..." || !serviceAccount.project_id)) {
    // console.warn("Dev Mode: Skipping token verification");
    req.user_Email = "dev@example.com"; // Mock user for development
    return next();
  }

  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  try {
    const userInfo = await admin.auth().verifyIdToken(token);
    req.user_Email = userInfo.email;
    next();
  } catch (error) {
    // Even if token is invalid, let it pass in local dev if you want, 
    // but for now we keep it strict if Firebase IS initialized.
    return res.status(401).send({ message: "Invalid token" });
  }
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("EdubariClient");
    const plansCollection = database.collection("plans");
    const subscriptionsCollection = database.collection("subscriptions");

    // Get all plans
    app.get("/plans", async (req, res) => {
      try {
        const plans = await plansCollection.find({}).toArray();
        res.json(plans);
      } catch (error) {
        console.error("Error fetching plans:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/plans/:id", async (req, res) => {
      try {
        const planId = req.params.id;
        const plan = await plansCollection.findOne({
          _id: new ObjectId(planId),
        });
        if (plan) {
          res.json(plan);
        } else {
          res.status(404).json({ error: "Plan not found" });
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.post("/plans", verifyAccessToken, async (req, res) => {
      try {
        const newPlan = req.body;
        const result = await plansCollection.insertOne(newPlan);
        res
          .status(201)
          .json({ message: "Plan created", planId: result.insertedId });
      } catch (error) {
        console.error("Error creating plan:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.patch("/plans/:id", verifyAccessToken, async (req, res) => {
      try {
        const planId = req.params.id;
        const updatedPlan = req.body;
        const result = await plansCollection.updateOne(
          { _id: new ObjectId(planId) },
          { $set: updatedPlan },
        );
        if (result.matchedCount > 0) {
          res.json({ message: "Plan updated" });
        } else {
          res.status(404).json({ error: "Plan not found" });
        }
      } catch (error) {
        console.error("Error updating plan:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.delete("/plans/:id", verifyAccessToken, async (req, res) => {
      try {
        const planId = req.params.id;
        const result = await plansCollection.deleteOne({
          _id: new ObjectId(planId),
        });
        if (result.deletedCount > 0) {
          res.json({ message: "Plan deleted" });
        } else {
          res.status(404).json({ error: "Plan not found" });
        }
      } catch (error) {
        console.error("Error deleting plan:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //Work Proof
    const workProofCollection = database.collection("workProof");
    app.get("/workProof", async (req, res) => {
      try {
        const workProofs = await workProofCollection.find({}).toArray();
        res.json(workProofs);
      } catch (error) {
        console.error("Error fetching work proofs:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/workProof/:id", async (req, res) => {
      try {
        const workProofId = req.params.id;
        const workProof = await workProofCollection.findOne({
          _id: new ObjectId(workProofId),
        });
        if (workProof) {
          res.json(workProof);
        } else {
          res.status(404).json({ error: "Work proof not found" });
        }
      } catch (error) {
        console.error("Error fetching work proof:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.post("/workProof", verifyAccessToken, async (req, res) => {
      try {
        const newWorkProof = req.body;
        const result = await workProofCollection.insertOne(newWorkProof);
        res.status(201).json({
          message: "Work proof created",
          workProofId: result.insertedId,
        });
      } catch (error) {
        console.error("Error creating work proof:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.patch("/workProof/:id", verifyAccessToken, async (req, res) => {
      try {
        const workProofId = req.params.id;
        const updatedWorkProof = { ...req.body };
        delete updatedWorkProof._id; // Prevent MongoDB error by removing _id
        
        const result = await workProofCollection.updateOne(
          { _id: new ObjectId(workProofId) },
          { $set: updatedWorkProof },
        );

        if (result.matchedCount > 0) {
          res.json({ message: "Work proof updated" });
        } else {
          res.status(404).json({ error: "Work proof not found" });
        }
      } catch (error) {
        console.error("Error updating work proof:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.delete("/workProof/:id", verifyAccessToken, async (req, res) => {
      try {
        const workProofId = req.params.id;
        const result = await workProofCollection.deleteOne({
          _id: new ObjectId(workProofId),
        });
        if (result.deletedCount > 0) {
          res.json({ message: "Work proof deleted" });
        } else {
          res.status(404).json({ error: "Work proof not found" });
        }
      } catch (error) {
        console.error("Error deleting work proof:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //Users
    // const usersCollection = database.collection("users");
    // app.get("/users", async (req, res) => {
    //   try {
    //     const users = await usersCollection.find({}).toArray();
    //     res.json(users);
    //   } catch (error) {
    //     console.error("Error fetching users:", error);
    //     res.status(500).json({ error: "Internal Server Error" });
    //   }
    // });

    // app.get("/users/:id", async (req, res) => {
    //   try {
    //     const userId = req.params.id;
    //     const user = await usersCollection.findOne({
    //       _id: new ObjectId(userId),
    //     });
    //     if (user) {
    //       res.json(user);
    //     } else {
    //       res.status(404).json({ error: "User not found" });
    //     }
    //   } catch (error) {
    //     console.error("Error fetching user:", error);
    //     res.status(500).json({ error: "Internal Server Error" });
    //   }
    // });

    // app.post("/users", async (req, res) => {
    //   try {
    //     const newUser = req.body;
    //     const result = await usersCollection.insertOne(newUser);
    //     res
    //       .status(201)
    //       .json({ message: "User created", userId: result.insertedId });
    //   } catch (error) {
    //     console.error("Error creating user:", error);
    //     res.status(500).json({ error: "Internal Server Error" });
    //   }
    // });

    // app.patch("/users/:id", async (req, res) => {
    //   try {
    //     const userId = req.params.id;
    //     const updatedUser = req.body;
    //     const result = await usersCollection.updateOne(
    //       { _id: new ObjectId(userId) },
    //       { $set: updatedUser },
    //     );
    //     if (result.matchedCount > 0) {
    //       res.json({ message: "User updated" });
    //     } else {
    //       res.status(404).json({ error: "User not found" });
    //     }
    //   } catch (error) {
    //     console.error("Error updating user:", error);
    //     res.status(500).json({ error: "Internal Server Error" });
    //   }
    // });

    // app.delete("/users/:id", async (req, res) => {
    //   try {
    //     const userId = req.params.id;
    //     const result = await usersCollection.deleteOne({
    //       _id: new ObjectId(userId),
    //     });
    //     if (result.deletedCount > 0) {
    //       res.json({ message: "User deleted" });
    //     } else {
    //       res.status(404).json({ error: "User not found" });
    //     }
    //   } catch (error) {
    //     console.error("Error deleting user:", error);
    //     res.status(500).json({ error: "Internal Server Error" });
    //   }
    // });

    // User Reviews
    const reviewsCollection = database.collection("reviews");
    app.get("/reviews", async (req, res) => {
      try {
        const reviews = await reviewsCollection.find({}).toArray();
        res.json(reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/reviews/:id", async (req, res) => {
      try {
        const reviewId = req.params.id;
        const review = await reviewsCollection.findOne({
          _id: new ObjectId(reviewId),
        });
        if (review) {
          res.json(review);
        } else {
          res.status(404).json({ error: "Review not found" });
        }
      } catch (error) {
        console.error("Error fetching review:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.post("/reviews", verifyAccessToken, async (req, res) => {
      try {
        const newReview = req.body;
        const result = await reviewsCollection.insertOne(newReview);
        res
          .status(201)
          .json({ message: "Review created", reviewId: result.insertedId });
      } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.patch("/reviews/:id", verifyAccessToken, async (req, res) => {
      try {
        const reviewId = req.params.id;
        const updatedReview = { ...req.body };
        delete updatedReview._id; // Remove _id if it exists to prevent MongoDB error
        
        const result = await reviewsCollection.updateOne(
          { _id: new ObjectId(reviewId) },
          { $set: updatedReview },
        );

        if (result.matchedCount > 0) {
          res.json({ message: "Review updated" });
        } else {
          res.status(404).json({ error: "Review not found" });
        }
      } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.delete("/reviews/:id", verifyAccessToken, async (req, res) => {
      try {
        const reviewId = req.params.id;
        const result = await reviewsCollection.deleteOne({
          _id: new ObjectId(reviewId),
        });
        if (result.deletedCount > 0) {
          res.json({ message: "Review deleted" });
        } else {
          res.status(404).json({ error: "Review not found" });
        }
      } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Newsletter Subscriptions
    
    app.post("/subscribe", async (req, res) => {

      try {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ error: "Email is required" });
        }

        // Check if already subscribed
        const existing = await subscriptionsCollection.findOne({ email });
        if (existing) {
          return res.status(400).json({ error: "Email already subscribed" });
        }

        const result = await subscriptionsCollection.insertOne({
          email,
          subscribedAt: new Date(),
        });

        res.status(201).json({ message: "Successfully subscribed", id: result.insertedId });
      } catch (error) {
        console.error("Error in subscription:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/subscriptions", verifyAccessToken, async (req, res) => {
      try {
        const subscribers = await subscriptionsCollection
          .find({})
          .sort({ subscribedAt: -1 })
          .toArray();
        res.json(subscribers);
      } catch (error) {
        console.error("Error fetching subscribers:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.delete("/subscriptions/:id", verifyAccessToken, async (req, res) => {
      try {
        const id = req.params.id;
        const result = await subscriptionsCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount > 0) {
          res.json({ message: "Subscriber removed" });
        } else {
          res.status(404).json({ error: "Subscriber not found" });
        }
      } catch (error) {
        console.error("Error deleting subscriber:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //Blog Posts
    
    const blogPostsCollection = database.collection("blogPosts");
    app.get("/blogPosts", async (req, res) => {
      try {
        const blogPosts = await blogPostsCollection
          .find({})
          .sort({ createdAt: -1, _id: -1 })
          .toArray();
        console.log(`[GET /blogPosts] Found ${blogPosts.length} posts`);
        res.json(blogPosts);

      } catch (error) {
        console.error("Error fetching blog posts:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/blogPosts/:id", async (req, res) => {
      try {
        const blogPostId = req.params.id;
        const blogPost = await blogPostsCollection.findOne({
          _id: new ObjectId(blogPostId),
        });
        if (blogPost) {
          res.json(blogPost);
        } else {
          res.status(404).json({ error: "Blog post not found" });
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.post("/blogPosts", verifyAccessToken, async (req, res) => {
      try {
        const newBlogPost = {
          ...req.body,
          createdAt: req.body.createdAt || new Date(),
        };
        const result = await blogPostsCollection.insertOne(newBlogPost);
        res.status(201).json({
          message: "Blog post created",
          blogPostId: result.insertedId,
        });
      } catch (error) {
        console.error("Error creating blog post:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.patch("/blogPosts/:id", verifyAccessToken, async (req, res) => {
      try {
        const blogPostId = req.params.id;
        const updatedBlogPost = { ...req.body };
        delete updatedBlogPost._id;
        
        const result = await blogPostsCollection.updateOne(
          { _id: new ObjectId(blogPostId) },
          { $set: updatedBlogPost },
        );

        if (result.matchedCount > 0) {
          res.json({ message: "Blog post updated" });
        } else {
          res.status(404).json({ error: "Blog post not found" });
        }
      } catch (error) {
        console.error("Error updating blog post:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.delete("/blogPosts/:id", verifyAccessToken, async (req, res) => {
      try {
        const blogPostId = req.params.id;
        const result = await blogPostsCollection.deleteOne({
          _id: new ObjectId(blogPostId),
        });
        if (result.deletedCount > 0) {
          res.json({ message: "Blog post deleted" });
        } else {
          res.status(404).json({ error: "Blog post not found" });
        }
      } catch (error) {
        console.error("Error deleting blog post:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //Contact Messages
    const contactMessagesCollection = database.collection("contactMessages");

    app.get("/contactMessages", verifyAccessToken, async (req, res) => {
      try {
        const contactMessages = await contactMessagesCollection
          .find({})
          .sort({ createdAt: -1, _id: -1 })
          .toArray();
        res.json(contactMessages);
      } catch (error) {
        console.error("Error fetching contact messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/contactMessages/:id", verifyAccessToken, async (req, res) => {
      try {
        const contactMessageId = req.params.id;
        const contactMessage = await contactMessagesCollection.findOne({
          _id: new ObjectId(contactMessageId),
        });
        if (contactMessage) {
          res.json(contactMessage);
        } else {
          res.status(404).json({ error: "Contact message not found" });
        }
      } catch (error) {
        console.error("Error fetching contact message:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.post("/contactMessages", async (req, res) => {
      try {
        const newContactMessage = {
          ...req.body,
          createdAt: new Date(),
        };
        const result =
          await contactMessagesCollection.insertOne(newContactMessage);

        if (mailTransporter) {
          const { name, email, subject, message, phone } = newContactMessage;
          const fallbackSubject = "New Contact Inquiry";
          const mailSubject = subject || fallbackSubject;
          const safeName = escapeHtml(name || "N/A");
          const safeEmail = escapeHtml(email || "N/A");
          const safePhone = escapeHtml(phone || "N/A");
          const safeSubject = escapeHtml(mailSubject);
          const safeMessage = escapeHtml(message || "N/A").replace(
            /\n/g,
            "<br>",
          );

          const mailText = [
            "A new contact inquiry has been received.",
            "",
            `Name: ${name || "N/A"}`,
            `Email: ${email || "N/A"}`,
            `Phone: ${phone || "N/A"}`,
            "",
            `Subject: ${mailSubject}`,
            "",
            `Message: ${message || "N/A"}`,
            "",
            "This notification was generated automatically by the Edubari website.",
          ].join("\n");

          const mailHtml = `
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
              <div style="background: #0f172a; color: #ffffff; padding: 18px 22px;">
                <h2 style="margin: 0; font-size: 20px;">New Contact Inquiry</h2>
                <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Edubari Website Notification</p>
              </div>
              <div style="padding: 22px; background: #ffffff;">
                <p style="margin-top: 0;">A visitor submitted the contact form with the following details:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 12px 0 18px;">
                  <tr>
                    <td style="padding: 8px 0; width: 120px; color: #6b7280;"><strong>Name</strong></td>
                    <td style="padding: 8px 0;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;"><strong>Email</strong></td>
                    <td style="padding: 8px 0;">${safeEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;"><strong>Phone</strong></td>
                    <td style="padding: 8px 0;">${safePhone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;"><strong>Subject</strong></td>
                    <td style="padding: 8px 0;">${safeSubject}</td>
                  </tr>
                </table>
                <div style="margin-top: 8px;">
                  <p style="margin: 0 0 8px;"><strong>Message</strong></p>
                  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; white-space: normal;">
                    ${safeMessage}
                  </div>
                </div>
              </div>
              <div style="padding: 14px 22px; font-size: 12px; color: #6b7280; background: #f8fafc; border-top: 1px solid #e5e7eb;">
                This email was generated automatically by the Edubari contact system.
              </div>
            </div>
          `;

          const mailOptions = {
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to: process.env.CONTACT_RECEIVER_EMAIL,
            replyTo: email || undefined,
            subject: `Edubari Contact Form: ${mailSubject}`,
            text: mailText,
            html: mailHtml,
          };

          // Send email outside the request path so form submission stays fast.
          setImmediate(async () => {
            try {
              const mailInfo = await mailTransporter.sendMail(mailOptions);
              // console.log(
              //   "Contact notification email sent successfully:",
              //   mailInfo.messageId,
              // );
            } catch (mailError) {
              console.error(
                "Error sending contact notification email:",
                mailError,
              );
            }
          });
        }

        res.status(201).json({
          message: "Contact message received",
          contactMessageId: result.insertedId,
        });
      } catch (error) {
        console.error("Error creating contact message:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.patch("/contactMessages/:id", async (req, res) => {
      try {
        const contactMessageId = req.params.id;
        const updatedContactMessage = req.body || {};

        const existingContactMessage = await contactMessagesCollection.findOne({
          _id: new ObjectId(contactMessageId),
        });

        if (!existingContactMessage) {
          return res.status(404).json({ error: "Contact message not found" });
        }

        const hasResponseUpdate =
          typeof updatedContactMessage.response === "string" &&
          updatedContactMessage.response.trim() !== "" &&
          updatedContactMessage.response !== existingContactMessage.response;

        const repliedAtValue = hasResponseUpdate
          ? updatedContactMessage.repliedAt || new Date()
          : updatedContactMessage.repliedAt;

        if (hasResponseUpdate && !updatedContactMessage.repliedAt) {
          updatedContactMessage.repliedAt = repliedAtValue;
        }

        const result = await contactMessagesCollection.updateOne(
          { _id: new ObjectId(contactMessageId) },
          { $set: updatedContactMessage },
        );

        if (
          hasResponseUpdate &&
          mailTransporter &&
          typeof existingContactMessage.email === "string" &&
          existingContactMessage.email.trim() !== ""
        ) {
          const customerName = existingContactMessage.name || "Customer";
          const inquirySubject =
            existingContactMessage.subject || "Your recent contact inquiry";
          const originalMessage = existingContactMessage.message || "N/A";
          const replyMessage = updatedContactMessage.response;

          const safeCustomerName = escapeHtml(customerName);
          const safeInquirySubject = escapeHtml(inquirySubject);
          const safeOriginalMessage = escapeHtml(originalMessage).replace(
            /\n/g,
            "<br>",
          );
          const safeReplyMessage = escapeHtml(replyMessage).replace(
            /\n/g,
            "<br>",
          );

          const userMailText = [
            `Hello ${customerName},`,
            "",
            "We have posted an update to your contact request.",
            "",
            `Subject: ${inquirySubject}`,
            "",
            "Your Message:",
            originalMessage,
            "",
            "Our Response:",
            replyMessage,
            "",
            "Thank you,",
            "Edubari Support Team",
          ].join("\n");

          const userMailHtml = `
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
              <div style="background: #0f172a; color: #ffffff; padding: 18px 22px;">
                <h2 style="margin: 0; font-size: 20px;">Your Contact Request Has Been Updated</h2>
                <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Edubari Support Update</p>
              </div>
              <div style="padding: 22px; background: #ffffff;">
                <p style="margin-top: 0;">Hello ${safeCustomerName},</p>
                <p>We have posted an update to your contact request.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 12px 0 18px;">
                  <tr>
                    <td style="padding: 8px 0; width: 130px; color: #6b7280;"><strong>Subject</strong></td>
                    <td style="padding: 8px 0;">${safeInquirySubject}</td>
                  </tr>
                </table>
                <p style="margin: 0 0 8px;"><strong>Your Message</strong></p>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
                  ${safeOriginalMessage}
                </div>
                <p style="margin: 0 0 8px;"><strong>Our Response</strong></p>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                  ${safeReplyMessage}
                </div>
              </div>
              <div style="padding: 14px 22px; font-size: 12px; color: #6b7280; background: #f8fafc; border-top: 1px solid #e5e7eb;">
                Thank you for contacting Edubari.
              </div>
            </div>
          `;

          const userMailOptions = {
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to: existingContactMessage.email,
            replyTo:
              process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER,
            subject: `Update on Your Edubari Inquiry: ${inquirySubject}`,
            text: userMailText,
            html: userMailHtml,
          };

          setImmediate(async () => {
            try {
              const userMailInfo =
                await mailTransporter.sendMail(userMailOptions);
              console.log(
                "Contact response update email sent successfully:",
                userMailInfo.messageId,
              );
            } catch (mailError) {
              console.error(
                "Error sending contact response update email:",
                mailError,
              );
            }
          });
        }

        if (result.matchedCount > 0) {
          res.json({ message: "Contact message updated" });
        } else {
          res.status(404).json({ error: "Contact message not found" });
        }
      } catch (error) {
        console.error("Error updating contact message:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.delete("/contactMessages/:id", verifyAccessToken, async (req, res) => {
      try {
        const contactMessageId = req.params.id;
        const result = await contactMessagesCollection.deleteOne({
          _id: new ObjectId(contactMessageId),
        });
        if (result.deletedCount > 0) {
          res.json({ message: "Contact message deleted" });
        } else {
          res.status(404).json({ error: "Contact message not found" });
        }
      } catch (error) {
        console.error("Error deleting contact message:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //Home Page Banners
    const bannersCollection = database.collection("banners");
    app.get("/banners", async (req, res) => {
      try {
        const banners = await bannersCollection.find({}).toArray();
        res.json(banners);
      } catch (error) {
        console.error("Error fetching banners:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/banners/:id", async (req, res) => {
      try {
        const bannerId = req.params.id;
        const banner = await bannersCollection.findOne({
          _id: new ObjectId(bannerId),
        });
        if (banner) {
          res.json(banner);
        } else {
          res.status(404).json({ error: "Banner not found" });
        }
      } catch (error) {
        console.error("Error fetching banner:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.post("/banners", verifyAccessToken, async (req, res) => {
      try {
        const newBanner = req.body;
        const result = await bannersCollection.insertOne(newBanner);
        res.status(201).json({
          message: "Banner created",
          bannerId: result.insertedId,
        });
      } catch (error) {
        console.error("Error creating banner:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.patch("/banners/:id", verifyAccessToken, async (req, res) => {
      try {
        const bannerId = req.params.id;
        const updatedBanner = req.body;
        const result = await bannersCollection.updateOne(
          { _id: new ObjectId(bannerId) },
          { $set: updatedBanner },
        );
        if (result.matchedCount > 0) {
          res.json({ message: "Banner updated" });
        } else {
          res.status(404).json({ error: "Banner not found" });
        }
      } catch (error) {
        console.error("Error updating banner:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.delete("/banners/:id", verifyAccessToken, async (req, res) => {
      try {
        const bannerId = req.params.id;
        const result = await bannersCollection.deleteOne({
          _id: new ObjectId(bannerId),
        });
        if (result.deletedCount > 0) {
          res.json({ message: "Banner deleted" });
        }
          else {
          res.status(404).json({ error: "Banner not found" });
        }
      } catch (error) {
        console.error("Error deleting banner:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });


    //Subscribtions
    app.get("/subscriptions", verifyAccessToken, async (req, res) => {
      try {
        const subscriptions = await subscriptionsCollection.find({}).toArray();
        res.json(subscriptions);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/subscriptions/:id", verifyAccessToken, async (req, res) => {
      try {
        const subscriptionId = req.params.id;
        const subscription = await subscriptionsCollection.findOne({
          _id: new ObjectId(subscriptionId),
        });
        if (subscription) {
          res.json(subscription);
        } else {
          res.status(404).json({ error: "Subscription not found" });
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.post("/subscriptions", async (req, res) => {
      try {
        const newSubscription = req.body;
        const result = await subscriptionsCollection.insertOne(newSubscription);
        res.status(201).json({
          message: "Subscription created",
          subscriptionId: result.insertedId,
        });
      } catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.patch("/subscriptions/:id", verifyAccessToken, async (req, res) => {
      try {        const subscriptionId = req.params.id;
        const updatedSubscription = req.body;
        const result = await subscriptionsCollection.updateOne(
          { _id: new ObjectId(subscriptionId) },
          { $set: updatedSubscription },
        );
        if (result.matchedCount > 0) {
          res.json({ message: "Subscription updated" });
        }
          else {
          res.status(404).json({ error: "Subscription not found" });
        }
      } catch (error) {
        console.error("Error updating subscription:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.delete("/subscriptions/:id", verifyAccessToken, async (req, res) => {
      try {
        const subscriptionId = req.params.id;
        const result = await subscriptionsCollection.deleteOne({
          _id: new ObjectId(subscriptionId),
        });
        if (result.deletedCount > 0) {
          res.json({ message: "Subscription deleted" });
        } else {
          res.status(404).json({ error: "Subscription not found" });
        }
      } catch (error) {
        console.error("Error deleting subscription:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
