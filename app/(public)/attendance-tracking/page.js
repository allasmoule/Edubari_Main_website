import React from "react";
import FeatureDetailView from "@/components/Feature/FeatureDetailView";

export const metadata = {
  title: "Digital Attendance Tracking & Auto SMS | EduBari",
  description: "Biometric and digital attendance tracking paired with instant absentee SMS notifications to parents.",
};

export default function AttendanceTrackingPage() {
  return <FeatureDetailView slug="attendance-tracking" />;
}
