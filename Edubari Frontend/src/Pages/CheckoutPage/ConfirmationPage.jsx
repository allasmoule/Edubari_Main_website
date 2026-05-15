import React from "react";
import { useLocation, useNavigate } from "react-router";
import { FiCheck, FiArrowRight, FiMail, FiCalendar, FiShield, FiRotateCcw, FiHeadphones, FiHash, FiClock } from "react-icons/fi";

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan, billingPeriod, formData } = location.state || {};

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-[#1E293B]">No order found</h2>
          <button 
            onClick={() => navigate("/pricing")}
            className="px-6 py-2 bg-[#3B42F2] text-white rounded-lg font-bold"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  const orderId = "EDU-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center opacity-40">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#3B42F2] flex items-center justify-center text-sm font-black border border-blue-200">
                <FiCheck />
              </div>
              <span className="text-[10px] font-black text-slate-500 mt-1.5 uppercase tracking-wider">Checkout</span>
            </div>
            <div className="w-16 h-[1.5px] bg-blue-600 mb-5"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#3B42F2] text-white flex items-center justify-center text-sm font-black shadow-lg shadow-blue-200">2</div>
              <span className="text-[10px] font-black text-[#3B42F2] mt-1.5 uppercase tracking-wider">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
          {/* Success Content Section */}
          <div className="bg-white rounded-[24px] p-6 sm:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-50 text-center flex flex-col items-center">
            {/* Success Icon */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                  <FiCheck className="text-white text-2xl stroke-[4]" />
                </div>
              </div>
              {/* Confetti decoration bits */}
              <div className="absolute -top-3 -right-3 w-2.5 h-2.5 bg-blue-400 rounded-sm rotate-12"></div>
              <div className="absolute top-8 -left-8 w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              <div className="absolute -bottom-1 -left-3 w-2.5 h-2.5 bg-amber-400 rotate-45"></div>
            </div>

            <h1 className="text-2xl font-black text-[#1E293B] mb-2 tracking-tight">Order Confirmed!</h1>
            <p className="text-slate-500 text-xs font-bold mb-8 max-w-xs mx-auto leading-relaxed">
              Thank you for choosing EduBari {plan.name}.<br />
              Your subscription is now active.
            </p>

            {/* What's Next Box */}
            <div className="w-full bg-blue-50/20 rounded-xl p-5 mb-6 flex items-start gap-4 text-left border border-blue-50">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                <FiMail className="text-[#3B42F2] text-lg" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#1E293B] mb-0.5">What's Next?</h4>
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                  You will receive an email with your order details and login information shortly.
                </p>
              </div>
            </div>

            <button 
              onClick={() => navigate("/dashboard")}
              className="w-full bg-[#3B42F2] hover:bg-blue-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-xl shadow-blue-100 transition-all"
            >
              Go to Dashboard
              <FiArrowRight className="stroke-[3]" />
            </button>

            <div className="mt-8 flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <FiHeadphones className="text-blue-500" />
              Need help? Contact our support team.
              <button className="text-[#3B42F2] hover:underline ml-0.5">Contact Support</button>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:sticky lg:top-8 space-y-6">
            <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-50">
              <div className="bg-[#3B42F2] p-6 text-white">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <FiCheck className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{plan.name} Plan</h3>
                      <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Most Popular</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black">৳{plan.price}</div>
                    <div className="text-[8px] font-bold uppercase opacity-60">
                      /{billingPeriod === "yearly" ? "year" : "month"}
                    </div>
                  </div>
                </div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-tight">Complete School Management Solution</p>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Plan Price</span>
                    <span className="text-[#1E293B] font-black">৳{plan.price}.00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-500">
                    <span>14 Days Free Trial</span>
                    <span>-৳0.00</span>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-50"></div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1E293B] uppercase tracking-widest opacity-60">Total Paid</span>
                  <span className="text-xl font-black text-[#3B42F2]">৳{plan.price}.00</span>
                </div>

                {/* Free Trial Banner */}
                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <FiCheck className="text-white text-xs" />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">14 Days Free Trial</h4>
                    <p className="text-[8px] font-bold text-emerald-500/70 leading-relaxed uppercase">You won't be charged today.</p>
                  </div>
                </div>

                {/* Payment Method Used */}
                <div className="pt-1">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 opacity-70">Payment Method</h4>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-white rounded-lg border border-slate-50 flex items-center justify-center overflow-hidden p-1">
                        <img 
                          src={
                            formData?.paymentMethod === 'bkash' 
                              ? "https://raw.githubusercontent.com/shafikshaon/bangladesh-payment-icons/main/icons/bkash.svg" 
                              : formData?.paymentMethod === 'nagad'
                                ? "https://raw.githubusercontent.com/shafikshaon/bangladesh-payment-icons/main/icons/nagad.svg"
                                : "https://raw.githubusercontent.com/shafikshaon/bangladesh-payment-icons/main/icons/rocket.svg"
                          } 
                          alt="payment method" 
                          className="max-w-full max-h-full object-contain" 
                        />
                      </div>
                      <span className="text-[11px] font-black text-[#1E293B] capitalize">{formData?.paymentMethod || 'bKash'}</span>
                    </div>
                    <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Paid</span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="pt-1">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 opacity-70">Order Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[9px] font-bold">
                      <div className="flex items-center gap-2 text-slate-500">
                        <FiCalendar className="text-blue-500" />
                        <span>Order Date</span>
                      </div>
                      <span className="text-[#1E293B] font-black">{currentDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-bold">
                      <div className="flex items-center gap-2 text-slate-500">
                        <FiHash className="text-blue-500" />
                        <span>Order ID</span>
                      </div>
                      <span className="text-[#1E293B] font-black uppercase tracking-tight">{orderId}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-bold">
                      <div className="flex items-center gap-2 text-slate-500">
                        <FiClock className="text-blue-500" />
                        <span>Payment Status</span>
                      </div>
                      <span className="text-emerald-600 font-black uppercase">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 opacity-60">
          <div className="flex items-center gap-3 grayscale">
            <FiCheck className="text-[#3B42F2]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">14 Days Free</span>
          </div>
          <div className="flex items-center gap-3 grayscale">
            <FiShield className="text-[#3B42F2]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure & Safe</span>
          </div>
          <div className="flex items-center gap-3 grayscale">
            <FiRotateCcw className="text-[#3B42F2]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-3 grayscale">
            <FiHeadphones className="text-[#3B42F2]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
