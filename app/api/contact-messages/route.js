import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { sendContactMessageNotificationEmail } from "@/lib/email";

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const mappedMessage = {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      subject: body.subject || null,
      message: body.message,
      read: false
    };

    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .insert([mappedMessage])
      .select();

    if (error) throw error;
    
    // Send email notification to Admin & CC (+ auto-acknowledgment to sender)
    sendContactMessageNotificationEmail(mappedMessage).catch((mailErr) => {
      console.error("Background contact email send error:", mailErr);
    });
    
    return NextResponse.json({ message: "Contact message received", contactMessageId: data[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error creating contact message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
