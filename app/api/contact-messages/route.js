import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendContactMessageNotificationEmail } from "@/lib/email";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value, max) => (value === undefined || value === null ? null : String(value).trim().slice(0, max)) || null;

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const data = await query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching contact messages:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const mappedMessage = {
      id: crypto.randomUUID(),
      name: text(body.name, 255),
      email: text(body.email, 255),
      phone: text(body.phone, 50),
      subject: text(body.subject, 255),
      message: text(body.message, 10000),
      read: false,
    };
    if (!mappedMessage.name || !mappedMessage.message || !mappedMessage.email || !EMAIL.test(mappedMessage.email)) {
      return NextResponse.json({ error: "Name, a valid email and a message are required" }, { status: 400 });
    }

    await execute(
      "INSERT INTO contact_messages (id, name, email, phone, subject, message, read) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [mappedMessage.id, mappedMessage.name, mappedMessage.email, mappedMessage.phone, mappedMessage.subject, mappedMessage.message, mappedMessage.read]
    );

    // Send email notification to Admin & CC (+ auto-acknowledgment to sender)
    sendContactMessageNotificationEmail(mappedMessage).catch((mailErr) => {
      console.error("Background contact email send error:", mailErr);
    });

    return NextResponse.json({ message: "Contact message received", contactMessageId: mappedMessage.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating contact message:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
