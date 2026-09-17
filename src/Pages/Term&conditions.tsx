import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="bg-white text-gray-800 px-6 py-16 max-w-5xl mx-auto font-sans leading-relaxed">
      <h1 className="text-4xl font-bold text-blue-700 mb-8 text-center">Terms & Conditions</h1>

      <p className="mb-6 text-gray-600">
        Welcome to Real Endorse. Please read these Terms and Conditions carefully before using our platform.
        By accessing or using any part of the site, you agree to be bound by these terms.
        If you do not agree to all the terms and conditions, you may not access the platform.
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">1. Overview</h2>
        <p>
          Real Endorse is a marketplace platform that connects influencers and creators ("Creators")
          with brands and agencies ("Brands") for paid collaborations. These terms govern your access to and use of our website,
          platform, mobile apps, and services.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">2. Eligibility</h2>
        <p>
          You must be at least 18 years old and able to form legally binding contracts. By using the platform,
          you represent and warrant that you meet these requirements.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">3. Account Registration</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
          <li>All information you provide must be accurate, current, and complete.</li>
          <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">4. Platform Usage</h2>
        <p>
          Real Endorse provides tools for campaign creation, influencer matching, communication,
          payments, and analytics. All communication and payment between brands and influencers must occur within the platform.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">5. Payments & Fees</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Brands are required to pre-fund campaigns via our secure escrow system.</li>
          <li>Creators are paid after deliverables are approved.</li>
          <li>Real Endorse charges a platform fee from either party, disclosed during onboarding or checkout.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">6. Intellectual Property</h2>
        <p>
          All content created by influencers under a campaign belongs to the brand once payment is completed,
          unless stated otherwise in campaign terms. Real Endorse retains all rights to platform design,
          branding, and technology.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">7. Prohibited Conduct</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>No fraudulent activity or misrepresentation.</li>
          <li>No circumvention of platform payments.</li>
          <li>No sharing of illegal, harmful, or offensive content.</li>
          <li>No harassment or abuse of other users.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">8. Termination</h2>
        <p>
          We may suspend or terminate your account at our sole discretion for any breach of these terms.
          Upon termination, you lose access to all platform features and data.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">9. Limitation of Liability</h2>
        <p>
          Real Endorse is not liable for any indirect, incidental, or consequential damages
          resulting from your use of the platform. Our total liability shall not exceed the amount you paid to us in the past 6 months.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">10. Dispute Resolution</h2>
        <p>
          In the event of a dispute between users, Real Endorse may assist with mediation but does not guarantee resolution.
          Legal disputes will be governed by the laws of India and resolved in the courts of [Your City, e.g. Mumbai/Delhi/Bangalore].
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">11. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Continued use of the platform after changes
          constitutes acceptance of the revised Terms. We will notify you of any significant updates.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-blue-600">12. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at:{" "}
          <a href="mailto:support@realendorse.com" className="text-blue-600 underline">
            support@realendorse.com
          </a>
        </p>
      </section>

      <div className="text-sm text-gray-500 mt-12 border-t pt-6">
        Last Updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}
