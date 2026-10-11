import React from "react";
import DomainSearch from "@/components/Home/DomainSearch";
import Pricing from "@/components/Home/Pricing";
import HowWorks from "@/components/Home/HowWorks";
import TrustedClients from "@/components/Home/TrustedClients";
import Feature from "@/components/Home/Feature";
import VideoTutorials from "@/components/Home/VideoTutorials";
import WhyShouldChoose from "@/components/Home/WhyShouldChoose";
import GetInTouch from "@/components/Home/GetInTouch";

export default function HomePage() {
  return (
    <div>
      <DomainSearch />
      <Pricing />
      <HowWorks />
      <TrustedClients />
      <Feature />
      <VideoTutorials />
      <WhyShouldChoose />
      <GetInTouch />
    </div>
  );
}
