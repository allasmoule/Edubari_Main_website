import nodemailer from "nodemailer";

/**
 * Creates and caches the Nodemailer transporter instance.
 */
function getTransporter() {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT) || 465;
  const user = process.env.EMAIL_USER || "support.edubari@gmail.com";
  let pass = process.env.EMAIL_APP_PASS || "";
  pass = pass.replace(/^["']|["']$/g, "").trim();

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    // Certificate checks stay on: without them anyone on the network path could read the SMTP password
  });
}

/**
 * Admin recipients list from environment variables.
 */
function getAdminRecipients() {
  const to = process.env.EMAIL_TO || process.env.EMAIL_USER || "support.edubari@gmail.com";
  const ccRaw = process.env.EMAIL_CC || "";
  const cc = ccRaw
    .split(",")
    .map((e) => e.trim())
    .filter((e) => Boolean(e) && e.includes("@"));

  return { to, cc };
}

/**
 * Common HTML email wrapper with EduBari branding.
 */
function emailWrapper({ title, badge, badgeColor = "#4F46E5", contentHtml, footerNote }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #8b5cf6 100%); padding: 32px 30px; text-align: left;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                      EduBari<span style="color: #f59e0b;">.</span>
                    </div>
                    <div style="font-size: 13px; color: #e0e7ff; font-weight: 500; margin-top: 4px;">
                      Smart Education Management Platform
                    </div>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.3);">
                      ${badge || "NOTIFICATION"}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 30px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                ${title}
              </h1>
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">
                EduBari Automated Notification System
              </p>
              <p style="margin: 0; line-height: 1.5;">
                ${footerNote || "This is an automated system email from edubari.bd. For support, contact support.edubari@gmail.com"}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 1. SEND ORDER NOTIFICATION (Admin & Optional Customer Copy)
 */
export async function sendOrderNotificationEmail(order) {
  try {
    const transporter = getTransporter();
    const { to, cc } = getAdminRecipients();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "edubari.bd";

    const instName = order.institutionName || order.institution_name || order.domain || "N/A";
    const clientName = order.fullName || order.full_name || order.name || order.userName || "N/A";
    const clientEmail = order.email || "N/A";
    const clientPhone = order.phone || order.userPhone || "N/A";
    const domain = order.preferredDomain || order.preferred_domain || order.domain || "N/A";
    const address = order.address || "N/A";
    const planName = order.selectedPlanName || order.selected_plan_name || order.packageName || "N/A";
    const planDuration = order.selectedPlanDuration || order.selected_plan_duration || "N/A";
    const price = Number(order.selectedPlanPrice || order.selected_plan_price || order.price || 0);
    const paymentMethod = order.paymentMethod || order.payment_method || "Direct Order (No Payment)";
    const orderId = order.subscriptionId || order.id || "EB-" + Date.now();

    const formattedPrice = price > 0 ? `৳${price.toLocaleString()}` : "Free / Trial / Contact";
    const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });

    const adminContent = `
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 0;">
        A new institution subscription order has been submitted on <strong>${siteUrl}</strong>. It has been recorded in the Admin Dashboard.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0; overflow: hidden; font-size: 13px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; width: 35%; border-bottom: 1px solid #e2e8f0;">Order / Reference ID:</td>
          <td style="padding: 12px 16px; font-weight: 800; color: #4f46e5; border-bottom: 1px solid #e2e8f0;">${orderId}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Institution Name:</td>
          <td style="padding: 12px 16px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${instName}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Contact Person:</td>
          <td style="padding: 12px 16px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Phone Number:</td>
          <td style="padding: 12px 16px; font-weight: 700; color: #0284c7; border-bottom: 1px solid #e2e8f0;">
            <a href="tel:${clientPhone}" style="color: #0284c7; text-decoration: none;">${clientPhone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Email Address:</td>
          <td style="padding: 12px 16px; font-weight: 600; color: #0284c7; border-bottom: 1px solid #e2e8f0;">
            <a href="mailto:${clientEmail}" style="color: #0284c7; text-decoration: none;">${clientEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Domain Requested:</td>
          <td style="padding: 12px 16px; font-family: monospace; font-weight: 700; color: #7c3aed; border-bottom: 1px solid #e2e8f0;">${domain}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Selected Plan:</td>
          <td style="padding: 12px 16px; font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Plan Price:</td>
          <td style="padding: 12px 16px; font-weight: 800; color: #059669; font-size: 15px; border-bottom: 1px solid #e2e8f0;">${formattedPrice}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Duration:</td>
          <td style="padding: 12px 16px; font-weight: 600; color: #334155; border-bottom: 1px solid #e2e8f0;">${planDuration}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Payment Method:</td>
          <td style="padding: 12px 16px; font-weight: 700; color: #d97706; border-bottom: 1px solid #e2e8f0;">${paymentMethod}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Address:</td>
          <td style="padding: 12px 16px; font-weight: 500; color: #475569; border-bottom: 1px solid #e2e8f0;">${address}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b;">Order Time:</td>
          <td style="padding: 12px 16px; font-weight: 500; color: #64748b;">${timestamp} (BDT)</td>
        </tr>
      </table>

      <div style="margin-top: 24px; text-align: center;">
        <a href="https://${siteUrl}/admin/dashboard/subscriptions" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
          View In Admin Panel →
        </a>
      </div>
    `;

    const adminHtml = emailWrapper({
      title: `🛍️ New Order Received: ${instName} (${planName})`,
      badge: "NEW ORDER",
      badgeColor: "#10B981",
      contentHtml: adminContent,
      footerNote: "New order alert automatically dispatched to administrators.",
    });

    // 1. Send to Admin & CC
    const adminMailPromise = transporter.sendMail({
      from: `"EduBari Orders" <${process.env.EMAIL_USER || "support.edubari@gmail.com"}>`,
      to,
      cc: cc.length > 0 ? cc : undefined,
      replyTo: clientEmail && clientEmail.includes("@") ? clientEmail : undefined,
      subject: `[New Order] ${instName} - ${planName} (${formattedPrice})`,
      html: adminHtml,
    });

    // 2. Send confirmation to customer if valid email provided
    let customerMailPromise = Promise.resolve();
    if (clientEmail && clientEmail.includes("@") && !clientEmail.endsWith("@example.com")) {
      const customerContent = `
        <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-top: 0;">
          Dear <strong>${clientName}</strong>,
        </p>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          ধন্যবাদ! EduBari প্ল্যাটফর্মে <strong>${instName}</strong> এর জন্য আপনার <strong>${planName}</strong> অর্ডারের রিকোয়েস্ট সফলভাবে গৃহীত হয়েছে।
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0; font-size: 13px;">
          <tr>
            <td style="padding: 12px 16px; font-weight: 700; color: #64748b; width: 40%; border-bottom: 1px solid #e2e8f0;">Requested Domain:</td>
            <td style="padding: 12px 16px; font-weight: 700; color: #4f46e5; border-bottom: 1px solid #e2e8f0;">${domain}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Plan / Package:</td>
            <td style="padding: 12px 16px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${planName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Amount:</td>
            <td style="padding: 12px 16px; font-weight: 800; color: #059669; border-bottom: 1px solid #e2e8f0;">${formattedPrice}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 700; color: #64748b;">Contact Mobile:</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #334155;">${clientPhone}</td>
          </tr>
        </table>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          আমাদের সাপোর্ট প্রতিনিধি অতি দ্রুত আপনার সাথে যোগাযোগ করে প্রতিষ্ঠানটির সেটআপ সম্পন্ন করবেন। কোনো প্রশ্ন থাকলে সরাসরি আমাদের ইমেইল বা হোয়াটসঅ্যাপে জানাতে পারেন।
        </p>
        <div style="margin-top: 20px; padding: 14px; background-color: #e0e7ff; border-radius: 10px; font-size: 13px; color: #3730a3; font-weight: 600;">
          📞 WhatsApp / Call: +880 1754 958008 | ✉️ Support: support.edubari@gmail.com
        </div>
      `;

      const customerHtml = emailWrapper({
        title: `🎉 Order Confirmation - ${instName}`,
        badge: "ORDER RECEIVED",
        badgeColor: "#4F46E5",
        contentHtml: customerContent,
        footerNote: "EduBari Support Desk | Thank you for trusting our school management ecosystem.",
      });

      customerMailPromise = transporter.sendMail({
        from: `"EduBari Support" <${process.env.EMAIL_USER || "support.edubari@gmail.com"}>`,
        to: clientEmail,
        subject: `Your EduBari Order Confirmation: ${instName} (${planName})`,
        html: customerHtml,
      }).catch((cErr) => console.warn("Customer confirmation email note:", cErr.message));
    }

    const [adminResult] = await Promise.all([adminMailPromise, customerMailPromise]);
    console.log("Order email successfully sent to admin:", adminResult.messageId);
    return { ok: true, messageId: adminResult.messageId };
  } catch (error) {
    console.error("Error sending order email:", error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * 2. SEND PAYMENT NOTIFICATION (Gateway / Online Payment / Manual Approval)
 */
export async function sendPaymentNotificationEmail(payment) {
  try {
    const transporter = getTransporter();
    const { to, cc } = getAdminRecipients();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "edubari.bd";

    const invoice = payment.invoice || payment.merchant_invoice || payment.id || "N/A";
    const trxId = payment.trxId || payment.trx_id || payment.transactionId || "N/A";
    const method = (payment.method || payment.paymentMethod || "Online Gateway").toUpperCase();
    const amount = Number(payment.amount || payment.paidAmount || payment.price || 0);
    const domain = payment.domain || payment.payer_reference || payment.preferredDomain || "N/A";
    const planName = payment.planName || payment.plan_name || payment.packageName || "N/A";
    const status = (payment.status || "Completed").toUpperCase();
    const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });

    const contentHtml = `
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 0;">
        A payment has been processed for <strong>${domain}</strong>.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0; overflow: hidden; font-size: 13px;">
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; width: 35%; border-bottom: 1px solid #e2e8f0;">Payment Status:</td>
          <td style="padding: 12px 16px; font-weight: 800; color: #059669; border-bottom: 1px solid #e2e8f0;">✅ ${status}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Amount Paid:</td>
          <td style="padding: 12px 16px; font-weight: 900; color: #059669; font-size: 16px; border-bottom: 1px solid #e2e8f0;">৳${amount.toLocaleString()} BDT</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Payment Method:</td>
          <td style="padding: 12px 16px; font-weight: 800; color: #e11d48; border-bottom: 1px solid #e2e8f0;">${method}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Transaction ID (TrxID):</td>
          <td style="padding: 12px 16px; font-family: monospace; font-weight: 700; color: #4338ca; border-bottom: 1px solid #e2e8f0;">${trxId}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Invoice / Order:</td>
          <td style="padding: 12px 16px; font-family: monospace; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0;">${invoice}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Institution Domain:</td>
          <td style="padding: 12px 16px; font-family: monospace; font-weight: 700; color: #7c3aed; border-bottom: 1px solid #e2e8f0;">${domain}</td>
        </tr>
        ${planName !== "N/A" ? `
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Plan / Package:</td>
          <td style="padding: 12px 16px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${planName}</td>
        </tr>` : ""}
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b;">Completed At:</td>
          <td style="padding: 12px 16px; font-weight: 500; color: #64748b;">${timestamp} (BDT)</td>
        </tr>
      </table>

      <div style="margin-top: 24px; text-align: center;">
        <a href="https://${siteUrl}/admin/dashboard/billing" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
          View Billing In Admin Panel →
        </a>
      </div>
    `;

    const html = emailWrapper({
      title: `💰 Payment Received: ৳${amount} via ${method}`,
      badge: "PAYMENT SUCCESS",
      badgeColor: "#059669",
      contentHtml,
      footerNote: "Automated payment alert triggered from payment gateway callback.",
    });

    const info = await transporter.sendMail({
      from: `"EduBari Payments" <${process.env.EMAIL_USER || "support.edubari@gmail.com"}>`,
      to,
      cc: cc.length > 0 ? cc : undefined,
      subject: `[Payment Success] ৳${amount} via ${method} for ${domain}`,
      html,
    });

    console.log("Payment email successfully sent to admin:", info.messageId);
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending payment email:", error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * 3. SEND CONTACT MESSAGE NOTIFICATION (Admin + Auto Ack to User)
 */
export async function sendContactMessageNotificationEmail(contact) {
  try {
    const transporter = getTransporter();
    const { to, cc } = getAdminRecipients();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "edubari.bd";

    const name = contact.name || "N/A";
    const email = contact.email || "N/A";
    const phone = contact.phone || "N/A";
    const subject = contact.subject || "General Inquiry";
    const message = contact.message || "";
    const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });

    const adminContent = `
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 0;">
        A new contact message / support inquiry has been submitted through the EduBari website.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0; overflow: hidden; font-size: 13px;">
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; width: 30%; border-bottom: 1px solid #e2e8f0;">Sender Name:</td>
          <td style="padding: 12px 16px; font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Email Address:</td>
          <td style="padding: 12px 16px; font-weight: 600; color: #0284c7; border-bottom: 1px solid #e2e8f0;">
            <a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Phone Number:</td>
          <td style="padding: 12px 16px; font-weight: 700; color: #0284c7; border-bottom: 1px solid #e2e8f0;">
            <a href="tel:${phone}" style="color: #0284c7; text-decoration: none;">${phone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0;">Subject / Topic:</td>
          <td style="padding: 12px 16px; font-weight: 700; color: #4338ca; border-bottom: 1px solid #e2e8f0;">${subject}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b; vertical-align: top; border-bottom: 1px solid #e2e8f0;">Message:</td>
          <td style="padding: 12px 16px; font-weight: 500; color: #1e293b; line-height: 1.6; white-space: pre-wrap; border-bottom: 1px solid #e2e8f0; background-color: #ffffff;">${message}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-weight: 700; color: #64748b;">Submitted At:</td>
          <td style="padding: 12px 16px; font-weight: 500; color: #64748b;">${timestamp} (BDT)</td>
        </tr>
      </table>

      <div style="margin-top: 24px; text-align: center;">
        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)} - EduBari" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); margin-right: 10px;">
          Reply to ${name} Directly ✉️
        </a>
        <a href="https://${siteUrl}/admin/dashboard/messages" style="display: inline-block; background-color: #f1f5f9; color: #334155; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 20px; border-radius: 8px; border: 1px solid #cbd5e1;">
          View Messages in Admin
        </a>
      </div>
    `;

    const adminHtml = emailWrapper({
      title: `📬 New Contact Inquiry: ${subject}`,
      badge: "CONTACT INQUIRY",
      badgeColor: "#3B82F6",
      contentHtml: adminContent,
      footerNote: "You can click 'Reply' directly in your email client to respond to this sender.",
    });

    // 1. Send to Admin & CC with Reply-To set to the sender's email
    const adminMailPromise = transporter.sendMail({
      from: `"${name} (via EduBari)" <${process.env.EMAIL_USER || "support.edubari@gmail.com"}>`,
      to,
      cc: cc.length > 0 ? cc : undefined,
      replyTo: email && email.includes("@") ? `"${name}" <${email}>` : undefined,
      subject: `[Contact Message] ${subject} - ${name}`,
      html: adminHtml,
    });

    // 2. Auto-reply / acknowledgment to sender if valid email provided
    let userAckPromise = Promise.resolve();
    if (email && email.includes("@") && !email.endsWith("@example.com")) {
      const ackContent = `
        <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-top: 0;">
          Dear <strong>${name}</strong>,
        </p>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          EduBari-তে মেসেজ পাঠানোর জন্য ধন্যবাদ। আপনার বার্তাটি সফলভাবে পৌঁছেছে।
        </p>
        <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 18px 0;">
          <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #64748b;">Subject:</p>
          <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${subject}</p>
          <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #64748b;">Your Message:</p>
          <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          আমাদের কাস্টমার সাপোর্ট টিম অতি শীঘ্রই (সাধারণত ১৫–৩০ মিনিটের মধ্যে) আপনার সাথে যোগাযোগ করবে।
        </p>
        <div style="margin-top: 20px; padding: 14px; background-color: #e0e7ff; border-radius: 10px; font-size: 13px; color: #3730a3; font-weight: 600;">
          📞 WhatsApp / Call: +880 1754 958008 | ✉️ Support: support.edubari@gmail.com
        </div>
      `;

      const ackHtml = emailWrapper({
        title: "We Have Received Your Message! 📩",
        badge: "INQUIRY RECEIVED",
        badgeColor: "#4F46E5",
        contentHtml: ackContent,
        footerNote: "EduBari Support Desk | Thank you for reaching out to us.",
      });

      userAckPromise = transporter.sendMail({
        from: `"EduBari Support" <${process.env.EMAIL_USER || "support.edubari@gmail.com"}>`,
        to: email,
        subject: `Thank you for contacting EduBari: ${subject}`,
        html: ackHtml,
      }).catch((ackErr) => console.warn("Contact user ack email note:", ackErr.message));
    }

    const [adminResult] = await Promise.all([adminMailPromise, userAckPromise]);
    console.log("Contact email successfully sent to admin:", adminResult.messageId);
    return { ok: true, messageId: adminResult.messageId };
  } catch (error) {
    console.error("Error sending contact email:", error.message);
    return { ok: false, error: error.message };
  }
}
