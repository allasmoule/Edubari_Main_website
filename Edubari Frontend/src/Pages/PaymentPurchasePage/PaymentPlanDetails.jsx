import React, { useState } from "react";
import { 
  FiGrid, 
  FiUsers, 
  FiUser, 
  FiCalendar, 
  FiBookOpen, 
  FiCheckSquare, 
  FiDollarSign, 
  FiHeadphones, 
  FiBell, 
  FiChevronLeft, 
  FiChevronRight, 
  FiCheckCircle, 
  FiShield, 
  FiLock, 
  FiArrowRight, 
  FiAward 
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router";

const PaymentPlanDetails = () => {
  const [activeTab, setActiveTab] = useState("admin");
  const navigate = useNavigate();
  const location = useLocation();
  const { plan, billingPeriod } = location.state || { 
    plan: { name: "EduPro", price: 249 }, 
    billingPeriod: "monthly" 
  };

  const tabs = [
    { id: "admin", label: "Admin Dashboard", icon: <FiGrid className="w-5 h-5" /> },
    { id: "teacher", label: "Teacher Panel", icon: <FiUser className="w-5 h-5" /> },
    { id: "student", label: "Student Dashboard", icon: <FiUsers className="w-5 h-5" /> },
  ];

  const features = [
    {
      icon: <FiGrid className="w-7 h-7 text-indigo-600" />,
      title: "AI for Timetables",
      desc: "Automate scheduling"
    },
    {
      icon: <FiShield className="w-7 h-7 text-indigo-600" />,
      title: "Exams & Marks",
      desc: "Create and analyze"
    },
    {
      icon: <FiDollarSign className="w-7 h-7 text-indigo-600" />,
      title: "Mobile Wallet",
      desc: "Secure payments"
    },
    {
      icon: <FiHeadphones className="w-7 h-7 text-indigo-600" />,
      title: "24/7 Support",
      desc: "Always online"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-[#1E293B] overflow-x-hidden">
      {/* --- Top Hero Section --- */}
      <section className="pt-12 md:pt-16 pb-8 md:pb-10 px-4 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        <div className="flex-1 space-y-4 md:space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Effortless School <br /> Management, <br />
            <span className="text-indigo-600">Better Results</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-md leading-relaxed">
            The all-in-one platform for modern institutions
          </p>
          
          <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 inline-flex flex-col gap-2">
             <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold self-start uppercase tracking-wider">
               <FiCheckCircle className="w-3.5 h-3.5" />
               Success Plan
             </div>
             <div className="flex items-center gap-4">
                <span className="text-2xl font-bold tracking-tight">{plan.name}</span>
                <button className="text-indigo-600 font-bold flex items-center gap-1 text-xs hover:gap-2 transition-all">
                  See details <FiChevronRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>

        <div className="flex-1 relative w-full max-w-2xl">
           <div className="relative z-10">
              <img 
                src="https://img.freepik.com/free-vector/gradient-ui-ux-elements-background_23-2149056159.jpg?t=st=1715745000~exp=1715748600~hmac=98a3b8655298a0005a766789e909a888c88c88c88c88c88c88c88c88c88c88c8&w=1380" 
                alt="Laptop Mockup" 
                className="rounded-xl shadow-2xl border-4 md:border-8 border-slate-900 w-full"
              />
              <div className="absolute -left-6 md:-left-10 -bottom-6 md:-bottom-10 w-32 md:w-48 z-20">
                 <img 
                  src="https://img.freepik.com/free-vector/gradient-ui-ux-elements-background_23-2149056159.jpg?w=1380" 
                  alt="Phone Mockup" 
                  className="rounded-2xl md:rounded-3xl shadow-2xl border-2 md:border-4 border-slate-900 h-56 md:h-80 w-full object-cover"
                />
              </div>
           </div>
        </div>
      </section>

      {/* --- Plan & Product Deep Dive Section --- */}
      <section className="bg-[#F8FAFC] py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto text-center mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Plan & Product Deep Dive</h2>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">Explore the key dashboards and features included in your plan</p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-6 md:mt-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                    : "bg-white text-slate-600 hover:bg-indigo-50 border border-slate-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto relative group">
          <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex h-[500px] md:h-[600px]">
              {/* Sidebar */}
              <div className="w-60 bg-[#1E293B] text-slate-400 p-5 flex flex-col gap-6 hidden lg:flex">
                <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black">{plan.name.substring(0, 2).toUpperCase()}</div>
                  {plan.name}
                </div>
                <div className="space-y-1">
                  <div className="bg-indigo-600/20 text-white flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all">
                    <FiGrid className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold">Dashboard</span>
                  </div>
                  {[
                    { icon: <FiUsers />, label: "Students" },
                    { icon: <FiUser />, label: "Teachers" },
                    { icon: <FiCalendar />, label: "Attendance" },
                    { icon: <FiBookOpen />, label: "Exams" },
                    { icon: <FiCheckSquare />, label: "Payments" },
                    { icon: <FiBell />, label: "Notices" },
                    { icon: <FiGrid />, label: "Reports" },
                    { icon: <FiShield />, label: "Settings" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group/item">
                      <span className="w-4 h-4 opacity-70 group-hover/item:opacity-100 transition-opacity">{item.icon}</span>
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-100 p-5 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold tracking-tight">Good Morning, Admin! 👋</h3>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium">Arambam Interrecords Inter Higher School</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 bg-slate-50 rounded-full relative hover:bg-slate-100 transition-colors">
                      <FiBell className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <div className="flex items-center gap-3 border-l border-slate-100 pl-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold leading-tight">Admin</p>
                        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">Super Admin</p>
                      </div>
                      <img src="https://ui-avatars.com/api/?name=Admin&background=random" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
                    </div>
                  </div>
                </header>

                <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 overflow-y-auto">
                   {[
                     { label: "Total Students", value: "1,348", sub: "All Students", color: "text-indigo-600", bg: "bg-indigo-50", icon: <FiUsers /> },
                     { label: "Total Attendance", value: "93%", sub: "Avg Attendance", color: "text-emerald-600", bg: "bg-emerald-50", icon: <FiCalendar /> },
                     { label: "Total Teachers", value: "78", sub: "All Teachers", color: "text-sky-600", bg: "bg-sky-50", icon: <FiUser /> },
                     { label: "Total Revenue", value: "৳24,500", sub: "This Month", color: "text-orange-600", bg: "bg-orange-50", icon: <FiDollarSign /> },
                   ].map((stat, i) => (
                     <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <div className="flex items-center justify-between">
                           <span className="text-xl md:text-2xl font-extrabold tracking-tight">{stat.value}</span>
                           <div className={`w-7 h-7 md:w-8 md:h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                              {stat.icon}
                           </div>
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium">{stat.sub}</p>
                     </div>
                   ))}

                   <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <h4 className="font-bold text-xs mb-4 uppercase tracking-wider text-slate-400">Attendance Overview</h4>
                      <div className="flex items-center gap-6">
                         <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                               <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                               <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="251" strokeDashoffset="25" className="text-indigo-600" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-lg md:text-xl font-black">90%</span>
                            </div>
                         </div>
                         <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-bold"><span className="w-2 h-2 bg-indigo-600 rounded-full"></span> Present 90%</div>
                            <div className="flex items-center gap-2 text-[10px] font-bold"><span className="w-2 h-2 bg-rose-400 rounded-full"></span> Absent 8%</div>
                            <div className="flex items-center gap-2 text-[10px] font-bold"><span className="w-2 h-2 bg-emerald-400 rounded-full"></span> Leave 2%</div>
                         </div>
                      </div>
                      <p className="mt-4 text-[10px] font-bold text-slate-300">Updated: Just Now</p>
                   </div>

                   <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Upcoming Exams</h4>
                        <button className="text-[9px] text-indigo-600 font-black hover:underline">VIEW ALL</button>
                      </div>
                      <div className="space-y-3">
                        {[
                          { title: "Maths Test", date: "18 May 2024" },
                          { title: "Science Quiz", date: "20 May 2024" },
                          { title: "Class Test", date: "24 May 2024" },
                        ].map((exam, i) => (
                          <div key={i} className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                                <FiCalendar className="w-4 h-4" />
                             </div>
                             <div className="min-w-0">
                                <p className="text-[10px] font-bold truncate">{exam.title}</p>
                                <p className="text-[8px] text-slate-400 font-medium">{exam.date}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Recent Notices</h4>
                        <button className="text-[9px] text-indigo-600 font-black hover:underline">VIEW ALL</button>
                      </div>
                      <div className="space-y-3">
                        {[
                          { title: "Half Year Schedule", date: "18 May 2024" },
                          { title: "Science Quiz Info", date: "20 May 2024" },
                          { title: "Sports Event", date: "22 May 2024" },
                        ].map((notice, i) => (
                          <div key={i} className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                                <FiBell className="w-4 h-4" />
                             </div>
                             <div className="min-w-0">
                                <p className="text-[10px] font-bold leading-tight truncate">{notice.title}</p>
                                <p className="text-[8px] text-slate-400 font-medium">{notice.date}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <button className="absolute left-[-16px] md:left-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center border border-slate-100 hover:bg-slate-50 transition-all z-30 text-slate-600 active:scale-90">
            <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button className="absolute right-[-16px] md:right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center border border-slate-100 hover:bg-slate-50 transition-all z-30 text-slate-600 active:scale-90">
            <FiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div className="flex justify-center gap-2 mt-6 md:mt-8">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="bg-white py-8 md:py-10 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 md:gap-4 group">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <div>
                <h4 className="font-bold text-xs md:text-sm">{f.title}</h4>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Sticky Footer Bar --- */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-6 md:gap-8">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Price</span>
                <div className="flex items-baseline gap-1">
                   <span className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900">৳{plan.price}</span>
                   <span className="text-[10px] text-slate-400 font-bold">/{billingPeriod === "monthly" ? "month" : "year"}</span>
                </div>
             </div>
             
             <div className="hidden lg:flex items-center gap-6 border-l border-slate-100 pl-6">
                {[
                  { icon: <FiCheckCircle />, title: "14 Days Free", sub: "No card required", bg: "bg-emerald-50", color: "text-emerald-600" },
                  { icon: <FiShield />, title: "SSL Secured", sub: "Data is safe", bg: "bg-indigo-50", color: "text-indigo-600" },
                  { icon: <FiLock />, title: "100% Secure", sub: "Trusted checkout", bg: "bg-blue-50", color: "text-blue-600" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                     <div className={`w-8 h-8 ${item.bg} ${item.color} rounded-lg flex items-center justify-center`}>
                        {item.icon}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold leading-tight">{item.title}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{item.sub}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 w-full sm:w-auto">
             <button 
                onClick={() => navigate("/checkout", { state: { plan, billingPeriod } })}
                className="w-full sm:w-auto bg-indigo-700 text-white px-8 md:px-10 py-2.5 md:py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-3 hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-100 active:scale-95 group"
             >
               Continue to Checkout
               <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
             <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                <FiLock className="w-2.5 h-2.5" />
                You can cancel anytime
             </div>
          </div>
        </div>
      </footer>
      
      <div className="h-24 md:h-28"></div>
    </div>
  );
};

export default PaymentPlanDetails;
