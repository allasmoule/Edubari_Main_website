import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import PurchaseHero from "./PaymentPurchaseComponents/PurchaseHero";
import PlanSelector from "./PaymentPurchaseComponents/PlanSelector";
import OrderSummary from "./PaymentPurchaseComponents/OrderSummary";
import RegistrationForm from "./PaymentPurchaseComponents/RegistrationForm";

const PaymentPurchase = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const location = useLocation();
  const preferredDomain = location.state?.preferredDomain || "";

  // Get plan id from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planId = params.get("plan");
    if (planId && plans.length > 0) {
      const found = plans.find((p) => p._id === planId);
      if (found) setSelectedPlan(found);
    }
  }, [location.search, plans]);

  // Fetch plans for pre-select
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(
        (import.meta.env.VITE_SERVER || "http://localhost:3000") + "/plans",
      );
      if (!response.ok) throw new Error("Failed to fetch plans");
      const data = await response.json();
      const activePlans = data.filter((plan) => plan.active);
      setPlans(activePlans || []);
    } catch {
      setPlans([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <PurchaseHero />

      {/* Plan Selector */}
      <PlanSelector
        selectedPlan={selectedPlan}
        onSelectPlan={setSelectedPlan}
        plans={plans}
      />

      {/* Order Details Section */}
      <section className="w-full px-6 sm:px-12 lg:px-24 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
            {/* Registration Form */}
            <RegistrationForm
              selectedPlan={selectedPlan}
              preferredDomain={preferredDomain}
            />

            {/* Order Summary — sticky sidebar */}
            <div className="lg:sticky lg:top-32">
              <OrderSummary selectedPlan={selectedPlan} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentPurchase;
