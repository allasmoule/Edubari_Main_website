import React from "react";
import FeatureDetailView from "@/components/Feature/FeatureDetailView";

export const metadata = {
  title: "Online Payment Gateway Integration | EduBari",
  description: "Instant 24/7 online fee payment via bKash, Nagad, Rocket, and cards with instant SMS confirmation.",
};

export default function OnlinePaymentPage() {
  return <FeatureDetailView slug="online-payment" />;
}
