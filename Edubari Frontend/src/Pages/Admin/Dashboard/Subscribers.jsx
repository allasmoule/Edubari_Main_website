import React, { useEffect, useState } from "react";
import { FiTrash2, FiSearch, FiMail, FiCalendar, FiLoader, FiAlertCircle } from "react-icons/fi";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_URL}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch subscribers");
      const data = await response.json();
      setSubscribers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this subscriber?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_URL}/subscriptions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setSubscribers(subscribers.filter((s) => s._id !== id));
      }
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#1E293B] mb-2">Newsletter Subscribers</h1>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-70">
              Manage your community and email list
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subscribers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-bold text-xs"
            />
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest flex items-center gap-3">
            <FiAlertCircle className="text-lg" /> {error}
          </div>
        )}

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Subscribers</p>
            <h3 className="text-4xl font-black text-[#3B42F2]">{subscribers.length}</h3>
          </div>
        </div>

        {/* List Table */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-20 text-center">
              <FiLoader className="h-10 w-10 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Loading Subscribers...</p>
            </div>
          ) : filteredSubscribers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscriber Email</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Subscribed</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#3B42F2]">
                            <FiMail />
                          </div>
                          <span className="font-bold text-[#1E293B] text-sm">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tighter">
                          <FiCalendar className="text-blue-600" />
                          {new Date(sub.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => handleDelete(sub._id)}
                          className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all ml-auto"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                <FiMail className="text-slate-300 text-2xl" />
              </div>
              <h3 className="text-lg font-black text-[#1E293B] mb-2">No Subscribers Found</h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Start growing your community today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscribers;
