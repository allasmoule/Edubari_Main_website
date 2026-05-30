import React from "react";
import ContactHero from "@/components/Contact/ContactHero";
import ContactInfo from "@/components/Contact/ContactInfo";
import ContactForm from "@/components/Contact/ContactForm";
import ContactMap from "@/components/Contact/ContactMap";

export const metadata = {
  title: "Contact Us | EduBari",
  description: "Get in touch with the EduBari team. Send us a message, find our office location on the map, or contact us via phone, email, or WhatsApp.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-primary/30 via-white to-primary/20">
      <ContactHero />
      <ContactInfo />
      <ContactForm />
      <ContactMap />
    </div>
  );
}
