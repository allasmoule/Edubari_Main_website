"use client";

import React, { useState, useEffect } from "react";
import { FiUsers, FiMail, FiCalendar, FiLoader, FiSearch } from "react-icons/fi";

export default function CollectedLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) =>
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight flex items-center gap-2">
              <FiUsers className="text-tertiary" /> Collected Leads
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              View all email addresses collected from the newsletter popup.
            </p>
          </div>
          
          <div className="relative max-w-xs w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-dark/10 bg-white text-sm font-medium outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-24 text-center">
            <FiLoader className="w-8 h-8 mx-auto text-tertiary animate-spin mb-3" />
            <p className="text-dark/50 font-semibold text-sm">Loading leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-dark/10 rounded-2xl bg-white/50">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-dark/5 text-dark/40 mb-3">
              <FiMail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-dark">No leads found</h3>
            <p className="text-sm text-dark/50 mt-1">
              {searchTerm ? "Try a different search term" : "When users subscribe to the newsletter, they will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark/5 text-xs font-bold text-dark/40 uppercase tracking-wider">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Subscribed On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark/5">
                {filteredLeads.map((lead, idx) => (
                  <tr key={lead.id} className="hover:bg-dark/[0.02] transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-dark/50">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-dark">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-tertiary/60" />
                        {lead.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-dark/60">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="w-3.5 h-3.5 text-dark/40" />
                        {new Date(lead.created_at).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
