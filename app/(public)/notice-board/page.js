import React from "react";
import FeatureDetailView from "@/components/Feature/FeatureDetailView";

export const metadata = {
  title: "Smart Digital Notice Board | EduBari",
  description: "Publish urgent announcements, academic calendars, holiday notices, PDF circulars, and instant SMS alerts.",
};

export default function NoticeBoardPage() {
  return <FeatureDetailView slug="notice-board" />;
}
