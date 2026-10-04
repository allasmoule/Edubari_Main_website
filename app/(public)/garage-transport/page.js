import React from "react";
import FeatureDetailView from "@/components/Feature/FeatureDetailView";

export const metadata = {
  title: "Garage & Transport Management | EduBari",
  description: "School bus fleet tracking, driver assignments, route management, fuel logs, and transport fees.",
};

export default function GarageTransportPage() {
  return <FeatureDetailView slug="garage-transport" />;
}
