import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BrandsSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brandName: "",
    email: "",
    password: "",
    category: "",
    website: "",
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      localStorage.setItem("brandToken", data.token);
      navigate("/BrandDashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-3xl w-full bg-white p-10 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Brand Signup
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            name="brandName"
            placeholder="Brand Name"
            required
            value={formData.brandName}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg"
          />

          <input
            name="email"
            type="email"
            placeholder="Work Email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg"
          />

          <select
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg bg-white"
          >
            <option value="">Select category</option>
            <option value="fashion">Fashion</option>
            <option value="technology">Technology</option>
            <option value="food">Food & Beverages</option>
            <option value="fitness">Health & Fitness</option>
            <option value="education">Education</option>
            <option value="automobile">Automobile</option>
            <option value="gaming">Gaming</option>
            <option value="travel">Travel & Tourism</option>
            <option value="other">Other</option>
          </select>

          <input
            name="website"
            type="url"
            placeholder="Website (optional)"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg"
          />

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            Create Brand Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/BrandsLogin" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
