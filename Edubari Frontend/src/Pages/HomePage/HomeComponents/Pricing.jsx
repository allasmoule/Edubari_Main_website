import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { FiArrowRight, FiLoader, FiCheck } from "react-icons/fi";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:5000";

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const preferredDomain = location.state?.preferredDomain;

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
    const domainSection = document.getElementById("domain-search-section");
    if (domainSection) {
      domainSection.scrollIntoView({ behavior: "smooth" });

      // Focus the input
      const searchInput = document.getElementById("domain-search-input");
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 800);
      }

      // Show premium toast
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: '#ffffff',
        color: '#0F172A',
        iconColor: '#2563EB',
        padding: '1rem 1.5rem',
        customClass: {
          popup: 'rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-slate-50',
          title: 'text-sm font-bold tracking-tight ml-2',
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });

      Toast.fire({
        icon: 'info',
        title: 'Select Your Domain First to Continue'
      });
    } else {
      navigate(`/pricing?plan=${planId}`);
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 lg:py-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm border border-blue-100/50">
            💰 AVAILABLE PLANS
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B] leading-tight mb-2">
            Simple, Transparent <span className="text-[#3B42F2]">Pricing</span>
          </h2>

          <p className="mt-2 text-xs sm:text-sm lg:text-base text-[#64748B] font-medium max-w-2xl mx-auto leading-snug">
            Choose the perfect plan to digitize and empower your institution
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
              <FiLoader className="w-10 h-10 mx-auto text-[#3B42F2] animate-spin mb-4" />
              <p className="text-[#64748B] font-bold text-lg">Finding the best plans for you...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 px-6 rounded-[40px] bg-red-50/50 border border-red-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiArrowRight className="w-8 h-8 text-red-500 rotate-180" />
              </div>
              <p className="text-[#1E293B] font-black text-xl">Failed to load plans</p>
              <p className="text-[#EF4444] font-medium mt-2">{error}</p>
              <button
                onClick={fetchPlans}
                className="mt-6 px-8 py-3 rounded-2xl bg-[#EF4444] text-white font-black shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-1 transition-all"
              >
                Retry Fetching
              </button>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
              <p className="text-[#64748B] font-bold text-lg">No active plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {plans.slice(0, 3).map((plan) => (
                <div
                  key={plan._id}
                  className={`group relative rounded-[32px] border-2 p-4 sm:p-6 text-left transition-all duration-500 hover:-translate-y-2 ${plan.popular
                      ? "border-[#3B42F2] bg-white shadow-[0_30px_70px_rgba(59,66,242,0.15)] z-10"
                      : "border-slate-100 bg-white hover:border-[#3B42F2]/20 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(59,66,242,0.1)]"
                    }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-linear-to-r from-[#1E3A8A] to-[#3B42F2] text-white text-xs font-black tracking-widest uppercase shadow-xl shadow-[#3B42F2]/30">
                      MOST POPULAR
                    </div>
                  )}

                  {/* Plan Name */}
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-[#1E293B] group-hover:text-[#3B42F2] transition-colors">
                      {plan.name}
                    </h3>
                    <p className={`text-[10px] font-bold tracking-tight ${preferredDomain ? "text-emerald-500" : "text-rose-500"}`}>
                      {preferredDomain ? `Domain: ${preferredDomain.toLowerCase()}` : "Domain Select First"}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-5 flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#1E293B]">
                        ৳{(plan.price || 0).toLocaleString()}
                      </span>
                      {plan.oldPrice && (
                        <span className="text-base font-bold text-[#94A3B8] line-through decoration-2">
                          ৳{(plan.oldPrice || 0).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {plan.badge && (
                      <span className="mt-2 inline-flex w-fit px-3 py-1 rounded-lg bg-green-50 text-green-600 text-[10px] font-black tracking-widest uppercase border border-green-100">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mb-8 flex-1">
                    <p className="text-[10px] font-black text-[#1E293B] mb-3 uppercase tracking-widest">Everything in {plan.name}:</p>
                    {plan.features && Array.isArray(plan.features) && (
                      <ul className="space-y-3">
                        {plan.features.slice(0, 8).map((feat, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-sm text-[#475569] font-semibold leading-snug"
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EFF2FF] text-[#3B42F2] group-hover:bg-[#3B42F2] group-hover:text-white transition-colors duration-300">
                              <FiCheck className="h-3 w-3 stroke-[4]" />
                            </span>
                            {feat}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={() => handleGetStarted(plan._id)}
                    className={`w-full block rounded-2xl px-6 py-4 text-base font-black text-center transition-all duration-300 ${plan.popular
                        ? "bg-linear-to-r from-[#1E3A8A] to-[#3B42F2] text-white shadow-xl shadow-[#3B42F2]/20 hover:shadow-2xl hover:shadow-[#3B42F2]/40 hover:-translate-y-1"
                        : "bg-[#EFF2FF] text-[#3B42F2] hover:bg-[#3B42F2] hover:text-white hover:shadow-xl hover:shadow-[#3B42F2]/20 hover:-translate-y-1"
                      }`}
                  >
                    Get Started Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All Plans */}
        <div className="mt-6 text-center">
          <a
            href="/pricing"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-[20px] bg-white border border-slate-100 text-[#1E293B] font-black shadow-lg shadow-slate-200/50 hover:bg-[#3B42F2] hover:text-white hover:border-[#3B42F2] hover:-translate-y-1 transition-all duration-500 group"
          >
            Explore All Premium Plans
            <FiArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
