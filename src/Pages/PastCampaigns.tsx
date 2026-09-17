// PastCampaigns.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

interface SelectedApplication {
  influencerId: string;
  influencerName?: string;
  status: "Selected" | "Rejected" | "Pending" | "Unknown";
}

interface Campaign {
  _id: string;
  name: string;
  brandName: string;
  description?: string;
  budget?: number;
  category?: string;
  deadline?: string;
  status?: string;
  fundingStatus?: string;
  createdAt?: string;
  selectedApplication?: SelectedApplication | null;
  conversationId?: string | null;
}

const PastCampaigns: React.FC = () => {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPastCampaigns = async () => {
      const token = localStorage.getItem("brandToken");
      if (!token) {
        setLoading(false);
        setError("Please log in as a brand to view past campaigns.");
        return;
      }
      try {
        const res = await axios.get<Campaign[]>(
          `${API_BASE}/api/campaigns/list/past`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setItems(res.data || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load past campaigns.");
      } finally {
        setLoading(false);
      }
    };

    fetchPastCampaigns();
  }, []);

  const handleChat = async (c: Campaign) => {
    if (
      c.selectedApplication && 
      c.selectedApplication.status === "Selected" &&
      c.selectedApplication.influencerId
    ) {
      setChatLoadingId(c._id);
      setError("");
      try {
        const token = localStorage.getItem("brandToken");
        if (!token) {
          setError("Please log in as a brand to start a chat.");
          setChatLoadingId(null);
          return;
        }
        // If a conversation ID exists, go directly.
        if (c.conversationId) {
          navigate(`/chat/${c.conversationId}`);
          setChatLoadingId(null);
          return;
        }
        // Otherwise, create/init chat with backend.
        const res = await axios.post<{ conversationId: string; link?: string }>(
          `${API_BASE}/api/campaigns/${c._id}/chat/init`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { conversationId, link } = res.data;
        navigate(link || `/chat/${conversationId}`);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.error || "Unable to start chat.");
      } finally {
        setChatLoadingId(null);
      }
    }
  };

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Past Campaigns</h1>
        {error && (
          <div className="text-sm px-3 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700">
            {error}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-gray-500">No past campaigns found.</div>
      ) : (
        <div className="grid gap-4">
          {items.map((c) => {
            const hasSelected =
              !!c.selectedApplication &&
              c.selectedApplication.status === "Selected" &&
              !!c.selectedApplication.influencerId;

            return (
              <div
                key={c._id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-900">{c.name}</h2>
                    <p className="text-xs text-gray-500">
                      Brand: <span className="font-medium">{c.brandName}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] rounded px-2 py-1 bg-gray-100 text-gray-700">
                      {c.status || "Completed"} · {c.fundingStatus || "Unfunded"}
                    </span>
                    {hasSelected ? (
                      <span className="text-[11px] rounded px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Selected: {c.selectedApplication?.influencerName || "Influencer"}
                      </span>
                    ) : (
                      <span className="text-[11px] rounded px-2 py-1 bg-gray-50 text-gray-500 border border-gray-200">
                        No influencer selected
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg border border-gray-200 p-3 bg-white">
                    <p className="text-[11px] text-gray-500">Deadline</p>
                    <p className="text-gray-900">
                      {c.deadline ? new Date(c.deadline).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3 bg-white">
                    <p className="text-[11px] text-gray-500">Budget</p>
                    <p className="text-gray-900">₹{(c.budget ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3 bg-white">
                    <p className="text-[11px] text-gray-500">Category</p>
                    <p className="text-gray-900">{c.category || "—"}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {c.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-2">
                    {hasSelected ? (
                      <button
                        type="button"
                        onClick={() => handleChat(c)}
                        disabled={chatLoadingId === c._id}
                        aria-label="Open chat with selected influencer"
                        className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold ${
                          chatLoadingId === c._id
                            ? "bg-blue-400 text-white cursor-wait"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600`}
                      >
                        {chatLoadingId === c._id
                          ? "Opening…"
                          : "Chat with influencer"}
                      </button>
                    ) : (
                      <span
                        title="Chat becomes available when an influencer is selected"
                        className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
                      >
                        Chat with influencer
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PastCampaigns;
