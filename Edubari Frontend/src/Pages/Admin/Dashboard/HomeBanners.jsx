import React, { useContext, useEffect, useMemo, useState } from "react";
import { FiPlus, FiEdit3, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { imageUpload } from "../../../Utils/Upload";
import { AuthContext } from "../../../Firebase/AuthContext";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  image: "",
  alt: "",
  order: 1,
  isActive: true,
};

const getBannerId = (item) => item?._id || item?.id;

const normalizeBanner = (item = {}) => ({
  ...item,
  image: item.image || item.imageUrl || item.bannerImage || "",
  alt: item.alt || item.altText || item.title || "Home page banner",
  title: item.title || "",
  subtitle: item.subtitle || item.description || "",
  order: Number.isFinite(Number(item.order)) ? Number(item.order) : 1,
  isActive:
    typeof item.isActive === "boolean"
      ? item.isActive
      : typeof item.active === "boolean"
        ? item.active
        : true,
});

const HomeBanners = () => {
  const { user } = useContext(AuthContext);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingBanner, setDeletingBanner] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");

  const activeCount = useMemo(
    () => banners.filter((item) => normalizeBanner(item).isActive).length,
    [banners],
  );

  const loadBanners = async () => {
    setLoading(true);
    setRequestError("");
    try {
      const response = await fetch(`${API_URL}/banners`);
      if (!response.ok) {
        throw new Error("Failed to fetch banners");
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : data ? [data] : [];
      setBanners(list.map(normalizeBanner));
    } catch (error) {
      setRequestError(error.message || "Failed to fetch banners");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setFormOpen(true);
  };

  const openEditModal = (banner) => {
    const normalized = normalizeBanner(banner);
    setEditingId(getBannerId(banner));
    setFormData({
      title: normalized.title,
      subtitle: normalized.subtitle,
      image: normalized.image,
      alt: normalized.alt,
      order: normalized.order,
      isActive: normalized.isActive,
    });
    setFormError("");
    setFormOpen(true);
  };

  const closeModal = () => {
    setFormOpen(false);
    setFormError("");
  };

  const showSuccess = (text) => {
    setSuccessMessage(text);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getAuthHeaders = async (includeJson = false) => {
    const token = await user?.getIdToken();
    if (!token) {
      throw new Error("Unauthorized access. Please login again.");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file.");
      return;
    }

    setUploadingImage(true);
    setFormError("");
    try {
      const uploadedUrl = await imageUpload(file);
      if (!uploadedUrl) {
        throw new Error("Image upload failed. Please try again.");
      }

      setFormData((prev) => ({
        ...prev,
        image: uploadedUrl,
      }));
    } catch (error) {
      setFormError(error.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    const title = formData.title.trim();
    const subtitle = formData.subtitle.trim();
    const image = formData.image.trim();
    const alt = formData.alt.trim();
    const order = Number(formData.order) || 1;

    if (!title || !image || !alt) {
      setFormError("Title, banner image and alt text are required.");
      return;
    }

    const payload = {
      title,
      subtitle,
      image,
      alt,
      order,
      isActive: Boolean(formData.isActive),
    };

    setIsSaving(true);
    setFormError("");
    setRequestError("");

    try {
      const url = editingId
        ? `${API_URL}/banners/${editingId}`
        : `${API_URL}/banners`;
      const method = editingId ? "PATCH" : "POST";
      const headers = await getAuthHeaders(true);
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          editingId ? "Failed to update banner" : "Failed to add banner",
        );
      }

      await loadBanners();
      showSuccess(
        editingId ? "Banner updated successfully" : "Banner added successfully",
      );
      closeModal();
    } catch (error) {
      setFormError(
        error.message ||
          (editingId ? "Failed to update banner" : "Failed to add banner"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBanner) return;

    const targetId = getBannerId(deletingBanner);
    if (!targetId) {
      setRequestError("Invalid banner id");
      return;
    }

    setIsDeleting(true);
    setRequestError("");
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/banners/${targetId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to delete banner");
      }

      setBanners((prev) =>
        prev.filter((item) => getBannerId(item) !== targetId),
      );
      setDeletingBanner(null);
      showSuccess("Banner deleted successfully");
    } catch (error) {
      setRequestError(error.message || "Failed to delete banner");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Home Banner Management
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Create, update and remove homepage hero banners
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-3 py-2 rounded-xl bg-tertiary text-white text-sm font-semibold hover:bg-tertiary/90 transition-all duration-200 inline-flex items-center gap-2 cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            Add Banner
          </button>
        </div>

        {successMessage && (
          <div className="mb-4 text-sm text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/60 rounded-xl p-3">
            {successMessage}
          </div>
        )}

        {requestError && (
          <div className="mb-4 text-sm text-rose-700 font-semibold bg-rose-50 border border-rose-200/60 rounded-xl p-3">
            {requestError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl border border-white/40 bg-white/75 p-3">
            <p className="text-xs font-bold text-dark/40">Total Banners</p>
            <p className="text-xl font-extrabold text-dark mt-1">
              {banners.length}
            </p>
          </div>
          <div className="rounded-xl border border-white/40 bg-white/75 p-3">
            <p className="text-xs font-bold text-dark/40">Active Banners</p>
            <p className="text-xl font-extrabold text-dark mt-1">
              {activeCount}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm font-semibold text-dark/55">
            Loading banners...
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12 text-sm font-semibold text-dark/55">
            No banners found. Add your first home banner.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] table-fixed">
              <thead>
                <tr className="text-left text-xs font-bold text-dark/35 uppercase tracking-wider border-b border-dark/5">
                  <th className="py-3.5 px-4 w-14">SL</th>
                  <th className="py-3.5 px-4 w-[30%]">Banner</th>
                  <th className="py-3.5 px-4 w-[22%]">Subtitle</th>
                  <th className="py-3.5 px-4 w-[12%]">Order</th>
                  <th className="py-3.5 px-4 w-[14%]">Status</th>
                  <th className="py-3.5 px-4 w-[22%] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark/5">
                {banners.map((item, index) => {
                  const banner = normalizeBanner(item);
                  const bannerId =
                    getBannerId(item) || `${banner.title}-${index}`;

                  return (
                    <tr
                      key={bannerId}
                      className="hover:bg-dark/2 transition-colors duration-150"
                    >
                      <td className="py-4 px-4 text-sm font-semibold text-dark/60">
                        {index + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={banner.image}
                            alt={banner.alt}
                            className="w-18 h-11 rounded-lg border border-dark/8 object-cover"
                          />
                          <div>
                            <p className="text-sm font-semibold text-dark/80 line-clamp-1">
                              {banner.title}
                            </p>
                            <p className="text-xs text-dark/45 mt-0.5 line-clamp-1">
                              {banner.alt}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-dark/55 font-medium line-clamp-2">
                        {banner.subtitle || "-"}
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-dark/60">
                        {banner.order}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                            banner.isActive
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                            title="Edit"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingBanner(item)}
                            className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors duration-150 cursor-pointer"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-dark/45 backdrop-blur-sm"
            onClick={closeModal}
            aria-label="Close banner form"
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl shadow-dark/10 animate-[fadeInUp_0.25s_ease-out]">
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-dark/5 bg-white/90 backdrop-blur-lg rounded-t-2xl">
              <h3 className="text-base sm:text-lg font-bold text-dark">
                {editingId ? "Update Home Banner" : "Add Home Banner"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-dark/35 hover:text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {formError && (
                <div className="text-sm text-rose-700 font-semibold bg-rose-50 border border-rose-200/60 rounded-xl p-3">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-dark/65 mb-1.5 block">
                  Banner Title *
                </label>
                <input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10"
                  placeholder="Enter banner title"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-dark/65 mb-1.5 block">
                  Subtitle
                </label>
                <textarea
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subtitle: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10"
                  placeholder="Optional subtitle text"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-dark/65 mb-1.5 block">
                  Banner Image *
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dark/10 bg-white text-sm font-semibold text-dark/70 hover:bg-dark/3 cursor-pointer transition-colors duration-150">
                    <FiUpload className="w-4 h-4" />
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>

                  <input
                    value={formData.image}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        image: e.target.value,
                      }))
                    }
                    className="flex-1 min-w-[240px] px-3 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10"
                    placeholder="Image URL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-dark/65 mb-1.5 block">
                    Alt Text *
                  </label>
                  <input
                    value={formData.alt}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, alt: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10"
                    placeholder="Banner image description"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-dark/65 mb-1.5 block">
                    Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        order: Number(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-dark/10 bg-white/70 text-sm outline-none focus:border-tertiary/40 focus:ring-2 focus:ring-tertiary/10"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm font-medium text-dark/65 select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-dark/20 text-tertiary focus:ring-tertiary/30"
                />
                Show this banner on homepage
              </label>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-dark/5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-dark/50 hover:bg-dark/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving || uploadingImage}
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-xl bg-linear-to-r from-tertiary to-[#8B5CF6] text-white text-sm font-bold hover:shadow-md hover:shadow-tertiary/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving
                    ? "Saving..."
                    : editingId
                      ? "Update Banner"
                      : "Create Banner"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-dark/45 backdrop-blur-sm"
            onClick={() => setDeletingBanner(null)}
            aria-label="Close delete modal"
          />

          <div className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl shadow-dark/10 p-5 sm:p-6 animate-[fadeInUp_0.25s_ease-out]">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <FiTrash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-dark tracking-tight mb-1">
              Delete Banner?
            </h3>
            <p className="text-sm text-dark/50 font-medium mb-5">
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingBanner(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-dark/45 hover:bg-dark/5 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeBanners;
