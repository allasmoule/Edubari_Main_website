import React from "react";
import About from "@/components/Home/About";

export const metadata = {
  title: "About Us | EduBari",
  description: "Learn more about EduBari and our mission.",
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16 bg-white min-h-screen">
      <div className="container mx-auto">
        <About />
      </div>
    </div>
  );
}
