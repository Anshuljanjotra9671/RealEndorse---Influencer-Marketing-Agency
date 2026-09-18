// routes/brand/billing.js
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Brand = require('../../models/brand');
const protectBrand = require('../../middleware/auth');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Env example:
 * BRAND_PLAN_PRICE_IDS='{"basic":"price_123","growth":"price_456"}'
 * APP_URL='http://localhost:5173' // or your deployed URL
 */
const PRICE_IDS = JSON.parse(process.env.BRAND_PLAN_PRICE_IDS || '{}');

// Create a Stripe Checkout Session for a subscription
router.post('/checkout-session', protectBrand, async (req, res, next) => {
  try {
  const { planKey, successUrl, cancelUrl } = req.body;
if (!planKey) {
  return res.status(400).json({
    message: "planKey required",
    validPlanKeys: Object.keys(PRICE_IDS),
  });
}
if (!PRICE_IDS[planKey]) {
  return res.status(400).json({
    message: `Unknown planKey: ${planKey}`,
    validPlanKeys: Object.keys(PRICE_IDS),
  });
}

    // Ensure a Stripe Customer exists for this brand
    let customerId = brand.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: brand.email,
        name: brand.brandName,
        metadata: { brandId: String(brand._id) },
      });
      customerId = customer.id;
      brand.stripeCustomerId = customerId;
      await brand.save();
    }

    // Create Checkout Session for the selected plan
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: PRICE_IDS[planKey], quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: String(brand._id),
      subscription_data: {
        metadata: { brandId: String(brand._id), planKey },
      },
      success_url: successUrl || `${process.env.APP_URL}/BrandDashboard?sub=success`,
      cancel_url: cancelUrl || `${process.env.APP_URL}/pricing?sub=cancel`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// Stripe Billing Customer Portal
router.get('/portal', protectBrand, async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.brand._id);
    if (!brand || !brand.stripeCustomerId) {
      return res.status(400).json({ message: 'Customer not found for brand' });
    }
    const portal = await stripe.billingPortal.sessions.create({
      customer: brand.stripeCustomerId,
      return_url: `${process.env.APP_URL}/BrandDashboard`,
    });
    return res.json({ url: portal.url });
  } catch (err) {
    next(err);
  }
});

// Current subscription status for dashboard
router.get('/status', protectBrand, async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.brand._id).lean();
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    return res.json({
      isPro: !!brand.isPro,
      subscriptionStatus: brand.subscriptionStatus || 'none',
      plan: brand.subscriptionPlan || null,
      currentPeriodEnd: brand.currentPeriodEnd || null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
