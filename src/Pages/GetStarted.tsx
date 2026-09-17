// src/Pages/GetStarted.tsx
import { motion } from "framer-motion";
import { Rocket, Users, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

export default function GetStarted() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full bg-white p-10 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to RealEndorse</h1>
          <p className="text-gray-600 text-lg">
            Connect with brands or influencers and grow your business or personal brand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Influencer Card */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="border p-6 rounded-xl shadow hover:shadow-lg transition bg-blue-50"
          >
            <div className="flex items-center mb-4">
              <Users className="text-blue-600" size={28} />
              <h3 className="text-xl font-semibold ml-3 text-blue-700">I’m an Influencer</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Build your portfolio, manage campaigns, and monetize your audience effectively.
            </p>
            <Link
              to="/influencerSignup"
              className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              Get Started
            </Link>
          </motion.div>

          {/* Brand Card */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="border p-6 rounded-xl shadow hover:shadow-lg transition bg-white"
          >
            <div className="flex items-center mb-4">
              <Briefcase className="text-purple-600" size={28} />
              <h3 className="text-xl font-semibold ml-3 text-purple-700">I’m a Brand</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Discover influencers, launch collaborations, and boost your brand's presence.
            </p>
            <Link
              to="/BrandsSignup"
              className="inline-block bg-purple-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-purple-700"
            >
              Get Started
            </Link>
          </motion.div>
        </div>

        <div className="mt-10 text-center text-gray-500 text-sm">
          <Rocket size={16} className="inline-block mr-1" />
          Powering creator-brand collaborations since 2025 🚀
        </div>
      </motion.div>
    </div>
  );
}
