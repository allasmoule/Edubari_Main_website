import React from "react";
import {
    FiMapPin,
    FiPhone,
    FiMail,
    FiClock,
    FiMessageCircle,
} from "react-icons/fi";

const infoCards = [
    {
        icon: <FiMapPin className="h-6 w-6" />,
        title: "Our Office",
        lines: ["Botbari, Dhaka", "Bangladesh"],
        color: "text-tertiary",
        bg: "bg-tertiary/10",
        border: "group-hover:border-tertiary/30",
        glow: "group-hover:shadow-tertiary/10",
    },
    {
        icon: <FiPhone className="h-6 w-6" />,
        title: "Call / WhatsApp",
        lines: ["+880 XXXX-XXXXXX"],
        extra: (
            <a
                href="https://wa.me/880"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline"
            >
                <FiMessageCircle className="h-3.5 w-3.5" />
                Chat on WhatsApp
            </a>
        ),
        color: "text-[#25D366]",
        bg: "bg-[#25D366]/10",
        border: "group-hover:border-[#25D366]/30",
        glow: "group-hover:shadow-[#25D366]/10",
    },
    {
        icon: <FiMail className="h-6 w-6" />,
        title: "Email Us",
        lines: ["contact@edubari.com"],
        extra: (
            <a
                href="mailto:contact@edubari.com"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#8B5CF6] hover:underline"
            >
                <FiMail className="h-3.5 w-3.5" />
                Send an Email
            </a>
        ),
        color: "text-[#8B5CF6]",
        bg: "bg-[#8B5CF6]/10",
        border: "group-hover:border-[#8B5CF6]/30",
        glow: "group-hover:shadow-[#8B5CF6]/10",
    },
    {
        icon: <FiClock className="h-6 w-6" />,
        title: "Business Hours",
        lines: ["Sat – Thu: 10 AM – 8 PM", "Friday: Closed"],
        color: "text-secondary",
        bg: "bg-secondary/10",
        border: "group-hover:border-secondary/30",
        glow: "group-hover:shadow-secondary/10",
    },
];

const ContactInfo = () => {
    return (
        <section className="w-full px-4 sm:px-6 md:px-12 py-10 sm:py-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
                {infoCards.map((card) => (
                    <div
                        key={card.title}
                        className={`group relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${card.border} ${card.glow}`}
                    >
                        {/* Icon */}
                        <div
                            className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${card.bg} ${card.color} transition-transform duration-300 group-hover:scale-110`}
                        >
                            {card.icon}
                        </div>

                        {/* Title */}
                        <h3 className="mt-4 text-base font-bold text-dark">
                            {card.title}
                        </h3>

                        {/* Info Lines */}
                        {card.lines.map((line, i) => (
                            <p
                                key={i}
                                className="mt-1 text-sm text-dark/55 font-medium leading-relaxed"
                            >
                                {line}
                            </p>
                        ))}

                        {/* Optional Extra */}
                        {card.extra && card.extra}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ContactInfo;
