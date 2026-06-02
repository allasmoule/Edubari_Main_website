"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiMail,
  FiInbox,
  FiTrash2,
  FiX,
  FiEye,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiUser,
  FiPhone,
  FiMessageSquare,
  FiCheckCircle,
  FiSend,
  FiSearch,
} from "react-icons/fi";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, read, unread
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/contact-messages");
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      
      const sorted = [...list].sort((a, b) => {
        const aTime = new Date(a?.created_at || a?.createdAt || 0).getTime();
        const bTime = new Date(b?.created_at || b?.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setMessages(sorted);
    } catch (err) {
      console.error(err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleToggleRead = async (id, currentRead) => {
    setActionLoadingId(id);
    try {
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !currentRead }),
      });
      if (!response.ok) throw new Error("Failed to toggle read state");
      
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, read: !currentRead } : msg))
      );
      
      // Fetch latest messages to sync
      fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    
    setActionLoadingId(id);
    try {
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete message");
      
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete message");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;

    setSendingReply(true);
    try {
      const response = await fetch(`/api/contact-messages/${selectedMessage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: replyText.trim(), read: true }),
      });
      
      if (!response.ok) throw new Error("Failed to send reply");
      const data = await response.json();
      const updated = data.contactMessage || data;
      
      setMessages((prev) =>
        prev.map((msg) => (msg.id === selectedMessage.id ? { ...msg, ...updated, read: true } : msg))
      );
      setSelectedMessage((prev) => ({ ...prev, ...updated, read: true }));
      setReplyText("");
      alert("Reply saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save reply");
    } finally {
      setSendingReply(false);
    }
  };

  /* Metrics and filtering */
  const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

  const filtered = useMemo(() => {
    return messages
      .filter((m) => {
        if (filter === "unread") return !m.read;
        if (filter === "read") return m.read;
        return true;
      })
      .filter((m) => {
        const text = (m.name || "").toLowerCase() + 
                     (m.email || "").toLowerCase() + 
                     (m.subject || "").toLowerCase() + 
                     (m.message || "").toLowerCase();
        return text.includes(search.toLowerCase());
      });
  }, [messages, filter, search]);

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Inquiries & Messages
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Read and reply to direct queries sent from the contact form.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMessages}
            className="px-3 py-2 rounded-xl border border-dark/10 text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer inline-flex items-center gap-2 border-none bg-transparent"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl border border-white/40 bg-white/75 p-3">
            <p className="text-xs font-bold text-dark/40">Total Inquiries</p>
            <p className="text-xl font-extrabold text-dark mt-1">
              {messages.length}
            </p>
          </div>
          <div className="rounded-xl border border-white/40 bg-white/75 p-3">
            <p className="text-xs font-bold text-dark/40">Unread Threads</p>
            <p className="text-xl font-extrabold text-red-500 mt-1">
              {unreadCount}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 py-4 border-b border-dark/5 bg-white/40 backdrop-blur-xs justify-between mb-5 px-3 rounded-xl">
          <div className="flex items-center border border-dark/10 bg-white/60 rounded-xl px-3 py-2 w-full sm:max-w-xs transition-all focus-within:border-tertiary/50">
            <FiSearch className="w-4 h-4 text-dark/30 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-medium bg-transparent outline-none text-dark placeholder:text-dark/30 border-none p-0"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto select-none py-1">
            {["all", "unread", "read"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                  filter === f
                    ? "bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white border-transparent shadow-sm shadow-tertiary/20"
                    : "bg-white/60 border-dark/10 text-dark/65 hover:bg-white hover:border-tertiary/20 hover:-translate-y-0.5"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="py-24 text-center">
            <FiLoader className="w-8 h-8 mx-auto text-tertiary animate-spin mb-3" />
            <p className="text-dark/50 font-semibold text-sm">Loading inquiries...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 inline-flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-24 text-center border border-dark/10 bg-white/40 rounded-2xl">
            <FiMessageSquare className="w-12 h-12 mx-auto text-dark/20 mb-3" />
            <p className="text-dark/50 font-bold">No Messages Found</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-2xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 shadow-md ${
                  msg.read
                    ? "border-white/45 bg-white/45 hover:bg-white/70"
                    : "border-tertiary/25 bg-linear-to-r from-tertiary/5 to-[#8B5CF6]/5 hover:bg-white/80 ring-1 ring-tertiary/10"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-dark">{msg.name}</span>
                    <span className="text-[10px] text-dark/45 font-medium">{formatDateTime(msg.created_at || msg.createdAt)}</span>
                  </div>
                  <p className="text-xs text-dark/55 font-medium mt-1">Email: {msg.email} | Phone: {msg.phone || "-"}</p>
                  <p className="text-sm font-semibold text-dark mt-2.5">Subject: {msg.subject || "(No Subject)"}</p>
                  <p className="text-xs text-dark/65 mt-1.5 leading-relaxed line-clamp-2">{msg.message}</p>
                  
                  {msg.response && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-800 leading-relaxed max-w-2xl">
                      <strong className="text-emerald-700">Reply:</strong> {msg.response}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (!msg.read) {
                        handleToggleRead(msg.id, false);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-dark/10 text-xs font-bold text-dark hover:bg-white transition-all cursor-pointer bg-transparent"
                  >
                    <FiEye className="w-4 h-4" /> View Thread
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleToggleRead(msg.id, msg.read)}
                    disabled={actionLoadingId === msg.id}
                    className="p-2.5 rounded-xl border border-dark/10 hover:bg-white text-dark/65 cursor-pointer bg-transparent"
                  >
                    {msg.read ? <FiInbox className="w-4 h-4 text-emerald-600" /> : <FiMail className="w-4 h-4 text-tertiary" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(msg.id)}
                    disabled={actionLoadingId === msg.id}
                    className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 cursor-pointer bg-transparent"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
            onClick={() => setSelectedMessage(null)}
          />
          <div className="relative w-full max-w-xl rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl p-6 z-10 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center justify-between pb-4 border-b border-dark/5 mb-5">
              <h3 className="text-base font-bold text-dark flex items-center gap-2">
                <FiMessageSquare className="w-5 h-5 text-tertiary" /> View Message Thread
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="p-1 rounded-lg text-dark/30 hover:text-dark/65 hover:bg-dark/5 border-none bg-transparent cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-dark/[0.02] border border-dark/5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-dark/60">
                  <FiUser className="w-4 h-4" />
                  <span className="font-bold text-dark">{selectedMessage.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-dark/60">
                  <FiMail className="w-4 h-4" />
                  <span>{selectedMessage.email}</span>
                </div>
                {selectedMessage.phone && (
                  <div className="flex items-center gap-2 text-xs text-dark/60">
                    <FiPhone className="w-4 h-4" />
                    <span>{selectedMessage.phone}</span>
                  </div>
                )}
                <div className="text-[10px] text-dark/40 font-medium">
                  Sent: {formatDateTime(selectedMessage.created_at || selectedMessage.createdAt)}
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-dark">Subject: {selectedMessage.subject || "(No Subject)"}</h4>
                <p className="text-xs sm:text-sm text-dark/70 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {selectedMessage.response && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-800 leading-relaxed">
                  <div className="flex items-center gap-2 mb-1.5 text-emerald-700 font-bold">
                    <FiCheckCircle className="w-4 h-4" /> Sent Reply ({formatDateTime(selectedMessage.replied_at)})
                  </div>
                  {selectedMessage.response}
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-dark/5 space-y-3">
                <label className="block text-xs font-bold text-dark/60 uppercase">
                  {selectedMessage.response ? "Update Saved Reply" : "Compose Reply"}
                </label>
                <textarea
                  rows="3"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a response to save for records..."
                  className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-xs sm:text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-xs font-bold shadow-md shadow-tertiary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all border-none cursor-pointer disabled:opacity-50"
                  >
                    <FiSend className="w-3.5 h-3.5" />
                    {sendingReply ? "Saving..." : "Save Reply"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
