import React from "react";
import About from "@/components/Home/About";
import MissionVision from "@/components/About/MissionVision";
import Roadmap from "@/components/About/Roadmap";
import WhyShouldChoose from "@/components/Home/WhyShouldChoose";

export const metadata = {
  title: "About Us | EduBari",
  description: "Learn more about EduBari, our mission, vision, and 2025-2030 roadmap.",
};

export default function AboutPage() {
  return (
    <div className="pt-20 pb-16 bg-white min-h-screen">
      <div className="w-full">
        {/* About Hero Section */}
        <About />

        {/* Mission & Vision Section */}
        <MissionVision />

        {/* 2025-2030 Development Roadmap Section */}
        <Roadmap />

        {/* Why Choose EduBari Section */}
        <WhyShouldChoose />
      </div>
    </div>
  );
}

