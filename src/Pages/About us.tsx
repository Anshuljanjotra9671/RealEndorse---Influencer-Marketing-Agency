import React from "react";

export default function AboutUs() {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Hero Section */}
      <div className="bg-blue-50 py-20 text-center px-6">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">About Real Endorse</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-600">
          We're transforming the way brands and creators collaborate. Real Endorse connects real influence with real impact.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Our Mission</h2>
          <p className="text-gray-700 text-lg">
            To empower brands and creators to build authentic partnerships based on performance, trust, and creativity —
            not just follower counts. We believe in real influence, measurable results, and long-term collaborations.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Our Vision</h2>
          <p className="text-gray-700 text-lg">
            We envision a digital world where creators are valued fairly, brands connect with the right voices, and campaigns drive value on both sides. Real Endorse is the infrastructure for the creator economy of the future.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Meet the Team</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          We're a team of marketers, engineers, and creators passionate about building tools that power authentic digital influence.
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {/* Example team members */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <img
              src="/team/founder.jpg"
              alt="Founder"
              className="w-24 h-24 mx-auto rounded-full mb-4 object-cover"
            />
            <h3 className="font-semibold text-lg">Aarav Mehta</h3>
            <p className="text-blue-600 text-sm">Founder & CEO</p>
            <p className="text-gray-500 mt-2 text-sm">
              Visionary behind Real Endorse with a passion for creator economics and product innovation.
            </p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <img
              src="/team/tech.jpg"
              alt="CTO"
              className="w-24 h-24 mx-auto rounded-full mb-4 object-cover"
            />
            <h3 className="font-semibold text-lg">Riya Kapoor</h3>
            <p className="text-blue-600 text-sm">CTO</p>
            <p className="text-gray-500 mt-2 text-sm">
              Leads product development and platform scalability with 10+ years in SaaS engineering.
            </p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <img
              src="/team/marketing.jpg"
              alt="CMO"
              className="w-24 h-24 mx-auto rounded-full mb-4 object-cover"
            />
            <h3 className="font-semibold text-lg">Devika Singh</h3>
            <p className="text-blue-600 text-sm">Chief Marketing Officer</p>
            <p className="text-gray-500 mt-2 text-sm">
              Heads influencer outreach and global brand strategy with deep creator network ties.
            </p>
          </div>
        </div>
      </div>

      {/* Why Real Endorse */}
      <div className="py-20 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Why Real Endorse?</h2>
        <p className="text-gray-600 text-lg mb-12">
          We’re not just another influencer platform. We’re a performance-driven, trust-first ecosystem that values transparency, analytics, and creator reputation.
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white border-l-4 border-blue-600 shadow-sm p-6 rounded">
            <h4 className="font-semibold text-blue-600 mb-2">Smart Matching</h4>
            <p className="text-gray-700 text-sm">AI-driven matchmaking based on campaign goals, niche, and creator trust score.</p>
          </div>
          <div className="bg-white border-l-4 border-blue-600 shadow-sm p-6 rounded">
            <h4 className="font-semibold text-blue-600 mb-2">Verified Campaigns</h4>
            <p className="text-gray-700 text-sm">All brands and creators are verified to ensure authenticity and fairness.</p>
          </div>
          <div className="bg-white border-l-4 border-blue-600 shadow-sm p-6 rounded">
            <h4 className="font-semibold text-blue-600 mb-2">Escrow Payments</h4>
            <p className="text-gray-700 text-sm">We secure transactions to protect both sides from fraud or missed deliverables.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 text-white text-center py-16">
        <h3 className="text-3xl font-bold mb-4">Join the Future of Influence</h3>
        <p className="mb-6 text-white/90">
          Whether you’re a brand looking to grow or a creator ready to shine, we’ve built Real Endorse for you.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/BrandsSignup">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100">
              I’m a Brand
            </button>
          </a>
          <a href="/influencerSignup">
            <button className="border border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600">
              I’m a Creator
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
