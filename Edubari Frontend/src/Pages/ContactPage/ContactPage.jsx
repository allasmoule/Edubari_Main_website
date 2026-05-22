import React, { useState } from "react";
import { FiUser, FiMail, FiMessageSquare, FiPhone, FiMapPin, FiMessageCircle, FiArrowRight, FiShield, FiClock, FiUsers, FiCheck, FiLoader } from "react-icons/fi";
import Swal from "sweetalert2";

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    phone: "" // Optional if you want to add phone field later
  });

  const API_URL = import.meta.env.VITE_SERVER || "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Swal.fire({
        icon: "warning",
        title: "Please fill all required fields",
        confirmButtonColor: "#3B42F2"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/contactMessages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Message Sent Successfully!",
          text: "We will get back to you soon.",
          confirmButtonColor: "#3B42F2"
        });
        setFormData({ name: "", email: "", subject: "", message: "", phone: "" });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Contact Error:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Please try again later.",
        confirmButtonColor: "#3B42F2"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-8 lg:px-16 relative overflow-hidden">
      {/* Decorative Floating Icons */}
      <div className="absolute top-20 left-10 w-12 h-12 rounded-full bg-[#3B42F2] flex items-center justify-center text-white shadow-xl shadow-blue-200 animate-bounce hidden lg:flex">
        <FiMessageSquare className="text-xl" />
      </div>
      <div className="absolute top-40 right-20 w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#3B42F2] shadow-xl shadow-blue-100 animate-pulse hidden lg:flex">
        <FiMail className="text-xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E293B] mb-4 tracking-tight">
            We're Here to Help 👋
          </h1>
          <p className="text-slate-500 font-bold text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Have questions or need support? Our team is ready to assist you.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start mb-12">
          {/* Contact Form Card */}
          <div className="bg-white rounded-[24px] p-6 sm:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-50">
            <h3 className="text-xl font-black text-[#1E293B] mb-1.5 tracking-tight">Send us a Message</h3>
            <p className="text-slate-400 text-[11px] font-bold mb-8 uppercase tracking-widest">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name" 
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-[#3B42F2] focus:bg-white transition-all text-xs font-bold text-[#1E293B] placeholder:text-slate-400"
                    required
                  />
                </div>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address" 
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-[#3B42F2] focus:bg-white transition-all text-xs font-bold text-[#1E293B] placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <FiMessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-[#3B42F2] focus:bg-white transition-all text-xs font-bold text-[#1E293B] appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Subject</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Sales Inquiry">Sales Inquiry</option>
                  <option value="Feedback">Feedback</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <FiArrowRight className="rotate-90 text-slate-400 text-xs" />
                </div>
              </div>

              <div className="relative">
                <FiMessageCircle className="absolute left-4 top-4 text-slate-300" />
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Your Message" 
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-[#3B42F2] focus:bg-white transition-all text-xs font-bold text-[#1E293B] placeholder:text-slate-400 resize-none"
                  required
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#3B42F2] hover:bg-blue-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all disabled:opacity-70"
              >
                {loading ? <FiLoader className="animate-spin text-lg" /> : "Send Message"}
                {!loading && <FiArrowRight className="stroke-[3]" />}
              </button>

              <p className="text-center text-[10px] font-bold text-slate-400 flex items-center justify-center gap-2">
                <FiShield className="text-blue-500" />
                Your information is safe with us. We'll never share your data.
              </p>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className="bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-50 space-y-10">
            <h3 className="text-xl font-black text-[#1E293B] mb-2 tracking-tight">Get in Touch</h3>
            
            <div className="space-y-8">
              {/* Phone */}
              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#3B42F2] group-hover:bg-[#3B42F2] group-hover:text-white transition-all">
                  <FiPhone className="text-lg" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-wider mb-1">Phone Support</h4>
                  <p className="text-[11px] font-bold text-[#3B42F2] mb-0.5">+880 1234 567890</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Sun - Thu: 9:00 AM - 6:00 PM</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#3B42F2] group-hover:bg-[#3B42F2] group-hover:text-white transition-all">
                  <FiMail className="text-lg" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-wider mb-1">Email Support</h4>
                  <p className="text-[11px] font-bold text-[#3B42F2] mb-0.5">support@edubari.com</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">We reply within 24 hours</p>
                </div>
              </div>

              {/* Live Chat */}
              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#3B42F2] group-hover:bg-[#3B42F2] group-hover:text-white transition-all">
                  <FiMessageSquare className="text-lg" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-wider mb-1">Live Chat</h4>
                  <p className="text-[11px] font-bold text-slate-500 mb-1 leading-tight">Chat with our support team</p>
                  <button className="text-[10px] font-black text-[#3B42F2] uppercase tracking-widest flex items-center gap-1.5 hover:gap-3 transition-all">
                    Start a live chat <FiArrowRight strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Office */}
              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#3B42F2] group-hover:bg-[#3B42F2] group-hover:text-white transition-all">
                  <FiMapPin className="text-lg" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#1E293B] uppercase tracking-wider mb-1">Our Office</h4>
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                    House 12, Road 5, Dhanmondi<br />
                    Dhaka, Bangladesh
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Footer */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-50 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3B42F2] group-hover:bg-[#3B42F2] group-hover:text-white transition-all">
              <FiClock className="text-lg" />
            </div>
            <div>
              <h5 className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">24/7 Support</h5>
              <p className="text-[9px] font-bold text-slate-400 uppercase">We're here whenever</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group border-l border-slate-50 pl-6 hidden sm:flex">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3B42F2] group-hover:bg-[#3B42F2] group-hover:text-white transition-all">
              <FiCheck className="text-lg" />
            </div>
            <div>
              <h5 className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Quick Response</h5>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Response within 24h</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group border-l border-slate-50 pl-6 hidden lg:flex">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3B42F2] group-hover:bg-[#3B42F2] group-hover:text-white transition-all">
              <FiUsers className="text-lg" />
            </div>
            <div>
              <h5 className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Expert Team</h5>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Ready to assist you</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group border-l border-slate-50 pl-6 hidden sm:flex">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3B42F2] group-hover:bg-[#3B42F2] group-hover:text-white transition-all">
              <FiShield className="text-lg" />
            </div>
            <div>
              <h5 className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Secure & Safe</h5>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Your data is protected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
