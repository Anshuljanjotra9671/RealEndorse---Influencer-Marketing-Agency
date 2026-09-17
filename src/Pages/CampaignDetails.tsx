// src/Pages/CampaignDetails.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

interface CampaignDoc {
  _id: string;
  title?: string;
  name?: string;
  brandName: string;
  description?: string;
  budget?: number;
  category?: string;
  deadline?: string;
  applicants?: string[];
  applicantsCount?: number;
  createdAt?: string;
  status?: "Active" | "Paused" | "Completed" | "Cancelled";
  fundingStatus?: "Unfunded" | "Funding" | "Funded" | "Held" | "Released" | "Refunded" | "Failed";
  currency?: string;
  // computed additions
  totalApplicants?: number;
  verifiedApplicants?: number;
  proApplicants?: number;
  avgRealScore?: number | null;
}

interface Recommended {
  _id: string;
  name: string;
  avatar?: string;
  followers: number;
  engagementRate: number;
  category: string;
  verifiedByPlatform?: boolean;
  plan?: "free" | "pro" | string;
  realScore?: number;
}

interface ApplicantsItem {
  _id: string;
  name: string;
  avatar?: string;
  followers: number;
  engagementRate: number;
  category: string;
  verifiedByPlatform: boolean;
  plan: string;
  realScore: number;
  applicationStatus: string;
  appliedAt: string | null;
}

interface ApplicantsResponse {
  items: ApplicantsItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface LocationState {
  created?: boolean;
}

const API_BASE = "http://localhost:5000";

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation() as { state?: LocationState };
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<CampaignDoc | null>(null);
  const [recs, setRecs] = useState<Recommended[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Applicants modal state
  const [showApplicants, setShowApplicants] = useState(false);
  const [appPage, setAppPage] = useState(1);
  const [appPageSize, setAppPageSize] = useState(12);
  const [appTotalPages, setAppTotalPages] = useState(1);
  const [appItems, setAppItems] = useState<ApplicantsItem[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [appError, setAppError] = useState("");
  const [fVerified, setFVerified] = useState<"" | "true" | "false">("");
  const [fPro, setFPro] = useState<"" | "true" | "false">("");
  const [fMinScore, setFMinScore] = useState<string>("");
  const [fMaxScore, setFMaxScore] = useState<string>("");
  const [fQ, setFQ] = useState<string>("");

  async function refetch() {
    const token = localStorage.getItem("brandToken");
    if (!token || !id) return;
    const c = await axios.get<CampaignDoc>(`${API_BASE}/api/campaigns/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCampaign(c.data);
  }

  useEffect(() => {
    const token = localStorage.getItem("brandToken");
    if (!token) {
      navigate("/BrandsLogin");
      return;
    }
    if (!id) {
      console.error("CampaignDetails: missing route param id");
      setLoading(false);
      return;
    }
    const fetchAll = async () => {
      try {
        const [c, r] = await Promise.all([
          axios.get<CampaignDoc>(`${API_BASE}/api/campaigns/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<Recommended[]>(`${API_BASE}/api/campaigns/${id}/recommended`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCampaign(c.data);
        setRecs(r.data);
      } catch (err) {
        console.error("Campaign fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, navigate]);

  const canFund = campaign?.fundingStatus === "Unfunded" || campaign?.fundingStatus === "Failed";
  const canRelease =
    (campaign?.fundingStatus === "Funded" || campaign?.fundingStatus === "Held") &&
    campaign?.status !== "Completed";

  const statusChip =
    campaign?.status === "Active"
      ? "bg-green-100 text-green-700"
      : campaign?.status === "Paused"
      ? "bg-yellow-100 text-yellow-700"
      : campaign?.status === "Completed"
      ? "bg-gray-200 text-gray-700"
      : "bg-red-100 text-red-700";

  const fundingChip =
    campaign?.fundingStatus === "Funded"
      ? "bg-emerald-100 text-emerald-700"
      : campaign?.fundingStatus === "Funding"
      ? "bg-blue-100 text-blue-700"
      : campaign?.fundingStatus === "Released"
      ? "bg-purple-100 text-purple-700"
      : campaign?.fundingStatus === "Refunded"
      ? "bg-orange-100 text-orange-700"
      : campaign?.fundingStatus === "Failed"
      ? "bg-rose-100 text-rose-700"
      : "bg-gray-100 text-gray-700";

  async function fundNow() {
    const token = localStorage.getItem("brandToken");
    if (!token || !id) return;
    setActionLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/payments/campaign/${id}/initiate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refetch();
      alert("Funding initiated (sandbox). Complete payment via provider flow when wired.");
    } catch (e) {
      console.error(e);
      alert("Failed to initiate funding.");
    } finally {
      setActionLoading(false);
    }
  }

  async function releaseNow() {
    const token = localStorage.getItem("brandToken");
    if (!token || !id) return;
    setActionLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/payments/campaign/${id}/release`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refetch();
      alert("Funds released. Campaign marked Completed.");
    } catch (e) {
      console.error(e);
      alert("Failed to release payment.");
    } finally {
      setActionLoading(false);
    }
  }

  // Applicants modal data loader (typed)
  const loadApplicants = async (pageOverride?: number) => {
    const token = localStorage.getItem("brandToken");
    if (!token || !id) return;
    setAppLoading(true);
    setAppError("");
    try {
      const resp = await axios.get<ApplicantsResponse>(`${API_BASE}/api/campaigns/${id}/applicants`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pageOverride || appPage,
          pageSize: appPageSize,
          verified: fVerified || undefined,
          pro: fPro || undefined,
          minScore: fMinScore || undefined,
          maxScore: fMaxScore || undefined,
          q: fQ || undefined,
        },
      });
      setAppItems(resp.data.items || []);
      setAppTotalPages(resp.data.totalPages || 1);
      setAppPage(resp.data.page || 1);
    } catch (e: any) {
      console.error("Applicants fetch error:", e?.response || e);
      setAppError(e?.response?.data?.message || "Failed to load applicants.");
    } finally {
      setAppLoading(false);
    }
  };

  const openApplicants = async () => {
    setShowApplicants(true);
    setAppPage(1);
    await loadApplicants(1);
  };

  const canPrev = useMemo(() => appPage > 1, [appPage]);
  const canNext = useMemo(() => appPage < appTotalPages, [appPage, appTotalPages]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!campaign) return <div className="p-6 text-red-600">Campaign not found.</div>;

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {location.state?.created && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700">
          ✅ Campaign created successfully.
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {campaign.title || campaign.name}
          </h1>
          <p className="text-gray-500 mt-1">
            Brand: <span className="font-medium text-gray-700">{campaign.brandName}</span>
          </p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <span className={`px-2 py-1 text-xs rounded-full ${statusChip}`}>
              Status: {campaign.status}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${fundingChip}`}>
              Funding: {campaign.fundingStatus || "Unfunded"}
            </span>
            {campaign.category && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                {campaign.category}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/BrandDashboard")} className="px-4 py-2 rounded-lg border text-sm">
            Back to Dashboard
          </button>
          {canFund && (
            <button
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
              onClick={fundNow}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing…" : "Fund Now"}
            </button>
          )}
          {canRelease && (
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
              onClick={releaseNow}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing…" : "Approve & Release"}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
        <StatCard label="Budget" value={`₹${(campaign.budget ?? 0).toLocaleString()}`} />
        <StatCard label="Applicants" value={`${campaign.totalApplicants ?? campaign.applicantsCount ?? 0}`} />
        <StatCard label="Verified" value={`${campaign.verifiedApplicants ?? 0}`} />
        <StatCard label="Avg Real Score" value={`${campaign.avgRealScore ?? "N/A"}`} />
      </div>

      {/* Applicants quick actions */}
      <div className="mt-3">
        <button
          onClick={openApplicants}
          className="px-4 py-2 rounded-lg border bg-white shadow-sm text-sm hover:bg-gray-50"
        >
          View Applicants
        </button>
      </div>

      {/* Description */}
      {campaign.description && (
        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-2">About this campaign</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{campaign.description}</p>
        </div>
      )}

      {/* Recommended influencers */}
      <div className="bg-white rounded-2xl shadow p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recommended Influencers</h2>
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => navigate("/Brandinfluencerfinder")}
          >
            Explore all →
          </button>
        </div>

        {recs.length === 0 ? (
          <div className="text-sm text-gray-500">No recommendations yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recs.map((inf) => (
              <div
                key={inf._id}
                className="border rounded-xl p-4 hover:shadow transition bg-gradient-to-b from-white to-gray-50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={inf.avatar || "/default-avatar.png"}
                    alt={inf.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{inf.name}</p>
                    <div className="flex items-center gap-2">
                      {inf.verifiedByPlatform && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Verified</span>
                      )}
                      {(inf.plan || "").toLowerCase() === "pro" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">PRO</span>
                      )}
                      {typeof inf.realScore === "number" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Score {inf.realScore}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{inf.category}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>👥 {(inf.followers || 0).toLocaleString()}</span>
                  <span>📈 {inf.engagementRate}%</span>
                </div>
                <button
                  className="w-full mt-3 text-sm bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
                  onClick={() => navigate(`/BrandInfluencerProfile/${inf._id}`)}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applicants modal */}
      {showApplicants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowApplicants(false)} />
          <div className="relative bg-white w-full max-w-5xl mx-4 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Applicants</h3>
              <button
                className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
                onClick={() => setShowApplicants(false)}
              >
                Close
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-3 mb-4">
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Search</label>
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Name or category"
                  value={fQ}
                  onChange={(e) => setFQ(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Verified</label>
                <select className="border rounded px-2 py-1" value={fVerified} onChange={(e) => setFVerified(e.target.value as any)}>
                  <option value="">Any</option>
                  <option value="true">Verified</option>
                  <option value="false">Not Verified</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">PRO</label>
                <select className="border rounded px-2 py-1" value={fPro} onChange={(e) => setFPro(e.target.value as any)}>
                  <option value="">Any</option>
                  <option value="true">PRO</option>
                  <option value="false">Non‑PRO</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Min Score</label>
                  <input
                    className="border rounded px-2 py-1 w-24"
                    type="number"
                    min={0}
                    max={100}
                    value={fMinScore}
                    onChange={(e) => setFMinScore(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Max Score</label>
                  <input
                    className="border rounded px-2 py-1 w-24"
                    type="number"
                    min={0}
                    max={100}
                    value={fMaxScore}
                    onChange={(e) => setFMaxScore(e.target.value)}
                  />
                </div>
              </div>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                onClick={() => loadApplicants(1)}
              >
                Apply Filters
              </button>
            </div>

           {/* List (enhanced card + actions) */}
{appLoading ? (
  <div className="p-8 text-gray-600">Loading applicants…</div>
) : appError ? (
  <div className="p-8 text-red-600">Error: {appError}</div>
) : appItems.length === 0 ? (
  <div className="p-8 text-gray-600">No applicants match these filters.</div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    {appItems.map((i) => {
      const statusClass =
        i.applicationStatus === "Selected"
          ? "bg-green-100 text-green-700 border-green-200"
          : i.applicationStatus === "Rejected"
          ? "bg-rose-100 text-rose-700 border-rose-200"
          : "bg-amber-100 text-amber-700 border-amber-200"; // Applied/Pending

      return (
        <div
          key={i._id}
          className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0.5 duration-200"
        >
          {/* Status badge */}
          <span className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClass}`}>
            {i.applicationStatus}
          </span>

          <div className="p-5">
            <div className="flex items-center gap-4">
              <img
                src={i.avatar || "/default-avatar.png"}
                alt={i.name}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 truncate">{i.name}</p>
                  {i.verifiedByPlatform && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                      Verified
                    </span>
                  )}
                  {(i.plan || "").toLowerCase() === "pro" && (
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                      PRO
                    </span>
                  )}
                  {typeof i.realScore === "number" && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      Score {i.realScore}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{i.category}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-gray-200 bg-white p-2 text-center">
                <div className="text-[11px] text-gray-500">Followers</div>
                <div className="font-semibold text-gray-800">{(i.followers || 0).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-2 text-center">
                <div className="text-[11px] text-gray-500">Engagement</div>
                <div className="font-semibold text-gray-800">{i.engagementRate}%</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-2 text-center">
                <div className="text-[11px] text-gray-500">Applied</div>
                <div className="font-semibold text-gray-800">
                  {i.appliedAt ? new Date(i.appliedAt).toLocaleDateString() : "—"}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                onClick={() => navigate(`/BrandInfluencerProfile/${i._id}`)}
                title="Open influencer profile"
              >
                View Profile
              </button>

              {i.applicationStatus !== "Selected" && (
                <button
                  className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("brandToken");
                      if (!token || !id) return;
                      await axios.post(
                        `${API_BASE}/api/campaigns/${id}/applicants/${i._id}/select`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      await loadApplicants(appPage);
                      await refetch();
                      alert("Influencer selected and notified.");
                    } catch (e) {
                      console.error(e);
                      alert("Failed to select influencer.");
                    }
                  }}
                >
                  Select
                </button>
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}


            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                disabled={!canPrev}
                onClick={() => canPrev && loadApplicants(appPage - 1)}
                className={`px-3 py-2 rounded border ${canPrev ? "hover:bg-gray-100" : "opacity-50 cursor-not-allowed"}`}
              >
                ◀
              </button>
              <span className="text-sm text-gray-700">
                Page {appPage} of {appTotalPages}
              </span>
              <button
                disabled={!canNext}
                onClick={() => canNext && loadApplicants(appPage + 1)}
                className={`px-3 py-2 rounded border ${canNext ? "hover:bg-gray-100" : "opacity-50 cursor-not-allowed"}`}
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white rounded-2xl shadow p-5 text-center hover:shadow-md transition">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
  </div>
);

export default CampaignDetails;
