import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

interface AnalyticsData {
  month: string;
  earnings: number;
  impressions: number;
}

const InfluencerAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem("influencerToken");
      try {
        const res = await axios.get<{ analytics: AnalyticsData[] }>(
          "http://localhost:5000/api/influencer/dashboard/analytics",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAnalytics(res.data.analytics);
      } catch {
        setAnalytics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <p className="p-10 text-gray-600">Loading analytics...</p>;
  if (!analytics.length) return <p className="p-10 text-red-500">No data available</p>;

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics Overview</h1>
      <section className="mb-12 bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Earned & Impressions per Month</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="impressions" stroke="#22c55e" strokeWidth={2} />
            <Line type="monotone" dataKey="earnings" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default InfluencerAnalytics;
