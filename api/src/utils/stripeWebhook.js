import express from 'express'
import { stripe } from './stripe.js'
import { supabase } from '../index.js'
import { sendEmail } from './emailService.js'

const router = express.Router()

// Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message)
    return res.status(400).send(`Webhook Error: ${error.message}`)
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'charge.refunded':
        await handleRefund(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(500).json({ error: error.message })
  }
})

async function handlePaymentSucceeded(paymentIntent) {
  try {
    console.log('✅ Payment succeeded:', paymentIntent.id)

    // Find user by Stripe customer ID
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*, users(*)')
      .eq('stripe_customer_id', paymentIntent.customer)

    if (subscriptions && subscriptions.length > 0) {
      const subscription = subscriptions[0]
      const user = subscription.users

      // Update subscription status
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          last_payment_date: new Date().toISOString(),
          payment_status: 'succeeded'
        })
        .eq('id', subscription.id)

      // Log payment
      await supabase
        .from('payment_logs')
        .insert([{
          subscription_id: subscription.id,
          user_id: user.id,
          stripe_payment_id: paymentIntent.id,
          amount_cents: paymentIntent.amount,
          status: 'succeeded'
        }])

      // Send confirmation email
      await sendEmail(user.email, 'subscriptionConfirmed', {
        fullName: user.full_name,
        email: user.email,
        charity: subscription.charity || { name: 'Selected Charity' },
        plan: subscription.plan_type
      })
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handleRefund(charge) {
  try {
    console.log('💰 Refund processed:', charge.id)

    const { data: paymentLogs } = await supabase
      .from('payment_logs')
      .select('*')
      .eq('stripe_payment_id', charge.id)

    if (paymentLogs && paymentLogs.length > 0) {
      const log = paymentLogs[0]

      await supabase
        .from('payment_logs')
        .update({
          status: 'refunded',
          refund_date: new Date().toISOString()
        })
        .eq('id', log.id)
    }
  } catch (error) {
    console.error('Error handling refund:', error)
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('🔄 Subscription updated:', subscription.id)

    const { data: dbSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (dbSubscription) {
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status === 'active' ? 'active' : 'paused'
        })
        .eq('id', dbSubscription.id)
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionCanceled(subscription) {
  try {
    console.log('❌ Subscription canceled:', subscription.id)

    const { data: dbSubscription, error } = await supabase
      .from('subscriptions')
      .select('*, users(*)')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (dbSubscription) {
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('id', dbSubscription.id)

      // Send cancellation email
      if (dbSubscription.users) {
        await sendEmail(dbSubscription.users.email, 'subscriptionCanceled', {
          fullName: dbSubscription.users.full_name,
          email: dbSubscription.users.email
        })
      }
    }
  } catch (error) {
    console.error('Error handling subscription canceled:', error)
  }
}

async function handlePaymentFailed(invoice) {
  try {
    console.log('❌ Payment failed:', invoice.id)

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*, users(*)')
      .eq('stripe_customer_id', invoice.customer)

    if (subscriptions && subscriptions.length > 0) {
      const subscription = subscriptions[0]
      const user = subscription.users

      // Log failed payment
      await supabase
        .from('payment_logs')
        .insert([{
          subscription_id: subscription.id,
          user_id: user.id,
          stripe_payment_id: invoice.id,
          amount_cents: invoice.amount_paid,
          status: 'failed'
        }])

      // Send payment failed email
      await sendEmail(user.email, 'paymentFailed', {
        fullName: user.full_name,
        email: user.email,
        retryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
      })
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

export default router
