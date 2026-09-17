// src/pages/InfluencerAllCampaigns.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiFilter, FiArrowLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "./api";

type CampaignListItem = {
  _id: string;
  name: string;
  brandName: string;
  category: string;
  deadline: string | null;
  budget: number;
  status: string;
  isApplied: boolean;
};

type CampaignListResponse = {
  items: CampaignListItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  availableBrands: string[];
  availableCategories: string[];
};

const PAGE_SIZE_DEFAULT = 12;

const InfluencerAllCampaigns: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || PAGE_SIZE_DEFAULT);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const sort = searchParams.get("sort") || "deadlineAsc";

  const [data, setData] = useState<CampaignListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (["q", "category", "brand", "sort"].includes(key)) next.set("page", "1");
    setSearchParams(next);
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<CampaignListResponse>("/api/influencer/campaigns/All", {
        params: { page, pageSize, q, category, brand, sort },
      });
      const payload: any = (response as any)?.data ?? response;
      setData(payload as CampaignListResponse);
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load campaigns.";
      const step = e?.response?.data?.step;
      const detail = e?.response?.data?.detail;
      const composed = step || detail ? `${msg}${step ? ` [step: ${step}]` : ""}${detail ? ` – ${detail}` : ""}` : msg;
      setError(composed);
      console.error("Campaigns fetch error:", e?.response ?? e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q, category, brand, sort]);

  const canPrev = page > 1;
  const canNext = useMemo(() => (data ? page < data.totalPages : false), [data, page]);

  const handleApply = async (id: string) => {
    try {
      setApplyingId(id);
      await api.post(`/api/influencer/dashboard/campaigns/${id}/apply`, {});
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((c) => (c._id === id ? { ...c, isApplied: true } : c)),
            }
          : prev
      );
      alert("Applied successfully");
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || "Failed to apply.";
      alert(msg);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/influencerDashboard")}
            className="p-2 rounded hover:bg-gray-100 text-gray-600"
            aria-label="Back"
          >
            <FiArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">All Campaigns</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white border rounded-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <FiSearch className="text-gray-500" />
              <input
                className="w-full outline-none"
                placeholder="Search campaign or brand…"
                value={q}
                onChange={(e) => setParam("q", e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <FiFilter />
              <span className="text-sm font-medium">Filters</span>
            </div>

            <select
              className="border rounded px-2 py-1"
              value={brand}
              onChange={(e) => setParam("brand", e.target.value)}
            >
              <option value="">All Brands</option>
              {data?.availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <select
              className="border rounded px-2 py-1"
              value={category}
              onChange={(e) => setParam("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {data?.availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="border rounded px-2 py-1"
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
            >
              <option value="deadlineAsc">Sort: Deadline ↑</option>
              <option value="budgetDesc">Sort: Budget ↓</option>
              <option value="newest">Sort: Newest</option>
            </select>

            <select
              className="border rounded px-2 py-1"
              value={String(pageSize)}
              onChange={(e) => setParam("pageSize", e.target.value)}
            >
              {[6, 12, 24, 48].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-10 text-gray-600">Loading campaigns…</div>
        ) : error ? (
          <div className="p-10 text-red-600 font-semibold">Error: {error}</div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-10 text-gray-600">No campaigns found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((c) => (
                <div key={c._id} className="rounded border border-gray-200 bg-white p-5 shadow">
                  <h3 className="mb-1 font-bold text-blue-700">{c.name}</h3>
                  <p className="text-sm text-gray-600">{c.brandName}</p>
                  <p className="text-sm text-gray-500 mb-2">{c.category}</p>
                  <p className="text-xs text-gray-600 mb-2">
                    Deadline: {c.deadline ? new Date(c.deadline).toLocaleDateString() : "N/A"}
                  </p>
                  <p className="mb-4 text-sm font-medium">Budget: ₹{c.budget.toLocaleString()}</p>
                  <button
                    disabled={c.isApplied || applyingId === c._id}
                    onClick={() => !c.isApplied && handleApply(c._id)}
                    className={`w-full rounded py-2 font-semibold text-white transition ${
                      c.isApplied || applyingId === c._id
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {c.isApplied ? "Applied" : applyingId === c._id ? "Applying..." : "Apply"}
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                disabled={!canPrev}
                onClick={() => setParam("page", String(page - 1))}
                className={`px-3 py-2 rounded border ${
                  canPrev ? "hover:bg-gray-100" : "opacity-50 cursor-not-allowed"
                }`}
              >
                <FiChevronLeft />
              </button>
              <span className="text-sm text-gray-700">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                disabled={!canNext}
                onClick={() => setParam("page", String(page + 1))}
                className={`px-3 py-2 rounded border ${
                  canNext ? "hover:bg-gray-100" : "opacity-50 cursor-not-allowed"
                }`}
              >
                <FiChevronRight />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default InfluencerAllCampaigns;
