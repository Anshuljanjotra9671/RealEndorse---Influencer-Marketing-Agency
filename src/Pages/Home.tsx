// src/Pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-10 items-center">
          {/* Left Text Content */}
          <div>
            <h1 className="text-5xl font-extrabold leading-tight text-blue-700">
              Build Credibility with <span className="text-blue-500">RealEndorse</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              RealEndorse helps you gather trusted endorsements, showcase professional strengths, and connect with peers who vouch for your skills.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white text-md font-medium py-3 px-6 rounded-xl shadow-lg transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="text-blue-700 hover:underline font-semibold py-3 px-2"
              >
                Already have an account?
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex justify-center">
            <img
              src="https://illustrations.popsy.co/gray/web-design.svg"
              alt="Trust Network Illustration"
              className="w-full max-w-md"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
            Why Choose RealEndorse?
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard
              title="Verified Endorsements"
              description="Collect endorsements from real people, not bots. Build a credible profile others trust."
              icon="✅"
              bgColor="bg-blue-100"
            />
            <FeatureCard
              title="Smart Profile System"
              description="Your profile evolves with endorsements, skills, and achievements over time."
              icon="📈"
              bgColor="bg-green-100"
            />
            <FeatureCard
              title="Professional Networking"
              description="Find and connect with mentors, teammates, and peers in your domain."
              icon="🤝"
              bgColor="bg-purple-100"
            />
            <FeatureCard
              title="Skill-Based Matching"
              description="Be discovered by employers and collaborators looking for your exact skillset."
              icon="🎯"
              bgColor="bg-pink-100"
            />
            <FeatureCard
              title="Feedback & Insights"
              description="Get real-time feedback from your connections to improve and grow."
              icon="💡"
              bgColor="bg-yellow-100"
            />
            <FeatureCard
              title="Secure & Transparent"
              description="Privacy-first design ensures your data is protected and endorsements are real."
              icon="🔒"
              bgColor="bg-red-100"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  bgColor: string;
}

const FeatureCard = ({ title, description, icon, bgColor }: FeatureCardProps) => (
  <div className={`p-6 rounded-2xl shadow-md hover:shadow-xl transition bg-white border-t-4 ${bgColor}`}>
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Home;
