import React from "react";
import WorkProofHero from "@/components/WorkProof/WorkProofHero";
import WorkProofGrid from "@/components/WorkProof/WorkProofGrid";
import WorkProofCTA from "@/components/WorkProof/WorkProofCTA";

export const metadata = {
  title: "Our Work Proof | EduBari",
  description: "Explore the live portfolios, websites, student portals, and smart administration panels we have successfully built and deployed for educational coaching centers and schools in Bangladesh.",
};

export default function WorkProofPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-primary/30 via-white to-primary/20">
      <WorkProofHero />
      <WorkProofGrid activeCategory="All" />
      <WorkProofCTA />
    </div>
  );
}
