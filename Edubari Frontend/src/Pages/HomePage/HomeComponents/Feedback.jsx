import React, { useEffect, useRef, useState } from "react";
import { FiStar, FiMessageCircle } from "react-icons/fi";

/* ──── static testimonials (kept inline for zero-latency render) ──── */
const testimonials = [
    {
        id: 1,
        name: "Ali Muzahid",
        role: "Founder",
        company: "GenTech Academy",
        avatar:
            "https://ui-avatars.com/api/?name=Ali+Muzahid&background=2563EB&color=fff&size=128&font-size=0.4&bold=true",
        rating: 5,
        text: "বিভিন্ন সিস্টেম ব্যবহার করার পরে আমার অভিজ্ঞতা খুব খারাপ ছিল, তারপর EduBari-এর খোঁজ পেলাম। পুরো প্রতিষ্ঠানের ডিজিটাল ম্যানেজমেন্ট এখন এক প্ল্যাটফর্মে!",
        source: "google",
    },
    {
        id: 2,
        name: "Shahadat Hosain",
        role: "Principal",
        company: "SH Academy",
        avatar:
            "https://ui-avatars.com/api/?name=Shahadat+Hosain&background=662200&color=fff&size=128&font-size=0.4&bold=true",
        rating: 5,
        text: "EduBari ব্যবহারের আগেই তাদের সাপোর্ট টিম অসাধারণ সহায়তা দিয়েছেন। পুরো সেটআপ তারা করে দিয়েছেন ২৪ ঘণ্টার মধ্যে। ইনশাআল্লাহ দীর্ঘদিন ব্যবহার করব।",
        source: "trustpilot",
    },
    {
        id: 3,
        name: "Tareful Islam",
        role: "IT Head",
        company: "Greenfield School",
        avatar:
            "https://ui-avatars.com/api/?name=Tareful+Islam&background=8B5CF6&color=fff&size=128&font-size=0.4&bold=true",
        rating: 5,
        text: "They offer the best after-sales service. The team is incredibly friendly and responsive. Our entire school management is now digital thanks to EduBari.",
        source: "google",
    },
    {
        id: 4,
        name: "Nusrat Jahan",
        role: "Vice Principal",
        company: "Sunrise Academy",
        avatar:
            "https://ui-avatars.com/api/?name=Nusrat+Jahan&background=10B981&color=fff&size=128&font-size=0.4&bold=true",
        rating: 5,
        text: "Awesome support and seamless experience! Attendance tracking and result management have become so much easier for our teachers. Highly recommended!",
        source: "trustpilot",
    },
    {
        id: 5,
        name: "Tanzimul Islam",
        role: "Administrator",
        company: "Bright Future School",
        avatar:
            "https://ui-avatars.com/api/?name=Tanzimul+Islam&background=F59E0B&color=fff&size=128&font-size=0.4&bold=true",
        rating: 5,
        text: "Speed is blazing fast and the dashboard tools are incredibly intuitive. We migrated from manual management to EduBari in just a week. Best decision!",
        source: "google",
    },
    {
        id: 6,
        name: "Imrul Kayes",
        role: "Director",
        company: "Modern Academy",
        avatar:
            "https://ui-avatars.com/api/?name=Imrul+Kayes&background=EF4444&color=fff&size=128&font-size=0.4&bold=true",
        rating: 5,
        text: "Best platform for educational institution management. The fee collection and result publishing features alone saved us countless hours every month.",
        source: "google",
    },
    {
        id: 7,
        name: "Rafiq Ahmed",
        role: "Founder",
        company: "Pioneer Institute",
        avatar:
            "https://ui-avatars.com/api/?name=Rafiq+Ahmed&background=06B6D4&color=fff&size=128&font-size=0.4&bold=true",
        rating: 5,
        text: "আমাদের প্রতিষ্ঠানের সম্পূর্ণ ম্যানেজমেন্ট এখন EduBari-তে। শিক্ষক, ছাত্র, অভিভাবক সবাই খুশি। ফি ম্যানেজমেন্ট এবং রেজাল্ট পাবলিশিং অসাধারণ!",
        source: "trustpilot",
    },
    {
        id: 8,
        name: "Sabrina Akter",
        role: "Academic Head",
        company: "Scholars Academy",
        avatar:
            "https://ui-avatars.com/api/?name=Sabrina+Akter&background=EC4899&color=fff&size=128&font-size=0.4&bold=true",
        rating: 5,
        text: "The online exam system is a game-changer! We can now conduct exams remotely with auto-grading. The analytics dashboard helps us track performance effortlessly.",
        source: "google",
    },
];

/* ──── source icons (inline SVGs) ──── */
const GoogleIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
);

const TrustpilotIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="#00B67A">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
);

const sourceIcons = {
    google: <GoogleIcon />,
    trustpilot: <TrustpilotIcon />,
};

/* ──── Star rating row ──── */
const Stars = ({ count = 5 }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: count }).map((_, i) => (
            <FiStar
                key={i}
                className="h-4 w-4 fill-[#FBBF24] text-[#FBBF24]"
            />
        ))}
    </div>
);

/* ──── Single testimonial card ──── */
const TestimonialCard = ({ item }) => (
    <div className="flex-none w-[320px] sm:w-[380px] px-3">
        <div className="h-full rounded-[40px] bg-white border border-slate-100 p-8 sm:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 group flex flex-col">
            {/* Quote Icon */}
            <div className="mb-6 text-[#3B42F2] opacity-20 group-hover:opacity-40 transition-opacity">
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21L14.017 18C14.017 16.899 14.918 16 16.017 16H19.017C19.568 16 20.017 15.551 20.017 15V9C20.017 8.449 19.568 8 19.017 8H16.017C15.466 8 15.017 8.449 15.017 9V12H13.017V9C13.017 7.346 14.363 6 16.017 6H19.017C20.671 6 22.017 7.346 22.017 9V15C22.017 16.654 20.671 18 19.017 18H17.017V21H14.017ZM3.017 21V18C3.017 16.899 3.918 16 5.017 16H8.017C8.568 16 9.017 15.551 9.017 15V9C9.017 8.449 8.568 8 8.017 8H5.017C4.466 8 4.017 8.449 4.017 9V12H2.017V9C2.017 7.346 3.363 6 5.017 6H8.017C9.671 6 11.017 7.346 11.017 9V15C11.017 16.654 9.671 18 8.017 18H6.017V21H3.017Z" />
                </svg>
            </div>

            {/* Stars */}
            <div className="mb-6">
                <Stars count={item.rating} />
            </div>

            {/* Review text */}
            <p className="text-[#475569] font-medium text-lg leading-relaxed flex-1 mb-8 italic">
                "{item.text}"
            </p>

            {/* Footer — avatar + name + source icon */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                <div className="relative">
                    <img
                        src={item.avatar}
                        alt={`${item.name} avatar`}
                        className="h-14 w-14 rounded-full object-cover border-2 border-[#3B42F2]/10 p-0.5"
                        loading="lazy"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                        {sourceIcons[item.source]}
                    </div>
                </div>
                <div className="min-w-0">
                    <p className="text-lg font-black text-[#1E293B] leading-none mb-1">
                        {item.name}
                    </p>
                    <p className="text-sm font-bold text-[#3B42F2]">
                        {item.role} {item.company && ` · ${item.company}`}
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const Feedback = () => {
    const trackRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const posRef = useRef(0);
    const speedRef = useRef(0.4);

    const cards = [...testimonials, ...testimonials];

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        let raf;
        const step = () => {
            if (!isPaused) {
                posRef.current += speedRef.current;
                const halfWidth = track.scrollWidth / 2;
                if (posRef.current >= halfWidth) {
                    posRef.current -= halfWidth;
                }
                track.style.transform = `translateX(-${posRef.current}px)`;
            }
            raf = requestAnimationFrame(step);
        };

        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [isPaused]);

    return (
        <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-28 bg-[#F8FAFC] overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-blue-100/50">
                        <FiMessageCircle className="h-3.5 w-3.5" />
                        TESTIMONIALS
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1E293B] leading-tight mb-4">
                        Trusted by <span className="text-[#3B42F2]">Leading Institutions</span>
                    </h2>

                    <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#64748B] font-medium max-w-2xl mx-auto leading-relaxed">
                        See what educators and administrators say about their journey with EduBari.
                    </p>
                </div>

                {/* Marquee carousel */}
                <div
                    className="relative overflow-hidden group"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Gradient Masks */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />

                    <div
                        ref={trackRef}
                        className="flex will-change-transform gap-4 py-6"
                        style={{ width: "max-content" }}
                    >
                        {cards.map((item, index) => (
                            <TestimonialCard
                                key={`${item.id}-${index}`}
                                item={item}
                            />
                        ))}
                    </div>
                </div>

                {/* Summary stats bar */}
                <div className="mt-16 flex flex-wrap items-center justify-center gap-12 sm:gap-24">
                    {[
                        { value: "50+", label: "Institutions" },
                        { value: "4.9", label: "Avg. Rating" },
                        { value: "100%", label: "Satisfaction" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center group">
                            <p className="text-4xl sm:text-5xl font-black text-[#1E293B] tracking-tight mb-1 group-hover:text-[#3B42F2] transition-colors duration-300">
                                {stat.value}
                            </p>
                            <p className="text-[#64748B] font-black text-xs uppercase tracking-widest">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Feedback;
