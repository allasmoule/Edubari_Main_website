import React, { useContext, useEffect, useState } from "react";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiLoader,
  FiRefreshCw,
  FiUser,
  FiMessageSquare,
  FiImage,
  FiX,
  FiCheckCircle,
} from "react-icons/fi";
import { AuthContext } from "../../../Firebase/AuthContext";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:5000";

const initialForm = {
  quote: "",
  authorName: "",
  authorRole: "",
  authorImage: "",
};

const ReviewModal = ({ open, onClose, onSubmit, form, setForm, saving, isEdit }) => {
  if (!open) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">{isEdit ? "Edit Review" : "Add New Review"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <FiX className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Review Quote *</label>
            <textarea
              required
              value={form.quote}
              onChange={(e) => handleChange("quote", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all min-h-[100px] text-sm"
              placeholder="What did the client say?"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Author Name *</label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={form.authorName}
                onChange={(e) => handleChange("authorName", e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="Full Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Author Role *</label>
            <input
              required
              value={form.authorRole}
              onChange={(e) => handleChange("authorRole", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="e.g. Principal, Greenfield School"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Author Image URL</label>
            <div className="relative">
              <FiImage className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.authorImage}
                onChange={(e) => handleChange("authorImage", e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all uppercase text-xs tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all uppercase text-xs tracking-widest disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Save Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Reviews = () => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reviews`);
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch reviews error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `${API_URL}/reviews/${editingId}` : `${API_URL}/reviews`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setOpen(false);
        setEditingId(null);
        setForm(initialForm);
        fetchReviews();
      }
    } catch (err) {
      alert("Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const token = await user?.getIdToken();
      await fetch(`${API_URL}/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Review Management</h2>
          <p className="text-sm text-slate-500 font-bold">Manage client testimonials and reviews</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm(initialForm); setOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
        >
          <FiPlus /> Add Review
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><FiLoader className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div key={rev._id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={rev.authorImage || "https://ui-avatars.com/api/?name=" + rev.authorName} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-50"
                  alt={rev.authorName}
                />
                <div>
                  <h4 className="font-bold text-slate-800 leading-tight">{rev.authorName}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{rev.authorRole}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic mb-6">"{rev.quote}"</p>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => { setEditingId(rev._id); setForm(rev); setOpen(true); }}
                  className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100"
                >
                  <FiEdit3 />
                </button>
                <button
                  onClick={() => handleDelete(rev._id)}
                  className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        saving={saving}
        isEdit={!!editingId}
      />
    </div>
  );
};

export default Reviews;
