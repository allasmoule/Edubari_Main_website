import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { FiCheck, FiArrowRight, FiMail, FiPhoneCall, FiLoader } from "react-icons/fi";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:5000";

const PlanSelector = ({ selectedPlan, onSelectPlan }) => {
  const [billingPeriod, setBillingPeriod] = useState("monthly"); // "monthly" or "yearly"
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const preferredDomain = location.state?.preferredDomain;

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/plans`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setPlans(data);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleAction = (plan, actionType) => {
    if (plan.type === "contact") {
      window.location.href = "mailto:sales@edubari.com";
      return;
    }

    if (!preferredDomain) {
      // Redirect to home domain search with state to trigger toast and scroll
      navigate("/", { state: { scrollToDomain: true } });
      return;
    }

    // Pass current billing price to selection
    const currentPrice = billingPeriod === "monthly" ? plan.price : (plan.yearlyPrice || plan.price * 12 * 0.8);
    const selectedPlanWithPrice = { ...plan, price: currentPrice, domain: preferredDomain };

    onSelectPlan(selectedPlanWithPrice);

    if (actionType === "direct") {
      navigate("/checkout", { state: { plan: selectedPlanWithPrice, billingPeriod, domain: preferredDomain } });
    } else {
      navigate("/payment-plan-details", { state: { plan: selectedPlanWithPrice, billingPeriod, domain: preferredDomain } });
    }
  };

  if (loading) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center bg-white">
        <FiLoader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">Loading premium plans...</p>
      </div>
    );
  }

  return (
    <section className="w-full pb-20 bg-white">
      {/* Dark Header Section */}
      <div className="bg-[#0B1121] pt-16 pb-28 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Choose Your Plan <br />
            <span className="text-white/90">& Get Started</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mb-8 leading-normal font-medium">
            Select the perfect plan for your institution, fill in your details, and confirm your
            order to launch your professional teaching platform with EduBari.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-bold ${billingPeriod === "monthly" ? "text-white" : "text-slate-500"}`}>Monthly</span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
              className="relative w-14 h-7 bg-blue-600 rounded-full p-1 transition-colors duration-300"
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${billingPeriod === "yearly" ? "translate-x-7" : "translate-x-0"}`} />
            </button>
            <span className={`text-sm font-bold ${billingPeriod === "yearly" ? "text-white" : "text-slate-500"}`}>Yearly</span>
            <span className="bg-blue-900/50 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full border border-blue-800/50 ml-2 uppercase">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isHighlighted = plan.highlighted;
            const displayPrice = billingPeriod === "monthly" ? plan.price : (plan.yearlyPrice || "Contact");

            return (
              <div
                key={plan._id}
                className={`relative flex flex-col p-8 bg-white transition-all duration-500 ${plan.isDashed
                    ? "rounded-[24px] border-2 border-dashed border-slate-200"
                    : isHighlighted
                      ? "rounded-[24px] border-4 border-blue-600 shadow-xl shadow-blue-600/10 scale-105 z-10"
                      : "rounded-[24px] border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1"
                  }`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isHighlighted ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                    Most Popular
                  </div>
                )}

                {/* Card Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#1E293B] mb-0.5">{plan.name}</h3>
                  <p className={`text-[10px] font-bold tracking-tight ${preferredDomain ? "text-emerald-500" : "text-rose-500"}`}>
                    {preferredDomain ? `Domain: ${preferredDomain.toLowerCase()}` : "Domain Select First"}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {typeof displayPrice === "number" ? (
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-[#1E293B]">৳{displayPrice}</span>
                      <span className="text-slate-400 text-xs font-bold ml-1">/{billingPeriod === "monthly" ? "mo" : "yr"}</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-[#1E293B] tracking-tight">
                      {displayPrice}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="flex-grow">
                  {plan.description ? (
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                      {plan.description}
                    </p>
                  ) : (
                    <ul className="space-y-3 mb-6">
                      {plan.features?.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[13px] font-medium text-slate-600">
                          <FiCheck className={`mt-1 shrink-0 ${isHighlighted ? "text-blue-600" : "text-emerald-500"}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleAction(plan, "select")}
                    className={`w-full py-4 rounded-xl text-[11px] font-black transition-all duration-300 uppercase tracking-widest ${isHighlighted
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                        : "bg-[#0B1121] text-white hover:bg-[#1E293B]"
                      }`}
                  >
                    {plan.buttonText || "Select Plan"}
                  </button>

                  {/* Direct Order Button - always visible for regular plans */}
                  {plan.type === "regular" && (
                    <button
                      onClick={() => handleAction(plan, "direct")}
                      className="w-full py-4 rounded-xl text-[11px] font-black bg-white text-[#1E293B] border-2 border-[#1E293B] hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                      Direct Order
                      <FiArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlanSelector;

