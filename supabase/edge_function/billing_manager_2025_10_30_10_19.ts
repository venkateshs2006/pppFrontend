import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data } = await req.json();

    switch (action) {
      case 'create_customer':
        return await createStripeCustomer(supabaseClient, data);
      case 'create_subscription':
        return await createSubscription(supabaseClient, data);
      case 'create_payment_intent':
        return await createPaymentIntent(data);
      case 'cancel_subscription':
        return await cancelSubscription(supabaseClient, data);
      case 'update_subscription':
        return await updateSubscription(supabaseClient, data);
      case 'get_subscription_status':
        return await getSubscriptionStatus(supabaseClient, data);
      case 'handle_webhook':
        return await handleStripeWebhook(supabaseClient, req);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function createStripeCustomer(supabaseClient: any, data: any) {
  const { organizationId, email, name } = data;
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY not found');
  }

  // Create customer in Stripe
  const response = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email: email,
      name: name,
      'metadata[organization_id]': organizationId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stripe API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const customer = await response.json();

  // Update organization with Stripe customer ID
  const { error: updateError } = await supabaseClient
    .from('organizations_2025_10_30_10_19')
    .update({ stripe_customer_id: customer.id })
    .eq('id', organizationId);

  if (updateError) throw updateError;

  return new Response(
    JSON.stringify({ success: true, customer }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createSubscription(supabaseClient: any, data: any) {
  const { organizationId, priceId, paymentMethodId } = data;
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY not found');
  }

  // Get organization with Stripe customer ID
  const { data: organization, error: orgError } = await supabaseClient
    .from('organizations_2025_10_30_10_19')
    .select('stripe_customer_id, subscription_plan')
    .eq('id', organizationId)
    .single();

  if (orgError) throw orgError;

  if (!organization.stripe_customer_id) {
    throw new Error('Organization does not have a Stripe customer ID');
  }

  // Attach payment method to customer
  if (paymentMethodId) {
    await fetch(`https://api.stripe.com/v1/payment_methods/${paymentMethodId}/attach`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: organization.stripe_customer_id,
      }),
    });

    // Set as default payment method
    await fetch(`https://api.stripe.com/v1/customers/${organization.stripe_customer_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'invoice_settings[default_payment_method]': paymentMethodId,
      }),
    });
  }

  // Create subscription
  const subscriptionResponse = await fetch('https://api.stripe.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      customer: organization.stripe_customer_id,
      'items[0][price]': priceId,
      'payment_behavior': 'default_incomplete',
      'payment_settings[save_default_payment_method]': 'on_subscription',
      'expand[]': 'latest_invoice.payment_intent',
      'metadata[organization_id]': organizationId,
    }),
  });

  if (!subscriptionResponse.ok) {
    const errorText = await subscriptionResponse.text();
    throw new Error(`Stripe subscription error: ${subscriptionResponse.status} - ${errorText}`);
  }

  const subscription = await subscriptionResponse.json();

  // Update organization subscription status
  const planMapping: { [key: string]: string } = {
    'price_basic': 'basic',
    'price_professional': 'professional', 
    'price_enterprise': 'enterprise'
  };

  const plan = planMapping[priceId] || 'basic';

  const { error: updateError } = await supabaseClient
    .from('organizations_2025_10_30_10_19')
    .update({ 
      subscription_plan: plan,
      subscription_status: subscription.status 
    })
    .eq('id', organizationId);

  if (updateError) throw updateError;

  return new Response(
    JSON.stringify({ 
      success: true, 
      subscription,
      clientSecret: subscription.latest_invoice?.payment_intent?.client_secret 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createPaymentIntent(data: any) {
  const { amount, currency = 'usd', organizationId } = data;
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY not found');
  }

  // Create payment intent with Stripe
  const response = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: Math.round(amount * 100).toString(), // Convert to cents
      currency: currency,
      'metadata[organization_id]': organizationId,
      'automatic_payment_methods[enabled]': 'true',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stripe payment intent error: ${response.status} - ${errorText}`);
  }

  const paymentIntent = await response.json();

  return new Response(
    JSON.stringify({ 
      success: true, 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function cancelSubscription(supabaseClient: any, data: any) {
  const { organizationId, subscriptionId } = data;
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY not found');
  }

  // Cancel subscription in Stripe
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stripe cancellation error: ${response.status} - ${errorText}`);
  }

  const canceledSubscription = await response.json();

  // Update organization subscription status
  const { error: updateError } = await supabaseClient
    .from('organizations_2025_10_30_10_19')
    .update({ 
      subscription_status: 'canceled',
      subscription_plan: 'basic' // Downgrade to basic plan
    })
    .eq('id', organizationId);

  if (updateError) throw updateError;

  return new Response(
    JSON.stringify({ success: true, subscription: canceledSubscription }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateSubscription(supabaseClient: any, data: any) {
  const { organizationId, subscriptionId, newPriceId } = data;
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY not found');
  }

  // Get current subscription
  const subscriptionResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
    },
  });

  if (!subscriptionResponse.ok) {
    throw new Error('Failed to fetch subscription');
  }

  const subscription = await subscriptionResponse.json();

  // Update subscription item
  const updateResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'items[0][id]': subscription.items.data[0].id,
      'items[0][price]': newPriceId,
      'proration_behavior': 'create_prorations',
    }),
  });

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    throw new Error(`Stripe update error: ${updateResponse.status} - ${errorText}`);
  }

  const updatedSubscription = await updateResponse.json();

  // Update organization plan
  const planMapping: { [key: string]: string } = {
    'price_basic': 'basic',
    'price_professional': 'professional',
    'price_enterprise': 'enterprise'
  };

  const plan = planMapping[newPriceId] || 'basic';

  const { error: updateError } = await supabaseClient
    .from('organizations_2025_10_30_10_19')
    .update({ subscription_plan: plan })
    .eq('id', organizationId);

  if (updateError) throw updateError;

  return new Response(
    JSON.stringify({ success: true, subscription: updatedSubscription }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getSubscriptionStatus(supabaseClient: any, data: any) {
  const { organizationId } = data;

  // Get organization subscription details
  const { data: organization, error: orgError } = await supabaseClient
    .from('organizations_2025_10_30_10_19')
    .select('stripe_customer_id, subscription_plan, subscription_status')
    .eq('id', organizationId)
    .single();

  if (orgError) throw orgError;

  let stripeSubscription = null;

  if (organization.stripe_customer_id) {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    // Get subscriptions from Stripe
    const response = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${organization.stripe_customer_id}&status=active`, {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      },
    });

    if (response.ok) {
      const subscriptions = await response.json();
      stripeSubscription = subscriptions.data[0] || null;
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      organization,
      stripeSubscription 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleStripeWebhook(supabaseClient: any, req: Request) {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  
  // In a real implementation, you would verify the webhook signature here
  // const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  try {
    const event = JSON.parse(body);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(supabaseClient, event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(supabaseClient, event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(supabaseClient, event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailure(supabaseClient, event.data.object);
        break;
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleSubscriptionUpdate(supabaseClient: any, subscription: any) {
  const organizationId = subscription.metadata?.organization_id;
  
  if (organizationId) {
    const { error } = await supabaseClient
      .from('organizations_2025_10_30_10_19')
      .update({ 
        subscription_status: subscription.status 
      })
      .eq('id', organizationId);

    if (error) console.error('Error updating subscription status:', error);
  }
}

async function handleSubscriptionCancellation(supabaseClient: any, subscription: any) {
  const organizationId = subscription.metadata?.organization_id;
  
  if (organizationId) {
    const { error } = await supabaseClient
      .from('organizations_2025_10_30_10_19')
      .update({ 
        subscription_status: 'canceled',
        subscription_plan: 'basic'
      })
      .eq('id', organizationId);

    if (error) console.error('Error handling subscription cancellation:', error);
  }
}

async function handlePaymentSuccess(supabaseClient: any, invoice: any) {
  const organizationId = invoice.subscription_details?.metadata?.organization_id;
  
  if (organizationId) {
    // Update subscription status to active
    const { error } = await supabaseClient
      .from('organizations_2025_10_30_10_19')
      .update({ subscription_status: 'active' })
      .eq('id', organizationId);

    if (error) console.error('Error updating payment success:', error);
  }
}

async function handlePaymentFailure(supabaseClient: any, invoice: any) {
  const organizationId = invoice.subscription_details?.metadata?.organization_id;
  
  if (organizationId) {
    // Update subscription status to past_due
    const { error } = await supabaseClient
      .from('organizations_2025_10_30_10_19')
      .update({ subscription_status: 'past_due' })
      .eq('id', organizationId);

    if (error) console.error('Error updating payment failure:', error);
  }
}