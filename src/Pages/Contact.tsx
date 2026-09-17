import React from "react";

export default function ContactUs() {
  return (
    <div className="bg-white text-gray-900 font-sans">
      {/* Header */}
      <div className="bg-blue-50 py-20 text-center px-4">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">Contact Us</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Have questions, feedback, or partnership inquiries? We'd love to hear from you.
        </p>
      </div>

      {/* Main Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10">
        {/* Contact Form */}
        <div className="bg-white shadow-lg p-8 rounded-xl">
          <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
          <form className="space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium">Your Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Email Address</label>
              <input
                type="email"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Message</label>
              <textarea
                rows={5}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your message here..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Details */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Office Address</h3>
            <p className="text-gray-700">Real Endorse HQ,<br />123 Influence St., Bangalore, India</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Email</h3>
            <p className="text-gray-700">support@realendorse.com</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Phone</h3>
            <p className="text-gray-700">+91 98765 43210</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Social Media</h3>
            <div className="flex gap-4 text-gray-600">
              <a href="#" className="hover:text-blue-600">Twitter</a>
              <a href="#" className="hover:text-blue-600">Instagram</a>
              <a href="#" className="hover:text-blue-600">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
