import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function InfluencerSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "", // ✅ matches backend
    email: "",
    socialLink: "",
    category: "",
    followers: "",
    password: "",
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
      const res = await fetch("http://localhost:5000/api/influencer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // ✅ Store token using consistent key
      localStorage.setItem("influencerToken", data.token);
      navigate("/influencerDashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-center text-3xl font-bold text-blue-600 mb-6">
          Join as an Influencer
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Get discovered by brands and start earning from your audience.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Create a strong password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Instagram / YouTube Link
            </label>
            <input
              type="url"
              name="socialLink"
              value={formData.socialLink}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://instagram.com/yourprofile"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select your niche</option>
              <option value="fashion">Fashion</option>
              <option value="tech">Tech</option>
              <option value="fitness">Fitness</option>
              <option value="travel">Travel</option>
              <option value="beauty">Beauty</option>
              <option value="comedy">Comedy</option>
              <option value="finance">Finance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Followers Count</label>
            <input
              type="number"
              name="followers"
              min={0}
              value={formData.followers}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 5000"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-500">
          Already have an account?{" "}
          <a href="/influencerLogin" className="text-blue-600 font-medium hover:underline">
            Log in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
