// BrandInfluencerFinder.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Influencer {
  _id: string;
  name: string;
  platform?: string;
  followers?: number;
  niche?: string;
  location?: string;
  engagementRate?: number;
  avgCostPerPost?: number;
  profilePic?: string;
}

interface FilterCriteria {
  platform: string;
  minFollowers: number;
  maxFollowers: number;
  niche: string;
  location: string;
}

const BrandInfluencerFinder: React.FC = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [filtered, setFiltered] = useState<Influencer[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterCriteria>({
    platform: "",
    minFollowers: 0,
    maxFollowers: 10000000,
    niche: "",
    location: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const token = localStorage.getItem("brandToken");
        if (!token) {
          navigate("/BrandsLogin");
          return;
        }

        const response = await axios.get<Influencer[]>(
          "http://localhost:5000/api/brand/dashboard/influencers",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (Array.isArray(response.data)) {
          setInfluencers(response.data);
          setFiltered(response.data);
        } else {
          console.error("Invalid influencer data format:", response.data);
        }
      } catch (err) {
        console.error("Error fetching influencers:", err);
        navigate("/BrandsLogin");
      }
    };

    fetchInfluencers();
  }, [navigate]);

  useEffect(() => {
    const result = influencers.filter((inf) =>
      (inf.name?.toLowerCase() ?? "").includes(search.toLowerCase()) &&
      (filters.platform === "" || inf.platform === filters.platform) &&
      (inf.followers ?? 0) >= filters.minFollowers &&
      (inf.followers ?? 0) <= filters.maxFollowers &&
      (filters.niche === "" || (inf.niche?.toLowerCase() ?? "").includes(filters.niche.toLowerCase())) &&
      (filters.location === "" || (inf.location?.toLowerCase() ?? "").includes(filters.location.toLowerCase()))
    );
    setFiltered(result);
  }, [search, filters, influencers]);

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Find Influencers</h1>

      {/* Filters */}
      <div className="grid md:grid-cols-6 gap-4 mb-8 bg-white p-4 rounded-xl shadow">
        <input
          type="text"
          placeholder="Search by name"
          className="col-span-2 border rounded-md p-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded-md p-2 text-sm"
          value={filters.platform}
          onChange={(e) => setFilters((f) => ({ ...f, platform: e.target.value }))}
        >
          <option value="">All Platforms</option>
          <option value="Instagram">Instagram</option>
          <option value="YouTube">YouTube</option>
          <option value="TikTok">TikTok</option>
        </select>
        <input
          type="number"
          placeholder="Min Followers"
          className="border rounded-md p-2 text-sm"
          value={filters.minFollowers}
          onChange={(e) => setFilters((f) => ({ ...f, minFollowers: Number(e.target.value) }))}
        />
        <input
          type="number"
          placeholder="Max Followers"
          className="border rounded-md p-2 text-sm"
          value={filters.maxFollowers}
          onChange={(e) => setFilters((f) => ({ ...f, maxFollowers: Number(e.target.value) }))}
        />
        <input
          type="text"
          placeholder="Location"
          className="border rounded-md p-2 text-sm"
          value={filters.location}
          onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
        />
      </div>

      {/* Influencer Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((inf) => (
            <div
              key={inf._id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col justify-between"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={inf.profilePic || "/default-avatar.png"}
                  alt={inf.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{inf.name}</h3>
                  <p className="text-sm text-gray-500">{inf.platform || "Unknown"} · {inf.niche || "N/A"}</p>
                </div>
              </div>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>📍 {inf.location || "N/A"}</li>
                <li>👥 {(inf.followers ?? 0).toLocaleString()} followers</li>
                <li>📈 {inf.engagementRate ?? 0}% engagement</li>
                <li>💸 Avg Cost: ₹{inf.avgCostPerPost ?? 0}</li>
              </ul>
              <div className="flex justify-end">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                  onClick={() => navigate(`/BrandInfluencerProfile/${inf._id}`)}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 text-sm">
            No influencers found with selected filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandInfluencerFinder;
