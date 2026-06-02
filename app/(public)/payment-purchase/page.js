"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PurchaseHero from "@/components/Payment/PurchaseHero";
import PlanSelector from "@/components/Payment/PlanSelector";
import OrderSummary from "@/components/Payment/OrderSummary";
import RegistrationForm from "@/components/Payment/RegistrationForm";

function PurchaseContent() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
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
      if (found) {
        setSelectedPlan(found);
        setShowRegistrationPopup(true);
      }
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

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowRegistrationPopup(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/30 via-white to-primary/20">
      {/* Hero */}
      <PurchaseHero />

      {/* Plan Selector */}
      <PlanSelector
        selectedPlan={selectedPlan}
        onSelectPlan={handleSelectPlan}
        plans={plans}
        loading={loading}
        error={error}
        onRetry={fetchPlans}
      />

      {/* Order Details Section - Only show OrderSummary in the page body if a plan is selected */}
      {selectedPlan && (
        <section className="w-full px-4 sm:px-6 md:px-12 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-full">
              <OrderSummary selectedPlan={selectedPlan} />
            </div>
            
            <button 
              onClick={() => setShowRegistrationPopup(true)}
              className="mt-8 bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              Complete Registration
            </button>
          </div>
        </section>
      )}

      {/* Registration Form Popup */}
      <RegistrationForm
        selectedPlan={selectedPlan}
        preferredDomain={preferredDomain}
        institutionName={institutionName}
        isExisting={isExisting}
        isOpen={showRegistrationPopup}
        onClose={() => setShowRegistrationPopup(false)}
      />
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
