import React from "react";
import ContactHero from "./ContactComponents/ContactHero";
import ContactInfo from "./ContactComponents/ContactInfo";
import ContactForm from "./ContactComponents/ContactForm";
import ContactMap from "./ContactComponents/ContactMap";

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-linear-to-b from-primary/30 via-white to-primary/20">
            <ContactHero />
            <ContactInfo />
            <ContactForm />
            <ContactMap />
        </div>
    );
};

export default ContactPage;
