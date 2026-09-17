import { ShieldCheck, Lock, AlertTriangle, UserCheck, BadgeCheck, Star, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function TrustAndSafety() {
  return (
    <div className="bg-white py-16 px-6 lg:px-20 space-y-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Trust & Safety</h1>
        <p className="text-lg text-gray-600">
          Your safety, data, and professionalism are our highest priority. We foster a secure and transparent environment for influencers and brands to collaborate confidently.
        </p>
      </div>

      {/* Security Features */}
      <section className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {[
          {
            icon: <ShieldCheck size={36} className="text-blue-600 mb-3" />,
            title: "Platform Integrity",
            desc: "Verified profiles, moderated campaigns, and anti-spam technology for a safe experience.",
          },
          {
            icon: <Lock size={36} className="text-blue-600 mb-3" />,
            title: "Data Encryption",
            desc: "We follow GDPR & global privacy standards. All communication is encrypted end-to-end.",
          },
          {
            icon: <AlertTriangle size={36} className="text-blue-600 mb-3" />,
            title: "Risk Detection",
            desc: "AI-based fraud monitoring, phishing detection, and misuse reporting keep users safe.",
          },
          {
            icon: <UserCheck size={36} className="text-blue-600 mb-3" />,
            title: "Community Guidelines",
            desc: "Respectful collaboration enforced through clearly defined rules and moderation tools.",
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            className="text-center"
          >
            {item.icon}
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Verified Badge System */}
      <section className="max-w-4xl mx-auto bg-blue-50 p-8 rounded-xl shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <BadgeCheck size={30} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Verified Influencer & Brand Badges</h2>
        </div>
        <p className="text-gray-600">
          We offer verified badges to genuine creators and brand representatives. Verified accounts build trust, receive priority placement, and reduce impersonation risks.
        </p>
        <ul className="list-disc list-inside text-sm mt-4 text-gray-600 space-y-1">
          <li>Complete profile and social links</li>
          <li>ID or business document submission</li>
          <li>Manual and AI-based verification process</li>
        </ul>
      </section>

      {/* User Report Form */}
      <section className="max-w-3xl mx-auto border rounded-xl p-8 bg-white shadow">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Report a Concern</h3>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Your email"
            required
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Offending user link or username"
            required
            className="w-full border px-4 py-2 rounded-lg"
          />
          <textarea
            placeholder="Describe the issue"
            rows={4}
            required
            className="w-full border px-4 py-2 rounded-lg"
          />
          <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
            <Send size={16} /> Submit Report
          </button>
        </form>
      </section>

      {/* Reviews / Testimonials */}
      <section className="max-w-6xl mx-auto text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">What Our Users Say</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Aanya R.",
              text: "Got my first campaign safely through this platform. The support team is excellent!",
              stars: 5,
            },
            {
              name: "Mediabridge Agency",
              text: "Influencer verification gives us confidence while shortlisting creators.",
              stars: 4,
            },
            {
              name: "Raj M.",
              text: "Easy to report fake profiles. Transparent and safe experience overall.",
              stars: 5,
            },
          ].map((review, idx) => (
            <div key={idx} className="bg-gray-50 p-6 rounded-xl shadow-sm text-left">
              <p className="text-gray-700 mb-3 italic">“{review.text}”</p>
              <div className="flex items-center gap-2">
                {[...Array(review.stars)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">– {review.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Frequently Asked Questions</h3>
        <div className="space-y-6">
          {[
            {
              q: "How can I get verified?",
              a: "Complete your profile, connect your social account, and submit identification. Our team reviews requests within 72 hours.",
            },
            {
              q: "How do you protect my payment and data?",
              a: "We use bank-grade encryption, secure payment gateways, and never share your data without consent.",
            },
            {
              q: "What happens when I report a user?",
              a: "Reports are reviewed by moderators. If violations are found, we suspend or remove accounts per our policy.",
            },
          ].map((item, i) => (
            <div key={i}>
              <h4 className="font-semibold text-gray-700">{item.q}</h4>
              <p className="text-gray-600 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <div className="text-center mt-20">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Still have questions?</h3>
        <p className="text-gray-600 mb-4">Our team is here to help with any concern, 24/7.</p>
        <a
          href="/contact"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Contact Trust & Safety Team
        </a>
      </div>
    </div>
  );
}
