"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PurchaseHero from "@/components/Payment/PurchaseHero";
import PlanSelector from "@/components/Payment/PlanSelector";
import OrderSummary from "@/components/Payment/OrderSummary";
import RegistrationForm from "@/components/Payment/RegistrationForm";

function PurchaseContent() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");
  const preferredDomain = searchParams.get("preferredDomain") || "";
  const institutionName = searchParams.get("name") || searchParams.get("institutionName") || "";
  const isExisting = searchParams.get("existing") === "true";

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (planId && plans.length > 0) {
      const found = plans.find((p) => (p.id === planId || p._id === planId));
      if (found) setSelectedPlan(found);
    }
  }, [planId, plans]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/plans");
      if (!response.ok) throw new Error("Failed to fetch plans");
      const data = await response.json();
      const activePlans = data.filter((plan) => plan.active);
      setPlans(activePlans || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError(err.message);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/30 via-white to-primary/20">
      {/* Hero */}
      <PurchaseHero />

      {/* Plan Selector */}
      <PlanSelector
        selectedPlan={selectedPlan}
        onSelectPlan={setSelectedPlan}
        plans={plans}
        loading={loading}
        error={error}
        onRetry={fetchPlans}
      />

      {/* Order Details Section */}
      <section className="w-full px-4 sm:px-6 md:px-12 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* Registration Form */}
            <RegistrationForm
              selectedPlan={selectedPlan}
              preferredDomain={preferredDomain}
              institutionName={institutionName}
              isExisting={isExisting}
            />

            {/* Order Summary — sticky sidebar */}
            <div className="lg:sticky lg:top-24">
              <OrderSummary selectedPlan={selectedPlan} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PaymentPurchasePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-primary/30 via-white to-primary/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tertiary mx-auto mb-4"></div>
          <p className="text-dark/50 font-medium">Loading checkout form...</p>
        </div>
      </div>
    }>
      <PurchaseContent />
    </Suspense>
  );
}
