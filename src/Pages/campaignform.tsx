// CampaignForm.tsx
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface BrandProfileResponse {
  brandName: string;
}

interface CampaignCreateRequest {
  name: string;
  brandName: string;
  description?: string;
  budget?: number;
  category?: string;
  deadline?: string;
}

interface CampaignResponse {
  _id: string;
  name: string;
  brandName: string;
  description?: string;
  budget?: number;
  category?: string;
  deadline?: string;
  applicants?: string[];
  createdAt?: string;
}

const API_BASE = "http://localhost:5000";

const CampaignForm: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    budget: "",
    category: "",
    deadline: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Campaign name is required.";
    if (form.budget && Number(form.budget) < 0) return "Budget must be positive.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("brandToken");
      if (!token) {
        setError("Not authenticated. Please login again.");
        navigate("/BrandsLogin");
        return;
      }

      // 1) Fetch brand name
      const profileRes = await axios.get<BrandProfileResponse>(
        `${API_BASE}/api/brand/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2) Build payload
      const payload: CampaignCreateRequest = {
        name: form.name.trim(),
        brandName: profileRes.data.brandName,
        description: form.description.trim() || undefined,
        budget: form.budget ? parseFloat(form.budget) : undefined,
        category: form.category.trim() || undefined,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      };

      // 3) Create campaign
      const res = await axios.post<CampaignResponse>(
        `${API_BASE}/api/campaigns`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("✅ Campaign created successfully!");

      // 4) Redirect to details
      setTimeout(() => {
        navigate(`/CampaignDetails/${res.data._id}`, {
          state: { created: true },
        });
      }, 800);
    } catch (err: any) {
      console.error("Create campaign failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.status === 404
          ? "API route not found. Check the URL: POST /api/campaigns"
          : err?.message) ||
        "Failed to create campaign";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-1 text-gray-800">Create New Campaign</h2>
          <p className="text-sm text-gray-500 mb-4">
            Fill in the details to publish your campaign.
          </p>

          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
          {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Summer Launch 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief about campaign objectives and deliverables"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Beauty, Tech, Food"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget (₹)
                </label>
                <input
                  name="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.budget}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select disabled className="w-full border rounded-md p-2 bg-gray-100" defaultValue="Active">
                  <option>Active</option>
                  <option>Hold</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-md border text-sm"
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? "Creating…" : "Create Campaign"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CampaignForm;
