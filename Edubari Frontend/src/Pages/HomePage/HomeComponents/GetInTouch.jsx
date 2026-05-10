import React from "react";
import { FiMessageCircle, FiPhone, FiMail } from "react-icons/fi";

const contacts = [
    {
        icon: <FiMessageCircle className="h-6 w-6" />,
        title: "WhatsApp",
        info: "+880XXXXXXXXXX",
        action: "Chat on WhatsApp",
        href: "https://wa.me/880",
        external: true,
        color: "text-[#25D366]",
        bg: "bg-[#25D366]/10",
        border: "group-hover:border-[#25D366]/25",
        btnClass:
            "bg-[#25D366] text-white shadow-[#25D366]/30 hover:shadow-[#25D366]/40",
    },
    {
        icon: <FiPhone className="h-6 w-6" />,
        title: "Phone",
        info: "+880XXXXXXXXXX",
        action: "Call Now",
        href: "tel:+880XXXXXXXXXX",
        external: false,
        color: "text-tertiary",
        bg: "bg-tertiary/10",
        border: "group-hover:border-tertiary/25",
        btnClass:
            "bg-white/60 text-dark border border-dark/10 hover:bg-white/80 shadow-dark/5 hover:shadow-dark/10",
    },
    {
        icon: <FiMail className="h-6 w-6" />,
        title: "Email",
        info: "contact@yourbrand.com",
        action: "Send Email",
        href: "mailto:contact@yourbrand.com",
        external: false,
        color: "text-[#8B5CF6]",
        bg: "bg-[#8B5CF6]/10",
        border: "group-hover:border-[#8B5CF6]/25",
        btnClass:
            "bg-white/60 text-dark border border-dark/10 hover:bg-white/80 shadow-dark/5 hover:shadow-dark/10",
    },
];

const GetInTouch = () => {
    return (
        <section
            id="contact"
            className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-24 bg-primary/40"
        >
            <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
                <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-12 sm:py-14">
                    {/* Header */}
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
                            📞 Contact
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-dark leading-tight">
                            Get In{" "}
                            <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                                Touch
                            </span>
                        </h2>

                        <p className="mt-5 text-sm sm:text-[15px] lg:text-base leading-7 text-dark/70 max-w-2xl mx-auto">
                            Have questions? We're here to help
                        </p>
                    </div>

                    {/* Contact Cards */}
                    <div className="mt-12 lg:mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
                        {contacts.map((c) => (
                            <div
                                key={c.title}
                                className={`group relative rounded-2xl border border-white/40 bg-white/50 p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dark/5 hover:bg-white/80 ${c.border}`}
                            >
                                {/* Icon */}
                                <div
                                    className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${c.bg} ${c.color} transition-transform duration-300 group-hover:scale-110`}
                                >
                                    {c.icon}
                                </div>

                                {/* Title */}
                                <h3 className="mt-5 text-lg font-bold text-dark">
                                    {c.title}
                                </h3>

                                {/* Info */}
                                <p className="mt-1.5 text-sm text-dark/55 font-medium">
                                    {c.info}
                                </p>

                                {/* CTA Button */}
                                <a
                                    href={c.href}
                                    {...(c.external && {
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                    })}
                                    className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ${c.btnClass}`}
                                >
                                    {c.action}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GetInTouch;
