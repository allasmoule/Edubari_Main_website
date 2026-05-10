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
    <div className="group flex-none w-[300px] sm:w-[340px] px-2">
        <div className="h-full rounded-2xl border border-white/40 bg-white/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dark/5 hover:bg-white/80 flex flex-col">
            {/* Header — avatar + name + source icon */}
            <div className="flex items-center gap-3">
                <img
                    src={item.avatar}
                    alt={`${item.name} avatar`}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-white/60 shadow-sm"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-dark leading-snug truncate">
                        {item.name}
                    </p>
                    <p className="text-xs text-dark/50 truncate">
                        {item.role}
                        {item.company && ` · ${item.company}`}
                    </p>
                </div>
                {sourceIcons[item.source] && (
                    <div className="flex-none opacity-60 group-hover:opacity-100 transition-opacity">
                        {sourceIcons[item.source]}
                    </div>
                )}
            </div>

            {/* Stars */}
            <div className="mt-3">
                <Stars count={item.rating} />
            </div>

            {/* Review text */}
            <p className="mt-3 text-sm leading-relaxed text-dark/70 flex-1 line-clamp-5">
                {item.text}
            </p>
        </div>
    </div>
);

/* ──── Main Feedback section ──── */
const Feedback = () => {
    const trackRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const posRef = useRef(0);
    const speedRef = useRef(0.5); // px per frame

    /* Duplicate cards for seamless loop */
    const cards = [...testimonials, ...testimonials];

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        let raf;
        const step = () => {
            if (!isPaused) {
                posRef.current += speedRef.current;
                // Reset when first set scrolls out
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
        <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-24 bg-primary/40">
            <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
                <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-12 sm:py-14">
                    {/* ── Header ── */}
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
                            <FiMessageCircle className="h-3.5 w-3.5" />
                            Testimonials
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-dark leading-tight">
                            Trusted by{" "}
                            <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                                Institutions
                            </span>
                        </h2>

                        <p className="mt-5 text-sm sm:text-[15px] lg:text-base leading-7 text-dark/70 max-w-2xl mx-auto">
                            See what educators and administrators say about
                            their experience with EduBari
                        </p>
                    </div>

                    {/* ── Marquee carousel ── */}
                    <div
                        className="mt-12 lg:mt-14 relative overflow-hidden"
                        style={{
                            maskImage:
                                "linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%)",
                            WebkitMaskImage:
                                "linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%)",
                        }}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        <div
                            ref={trackRef}
                            className="flex will-change-transform"
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

                    {/* ── Summary stats bar ── */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                        {[
                            { value: "50+", label: "Institutions" },
                            { value: "4.9", label: "Avg. Rating" },
                            { value: "100%", label: "Satisfaction" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="text-center"
                            >
                                <p className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="mt-1 text-xs sm:text-sm font-medium text-dark/50">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Feedback;
