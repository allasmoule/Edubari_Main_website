import React from "react";
import ContactHero from "@/components/Contact/ContactHero";
import ContactInfo from "@/components/Contact/ContactInfo";
import ContactForm from "@/components/Contact/ContactForm";
import ContactFAQ from "@/components/Contact/ContactFAQ";
import ContactMap from "@/components/Contact/ContactMap";

export const metadata = {
  title: "Contact Us | EduBari - Smart Digital Learning Platform",
  description: "Get in touch with the EduBari team. Send us a message, request a live school ERP software demo, or contact us via WhatsApp, phone, or email.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <ContactHero />
      <ContactInfo />
      <ContactForm />
      <ContactFAQ />
      <ContactMap />
    </div>
  );
}
