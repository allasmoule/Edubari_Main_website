import {
    FiCheckCircle,
    FiAward,
    FiGlobe,
    FiClock,
} from "react-icons/fi";

export const categories = [
    "All",
    "School Management",
    "LMS",
    "Website",
    "Mobile App",
];

export const stats = [
    {
        icon: FiCheckCircle,
        value: "50+",
        label: "Projects Completed",
        color: "text-tertiary",
        bg: "bg-tertiary/10",
    },
    {
        icon: FiAward,
        value: "40+",
        label: "Happy Clients",
        color: "text-[#8B5CF6]",
        bg: "bg-[#8B5CF6]/10",
    },
    {
        icon: FiGlobe,
        value: "35+",
        label: "Live Websites",
        color: "text-[#10B981]",
        bg: "bg-[#10B981]/10",
    },
    {
        icon: FiClock,
        value: "5+",
        label: "Years Experience",
        color: "text-secondary",
        bg: "bg-secondary/10",
    },
];

export const projects = [
    {
        id: 1,
        title: "Dhaka Residential Model",
        type: "Complete Institution Management",
        category: "School Management",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
        link: "#",
        features: ["Result Processing", "Online Admission", "Fee Collection"],
        description:
            "Full-stack school management platform with automated result processing, digital admission, and integrated payment.",
    },
    {
        id: 2,
        title: "Sunrise Public School",
        type: "Educational Website & Portal",
        category: "Website",
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop",
        link: "#",
        features: ["Student Dashboard", "Attendance Tracking", "Notice Board"],
        description:
            "Responsive school website with a feature-rich student dashboard, digital attendance, and real-time notice board.",
    },
    {
        id: 3,
        title: "Global Academy LMS",
        type: "LMS & Online Classes",
        category: "LMS",
        image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format&fit=crop",
        link: "#",
        features: ["Video Classes", "Online Exams", "Progress Tracking"],
        description:
            "Complete learning management system with live/recorded video classes, auto-graded exams, and student analytics.",
    },
    {
        id: 4,
        title: "EduConnect Mobile",
        type: "Cross-Platform App",
        category: "Mobile App",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop",
        link: "#",
        features: ["Push Notifications", "Offline Mode", "Parent Portal"],
        description:
            "React Native mobile app connecting parents, students, and teachers with real-time updates and offline access.",
    },
    {
        id: 5,
        title: "Greenfield International",
        type: "School Website",
        category: "Website",
        image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop",
        link: "#",
        features: ["Event Calendar", "Gallery", "Blog Integration"],
        description:
            "Modern, multilingual school website with event management, multimedia gallery, and an integrated blog.",
    },
    {
        id: 6,
        title: "Scholars Academy ERP",
        type: "Complete Management Suite",
        category: "School Management",
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop",
        link: "#",
        features: ["HR Management", "Library System", "Transport Tracking"],
        description:
            "Enterprise-grade ERP system covering HR, library, transport, and academic management in a single platform.",
    },
    {
        id: 7,
        title: "LearnSmart Platform",
        type: "Interactive LMS",
        category: "LMS",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
        link: "#",
        features: ["AI Quizzes", "Discussion Forum", "Certificates"],
        description:
            "AI-powered learning platform with adaptive quizzes, peer discussions, and automated certificate generation.",
    },
    {
        id: 8,
        title: "SchoolSync App",
        type: "Mobile Application",
        category: "Mobile App",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop",
        link: "#",
        features: ["Live Chat", "Fee Payment", "Report Cards"],
        description:
            "All-in-one mobile app for fee payments, live messaging between teachers and parents, and digital report cards.",
    },
    {
        id: 9,
        title: "Vidyalaya Digital Campus",
        type: "Full Digital Solution",
        category: "School Management",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop",
        link: "#",
        features: ["Biometric Attendance", "SMS Gateway", "Analytics Dashboard"],
        description:
            "Complete digital campus solution with biometric integration, bulk SMS notifications, and advanced analytics.",
    },
];
