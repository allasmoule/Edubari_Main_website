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
        title: "Visit Our Office",
        lines: ["Botbari, Dhaka", "Bangladesh"],
        color: "text-[#3B42F2]",
        bg: "bg-blue-50",
    },
    {
        icon: <FiPhone className="h-6 w-6" />,
        title: "Let's Talk",
        lines: ["+880 XXXX-XXXXXX"],
        extra: (
            <a
                href="https://wa.me/880"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#22C55E] uppercase tracking-widest hover:text-[#16a34a] transition-colors"
            >
                <FiMessageCircle className="h-4 w-4" />
                WHATSAPP
            </a>
        ),
        color: "text-[#22C55E]",
        bg: "bg-green-50",
    },
    {
        icon: <FiMail className="h-6 w-6" />,
        title: "Email Us",
        lines: ["contact@edubari.com"],
        extra: (
            <a
                href="mailto:contact@edubari.com"
                className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#6366F1] uppercase tracking-widest hover:text-[#4f46e5] transition-colors"
            >
                <FiMail className="h-4 w-4" />
                SEND MAIL
            </a>
        ),
        color: "text-[#6366F1]",
        bg: "bg-indigo-50",
    },
    {
        icon: <FiClock className="h-6 w-6" />,
        title: "Working Hours",
        lines: ["Sat – Thu: 10AM – 8PM", "Friday: Closed"],
        color: "text-[#F59E0B]",
        bg: "bg-amber-50",
    },
];

const ContactInfo = () => {
    return (
        <section className="w-full px-6 sm:px-12 lg:px-24 py-12 sm:py-16 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {infoCards.map((card) => (
                        <div
                            key={card.title}
                            className="group relative rounded-[40px] border border-slate-50 bg-white p-10 text-center transition-all duration-500 hover:-translate-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(59,66,242,0.1)]"
                        >
                            {/* Icon */}
                            <div
                                className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${card.bg} ${card.color} transition-transform duration-500 group-hover:scale-110 shadow-sm`}
                            >
                                {card.icon}
                            </div>

                            {/* Title */}
                            <h3 className="mt-6 text-xl font-black text-[#1E293B]">
                                {card.title}
                            </h3>

                            {/* Info Lines */}
                            <div className="mt-3 space-y-1">
                                {card.lines.map((line, i) => (
                                    <p
                                        key={i}
                                        className="text-slate-500 font-medium text-[15px] leading-relaxed"
                                    >
                                        {line}
                                    </p>
                                ))}
                            </div>

                            {/* Optional Extra */}
                            {card.extra && (
                                <div className="flex justify-center">
                                    {card.extra}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ContactInfo;
