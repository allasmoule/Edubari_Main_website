import React from "react";
import FeatureDetailView from "@/components/Feature/FeatureDetailView";

export const metadata = {
  title: "Hostel & Dormitory Management | EduBari",
  description: "Room & seat allocation, resident student tracking, gate pass, dining meals, and hostel billing.",
};

export default function HostelManagementPage() {
  return <FeatureDetailView slug="hostel-management" />;
}
