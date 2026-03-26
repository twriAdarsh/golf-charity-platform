import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Plan',
    amount: 99900, // ₹999 in paise (1 INR = 100 paise)
    interval: 'monthly',
    currency: 'INR',
    period: 1
  },
  yearly: {
    name: 'Yearly Plan (20% Off)',
    amount: 799920, // ₹7999.20 in paise (20% discount)
    interval: 'yearly',
    currency: 'INR',
    period: 12
  }
}

// Create subscription order
export async function createSubscriptionOrder(email, planType, charityName) {
  try {
    const plan = SUBSCRIPTION_PLANS[planType]
    if (!plan) throw new Error('Invalid plan type')

    const orderOptions = {
      amount: plan.amount,
      currency: plan.currency,
      receipt: `subscription_${Date.now()}`,
      email: email,
      notes: {
        charity: charityName,
        plan: planType,
        description: plan.name
      }
    }

    const order = await razorpay.orders.create(orderOptions)
    return order
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    throw error
  }
}

// Verify payment signature
export function verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  try {
    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex')

    const isSignatureValid = expectedSignature === razorpaySignature
    return isSignatureValid
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// Get payment details
export async function getPaymentDetails(paymentId) {
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error('Error fetching payment details:', error)
    throw error
  }
}

// Create recurring subscription
export async function createRecurringSubscription(customerId, planType, email) {
  try {
    const plan = SUBSCRIPTION_PLANS[planType]
    if (!plan) throw new Error('Invalid plan type')

    const subscriptionOptions = {
      plan_id: planType, // You need to create plans in Razorpay dashboard first
      customer_notify: 1,
      quantity: 1,
      total_count: planType === 'monthly' ? 12 : 1,
      email: email
    }

    // For now, return order instead (manual subscriptions)
    // In production, you'd create Razorpay plans first
    const subscription = await createSubscriptionOrder(email, planType, 'Selected Charity')
    return subscription
  } catch (error) {
    console.error('Subscription creation error:', error)
    throw error
  }
}

// Refund payment
export async function refundPayment(paymentId, amount = null) {
  try {
    const refundOptions = {
      amount: amount || undefined // undefined = full refund
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions)
    return refund
  } catch (error) {
    console.error('Refund error:', error)
    throw error
  }
}

export default razorpay
