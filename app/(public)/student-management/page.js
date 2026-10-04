import React from "react";
import FeatureDetailView from "@/components/Feature/FeatureDetailView";

export const metadata = {
  title: "Student Management System | EduBari",
  description: "Complete student profiles, enrollment, ID cards, and academic records management.",
};

export default function StudentManagementPage() {
  return <FeatureDetailView slug="student-management" />;
}
