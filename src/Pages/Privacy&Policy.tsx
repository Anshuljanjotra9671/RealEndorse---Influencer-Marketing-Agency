import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Hero Section */}
      <div className="bg-blue-50 py-20 text-center px-6">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">Privacy Policy</h1>
        <p className="max-w-3xl mx-auto text-gray-600 text-lg">
          Your privacy is important to us. This Privacy Policy explains how Real Endorse collects, uses, and protects your information.
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto py-16 px-6 space-y-10">
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-blue-600">1. Information We Collect</h2>
          <p className="text-gray-700">
            We collect personal data that you provide to us directly, such as name, email address, social media profiles, payment information, and content submitted through the platform. We may also collect data from your usage of the platform, such as device information, IP address, pages visited, and cookies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-blue-600">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>To provide and improve our services</li>
            <li>To personalize user experiences and recommendations</li>
            <li>To process payments securely</li>
            <li>To communicate with you about updates, support, or promotions</li>
            <li>To enforce terms, prevent fraud, and ensure platform security</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-blue-600">3. Sharing Your Information</h2>
          <p className="text-gray-700">
            We do not sell your data. We may share it with trusted partners and service providers who help us operate Real Endorse. These partners are bound by confidentiality and data protection agreements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-blue-600">4. Data Retention</h2>
          <p className="text-gray-700">
            We retain personal data for as long as necessary to provide the service and fulfill legal or business obligations. You may request deletion of your data at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-blue-600">5. Cookies & Tracking</h2>
          <p className="text-gray-700">
            We use cookies and similar technologies to track activity and enhance user experience. You can control cookies through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-blue-600">6. Your Rights</h2>
          <p className="text-gray-700">
            You have the right to access, correct, or delete your personal data. You may also opt out of certain uses of your data. To exercise these rights, contact us at: <a href="mailto:privacy@realendorse.com" className="text-blue-600 underline">privacy@realendorse.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-blue-600">7. Children’s Privacy</h2>
          <p className="text-gray-700">
            Real Endorse is not intended for users under the age of 13. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-blue-600">8. Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy periodically. When we do, we’ll revise the “Last updated” date. Continued use of the platform means you accept the changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-blue-600">9. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, contact us at: <br />
            <strong>Email:</strong> privacy@realendorse.com <br />
            <strong>Address:</strong> Real Endorse, 123 Influence St., Bangalore, India
          </p>
        </section>

        <div className="text-sm text-gray-500 mt-8">
          Last updated: July 21, 2025
        </div>
      </div>
    </div>
  );
}
