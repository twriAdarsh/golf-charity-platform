import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Plan',
    amount: 999, // $9.99 in cents
    interval: 'month',
    currency: 'usd'
  },
  yearly: {
    name: 'Yearly Plan',
    amount: 9999, // $99.99 in cents (discounted)
    interval: 'year',
    currency: 'usd'
  }
};

export async function createStripeCustomer(email, name) {
  try {
    const customer = await stripe.customers.create({
      email,
      name
    });
    return customer;
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    throw error;
  }
}

export async function createSubscription(customerId, planType) {
  try {
    const plan = SUBSCRIPTION_PLANS[planType];
    if (!plan) throw new Error('Invalid plan type');

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.name
            },
            recurring: {
              interval: plan.interval
            },
            unit_amount: plan.amount
          }
        }
      ]
    });

    return subscription;
  } catch (error) {
    console.error('Stripe subscription creation error:', error);
    throw error;
  }
}
