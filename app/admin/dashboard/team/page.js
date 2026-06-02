"use client";

import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiX,
  FiUsers,
  FiAlertCircle,
  FiLoader,
  FiToggleLeft,
  FiToggleRight,
  FiSearch,
  FiUploadCloud
} from "react-icons/fi";

const TeamMemberModal = ({ member, onSave, onClose, saving }) => {
  const isEdit = !!member?.id;
  const [form, setForm] = useState({
    id: member?.id || undefined,
    name: member?.name || "",
    description: member?.description || "",
    image_url: member?.image_url || "",
    order_index: member?.order_index || 1,
    active: member?.active ?? true,
  });
  const [errors, setErrors] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.image_url.trim()) errs.image_url = "Image is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrors({ ...errors, image_url: "" });

    try {
      const formData = new FormData();
      formData.append("image", file);

      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!apiKey) {
        throw new Error("ImgBB API Key is missing in environment variables.");
      }

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setForm({ ...form, image_url: data.data.url });
      } else {
        throw new Error("Failed to upload image to ImgBB.");
      }
    } catch (err) {
      console.error(err);
      setErrors({ ...errors, image_url: "Image upload failed. Please try again or paste a URL." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl p-6 z-10 animate-[fadeInUp_0.3s_ease-out]">
        <div className="flex items-center justify-between pb-4 border-b border-dark/5 mb-5">
          <h3 className="text-base font-bold text-dark">
            {isEdit ? "Edit Team Member" : "Add Team Member"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-dark/30 hover:text-dark/65 hover:bg-dark/5 border-none bg-transparent cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Asif Rabetul"
              className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
            />
            {errors.name && <p className="text-xs text-red-500 font-semibold mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Description / Designation</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Founder & CEO"
              className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Image *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="Image URL"
                className="flex-1 rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
              />
              <label className="flex items-center justify-center gap-2 px-4 rounded-xl bg-dark/5 hover:bg-dark/10 cursor-pointer transition-all border border-dark/10">
                {uploadingImage ? <FiLoader className="animate-spin w-4 h-4 text-tertiary" /> : <FiUploadCloud className="w-4 h-4 text-dark/70" />}
                <span className="text-sm font-bold text-dark/70 whitespace-nowrap">Upload</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            {errors.image_url && <p className="text-xs text-red-500 font-semibold mt-1">{errors.image_url}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark/60 uppercase mb-1.5">Order Index</label>
              <input
                type="number"
                value={form.order_index}
                onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
                className="w-full rounded-xl border border-dark/10 bg-white px-4 py-3 text-sm font-medium text-dark outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 transition-all"
              />
            </div>
            <div className="flex items-center gap-2.5 pt-6">
              <button
                type="button"
                onClick={() => setForm({ ...form, active: !form.active })}
                className="cursor-pointer bg-transparent border-none p-0 flex items-center"
              >
                {form.active ? (
                  <FiToggleRight className="w-6 h-6 text-emerald-500" />
                ) : (
                  <FiToggleLeft className="w-6 h-6 text-dark/20" />
                )}
              </button>
              <span className="text-xs font-bold text-dark/60">Visible</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-dark/50 hover:bg-dark/5 border-none bg-transparent cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] text-white text-sm font-bold shadow-md shadow-tertiary/25 hover:shadow-lg hover:-translate-y-0.5 transition-all border-none cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/team");
      if (!response.ok) throw new Error("Failed to fetch team members");
      const data = await response.json();
      setMembers(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      const id = formData.id;
      const method = id ? "PATCH" : "POST";
      const url = id ? `/api/team/${id}` : "/api/team";

      const payload = {
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
        order_index: formData.order_index,
        active: formData.active,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save team member");
      const saved = await response.json();

      if (id) {
        setMembers((prev) => prev.map((p) => (p.id === id ? saved : p)));
      } else {
        setMembers((prev) => [...prev, saved].sort((a, b) => (a.order_index || 1) - (b.order_index || 1)));
      }

      setShowModal(false);
      setEditingMember(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save team member");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) return;

    try {
      const response = await fetch(`/api/team/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete team member");
      setMembers((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete team member");
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const response = await fetch(`/api/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      setMembers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: !currentActive } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = members.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Team Members
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Add and edit team members displayed on the About Us page.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingMember({});
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-tertiary to-[#8B5CF6] px-4 py-2.5 text-white text-xs sm:text-sm font-bold shadow-md shadow-tertiary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all border-none cursor-pointer"
          >
            <FiPlus className="w-4 h-4 stroke-[3]" /> Add Member
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center border border-dark/10 bg-white/60 rounded-xl px-3 py-2 w-full sm:max-w-xs transition-all focus-within:border-tertiary/50 mb-5">
          <FiSearch className="w-4 h-4 text-dark/30 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-medium bg-transparent outline-none text-dark placeholder:text-dark/30 border-none p-0"
          />
        </div>

        {loading && (
          <div className="py-24 text-center">
            <FiLoader className="w-8 h-8 mx-auto text-tertiary animate-spin mb-3" />
            <p className="text-dark/50 font-semibold text-sm">Loading team members...</p>
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
            <FiUsers className="w-12 h-12 mx-auto text-dark/20 mb-3" />
            <p className="text-dark/50 font-bold">No Members Found</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((member) => (
              <div
                key={member.id}
                className="group rounded-2xl border border-white/40 bg-white/50 hover:bg-white/80 p-5 flex flex-col items-center text-center transition-all duration-300 shadow-md"
              >
                {member.image_url && (
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 relative bg-dark/5 ring-4 ring-white shadow-lg">
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex-1 w-full">
                  <h3 className="text-base font-bold text-dark">{member.name}</h3>
                  <p className="text-xs text-dark/55 font-medium mt-1">{member.description}</p>
                </div>

                <div className="w-full mt-5 pt-3 border-t border-dark/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(member.id, member.active)}
                    className="flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                  >
                    {member.active ? (
                      <FiToggleRight className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <FiToggleLeft className="w-6 h-6 text-dark/20" />
                    )}
                    <span className="text-[11px] font-bold text-dark/45">Visible</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMember(member);
                        setShowModal(true);
                      }}
                      className="p-2 rounded-lg border border-dark/10 hover:bg-dark/5 text-dark/65 cursor-pointer bg-transparent"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(member.id)}
                      className="p-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 cursor-pointer bg-transparent"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TeamMemberModal
          member={editingMember}
          saving={saving}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}
