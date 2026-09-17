import React, { useEffect, useMemo, useState } from "react";
import {
  HomeIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// ----- Types -----
type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | "none";

interface Campaign {
  _id?: string; // normalized real Campaign ID (top-level collection)
  title?: string;
  name?: string;
  dateRange?: string;
  status: string;
  budget: number;
}

interface DashboardData {
  brandName: string;
  activeCampaigns: number;
  influencersEngaged: number;
  budgetSpent: number;
  recentCampaigns: Campaign[];
  // Billing fields exposed by backend
  isPro?: boolean;
  subscriptionStatus?: SubscriptionStatus;
  currentPeriodEnd?: string | null;
}

const BrandDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [portalLoading, setPortalLoading] = useState<boolean>(false);
  const [banner, setBanner] = useState<string | null>(null);

  const token = useMemo(() => localStorage.getItem("brandToken"), []);

  const handleLogout = () => {
    localStorage.removeItem("brandToken");
    navigate("/BrandsLogin");
  };

  // Fetch dashboard data
  useEffect(() => {
    const run = async () => {
      if (!token) {
        navigate("/BrandsLogin");
        return;
      }
      try {
        const res = await axios.get<DashboardData>("http://localhost:5000/api/brand/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        navigate("/BrandsLogin");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [navigate, token]);

  // If returning from Stripe success redirect, re-check subscription status (no .finally usage)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sub = params.get("sub");
    if (sub === "success" && token) {
      setBanner("Subscription updated. Finalizing access...");
      const run = async () => {
        try {
          const r = await axios.get<{
            isPro: boolean;
            subscriptionStatus: SubscriptionStatus | "none";
            plan: string | null;
            currentPeriodEnd: string | null;
          }>("http://localhost:5000/api/brand/billing/status", {
            headers: { Authorization: `Bearer ${token}` },
          });

          setStats((prev) =>
            prev
              ? {
                  ...prev,
                  isPro: r.data.isPro,
                  subscriptionStatus: r.data.subscriptionStatus as SubscriptionStatus,
                  currentPeriodEnd: r.data.currentPeriodEnd,
                }
              : prev
          );

          setBanner("Subscription active. Enjoy Pro features!");

          // Clear query param
          const url = new URL(window.location.href);
          url.searchParams.delete("sub");
          window.history.replaceState({}, "", url.toString());
        } catch {
          setBanner("Payment succeeded, awaiting confirmation...");
        }
        // Cleanup timeout regardless of outcome (acts like finally)
        window.setTimeout(() => setBanner(null), 3500);
      };
      void run();
    }
  }, [location.search, token]);

  const openBillingPortal = async (): Promise<void> => {
    if (!token) {
      navigate("/BrandsLogin");
      return;
    }
    try {
      setPortalLoading(true);
      const res = await axios.get<{ url: string }>("http://localhost:5000/api/brand/billing/portal", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.url) {
        window.location.href = res.data.url; // short-lived Stripe portal session URL
      }
    } catch (e) {
      console.error("Open portal error:", e);
      alert("Unable to open billing portal. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading Dashboard...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Failed to load dashboard data.
      </div>
    );
  }

  const isPro = Boolean(stats.isPro);
  const status = (stats.subscriptionStatus ?? "none") as SubscriptionStatus;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col justify-between px-6 py-8">
        <div>
          <h2 className="text-2xl font-bold text-blue-600 mb-10">Dashboard</h2>
          <nav className="space-y-4 text-sm">
            <SidebarLink icon={<HomeIcon className="h-5 w-5" />} label="Home" to="/BrandDashboard" />
            <SidebarLink icon={<ChartBarIcon className="h-5 w-5" />} label="Campaigns" to="/campaign" />
            <SidebarLink icon={<UserIcon className="h-5 w-5" />} label="Influencers" to="/Brandinfluencerfinder" />
            <SidebarLink icon={<UserCircleIcon className="h-5 w-5" />} label="Profile" to="/Brandprofile" />
            <SidebarLink icon={<ChartBarIcon className="h-5 w-5" />} label="Past Campaigns" to="/PastCampaigns" />
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-6">
        {/* Banner (post-checkout or notices) */}
        {banner && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 text-blue-800 px-4 py-3 text-sm">
            {banner}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, <span className="text-blue-600">{stats.brandName}</span>
            </h1>
            <p className="text-gray-500 mt-1">Track campaigns and monitor performance in one place.</p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isPro ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {isPro ? "Pro" : "Free"}
              </span>
              <span className="text-xs text-gray-400">Status: {status}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isPro && (
              <button
                onClick={() => navigate("/pricing")}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-95"
              >
                Upgrade to Pro
              </button>
            )}
            {isPro && (
              <button
                onClick={openBillingPortal}
                disabled={portalLoading}
                className={`rounded-lg ${
                  portalLoading ? "bg-gray-300 text-gray-600" : "bg-white text-gray-800 hover:bg-gray-50"
                } border px-4 py-2 text-sm font-semibold shadow-sm`}
              >
                {portalLoading ? "Opening..." : "Manage Billing"}
              </button>
            )}
          </div>
        </div>

        {/* Upgrade CTA for Free users */}
        {!isPro && (
          <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Unlock advanced features with Pro</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Get unlimited campaign posts, CRM, analytics, and priority support.
                </p>
              </div>
              <button
                onClick={() => navigate("/pricing")}
                className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-indigo-700"
              >
                See Plans
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Active Campaigns" value={stats.activeCampaigns.toString()} />
          <StatCard label="Influencers Engaged" value={stats.influencersEngaged.toString()} />
          <StatCard label="Budget Spent" value={`$${stats.budgetSpent.toLocaleString()}`} />
        </div>

        {/* Campaigns */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">All Campaigns</h2>
          <div className="flex items-center gap-3">
            {isPro && (
              <button
                onClick={openBillingPortal}
                disabled={portalLoading}
                className={`hidden sm:inline-flex items-center rounded-lg ${
                  portalLoading ? "bg-gray-300 text-gray-600" : "bg-white text-gray-800 hover:bg-gray-50"
                } border px-3 py-2 text-xs font-semibold shadow-sm`}
              >
                {portalLoading ? "Opening..." : "Manage Billing"}
              </button>
            )}
            <button
              onClick={() => navigate("/campaignform")}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <PlusIcon className="h-4 w-4" /> New Campaign
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {stats.recentCampaigns.length > 0 ? (
            stats.recentCampaigns.map((campaign) => {
              if (!campaign._id) return null; // guard against malformed items
              return (
                <CampaignCard
                  key={campaign._id}
                  id={campaign._id}
                  title={campaign.title || campaign.name || "Untitled Campaign"}
                  date={campaign.dateRange || ""}
                  status={campaign.status}
                  budget={`$${(campaign.budget ?? 0).toLocaleString()}`}
                />
              );
            })
          ) : (
            <div className="bg-white p-6 rounded-xl text-gray-400 border-dashed border-2 border-gray-200 text-sm text-center">
              No campaigns found. Click "New Campaign" to start one.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// ----- Sidebar Link -----
const SidebarLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  to: string;
}> = ({ icon, label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-1 py-1 rounded-md transition text-sm ${
        isActive ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"
      }`
    }
  >
    {icon}
    {label}
  </NavLink>
);

// ----- Stat Card -----
const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
    <h3 className="text-sm text-gray-500">{label}</h3>
    <p className="text-2xl font-bold text-blue-600 mt-1">{value}</p>
  </div>
);

// ----- Campaign Card -----
const CampaignCard: React.FC<{
  id: string;
  title: string;
  date: string;
  status: string;
  budget: string;
}> = ({ id, title, date, status, budget }) => {
  const navigate = useNavigate();
  const statusStyle =
    status === "Active"
      ? "bg-green-100 text-green-700"
      : status === "Paused"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${statusStyle}`}>{status}</span>
      </div>
      <p className="text-sm text-gray-500">{date}</p>
      <p className="text-sm text-gray-700 mt-2 font-medium">Budget: {budget}</p>
      <button
        onClick={() => navigate(`/CampaignDetails/${id}`)}
        className="mt-3 text-sm text-blue-600 hover:underline"
      >
        View Details
      </button>
    </div>
  );
};

export default BrandDashboard;
