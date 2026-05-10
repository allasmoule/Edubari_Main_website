import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FiArrowRight, FiLoader, FiCheck } from "react-icons/fi";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/plans`);
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

  // Handle Get Started click
  const handleGetStarted = (planId) => {
    navigate(`/payment-purchase?plan=${planId}`);
  };

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-16 sm:py-20 lg:py-24 bg-white">
      <div className="w-full rounded-[28px] border border-white/20 bg-primary/95 backdrop-blur-sm overflow-hidden">
        <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-12 sm:py-14">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold tracking-wide uppercase mb-4">
              💰 Available Plans
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-dark leading-tight">
              Simple, Transparent{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                Pricing
              </span>
            </h2>

            <p className="mt-5 text-sm sm:text-[15px] lg:text-base leading-7 text-dark/70 max-w-2xl mx-auto">
              Choose the plan that fits your institution
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mt-12 lg:mt-14 max-w-5xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <FiLoader className="w-8 h-8 mx-auto text-tertiary animate-spin mb-3" />
                <p className="text-dark/50 font-medium">Loading plans...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 px-6 rounded-xl bg-red-50 border border-red-200/60">
                <p className="text-red-600 font-semibold">
                  Failed to load plans
                </p>
                <p className="text-sm text-red-500/70 mt-1">{error}</p>
                <button
                  onClick={fetchPlans}
                  className="mt-4 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all"
                >
                  Retry
                </button>
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-dark/50 font-medium">
                  No active plans available
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                {plans.slice(0, 3).map((plan) => (
                  <div
                    key={plan._id}
                    className={`group relative rounded-2xl border p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-dark/5 ${
                      plan.popular
                        ? "border-tertiary/30 bg-white/80 shadow-lg shadow-tertiary/10 ring-1 ring-tertiary/20"
                        : "border-white/40 bg-white/50 hover:bg-white/80"
                    }`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div
                        className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide ${
                          plan.popular
                            ? "bg-linear-to-r from-tertiary to-[#8B5CF6] text-white shadow-md shadow-tertiary/30"
                            : "bg-[#F59E0B]/15 text-[#D97706]"
                        }`}
                      >
                        {plan.badge}
                      </div>
                    )}

                    {/* Popular label */}
                    {plan.popular && (
                      <div className="text-[11px] font-bold text-tertiary uppercase tracking-wider mb-2">
                        Most Popular
                      </div>
                    )}

                    {/* Plan Name */}
                    <h3 className="mt-1 text-lg font-bold text-dark">
                      {plan.name}
                    </h3>

                    {/* Duration */}
                    <p className="mt-1 text-xs font-medium text-dark/45">
                      {plan.duration}
                    </p>

                    {/* Price */}
                    <div className="mt-5 flex items-baseline gap-2">
                      <span
                        className={`text-4xl sm:text-5xl font-black tracking-tight ${
                          plan.popular
                            ? "bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]"
                            : "text-dark"
                        }`}
                      >
                        ৳{(plan.price || 0).toLocaleString()}
                      </span>
                      {plan.oldPrice && (
                        <span className="text-base font-semibold text-dark/30 line-through decoration-1">
                          ৳{(plan.oldPrice || 0).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    {plan.features &&
                      Array.isArray(plan.features) &&
                      plan.features.length > 0 && (
                        <ul className="mt-6 space-y-2.5">
                          {plan.features.map((feat, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2.5 text-sm text-dark/70"
                            >
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
                                <FiCheck className="h-3 w-3 stroke-[3]" />
                              </span>
                              <span className="leading-5 font-medium">
                                {feat}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                    {/* CTA */}
                    <button
                      type="button"
                      onClick={() => handleGetStarted(plan._id)}
                      className={`mt-7 w-full block rounded-xl px-6 py-3 text-sm font-bold text-center transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${
                        plan.popular
                          ? "bg-tertiary/10 text-tertiary group-hover:bg-tertiary group-hover:text-white group-hover:shadow-md group-hover:shadow-tertiary/30"
                          : "bg-white/60 text-dark border border-dark/10 group-hover:bg-white/90 shadow-sm group-hover:shadow-md"
                      }`}
                    >
                      Get Started
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* View All Plans */}
          <div className="mt-10 text-center">
            <a
              href="/payment-purchase"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/60 border border-dark/10 text-sm font-bold text-dark hover:bg-white/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              Explore All Plans
              <FiArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
