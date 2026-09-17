import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

interface AppliedCampaign {
  id: string;
  name: string;
  brandName: string;
  category: string;
  description: string;
  budget: number;
  deadline: string | null;
  campaignStatus: string;
  applicationStatus: "Pending" | "Selected" | "Rejected" | "Unknown";
}

interface AppliedCampaignsResponse {
  totalApplied: number;
  selectedCount: number;
  pendingCount: number;
  rejectedCount: number;
  campaigns: AppliedCampaign[];
}

interface CampaignDetail {
  id: string;
  name: string;
  brandId?: string;
  brandName: string;
  category: string;
  description: string;
  budget: number;
  deadline: string | null;
  deliverables?: string[];
  platforms?: string[];
  campaignStatus: string;
  applicationStatus: "Pending" | "Selected" | "Rejected" | "Unknown";
  createdAt?: string;
}

interface BrandProfileSnapshot {
  name: string;
  logo: string;
  website: string;
  email: string;
  phone: string;
  industry: string;
  bio: string;
}

const API_BASE = "http://localhost:5000";

const AppliedCampaignsPage: React.FC = () => {
  const [data, setData] = useState<AppliedCampaignsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [brand, setBrand] = useState<BrandProfileSnapshot | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  const token = useMemo(() => localStorage.getItem("influencerToken"), []);

  useEffect(() => {
    if (!token) {
      setError("Please log in to view your applications.");
      setLoading(false);
      return;
    }

    const fetchAppliedCampaigns = async () => {
      try {
        const res = await axios.get<AppliedCampaignsResponse>(
          `${API_BASE}/api/influencer/campaigns/applied`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data);
      } catch (err) {
        setError("Failed to load your applied campaigns.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedCampaigns();
  }, [token]);

  const fetchBrandSnapshot = useCallback(
    async (c: CampaignDetail) => {
      try {
        if (c.brandId) {
          const brandRes = await axios.get<BrandProfileSnapshot>(
            `${API_BASE}/api/influencer/campaigns/brand-public/by-id/${c.brandId}`
          );
          return brandRes.data;
        }
        if (c.brandName) {
          const encoded = encodeURIComponent(c.brandName);
          const brandRes = await axios.get<BrandProfileSnapshot>(
            `${API_BASE}/api/influencer/campaigns/brand-public/by-name/${encoded}`
          );
          return brandRes.data;
        }
      } catch (e) {
        console.error("Brand snapshot fetch failed", e);
      }
      return null;
    },
    []
  );

  const onOpenDetail = async (id: string) => {
    if (!token) return;
    setActiveId(id);
    setDrawerOpen(true);
    setDetail(null);
    setBrand(null);
    setDetailError("");
    setChatError("");
    setDetailLoading(true);

    try {
      const campRes = await axios.get<CampaignDetail>(
        `${API_BASE}/api/influencer/campaigns/${id}/detail`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const c = campRes.data;
      setDetail(c);

      const brandSnap = await fetchBrandSnapshot(c);
      if (brandSnap) setBrand(brandSnap);
    } catch (err) {
      console.error("Fetch detail failed", err);
      setDetailError("Failed to load campaign details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const onCloseDetail = () => {
    setDrawerOpen(false);
    setActiveId(null);
    setDetail(null);
    setBrand(null);
    setDetailError("");
    setChatError("");
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) onCloseDetail();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const startChat = async () => {
    if (!token || !detail) return;
    setChatLoading(true);
    setChatError("");
    try {
      // Initialize or fetch a conversation; backend returns { conversationId, link? }
      const resp = await axios.post<{ conversationId: string; link?: string }>(
        `${API_BASE}/api/influencer/campaigns/${detail.id}/chat/init`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { conversationId, link } = resp.data;
      // If you have a chat route in the SPA:
      if (link) {
        window.location.href = link;
      } else {
        window.location.href = `/chat/${conversationId}`;
      }
    } catch (e: any) {
      console.error("Chat init failed", e);
      const msg = e?.response?.data?.error || "Unable to start chat.";
      setChatError(msg);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-600 text-xl font-semibold">Loading your applications...</div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-4xl mx-auto mt-20 p-6 bg-red-50 border border-red-400 text-red-700 rounded-lg shadow-md text-center">
        {error}
      </div>
    );

  if (!data || data.campaigns.length === 0)
    return (
      <div className="max-w-4xl mx-auto mt-20 p-6 bg-gray-100 border border-gray-400 text-gray-700 rounded-lg shadow-md text-center">
        You have not applied to any campaigns yet.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight drop-shadow-sm">
        My Campaign Applications
      </h1>

      <div className="flex flex-wrap justify-center gap-8 mb-12 text-center">
        <StatCard label="Total Applied" value={data.totalApplied} color="text-blue-700" />
        <StatCard label="Selected" value={data.selectedCount} color="text-green-700" />
        <StatCard label="Pending" value={data.pendingCount} color="text-yellow-600" />
        <StatCard label="Rejected" value={data.rejectedCount} color="text-red-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.campaigns.map((c) => (
          <button
            key={c.id}
            onClick={() => onOpenDetail(c.id)}
            className="text-left bg-white border border-gray-300 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label={`Open details for ${c.name}`}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">{c.name}</h2>
            <p className="text-gray-700 mb-4 line-clamp-4 flex-grow whitespace-pre-line">{c.description}</p>

            <div className="mb-2 text-sm text-gray-600 font-medium space-x-2">
              <span>
                <b>Brand:</b> {c.brandName}
              </span>
              <span>•</span>
              <span>
                <b>Category:</b> {c.category}
              </span>
            </div>

            <div className="mb-4 text-sm text-gray-700 space-x-2 flex flex-wrap">
              <span>
                <b>Budget:</b> ₹{c.budget.toLocaleString()}
              </span>
              <span>•</span>
              <span>
                <b>Deadline:</b>{" "}
                {c.deadline ? new Date(c.deadline).toLocaleDateString(undefined, { dateStyle: "medium" }) : "N/A"}
              </span>
            </div>

            <div className="text-sm text-gray-800 flex justify-between items-center mt-auto">
              <span>
                <b>Campaign Status:</b> {c.campaignStatus}
              </span>
              <span
                className={`px-3 py-1 rounded-full font-semibold text-sm ${
                  c.applicationStatus === "Selected"
                    ? "bg-green-100 text-green-800"
                    : c.applicationStatus === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : c.applicationStatus === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {c.applicationStatus}
              </span>
            </div>
          </button>
        ))}
      </div>

      <DetailDrawer
        open={drawerOpen}
        onClose={onCloseDetail}
        loading={detailLoading}
        error={detailError}
        detail={detail}
        brand={brand}
        onStartChat={startChat}
        chatLoading={chatLoading}
        chatError={chatError}
      />
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="bg-white border border-gray-300 rounded-xl shadow-md p-6 w-40 flex flex-col items-center justify-center hover:shadow-lg transition-shadow">
    <div className={`text-4xl font-extrabold ${color}`}>{value}</div>
    <div className="mt-2 text-gray-800 font-semibold">{label}</div>
  </div>
);

const DetailDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string;
  detail: CampaignDetail | null;
  brand: BrandProfileSnapshot | null;
  onStartChat: () => void;
  chatLoading: boolean;
  chatError: string;
}> = ({ open, onClose, loading, error, detail, brand, onStartChat, chatLoading, chatError }) => {
  const canChat = detail?.applicationStatus === "Selected";
  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${open ? "opacity-40" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute top-0 right-0 h-full w-full sm:w-[560px] bg-white shadow-2xl transform transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Campaign Details</h3>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Close
          </button>
        </div>

        <div className="p-5 overflow-y-auto h-[calc(100%-56px)]">
          {loading && <p className="text-gray-600">Loading details…</p>}
          {!loading && error && <p className="text-red-600">{error}</p>}

          {!loading && !error && detail && (
            <div className="space-y-6">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">{detail.name}</h4>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                    {detail.category}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                    {detail.campaignStatus}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      detail.applicationStatus === "Selected"
                        ? "bg-green-100 text-green-800"
                        : detail.applicationStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : detail.applicationStatus === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {detail.applicationStatus}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <img
                  src={brand?.logo || "/placeholder-logo.png"}
                  alt={brand?.name || detail.brandName}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow"
                />
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-gray-900 truncate">{brand?.name || detail.brandName}</p>
                  <p className="text-sm text-gray-600 truncate">{brand?.industry || "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Budget" value={`₹${detail.budget.toLocaleString()}`} />
                <InfoRow
                  label="Deadline"
                  value={
                    detail.deadline
                      ? new Date(detail.deadline).toLocaleDateString(undefined, { dateStyle: "medium" })
                      : "N/A"
                  }
                />
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Description</h5>
                <p className="text-gray-800 whitespace-pre-line">{detail.description || "—"}</p>
              </div>

              {Array.isArray(detail.deliverables) && detail.deliverables.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Deliverables</h5>
                  <ul className="list-disc pl-5 text-gray-800 space-y-1">
                    {detail.deliverables.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(detail.platforms) && detail.platforms.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Platforms</h5>
                  <div className="flex flex-wrap gap-2">
                    {detail.platforms.map((p, i) => (
                      <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat CTA (replaces public contact details) */}
              <div className="rounded-xl border border-gray-200 p-4 bg-white">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Contact</h5>
                <p className="text-sm text-gray-600">
                  Brand contact details are hidden to protect privacy; use in-platform chat to communicate. 
                </p>
                {chatError && <p className="mt-2 text-sm text-red-600">{chatError}</p>}
                <div className="mt-3">
                  <button
                    onClick={onStartChat}
                    disabled={!canChat || chatLoading}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      canChat
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    title={
                      canChat
                        ? "Open chat with brand"
                        : "Chat becomes available when selected for this campaign"
                    }
                  >
                    {chatLoading ? "Starting chat…" : "Chat with Brand"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 p-3 bg-white">
    <p className="text-[11px] text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

export default AppliedCampaignsPage;
