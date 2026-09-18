// routes/stripeWebhook.js
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Brand = require('../models/brand');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// IMPORTANT: mount this route with express.raw before any body-parser for JSON
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription') {
          const brandId = session.client_reference_id || session.metadata?.brandId;
          const customerId = session.customer;
          const subscriptionId = session.subscription;

          if (brandId) {
            await Brand.findByIdAndUpdate(brandId, {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
            });
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;
        const status = sub.status; // active, trialing, past_due, canceled, etc.
        const priceId = sub.items?.data?.[0]?.price?.id;
        const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;
        const isPro = status === 'active' || status === 'trialing';

        await Brand.findOneAndUpdate(
          { stripeCustomerId: customerId },
          {
            stripeSubscriptionId: sub.id,
            subscriptionPlan: priceId,
            subscriptionStatus: status,
            currentPeriodEnd,
            isPro,
          }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object;
        const customerId = inv.customer;
        await Brand.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { subscriptionStatus: 'past_due', isPro: false }
        );
        break;
      }

      default:
        // handle other events as needed
        break;
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return res.status(500).send('Webhook handler failed');
  }
});

module.exports = router;
