import React from "react";
import {
  UserIcon,
  AtSymbolIcon,
  ChartBarIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const mockInfluencers = [
  {
    id: 1,
    name: "Ava Johnson",
    handle: "@ava.style",
    platform: "Instagram",
    category: "Fashion",
    followers: 120000,
    engagementRate: 3.4,
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    name: "Leo Carter",
    handle: "@techleo",
    platform: "YouTube",
    category: "Tech",
    followers: 98000,
    engagementRate: 5.1,
    image: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    name: "Maya Singh",
    handle: "@maya.travel",
    platform: "TikTok",
    category: "Travel",
    followers: 150000,
    engagementRate: 4.2,
    image: "https://i.pravatar.cc/150?img=3",
  },
];

const InfluencersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Influencers</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockInfluencers.map((influencer) => (
          <div
            key={influencer.id}
            className="bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={influencer.image}
                alt={influencer.name}
                className="h-14 w-14 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {influencer.name}
                </h2>
                <p className="text-sm text-gray-500">{influencer.handle}</p>
              </div>
            </div>

            <div className="text-sm text-gray-700 space-y-1 mb-4">
              <div className="flex items-center gap-2">
                <AtSymbolIcon className="h-4 w-4 text-blue-500" />
                <span>{influencer.platform}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-pink-500" />
                <span>{influencer.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4 text-green-500" />
                <span>{influencer.followers.toLocaleString()} followers</span>
              </div>
              <div className="flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4 text-yellow-500" />
                <span>{influencer.engagementRate}% engagement</span>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
              <EyeIcon className="h-4 w-4" />
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfluencersPage;
