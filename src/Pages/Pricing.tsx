// PricingPage.tsx — wired to brand subscription backend (Stripe Checkout)
// - Uses brandToken from localStorage
// - Maps plan titles to backend planKey (basic/growth)
// - Redirects to Stripe-hosted Checkout URL returned by the API
// - Leaves influencer plans present; wire later to influencer billing if desired

import React, { useState } from "react";
import { motion } from "framer-motion";

type Plan = {
  title: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  role: "brand" | "influencer";
};

const plans: { influencer: Plan[]; brand: Plan[] } = {
  influencer: [
    {
      title: "Starter",
      price: "$0",
      description: "Perfect for growing creators starting to monetize.",
      features: ["Basic Campaign Access", "Profile Listing", "Up to 3 Brand Applications"],
      role: "influencer",
    },
    {
      title: "Pro Influencer",
      price: "$19/month",
      description: "Designed for active creators with growing audiences.",
      features: ["Priority Brand Matches", "Unlimited Applications", "Analytics Dashboard", "Email Support"],
      popular: true,
      role: "influencer",
    },
    {
      title: "Elite",
      price: "$49/month",
      description: "Full-featured access with concierge onboarding.",
      features: ["Dedicated Account Manager", "Featured Listings", "Brand Deal Negotiation Help", "Exclusive Campaign Invites"],
      role: "influencer",
    },
  ],
  brand: [
    {
      title: "Basic Brand",
      price: "$29/month",
      description: "For early-stage startups and solo founders.",
      features: ["Post 1 Campaign/month", "Access to 50 Influencer Profiles", "Email Support"],
      role: "brand",
    },
    {
      title: "Growth",
      price: "$99/month",
      description: "For small to mid-size businesses scaling influencer outreach.",
      features: ["Unlimited Campaign Posts", "Influencer CRM", "Campaign Analytics", "Priority Support"],
      popular: true,
      role: "brand",
    },
    {
      title: "Enterprise",
      price: "Contact Us",
      description: "Custom solutions for agencies and large brands.",
      features: ["White-label Tools", "Team Access", "API Integration", "Dedicated Success Manager"],
      role: "brand",
    },
  ],
};

// Map plan titles → backend planKey
const BRAND_PLAN_KEY: Record<string, "basic" | "growth" | "enterprise"> = {
  "Basic Brand": "basic",
  Growth: "growth",
  Enterprise: "enterprise",
};

// Optional future mapping for influencer
const INFLUENCER_PLAN_KEY: Record<string, "starter" | "pro" | "elite" | "contact"> = {
  Starter: "starter",
  "Pro Influencer": "pro",
  Elite: "elite",
  // Not used here; no “Contact” for influencer plans in this UI
};

async function startBrandCheckout(planKey: "basic" | "growth") {
  const token = localStorage.getItem("brandToken");
  if (!token) {
    window.location.href = "/BrandsLogin";
    return;
  }
  const res = await fetch("http://localhost:5000/api/brand/billing/checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      planKey,
      successUrl: window.location.origin + "/BrandDashboard?sub=success",
      cancelUrl: window.location.origin + "/pricing?sub=cancel",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create checkout session");
  }
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url; // Redirect to hosted Stripe Checkout
  }
}

function PricingCard({
  plan,
  onSelect,
  disabled,
  loading,
}: {
  plan: Plan;
  onSelect: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`relative border rounded-2xl p-6 shadow-lg bg-white ${plan.popular ? "ring-2 ring-blue-600" : ""}`}
    >
      {plan.popular && (
        <div className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-br-2xl rounded-tl-lg">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-800">{plan.title}</h3>
      <p className="text-3xl font-extrabold text-blue-600 mt-2">{plan.price}</p>
      <p className="text-gray-500 mt-2">{plan.description}</p>
      <ul className="mt-4 space-y-2 text-sm text-gray-700">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            ✅ <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        disabled={disabled || loading}
        className={`mt-6 w-full py-2 rounded-lg font-semibold transition ${
          disabled
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {plan.price === "Contact Us"
          ? loading
            ? "Opening..."
            : "Contact Sales"
          : loading
          ? "Redirecting..."
          : "Choose Plan"}
      </button>
      {plan.role === "brand" && (
        <p className="mt-2 text-xs text-gray-400">
          Powered by Stripe Checkout; the app will return here after payment. [web:25]
        </p>
      )}
    </motion.div>
  );
}

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelect = async (plan: Plan) => {
    try {
      setLoadingPlan(plan.title);

      if (plan.role === "brand") {
        const key = BRAND_PLAN_KEY[plan.title];
        if (key === "enterprise") {
          window.location.href = "/contact"; // or mailto:
          return;
        }
        await startBrandCheckout(key); // Stripe Checkout subscription flow
        return;
      }

      // Influencer flow placeholder: wire to /api/influencer/billing/checkout-session when ready
      // For Starter ($0), optionally route to signup or dashboard
      if (plan.role === "influencer") {
        if (plan.title === "Starter") {
          window.location.href = "/InfluencersLogin"; // or onboarding
          return;
        }
        // TODO: implement influencer subscription call similar to brand using INFLUENCER_PLAN_KEY
        alert("Influencer subscriptions coming soon.");
        return;
      }
    } catch (err: any) {
      alert(err?.message || "Something went wrong.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-gray-800 mb-4"
        >
          Simple, Transparent Pricing
        </motion.h1>
        <p className="text-gray-600 mb-12 text-lg">
          Whether you're an Influencer or a Brand, we have the right plan to help you grow. [web:41]
        </p>

        {/* Influencer Pricing */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">For Influencers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.influencer.map((plan) => (
            <PricingCard
              key={plan.title}
              plan={plan}
              onSelect={() => handleSelect(plan)}
              disabled={plan.title !== "Starter"} // disable paid influencer plans until backend is live
              loading={loadingPlan === plan.title}
            />
          ))}
        </div>

        {/* Brand Pricing */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">For Brands</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.brand.map((plan) => (
            <PricingCard
              key={plan.title}
              plan={plan}
              onSelect={() => handleSelect(plan)}
              loading={loadingPlan === plan.title}
            />
          ))}
        </div>

        <p className="mt-8 text-sm text-gray-500">
          After purchase, access is provisioned by webhooks; success and cancel URLs are only for navigation. [web:27]
        </p>
      </div>
    </div>
  );
}
