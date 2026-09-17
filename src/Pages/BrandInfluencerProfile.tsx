import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000";

interface SocialLink { platform: string; url: string; }
interface Campaign { name: string; status: string; }

interface InfluencerProfile {
  _id: string;
  name: string;
  avatar?: string;
  bio?: string;
  platform: string;
  niche: string;
  location: string;
  followers: number;
  engagementRate: number;
  avgCostPerPost: number;
  socials?: SocialLink[];
  campaigns?: Campaign[];
}

const BrandInfluencerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [search] = useSearchParams(); // to read ?campaignId=
  const navigate = useNavigate();

  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        const token = localStorage.getItem("brandToken");
        if (!token) {
          navigate("/BrandsLogin");
          return;
        }

        const res = await axios.get<InfluencerProfile>(
          `${API_BASE}/api/influencer/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching influencer profile:", err);
        setError("Failed to load influencer profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, navigate]);

  const startChat = async () => {
    setError("");
    const token = localStorage.getItem("brandToken");
    if (!token) {
      navigate("/BrandsLogin");
      return;
    }
    if (!id) return;

    setChatLoading(true);
    try {
      const campaignId = search.get("campaignId");

      if (campaignId) {
        // Matches brand router: app.use("/api/campaigns", router); router.post("/:id/chat/init", ...)
        const r = await axios.post<{ conversationId: string; link?: string }>(
          `${API_BASE}/api/campaigns/${campaignId}/chat/init`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { conversationId, link } = r.data;
        window.location.href = link || `/chat/${conversationId}`;
        return;
      }

      // Fallback: a by-influencer init endpoint to allow profile-origin chat
      // Add POST /api/campaigns/chat/by-influencer/:influencerId/init to the brand router if not present
      const r = await axios.post<{ conversationId: string; link?: string }>(
        `${API_BASE}/api/campaigns/chat/by-influencer/${id}/init`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { conversationId, link } = r.data;
      window.location.href = link || `/chat/${conversationId}`;
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.error || "Unable to start chat.");
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <div className="p-6 animate-pulse text-gray-500">Loading profile...</div>;
  if (!profile) return <div className="p-6 text-red-500">Influencer not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-xl shadow-lg p-6 flex items-center gap-6 text-white">
        <img
          src={profile.avatar || "/default-avatar.png"}
          alt={profile.name}
          className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
        />
        <div>
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          <p className="opacity-90">{profile.platform} · {profile.niche}</p>
          <p className="text-sm opacity-75">{profile.location}</p>
        </div>
      </div>

      {error && (
        <div className="text-sm px-3 py-2 rounded-md bg-rose-50 border border-rose-200 text-rose-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: "Followers", value: profile.followers.toLocaleString() },
          { label: "Engagement", value: `${profile.engagementRate}%` },
          { label: "Avg Cost/Post", value: `$${profile.avgCostPerPost}` },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow duration-300">
            <p className="text-2xl font-extrabold text-gray-800">{stat.value}</p>
            <p className="text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">About</h2>
          <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Social Links */}
      {profile.socials && profile.socials.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Social Links</h2>
          <div className="flex flex-wrap gap-3">
            {profile.socials.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium hover:bg-blue-200 transition-colors"
              >
                {s.platform}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Past Campaigns */}
      {profile.campaigns && profile.campaigns.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Past Campaigns</h2>
          <ul className="space-y-2">
            {profile.campaigns.map((c, i) => (
              <li key={i} className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-md">
                <span className="font-medium text-gray-700">{c.name}</span>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    c.status.toLowerCase() === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Send Message */}
      <div className="flex justify-end">
        <button
          onClick={startChat}
          disabled={chatLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg shadow-lg hover:opacity-90 transition disabled:opacity-60"
          title="Open chat with this influencer"
        >
          {chatLoading ? "Opening…" : "Send Message"}
        </button>
      </div>
    </div>
  );
};

export default BrandInfluencerProfile;
