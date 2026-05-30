import React from "react";
import HeroSlider from "@/components/Home/HeroSlider";
import DomainSearch from "@/components/Home/DomainSearch";
import Pricing from "@/components/Home/Pricing";
import HowWorks from "@/components/Home/HowWorks";
import Feature from "@/components/Home/Feature";
import WorkProof from "@/components/Home/WorkProof";
import WhyShouldChoose from "@/components/Home/WhyShouldChoose";
import About from "@/components/Home/About";
import GetInTouch from "@/components/Home/GetInTouch";

export default function HomePage() {
  return (
    <div>
      <HeroSlider />
      <DomainSearch />
      <Pricing />
      <HowWorks />
      <Feature />
      <WorkProof />
      <WhyShouldChoose />
      <About />
      <GetInTouch />
    </div>
  );
}
