import React from "react";
import FeatureDetailView from "@/components/Feature/FeatureDetailView";

export const metadata = {
  title: "Payment & Fee Management | EduBari",
  description: "Fee collection tracking, automated invoice receipts, due balance records, and ledger accounting.",
};

export default function PaymentManagementPage() {
  return <FeatureDetailView slug="payment-management" />;
}
