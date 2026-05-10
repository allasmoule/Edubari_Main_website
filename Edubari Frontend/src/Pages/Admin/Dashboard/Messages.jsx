import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FiLoader,
  FiRefreshCw,
  FiMessageSquare,
  FiMail,
  FiUser,
  FiFileText,
  FiTrash2,
} from "react-icons/fi";
import { AuthContext } from "../../../Firebase/AuthContext";

const API_URL = import.meta.env.VITE_SERVER || "http://localhost:3000";
const IMPORTANCE_OPTIONS = ["More", "Usual", "Less", "Duplicate", "Spam"];
const STATUS_OPTIONS = ["To be replied", "Replied"];
const FILTER_ALL = "All";

const formatDateTime = (value) => {
  if (!value) return { dateText: "-", timeText: "-" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { dateText: "-", timeText: "-" };

  const dateText = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
  const timeText = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { dateText, timeText };
};

const getImportanceSelectClass = (importance) => {
  const value = (importance || "Usual").toLowerCase();
  if (value === "more") return "bg-amber-50 text-amber-700 border-amber-200";
  if (value === "less") return "bg-sky-50 text-sky-700 border-sky-200";
  if (value === "duplicate")
    return "bg-slate-100 text-slate-700 border-slate-200";
  if (value === "spam") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-white/80 text-dark/70 border-dark/10";
};

const getStatusSelectClass = (status) => {
  const value = (status || "To be replied").toLowerCase();
  if (value === "replied")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

const Messages = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingImportanceId, setSavingImportanceId] = useState("");
  const [savingStatusId, setSavingStatusId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [importanceFilter, setImportanceFilter] = useState(FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState(FILTER_ALL);
  const [detailTarget, setDetailTarget] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [savingResponseId, setSavingResponseId] = useState("");

  const totalMessages = useMemo(() => messages.length, [messages]);
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const messageImportance = msg.importance || "Usual";
      const messageStatus = msg.status || "To be replied";

      const importanceMatched =
        importanceFilter === FILTER_ALL ||
        messageImportance === importanceFilter;
      const statusMatched =
        statusFilter === FILTER_ALL || messageStatus === statusFilter;

      return importanceMatched && statusMatched;
    });
  }, [messages, importanceFilter, statusFilter]);

  const getAuthHeaders = useCallback(
    async (includeJson = false) => {
      const token = await user?.getIdToken?.();
      if (!token) throw new Error("Unauthorized access");

      const headers = { Authorization: `Bearer ${token}` };
      if (includeJson) headers["Content-Type"] = "application/json";
      return headers;
    },
    [user],
  );

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/contactMessages`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch contact messages");

      const data = await response.json();
      const list = Array.isArray(data) ? data : data?.messages;
      setMessages(Array.isArray(list) ? list : []);
    } catch (err) {
      setMessages([]);
      setError(err.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleImportanceChange = async (msg, importance) => {
    if (!msg?._id) {
      setMessages((prev) =>
        prev.map((item) => (item === msg ? { ...item, importance } : item)),
      );
      return;
    }

    setSavingImportanceId(msg._id);
    try {
      const response = await fetch(`${API_URL}/contactMessages/${msg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importance }),
      });
      if (!response.ok) throw new Error("Failed to update importance");

      setMessages((prev) =>
        prev.map((item) =>
          item._id === msg._id ? { ...item, importance } : item,
        ),
      );
    } catch (err) {
      alert(err.message || "Failed to update importance");
    } finally {
      setSavingImportanceId("");
    }
  };

  const handleDelete = async (msg) => {
    if (!msg?._id) {
      alert("Cannot delete this message");
      return;
    }

    setDeletingId(msg._id);
    try {
      const response = await fetch(`${API_URL}/contactMessages/${msg._id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete message");

      setMessages((prev) => prev.filter((item) => item._id !== msg._id));
      setDeleteTarget(null);
      setSuccessMessage("Message deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      alert(err.message || "Delete failed");
    } finally {
      setDeletingId("");
    }
  };

  const handleStatusChange = async (msg, status) => {
    if (!msg?._id) {
      setMessages((prev) =>
        prev.map((item) => (item === msg ? { ...item, status } : item)),
      );
      return;
    }

    setSavingStatusId(msg._id);
    try {
      const response = await fetch(`${API_URL}/contactMessages/${msg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");

      setMessages((prev) =>
        prev.map((item) => (item._id === msg._id ? { ...item, status } : item)),
      );
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setSavingStatusId("");
    }
  };

  const openDetailsModal = async (msg) => {
    if (!msg?._id) {
      setDetailTarget(msg);
      setResponseText(msg.response || msg.reply || "");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/contactMessages/${msg._id}`, {
        headers: await getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to load message details");

      const data = await response.json();
      const detailedMessage =
        data && typeof data.message === "object"
          ? data.message
          : data && typeof data.data === "object"
            ? data.data
            : data;

      const mergedMessage = { ...msg, ...detailedMessage };
      setDetailTarget(mergedMessage);
      setResponseText(mergedMessage.response || mergedMessage.reply || "");
    } catch (err) {
      alert(err.message || "Failed to load message details");
      setDetailTarget(msg);
      setResponseText(msg.response || msg.reply || "");
    }
  };

  const handleSaveResponse = async () => {
    if (!detailTarget) return;

    const targetMessage = detailTarget;
    const responseValue = responseText;

    setDetailTarget(null);
    setResponseText("");

    if (!targetMessage._id) {
      const updated = {
        ...targetMessage,
        response: responseValue,
        repliedAt: new Date().toISOString(),
        status: "Replied",
      };
      setMessages((prev) =>
        prev.map((item) => (item === targetMessage ? updated : item)),
      );
      setSuccessMessage("Response saved successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    setSavingResponseId(targetMessage._id);
    try {
      const payload = {
        response: responseValue,
        status: "Replied",
        repliedAt: new Date().toISOString(),
      };

      const response = await fetch(
        `${API_URL}/contactMessages/${targetMessage._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error("Failed to save response");

      setMessages((prev) =>
        prev.map((item) =>
          item._id === targetMessage._id ? { ...item, ...payload } : item,
        ),
      );
      setSuccessMessage("Response saved successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      alert(err.message || "Failed to save response");
    } finally {
      setSavingResponseId("");
    }
  };

  return (
    <div className="space-y-6 animate-[fadeInUp_0.35s_ease-out]">
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 sm:p-6 shadow-lg shadow-dark/3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
              Contact Messages
            </h2>
            <p className="text-xs sm:text-sm text-dark/45 font-medium mt-1">
              Messages submitted from the contact form
            </p>
          </div>

          <button
            onClick={fetchMessages}
            className="px-3 py-2 rounded-xl border border-dark/10 text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="rounded-xl border border-white/40 bg-white/75 p-3">
            <p className="text-xs font-bold text-dark/40">Total Messages</p>
            <p className="text-xl font-extrabold text-dark mt-1">
              {totalMessages}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-dark/45 uppercase tracking-wide mb-1.5">
              Filter by Importance
            </label>
            <select
              value={importanceFilter}
              onChange={(e) => setImportanceFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-dark/10 bg-white/80 text-sm font-semibold text-dark/70 outline-none focus:ring-2 focus:ring-tertiary/20"
            >
              <option value={FILTER_ALL}>{FILTER_ALL}</option>
              {IMPORTANCE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-dark/45 uppercase tracking-wide mb-1.5">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-dark/10 bg-white/80 text-sm font-semibold text-dark/70 outline-none focus:ring-2 focus:ring-tertiary/20"
            >
              <option value={FILTER_ALL}>{FILTER_ALL}</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {successMessage && (
          <div className="mb-5 text-sm text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/60 rounded-xl p-3">
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-14 text-dark/50">
            <FiLoader className="w-5 h-5 animate-spin mr-2" />
            Loading messages...
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 font-semibold bg-red-50 border border-red-200/60 rounded-xl p-3">
            {error}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <FiMessageSquare className="w-8 h-8 text-tertiary/60 mx-auto mb-2" />
            <p className="text-sm font-semibold text-dark/60">
              No messages found
            </p>
            <p className="text-xs text-dark/40 mt-1">
              No message matches the selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180">
              <thead>
                <tr className="text-left text-xs font-bold text-dark/35 uppercase tracking-wider border-b border-dark/5">
                  <th className="py-3 px-3">SL</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Message</th>
                  <th className="py-3 px-3">Importance</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark/5">
                {filteredMessages.map((msg, index) => (
                  <tr
                    key={
                      msg._id ||
                      `${msg.email || "email"}-${msg.subject || "subject"}`
                    }
                    onClick={() => openDetailsModal(msg)}
                    className="hover:bg-dark/2 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="py-3.5 px-3 text-sm font-semibold text-dark/60">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-dark/45 font-semibold">
                      {(() => {
                        const { dateText, timeText } = formatDateTime(
                          msg.createdAt || msg.submittedAt || msg.dateTime,
                        );
                        return (
                          <div className="leading-4">
                            <div>{dateText}</div>
                            <div className="text-dark/40">{timeText}</div>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="max-w-57.5">
                        <p className="text-sm font-semibold text-dark/80 truncate inline-flex items-center gap-1.5">
                          <FiUser className="w-3.5 h-3.5 text-dark/40" />
                          {msg.name || "Unknown"}
                        </p>
                        <p className="text-xs text-dark/40 truncate mt-0.5 inline-flex items-center gap-1.5">
                          <FiMail className="w-3.5 h-3.5" />
                          {msg.email || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-sm text-dark/60 font-medium whitespace-nowrap">
                      {msg.phone || msg.phoneNo || msg.mobile || "-"}
                    </td>
                    <td className="py-3.5 px-3 text-sm text-dark/70 font-semibold">
                      <span className="inline-flex items-center gap-1.5">
                        <FiFileText className="w-3.5 h-3.5 text-dark/40" />
                        {msg.subject || "No subject"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-sm text-dark/60 font-medium max-w-105">
                      <p className="line-clamp-2">{msg.message || "-"}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <select
                        value={msg.importance || "Usual"}
                        onChange={(e) =>
                          handleImportanceChange(msg, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        disabled={savingImportanceId === msg._id}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold outline-none focus:ring-2 focus:ring-tertiary/20 disabled:opacity-60 disabled:cursor-not-allowed ${getImportanceSelectClass(
                          msg.importance,
                        )}`}
                      >
                        {IMPORTANCE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-3">
                      <select
                        value={msg.status || "To be replied"}
                        onChange={(e) =>
                          handleStatusChange(msg, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        disabled={savingStatusId === msg._id}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold outline-none focus:ring-2 focus:ring-tertiary/20 disabled:opacity-60 disabled:cursor-not-allowed ${getStatusSelectClass(
                          msg.status,
                        )}`}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(msg);
                          }}
                          disabled={deletingId === msg._id}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          aria-label="Delete message"
                        >
                          {deletingId === msg._id ? (
                            <FiLoader className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiTrash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-dark/45 backdrop-blur-sm"
            onClick={() => (deletingId ? null : setDeleteTarget(null))}
            aria-label="Close delete confirmation"
          />

          <div className="relative w-full max-w-md rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl shadow-dark/10 p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-dark">
              Delete Message
            </h3>
            <p className="mt-2 text-sm text-dark/60">
              Are you sure you want to delete this message from
              <span className="font-semibold text-dark">
                {` ${deleteTarget.subject || "No subject"}`}
              </span>
              ?
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={!!deletingId}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTarget)}
                disabled={!!deletingId}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {deletingId ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-dark/45 backdrop-blur-sm"
            onClick={() => (savingResponseId ? null : setDetailTarget(null))}
            aria-label="Close message details"
          />

          <div className="relative w-full max-w-2xl rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl shadow-dark/10 p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold text-dark">
              Message Details
            </h3>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/70 border border-dark/8 p-3">
                <p className="text-xs font-bold text-dark/45 uppercase">Name</p>
                <p className="mt-1 font-semibold text-dark/80">
                  {detailTarget.name || "Unknown"}
                </p>
              </div>
              <div className="rounded-xl bg-white/70 border border-dark/8 p-3">
                <p className="text-xs font-bold text-dark/45 uppercase">
                  Email
                </p>
                <p className="mt-1 font-semibold text-dark/80 break-all">
                  {detailTarget.email || "-"}
                </p>
              </div>
              <div className="rounded-xl bg-white/70 border border-dark/8 p-3">
                <p className="text-xs font-bold text-dark/45 uppercase">
                  Phone
                </p>
                <p className="mt-1 font-semibold text-dark/80">
                  {detailTarget.phone ||
                    detailTarget.phoneNo ||
                    detailTarget.mobile ||
                    "-"}
                </p>
              </div>
              <div className="rounded-xl bg-white/70 border border-dark/8 p-3">
                <p className="text-xs font-bold text-dark/45 uppercase">
                  Date & Time
                </p>
                <p className="mt-1 font-semibold text-dark/80">
                  {(() => {
                    const { dateText, timeText } = formatDateTime(
                      detailTarget.createdAt ||
                        detailTarget.submittedAt ||
                        detailTarget.dateTime,
                    );
                    return `${dateText} ${timeText}`;
                  })()}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-white/70 border border-dark/8 p-3">
              <p className="text-xs font-bold text-dark/45 uppercase">
                Subject
              </p>
              <p className="mt-1 font-semibold text-dark/80">
                {detailTarget.subject || "No subject"}
              </p>
            </div>

            <div className="mt-3 rounded-xl bg-white/70 border border-dark/8 p-3">
              <p className="text-xs font-bold text-dark/45 uppercase">
                Message
              </p>
              <p className="mt-1 text-sm text-dark/70 whitespace-pre-wrap">
                {detailTarget.message || "-"}
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-dark/45 uppercase tracking-wide mb-1.5">
                Response
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-dark/10 bg-white/90 px-3 py-2.5 text-sm text-dark/80 outline-none focus:ring-2 focus:ring-tertiary/20"
                placeholder="Write your response..."
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDetailTarget(null)}
                disabled={!!savingResponseId}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-dark/60 hover:bg-dark/5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveResponse}
                disabled={!!savingResponseId}
                className="px-4 py-2 rounded-xl bg-tertiary text-white text-sm font-bold hover:bg-tertiary/90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {savingResponseId ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : null}
                Save Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
