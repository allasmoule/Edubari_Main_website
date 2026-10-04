import React from "react";
import FeatureDetailView from "@/components/Feature/FeatureDetailView";

export const metadata = {
  title: "Teacher Portal & Dashboard | EduBari",
  description: "Dedicated dashboard for teachers to manage daily class routines, attendance, grades, homework, and AI generators.",
};

export default function TeacherPanelPage() {
  return <FeatureDetailView slug="teacher-panel" />;
}
