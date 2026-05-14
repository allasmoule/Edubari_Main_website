import React, { useState } from "react";
import WorkProofHero from "./WorkProofCompnents/WorkProofHero";
import WorkProofGrid from "./WorkProofCompnents/WorkProofGrid";
import WorkProofCTA from "./WorkProofCompnents/WorkProofCTA";

const WorkProofPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <WorkProofHero
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <WorkProofGrid activeCategory={activeCategory} />
      <WorkProofCTA />
    </div>
  );
};

export default WorkProofPage;
