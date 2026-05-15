import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import PlanSelector from "./PaymentPurchaseComponents/PlanSelector";

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
      {/* Plan Selector (Acts as Hero + Pricing) */}
      <PlanSelector
        selectedPlan={selectedPlan}
        onSelectPlan={setSelectedPlan}
        plans={plans}
      />
    </div>
  );
};

export default PaymentPurchase;
