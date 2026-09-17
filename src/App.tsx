import React from "react";
import { Link } from "react-router-dom";

export default function App() {
  return (
    <div className="font-sans bg-white text-gray-900">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 shadow-sm bg-white sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-600">Real Endorse</h1>
        <nav className="space-x-6 hidden md:flex">
          <Link to="/BrandsSignup" className="hover:text-blue-600 font-medium">Brands</Link>
          <Link to="/influencerSignup" className="hover:text-blue-600 font-medium">Influencers</Link>
          <Link to="/pricing" className="hover:text-blue-600 font-medium">Pricing</Link>
          <Link to="/trust" className="hover:text-blue-600 font-medium">Trust & Safety</Link>
        </nav>
        <Link to="/get-started">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700">
            Get Started
          </button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-white text-center px-4">
        <h2 className="text-5xl font-bold mb-4 leading-tight">
          Real Creators. <span className="text-blue-600">Real Results.</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-8">
          The first platform that connects authentic influencers to brands based on quality, not followers.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/BrandsSignup">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700">
              Launch a Campaign
            </button>
          </Link>
          <Link to="/influencerSignup">
            <button className="border border-gray-400 text-gray-700 px-6 py-3 rounded-full text-lg hover:bg-gray-200">
              Join as Influencer
            </button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h4 className="text-xl font-semibold mb-2 text-blue-600">For Brands</h4>
            <ul className="space-y-4 text-gray-700">
              <li>✓ Create a campaign in minutes</li>
              <li>✓ Get matched with real influencers</li>
              <li>✓ Pay securely via escrow</li>
              <li>✓ Approve work, track impact, and rate creators</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2 text-blue-600">For Influencers</h4>
            <ul className="space-y-4 text-gray-700">
              <li>✓ Join with your social links</li>
              <li>✓ Get matched by niche & performance</li>
              <li>✓ Submit proof, earn money</li>
              <li>✓ Build your PR Score to unlock more deals</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-4xl font-bold text-blue-600">1,200+</p>
            <p className="text-gray-600 mt-2">Influencers Registered</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-blue-600">85+</p>
            <p className="text-gray-600 mt-2">Active Brand Campaigns</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-blue-600">₹12L+</p>
            <p className="text-gray-600 mt-2">Paid to Creators</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-blue-600">4.9⭐</p>
            <p className="text-gray-600 mt-2">Avg. Creator Rating</p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto text-center">
        <h3 className="text-3xl font-bold mb-6">Built for Trust</h3>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          Real Endorse protects both brands and creators with secure payments, digital contracts, verified profiles, and smart matching.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-left">
          <div className="bg-white shadow rounded-lg p-6 w-72">
            <h4 className="font-semibold mb-2 text-blue-600">Escrow Protection</h4>
            <p className="text-sm text-gray-600">We hold funds until work is verified and approved.</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 w-72">
            <h4 className="font-semibold mb-2 text-blue-600">RealScore Verified</h4>
            <p className="text-sm text-gray-600">We score influencers on delivery, engagement, and trust.</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 w-72">
            <h4 className="font-semibold mb-2 text-blue-600">Transparent Ratings</h4>
            <p className="text-sm text-gray-600">Each collaboration ends with reviews from both sides.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <h3 className="text-3xl font-bold mb-4">Ready to Join the New Era of Influence?</h3>
        <p className="mb-6 text-white/90">Whether you're a brand or creator, Real Endorse is built for you.</p>
        <div className="flex justify-center gap-4">
          <Link to="/BrandsSignup">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100">
              Create a Campaign
            </button>
          </Link>
          <Link to="/influencerSignup">
            <button className="border border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600">
              Join as Influencer
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
          {/* Company Info */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-4">Real Endorse</h4>
            <p className="text-gray-400">
              Real Endorse is the platform for authentic influencer-brand collaborations. Quality {">"} follower count.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white font-medium mb-3">Explore</h5>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/BrandsSignup" className="hover:text-white">For Brands</Link></li>
              <li><Link to="/influencerSignup" className="hover:text-white">For Influencers</Link></li>
              <li><Link to="/Pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link to="/Trust" className="hover:text-white">Trust & Safety</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-white font-medium mb-3">Company</h5>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/About us" className="hover:text-white">About Us</Link></li>
              <li><Link to="/Privacy&Policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/Term&condtions" className="hover:text-white">Terms & Conditions</Link></li>
              <li><Link to="/Contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="text-white font-medium mb-3">Stay in the loop</h5>
            <p className="text-gray-400 mb-3">Join our newsletter for updates & tips.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-3 py-2 rounded-l-md text-black focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-md"
              >
                Subscribe
              </button>
            </form>
            <div className="mt-4 flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Real Endorse. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
