import React from "react";
import FeatureDetailView from "@/components/Feature/FeatureDetailView";

export const metadata = {
  title: "Reports & Executive Analytics | EduBari",
  description: "Comprehensive analytical dashboards tracking fee collection, financial cash flows, attendance trends, and academic performance.",
};

export default function ReportsAnalyticsPage() {
  return <FeatureDetailView slug="reports-analytics" />;
}
