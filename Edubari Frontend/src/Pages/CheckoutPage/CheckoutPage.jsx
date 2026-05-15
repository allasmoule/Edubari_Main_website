import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { FiArrowRight, FiCheck, FiUser, FiMail, FiHome, FiShield, FiClock, FiHeadphones, FiCalendar, FiRotateCcw } from "react-icons/fi";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan, billingPeriod } = location.state || {};

  const [formData, setFormData] = useState({
    institutionName: "",
    yourName: "",
    email: "",
    paymentMethod: "bkash",
    transactionId: "",
  });

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No plan selected</h2>
          <button 
            onClick={() => navigate("/pricing")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const orderData = {
      institutionName: formData.institutionName,
      customerName: formData.yourName,
      email: formData.email,
      paymentMethod: formData.paymentMethod,
      transactionId: formData.transactionId,
      planName: plan.name,
      price: plan.price,
      billingPeriod: billingPeriod,
      status: "pending",
      orderDate: new Date()
    };

    try {
      const response = await fetch(`${API_URL}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        console.log("Order saved successfully");
        navigate("/confirmation", { state: { plan, billingPeriod, formData } });
      } else {
        const errorData = await response.json();
        alert(`Failed to save order: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("An error occurred while saving your order. Please try again.");
    }
  };


  const paymentMethods = [
    { id: "bkash", name: "bKash", icon: "https://raw.githubusercontent.com/shafikshaon/bangladesh-payment-icons/main/icons/bkash.svg" },
    { id: "nagad", name: "Nagad", icon: "https://raw.githubusercontent.com/shafikshaon/bangladesh-payment-icons/main/icons/nagad.svg" },
    { id: "rocket", name: "Rocket", icon: "https://raw.githubusercontent.com/shafikshaon/bangladesh-payment-icons/main/icons/rocket.svg" },
  ];

  const planFeatures = plan.features || [
    "Unlimited Teachers", "Student Management", "Attendance Management", 
    "Exam & Result Management", "Fee Collection", "Parent Communication", 
    "Notice & Announcement", "Reports & Analytics", "Mobile App Access", "24/7 Support"
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#3B42F2] text-white flex items-center justify-center text-sm font-black shadow-lg shadow-blue-200">1</div>
              <span className="text-[10px] font-black text-[#3B42F2] mt-1.5 uppercase tracking-wider">Checkout</span>
            </div>
            <div className="w-16 h-[1.5px] bg-blue-200 mb-5"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-100 text-slate-400 flex items-center justify-center text-sm font-black">2</div>
              <span className="text-[10px] font-black text-slate-400 mt-1.5 uppercase tracking-wider">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
          {/* Main Form Section */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100">
            <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] mb-1.5 tracking-tight">Complete Your Order</h1>
            <p className="text-slate-500 text-xs font-bold mb-8">You are just one step away from activating {plan.name}.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Your Information */}
              <div>
                <h3 className="text-[10px] font-black text-[#1E293B] uppercase tracking-[0.15em] mb-4 opacity-70">Your Information</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <FiHome className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-sm" />
                    <input 
                      type="text" 
                      name="institutionName"
                      placeholder="School / Institution Name" 
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3B42F2] focus:bg-white transition-all text-sm font-bold text-[#1E293B] placeholder:text-slate-400"
                      value={formData.institutionName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-sm" />
                    <input 
                      type="text" 
                      name="yourName"
                      placeholder="Your Name" 
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3B42F2] focus:bg-white transition-all text-sm font-bold text-[#1E293B] placeholder:text-slate-400"
                      value={formData.yourName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-sm" />
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Email Address" 
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3B42F2] focus:bg-white transition-all text-sm font-bold text-[#1E293B] placeholder:text-slate-400"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-[10px] font-black text-[#1E293B] uppercase tracking-[0.15em] mb-4 opacity-70">Choose Payment Method</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                      className={`relative group flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 ${
                        formData.paymentMethod === method.id 
                          ? "border-[#3B42F2] bg-blue-50/30 shadow-md" 
                          : "border-slate-100 bg-slate-50 hover:border-blue-200"
                      }`}
                    >
                      <div className={`w-10 h-10 mb-1.5 flex items-center justify-center transition-all ${formData.paymentMethod === method.id ? "grayscale-0 opacity-100" : "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"}`}>
                        <img src={method.icon} alt={method.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider ${formData.paymentMethod === method.id ? "text-[#3B42F2]" : "text-slate-500"}`}>{method.name}</span>
                      {formData.paymentMethod === method.id && (
                        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#3B42F2] rounded-full flex items-center justify-center shadow-sm">
                          <FiCheck className="text-white text-[8px] stroke-[4]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Transaction ID */}
                <div className="bg-blue-50/30 rounded-xl p-5 border border-blue-100">
                  <label className="block text-[9px] font-black text-[#3B42F2] uppercase tracking-[0.2em] mb-2.5">
                    Transaction ID <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="transactionId"
                    placeholder={`Enter your ${formData.paymentMethod} Transaction ID`}
                    className="w-full px-5 py-3 bg-white border border-blue-200 rounded-xl outline-none focus:border-[#3B42F2] transition-all text-sm font-bold text-[#1E293B] placeholder:text-slate-400 mb-3"
                    value={formData.transactionId}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest leading-relaxed">
                    Send <span className="text-[#3B42F2] font-black">৳{plan.price}</span> to our <span className="text-[#3B42F2] font-black uppercase">{formData.paymentMethod}</span> number <span className="text-[#1E293B] font-black">01XXXXXXXXX</span>.
                  </p>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#3B42F2] hover:bg-blue-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-blue-100 transition-all"
              >
                Continue to Confirmation
                <FiArrowRight className="stroke-[3]" />
              </button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:sticky lg:top-8 space-y-6">
            <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100">
              <div className="bg-[#1E293B] p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <FiCheck className="text-lg text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{plan.name} Plan</h3>
                      <span className="text-[8px] font-black uppercase tracking-widest bg-blue-600 text-white px-2 py-0.5 rounded-full">Most Popular</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-white">৳{plan.price}</div>
                    <div className="text-[8px] font-bold uppercase opacity-70">
                      /{billingPeriod === "yearly" ? "year" : "month"}
                    </div>
                  </div>
                </div>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-tight">Complete School Management Solution</p>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Plan Price</span>
                    <span className="text-[#1E293B] font-black">
                      {typeof plan.price === "number" ? `৳${plan.price}.00` : plan.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span>14 Days Free Trial</span>
                    <span>-৳0.00</span>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100"></div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Due Today</span>
                  <span className="text-xl font-black text-[#3B42F2]">
                    {typeof plan.price === "number" ? `৳${plan.price}.00` : plan.price}
                  </span>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <FiCheck className="text-white text-xs" />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-0.5">14 Days Free Trial</h4>
                    <p className="text-[8px] font-bold text-emerald-600 leading-relaxed uppercase">You won't be charged today.</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">What's Included in {plan.name}</h4>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                    {planFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[8px] font-black text-slate-700 uppercase tracking-tight">
                        <FiCheck className="text-[#3B42F2] shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Features */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <FiCalendar className="text-[#3B42F2] text-base" />
                <div>
                  <h5 className="text-[9px] font-black text-[#1E293B] uppercase tracking-tight">14 Days Free</h5>
                  <p className="text-[7px] font-bold text-slate-500 uppercase">No payment today</p>
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <FiShield className="text-[#3B42F2] text-base" />
                <div>
                  <h5 className="text-[9px] font-black text-[#1E293B] uppercase tracking-tight">Secure & Safe</h5>
                  <p className="text-[7px] font-bold text-slate-500 uppercase">Data 100% protected</p>
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <FiRotateCcw className="text-[#3B42F2] text-base" />
                <div>
                  <h5 className="text-[9px] font-black text-[#1E293B] uppercase tracking-tight">Cancel Anytime</h5>
                  <p className="text-[7px] font-bold text-slate-500 uppercase">No hidden charges</p>
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center gap-2.5">
                <FiHeadphones className="text-[#3B42F2] text-base" />
                <div>
                  <h5 className="text-[9px] font-black text-[#1E293B] uppercase tracking-tight">24/7 Support</h5>
                  <p className="text-[7px] font-bold text-slate-500 uppercase">We're here to help</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
