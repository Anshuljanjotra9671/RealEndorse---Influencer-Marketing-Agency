import React, { useState, useEffect, ChangeEvent } from "react";
import {
  CameraIcon,
  PencilSquareIcon,
  GlobeAltIcon,
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

interface BrandProfileData {
  name?: string;
  logo: string;
  bio: string;
  website: string;
  email: string;
  phone: string;
  industry: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
}

const BrandProfile: React.FC = () => {
  const [profile, setProfile] = useState<BrandProfileData>({
    name: "",
    logo: "",
    bio: "",
    website: "",
    email: "",
    phone: "",
    industry: "",
  });

  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("brandToken");

  useEffect(() => {
    if (!token) return;
    axios
      .get<BrandProfileData>("http://localhost:5000/api/brand/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile({
          name: res.data.name || "",
          logo: res.data.logo || "",
          bio: res.data.bio || "",
          website: res.data.website || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          industry: res.data.industry || "",
        });
        setLogoPreview(res.data.logo);
      })
      .catch((err) => {
        console.error("Error fetching profile", err);
        setError("Failed to load brand profile.");
      });
  }, [token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Logo upload (unsigned preset) with autosave
  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const files = input && input.files ? input.files : null;
    if (!files || files.length === 0) {
      if (input) input.value = "";
      return;
    }
    const file = files[0];

    // Basic validation
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (validTypes.indexOf(file.type) === -1) {
      setError("Please upload a JPEG/PNG/WEBP image.");
      if (input) input.value = "";
      return;
    }
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError("Image must be <= 5MB.");
      if (input) input.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    // Use your existing Cloudinary unsigned preset and cloud name
    formData.append("upload_preset", "brand_profile_preset");
    formData.append("cloud_name", "dqcmdmeit");

    try {
      setUploading(true);
      setError("");
      const res = await axios.post<CloudinaryUploadResponse>(
        "https://api.cloudinary.com/v1_1/dqcmdmeit/image/upload",
        formData
      );

      const uploadedUrl = res.data.secure_url;
      setLogoPreview(uploadedUrl);
      setProfile((prev) => ({
        ...prev,
        logo: uploadedUrl,
      }));

      // Persist immediately
      await axios.post(
        "http://localhost:5000/api/brand/profile/update",
        { logo: uploadedUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Logo upload failed", err);
      setError("Logo upload failed. Try again.");
      alert("❌ Logo upload failed. Try again.");
    } finally {
      setUploading(false);
      if (input) input.value = "";
    }
  };

  const handleSave = async () => {
    if (!token) return;
    try {
      setSaving(true);
      setError("");
      await axios.post("http://localhost:5000/api/brand/profile/update", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Update failed", err);
      setError("Update failed. Try again.");
      alert("Update failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {!!error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">
          {error}
        </div>
      )}

      {/* Brand Identity Header */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 shadow-sm">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <img
              src={logoPreview || "/placeholder-logo.png"}
              alt="Brand Logo"
              className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow"
            />
            <label
              className="absolute -bottom-2 right-0 cursor-pointer rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 shadow"
              title="Upload new logo"
            >
              {uploading ? "Uploading…" : "Change"}
              <input type="file" hidden onChange={handleLogoUpload} accept="image/*" />
            </label>
          </div>

          <div className="flex-1 w-full">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="min-w-0">
                {/* Name with inline edit */}
                {!isEditing ? (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
                      {profile.name || "Brand Name"}
                    </h1>
                    <button
                      type="button"
                      className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
                      onClick={() => setIsEditing(true)}
                      title="Edit brand info"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      name="name"
                      value={profile.name || ""}
                      onChange={handleChange}
                      placeholder="Enter brand name"
                      className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <button
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Verified Brand
                  </span>
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    Public Profile
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={() => setIsEditing((s) => !s)}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
                <button
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Quick Facts */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                <BuildingStorefrontIcon className="h-5 w-5 text-gray-500" />
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-500">Industry</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{profile.industry || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                <GlobeAltIcon className="h-5 w-5 text-gray-500" />
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-500">Website</p>
                  <p className="text-sm font-medium text-blue-700 truncate">
                    {profile.website || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{profile.email || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Sections */}
      <div className="mt-6 grid grid-cols-1 gap-6">
        {/* Identity */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Identity</h2>
            <p className="text-sm text-gray-500 mt-1">
              Set the public-facing details that represent the brand’s identity.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-600">Brand name</label>
                <input
                  name="name"
                  value={profile.name || ""}
                  onChange={handleChange}
                  placeholder="Acme Inc."
                  disabled={!isEditing}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-gray-600">Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Elevator pitch, mission, and product lines…"
                  rows={3}
                  disabled={!isEditing}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
                />
                <p className="mt-1 text-[11px] text-gray-500">Visible on public brand profile for creators.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
            <p className="text-sm text-gray-500 mt-1">
              Keep communication details accurate for collaboration workflow and invoicing.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-gray-600">Email</label>
                <input
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="name@brand.com"
                  disabled={!isEditing}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Phone</label>
                <input
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  disabled={!isEditing}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Public info */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Public info</h2>
            <p className="text-sm text-gray-500 mt-1">
              This information helps creators validate and understand the brand at a glance.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-600">Website</label>
                  <span className="text-[11px] text-gray-400">https://</span>
                </div>
                <input
                  name="website"
                  value={profile.website}
                  onChange={handleChange}
                  placeholder="www.brand.com"
                  disabled={!isEditing}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Industry</label>
                <input
                  name="industry"
                  value={profile.industry}
                  onChange={handleChange}
                  placeholder="e.g., Beauty, Tech, Health"
                  disabled={!isEditing}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => setIsEditing((s) => !s)}
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal (unchanged info, refreshed styles) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 rounded-full p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Close"
            >
              ✖
            </button>

            <div className="p-6">
              <div className="flex flex-col items-center">
                <img
                  src={profile.logo || "/placeholder-logo.png"}
                  alt="Brand Logo"
                  className="w-28 h-28 object-cover rounded-full border shadow mb-3"
                />
                <h3 className="text-lg font-semibold">Brand details</h3>
                <p className="text-sm text-gray-500">As seen by creators during outreach</p>
              </div>

              <div className="mt-5 space-y-3">
                {isEditing ? (
                  <>
                    <input
                      name="name"
                      placeholder="Brand Name"
                      value={profile.name || ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <input
                      name="bio"
                      placeholder="Brand Bio"
                      value={profile.bio}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <input
                      name="website"
                      placeholder="Website"
                      value={profile.website}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <input
                      name="email"
                      placeholder="Email"
                      value={profile.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <input
                      name="phone"
                      placeholder="Phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <input
                      name="industry"
                      placeholder="Industry"
                      value={profile.industry}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <button
                      onClick={handleSave}
                      className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <p><strong>Name:</strong> {profile.name || "-"}</p>
                    <p><strong>Bio:</strong> {profile.bio || "-"}</p>
                    <p><strong>Website:</strong> {profile.website || "-"}</p>
                    <p><strong>Email:</strong> {profile.email || "-"}</p>
                    <p><strong>Phone:</strong> {profile.phone || "-"}</p>
                    <p><strong>Industry:</strong> {profile.industry || "-"}</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandProfile;
