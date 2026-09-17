import React, { useEffect, useState, FormEvent } from "react";
import axios from "axios";

// IMPORTANT: Avoid import.meta.env to prevent Babel/ambient context issues.
// Replace with real values or load via your own config module.
const CLOUD_NAME = "dqcmdmeit";           // e.g., "dqcmdmeit"
const UPLOAD_PRESET = "brand_profile_preset";   // must be UNSIGNED preset in Cloudinary Console

const API_BASE = "http://localhost:5000";

// Minimal ambient declaration for the Cloudinary widget
declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, any>,
        callback: (
          error: unknown,
          result: { event?: string; info?: { secure_url?: string } }
        ) => void
      ) => { open: () => void; close: () => void };
    };
  }
}

interface Profile {
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  category?: string;
  platform?: string;
}

const InfluencerProfile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const token = localStorage.getItem("influencerToken");

  // Ensure the Cloudinary widget script is present; if not using index.html, load it here
  useEffect(() => {
    if (window.cloudinary) return;
    const script = document.createElement("script");
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    script.onload = () => {};
    script.onerror = () => console.error("Failed to load Cloudinary widget script");
    document.body.appendChild(script);
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get<Profile>(`${API_BASE}/api/influencer/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setAvatarPreview(res.data.avatar || "/default-avatar.png");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load profile.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openUploadWidget = () => {
    if (!window.cloudinary) {
      setError("Upload widget is not loaded yet. Please try again.");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET, // must be UNSIGNED
        folder: "real_endorse/avatars",
        sources: ["local", "url", "camera"],
        multiple: false,
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxFileSize: 5 * 1024 * 1024,
        cropping: false,
        showAdvancedOptions: false,
        theme: "minimal",
      },
      async (_error, result) => {
        if (result?.event === "success" && result?.info?.secure_url && profile) {
          try {
            setUploading(true);
            const uploadedUrl = result.info.secure_url;
            setAvatarPreview(uploadedUrl);
            setProfile((prev) => (prev ? { ...prev, avatar: uploadedUrl } : prev));
            // Persist avatar to backend
            await axios.put(
              `${API_BASE}/api/influencer/profile`,
              { ...profile, avatar: uploadedUrl },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (e: any) {
            setError(e?.response?.data?.message || "Failed to save avatar.");
            alert("Failed to save avatar.");
          } finally {
            setUploading(false);
          }
        }
      }
    );

    widget.open();
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!token) {
      alert("Not authenticated");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await axios.put(`${API_BASE}/api/influencer/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully!");
      setEdit(false);
      fetchProfile();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to update profile.");
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-36 rounded-2xl bg-gray-200" />
          <div className="h-10 rounded bg-gray-200" />
          <div className="h-24 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6 text-red-600">Failed to load profile.</div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      {!!error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">
          {error}
        </div>
      )}

      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 shadow-sm">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <img
              src={avatarPreview || profile.avatar || "/default-avatar.png"}
              alt={profile.name}
              className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow"
            />
            {edit && (
              <button
                type="button"
                className="absolute -bottom-2 right-0 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 shadow"
                onClick={openUploadWidget}
                disabled={uploading}
                title="Upload avatar"
              >
                {uploading ? "Uploading…" : "Change"}
              </button>
            )}
          </div>

          <div className="flex-1 w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.name}</h1>
              {profile.category && (
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {profile.category}
                </span>
              )}
            </div>
            <p className="mt-1 text-gray-500">{profile.email}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => setEdit((e) => !e)}
              >
                {edit ? "Cancel" : "Edit Profile"}
              </button>
              {edit && (
                <button
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  onClick={handleSubmit as any}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="text-xs text-gray-500">Name</label>
            <input
              name="name"
              type="text"
              value={profile.name}
              placeholder="Name"
              className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              onChange={handleInput}
              disabled={!edit}
              required
            />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="text-xs text-gray-500">Email</label>
            <input
              name="email"
              type="email"
              value={profile.email}
              placeholder="Email"
              className="mt-1 w-full rounded border border-gray-300 p-2 bg-gray-100"
              disabled
            />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="text-xs text-gray-500">Category</label>
            <input
              name="category"
              type="text"
              value={profile.category || ""}
              placeholder="e.g. Beauty, Tech"
              className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              onChange={handleInput}
              disabled={!edit}
              required
            />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="text-xs text-gray-500">Primary Platform</label>
            <input
              name="platform"
              type="text"
              value={profile.platform || ""}
              placeholder="Instagram, YouTube, etc."
              className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              onChange={handleInput}
              disabled={!edit}
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
          <label className="text-xs text-gray-500">Bio</label>
          <textarea
            name="bio"
            value={profile.bio || ""}
            placeholder="Tell brands about your niche, audience, packages, and collaboration style…"
            rows={4}
            className="mt-1 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            onChange={handleInput}
            disabled={!edit}
          />
        </div>

        {edit && (
          <div className="mt-5">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default InfluencerProfile;
