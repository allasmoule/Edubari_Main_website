import React from "react";
import { FiMessageCircle, FiPhone, FiMail } from "react-icons/fi";

const contacts = [
    {
        icon: <FiMessageCircle className="h-7 w-7" />,
        title: "WhatsApp",
        info: "+8801824-814141",
        action: "Chat on WhatsApp",
        href: "https://wa.me/8801824814141",
        external: true,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        btnClass: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200",
    },
    {
        icon: <FiPhone className="h-7 w-7" />,
        title: "Phone Call",
        info: "+8801824-814141",
        action: "Call Us Now",
        href: "tel:+8801824814141",
        external: false,
        color: "text-[#3B42F2]",
        bg: "bg-[#EFF2FF]",
        btnClass: "bg-[#3B42F2] text-white hover:bg-[#1E3A8A] shadow-blue-200",
    },
    {
        icon: <FiMail className="h-7 w-7" />,
        title: "Email Us",
        info: "support@edubari.com",
        action: "Send an Email",
        href: "mailto:support@edubari.com",
        external: false,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        btnClass: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200",
    },
];

const GetInTouch = () => {
    return (
    <section id="contact" className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-28 bg-[#F8FAFC] relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#3B42F2] rounded-full blur-[160px] opacity-10" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#8B5CF6] rounded-full blur-[160px] opacity-10" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-blue-100/50">
                    📞 CONTACT US
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1E293B] leading-tight mb-4">
                    Get In <span className="text-[#3B42F2]">Touch</span> With Us
                </h2>

                <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#64748B] font-medium max-w-2xl mx-auto leading-relaxed">
                    Have questions or ready to digitize your institution? Our team is always here to help you get started.
                </p>
            </div>

            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto">
                {contacts.map((c) => (
                    <div
                        key={c.title}
                        className="group relative rounded-[40px] bg-white border border-slate-100 p-8 sm:p-10 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 overflow-hidden"
                    >
                        {/* Decorative background shape */}
                        <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${c.bg} opacity-0 group-hover:opacity-40 transition-all duration-700 blur-2xl`} />

                        {/* Icon */}
                        <div
                            className={`inline-flex h-16 w-16 items-center justify-center rounded-[24px] ${c.bg} ${c.color} transition-all duration-500 group-hover:rotate-6 shadow-sm mb-6`}
                        >
                            {c.icon}
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-black text-[#1E293B] mb-2 group-hover:text-[#3B42F2] transition-colors duration-300">
                            {c.title}
                        </h3>

                        {/* Info */}
                        <p className="text-lg font-bold text-[#64748B] mb-8">
                            {c.info}
                        </p>

                        {/* CTA Button */}
                        <a
                            href={c.href}
                            {...(c.external && {
                                target: "_blank",
                                rel: "noopener noreferrer",
                            })}
                            className={`flex items-center justify-center w-full py-4 rounded-2xl text-sm font-black shadow-xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0 ${c.btnClass}`}
                        >
                            {c.action}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    </section>
    );
};

export default GetInTouch;
