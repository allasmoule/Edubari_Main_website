import React, { useEffect, useState } from "react";
import { FiTrash2, FiSearch, FiMail, FiCalendar, FiLoader, FiAlertCircle, FiSend } from "react-icons/fi";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:5000";

const Newsletter = () => {
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
    if (!window.confirm("Remove this subscriber?")) return;
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#1E293B] mb-2">Newsletter</h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">
              Manage email marketing subscribers
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-100 shadow-sm outline-none transition-all font-bold text-xs"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#3B42F2] p-6 rounded-[24px] text-white shadow-xl shadow-blue-100">
            <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-70">Subscribers</p>
            <h3 className="text-3xl font-black">{subscribers.length}</h3>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-20 text-center flex flex-col items-center">
              <FiLoader className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Fetching Data...</p>
            </div>
          ) : filteredSubscribers.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Subscribed On</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSubscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><FiMail /></div>
                        <span className="font-bold text-[#1E293B] text-xs">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">
                      {new Date(sub.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(sub._id)} className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all ml-auto">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
              <FiMail className="text-slate-200 text-5xl mx-auto mb-4" />
              <h3 className="text-base font-black text-[#1E293B]">Empty List</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
