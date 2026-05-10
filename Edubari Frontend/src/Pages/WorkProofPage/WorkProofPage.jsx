import React, { useState } from "react";
import WorkProofHero from "./WorkProofCompnents/WorkProofHero";
import WorkProofGrid from "./WorkProofCompnents/WorkProofGrid";
import WorkProofCTA from "./WorkProofCompnents/WorkProofCTA";

const WorkProofPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/30 via-white to-primary/20">
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
