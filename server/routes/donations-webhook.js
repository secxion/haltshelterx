const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const { Donation } = require('../models');
const { sendReceiptEmail } = require('../utils/email');
const { donationReceiptHtml, donationReceiptText } = require('../utils/emailTemplates');
const { logToFile } = require('../utils/fileLogger');

/**
 * Fresh Stripe Webhook Handler for Donations
 * Handles payment_intent.succeeded events and sends receipt emails via SMTP
 */
module.exports = async function donationsWebhookHandler(req, res) {
  const timestamp = new Date().toISOString();
  
  // ===== WEBHOOK ENTRY LOGGING =====
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[WEBHOOK] ENTRY AT ${timestamp}`);
  console.log(`${'='.repeat(80)}`);
  console.log('[WEBHOOK] Request Details:');
  console.log(`  • Method: ${req.method}`);
  console.log(`  • URL: ${req.url}`);
  console.log(`  • Content-Type: ${req.headers['content-type']}`);
  console.log(`  • Body Length: ${req.body?.length || 0} bytes`);
  console.log(`  • Stripe-Signature Present: ${!!req.headers['stripe-signature']}`);
  console.log(`  • Webhook Secret Configured: ${!!process.env.STRIPE_WEBHOOK_SECRET}`);
  
  logToFile(`[WEBHOOK-ENTRY] ${timestamp} - Webhook handler invoked`);

  // ===== VERIFY SIGNATURE =====
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    console.error('[WEBHOOK] ❌ ERROR: Missing stripe-signature header');
    logToFile('[WEBHOOK-ERROR] Missing stripe-signature header');
    return res.status(400).json({ 
      error: 'Missing stripe-signature header',
      received: false 
    });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[WEBHOOK] ❌ ERROR: STRIPE_WEBHOOK_SECRET not configured in environment');
    logToFile('[WEBHOOK-ERROR] STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ 
      error: 'Webhook secret not configured',
      received: false 
    });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log(`[WEBHOOK] ✅ Signature verified successfully`);
  } catch (err) {
    console.error('[WEBHOOK] ❌ Signature verification failed:');
    console.error(`  • Error: ${err.message}`);
    console.error(`  • Type: ${err.type}`);
    logToFile(`[WEBHOOK-ERROR] Signature verification failed: ${err.message}`);
    return res.status(400).json({ 
      error: `Webhook error: ${err.message}`,
      received: false 
    });
  }

  // ===== LOG EVENT DETAILS =====
  const eventId = event && event.id ? String(event.id) : null;
  console.log(`[WEBHOOK] ✅ Event received`);
  console.log(`  • Event ID: ${eventId}`);
  console.log(`  • Event Type: ${event.type}`);
  console.log(`  • Created: ${new Date(event.created * 1000).toISOString()}`);
  logToFile(`[WEBHOOK-EVENT] id=${eventId} type=${event.type} created=${event.created}`);
  // DEBUG: Print eventId and typeof
  console.log(`[DEBUG] eventId (raw):`, eventId, '| typeof:', typeof eventId);

  // Deduplication logic removed as requested

  // ===== ROUTE EVENT =====
  let handlerResult = null;
  let handlerError = null;
  console.log(`[WEBHOOK] [DEBUG] Routing event type: '${event.type}' (typeof: ${typeof event.type})`);
  if (!event.type) {
    console.error('[WEBHOOK] [DEBUG] event.type is missing or falsy:', event.type);
    logToFile('[WEBHOOK-ERROR] event.type is missing or falsy');
  }
  switch (event.type && event.type.trim().toLowerCase()) {
    case 'payment_intent.succeeded':
      try {
    let matched = false;
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          matched = true;
          console.log(`[DEBUG] Routing to handlePaymentIntentSucceeded for event: ${event.id}`);
          handlerResult = await handlePaymentIntentSucceeded(event, res);
          return;
          break;
        case 'payment_intent.payment_failed':
          matched = true;
          console.log(`[DEBUG] Routing to handlePaymentIntentFailed for event: ${event.id}`);
          handlerResult = await handlePaymentIntentFailed(event, res);
          return;
          break;
        case 'charge.refunded':
          matched = true;
          console.log(`[WEBHOOK] 💬 Refund event received (no action taken)`, event.data.object.id);
          res.json({ received: true });
          break;
        default:
          // Do not set matched = true here
          break;
      }
      if (!matched) {
        console.error(`[WEBHOOK] [DEBUG] No switch match for event.type: '${event.type}'`);
        logToFile(`[WEBHOOK-ERROR] No switch match for event.type: '${event.type}'`);
        res.json({ received: true, note: 'No switch match for event.type' });
      }
    } catch (err) {
      handlerError = err;
      console.error(`[WEBHOOK] ❌ ERROR in event handler for type ${event.type}:`, err.message);
      console.error(err.stack);
      logToFile(`[WEBHOOK-ERROR] Handler error for type ${event.type}: ${err.message}`);
      res.status(500).json({ received: false, error: err.message });
    }
        handlerResult = await handlePaymentIntentSucceeded(event, res);
        return;
      } catch (err) {
        handlerError = err;
      }
      break;

    case 'payment_intent.payment_failed':
      try {
        handlerResult = await handlePaymentIntentFailed(event, res);
        return;
      } catch (err) {
        handlerError = err;
      }
      break;

    case 'charge.refunded':
      console.log(`[WEBHOOK] 💬 Refund event received (no action taken)`, event.data.object.id);
      res.json({ received: true });
      break;

    default:
      // Fallback: handle any event type containing 'payment_intent.succeeded'
      if (event.type && event.type.toLowerCase().includes('payment_intent.succeeded')) {
        try {
          handlerResult = await handlePaymentIntentSucceeded(event, res);
          return;
        } catch (err) {
          handlerError = err;
        }
        break;
      }
      console.log(`[WEBHOOK] ⚠️  Unhandled event type: ${event.type}`);
      logToFile(`[WEBHOOK-UNHANDLED] Event type: ${event.type}`);
      res.json({ received: true });
  }

  // Deduplication logic removed as requested
};

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(event, res) {
    console.log(`\n[DEBUG] Entered handlePaymentIntentSucceeded for event:`, event && event.id);
    if (event && event.data && event.data.object) {
      console.log(`[DEBUG] PaymentIntent ID:`, event.data.object.id);
      console.log(`[DEBUG] PaymentIntent metadata:`, event.data.object.metadata);
    }
  const paymentIntent = event.data.object;
  console.log(`\n[PAYMENT-SUCCESS] >>> ENTRY: handlePaymentIntentSucceeded`);
  logToFile(`[PAYMENT-SUCCESS-ENTRY] Payment intent=${paymentIntent.id}`);
  try {
    console.log(`[PAYMENT-SUCCESS] [STEP] Extracting donor info...`);
    // ===== EXTRACT DONOR INFO =====
    const metadata = paymentIntent.metadata || {};
    let donorName = metadata.donor_name || metadata.donorName || 'Supporter';
    let donorEmail = metadata.donor_email || metadata.donorEmail || paymentIntent.receipt_email;
    const donationType = metadata.donation_type || metadata.donationType || 'one-time';
    const isEmergency = metadata.is_emergency === 'true' || metadata.is_emergency === true;
    const amount = paymentIntent.amount / 100;
    const currency = paymentIntent.currency.toUpperCase();
    const transactionId = paymentIntent.id;

    console.log(`\n[DONOR-INFO] Extracted from payment intent:`);
    console.log(`  • Name: ${donorName}`);
    console.log(`  • Email: ${donorEmail}`);
    console.log(`  • Donation Type: ${donationType}`);
    console.log(`  • Amount: $${amount} ${currency}`);

    // Fallback: retrieve customer email if missing
    if ((!donorEmail || donorEmail === 'null' || donorEmail === 'undefined') && paymentIntent.customer) {
      console.log(`[DONOR-INFO] Email missing, fetching from Stripe customer...`);
      try {
        const customer = await stripe.customers.retrieve(paymentIntent.customer);
        if (customer?.email) {
          donorEmail = customer.email;
          if (customer.name) donorName = customer.name;
          console.log(`[DONOR-INFO] ✅ Retrieved from Stripe: ${donorEmail}`);
          logToFile(`[DONOR-FETCH] Retrieved customer email: ${donorEmail}`);
        }
      } catch (custErr) {
        console.warn(`[DONOR-INFO] ⚠️  Could not fetch customer:`, custErr.message);
        logToFile(`[DONOR-FETCH-ERROR] ${custErr.message}`);
      }
    }

    // Validate email
    if (!donorEmail || !donorEmail.includes('@')) {
      console.error(`[PAYMENT-SUCCESS] ❌ Invalid or missing donor email: ${donorEmail}`);
      logToFile(`[DONATION-ERROR] Invalid donor email: ${donorEmail}`);
      res.status(400).json({ 
        error: 'Cannot process: no valid donor email',
        received: false 
      });
      return;
    }


    // ===== ATOMIC EMAIL SEND & DEDUPLICATION (UPSERT) =====
    console.log(`\n[DEDUP] Atomic upsert for donation receipt...`);
    const now = new Date();
    // Try to insert or update the donation atomically
    const upsertResult = await Donation.findOneAndUpdate(
      { transactionId },
      {
        $setOnInsert: {
          donorInfo: { name: donorName, email: donorEmail },
          amount,
          currency,
          donationType,
          paymentMethod: 'stripe',
          paymentStatus: 'completed',
          transactionId,
          stripeCustomerId: paymentIntent.customer || undefined,
          source: 'website',
          isRecurring: donationType !== 'one-time',
          completedAt: now,
          receiptSent: true,
          receiptSentAt: now
        }
      },
      { new: true, upsert: true }
    );
    // Only send email if this is a new donation (receiptSentAt == now)
    if (!upsertResult.receiptSentAt || Math.abs(upsertResult.receiptSentAt.getTime() - now.getTime()) > 1000) {
      console.log(`[DEDUP] ✅ Receipt already sent, skipping...`);
      logToFile(`[DEDUP] Receipt already sent, skipping email`);
      res.json({ received: true, status: 'duplicate_processed', donationId: upsertResult?._id });
      return;
    }

    // ===== SEND RECEIPT EMAIL =====
    console.log(`\n[EMAIL] Preparing receipt email...`);
    logToFile(`[EMAIL-ATTEMPT] About to call sendReceiptEmail for ${donorEmail}`);

    const emailSubject = 'Thank You for Your Compassion 💙 - HALT Shelter';
    const emailHtml = donationReceiptHtml({
      donorName,
      amount,
      currency,
      donationType,
      isEmergency,
      transactionId,
      timestamp: new Date(paymentIntent.created * 1000)
    });

    const emailText = donationReceiptText({
      donorName,
      amount,
      currency,
      donationType,
      isEmergency,
      transactionId,
      timestamp: new Date(paymentIntent.created * 1000)
    });

    try {
      console.log(`[EMAIL] 📧 Sending to ${donorEmail}...`);
      logToFile(`[EMAIL-SEND] Calling sendReceiptEmail for ${donorEmail}`);
      const emailResult = await sendReceiptEmail({
        to: donorEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailText
      });
      console.log(`[EMAIL] ✅ Email sent successfully`);
      logToFile(`[EMAIL-SUCCESS] Email sent to ${donorEmail}`);
      console.log(`\n[PAYMENT-SUCCESS] ✅ COMPLETE - Donation ${updateResult._id} processed and email sent`);
      logToFile(`[PAYMENT-SUCCESS-COMPLETE] donation=${updateResult._id}`);
      res.json({ received: true, status: 'success', donationId: updateResult._id });
      return;
    } catch (emailErr) {
      console.error(`[EMAIL] ❌ Failed to send receipt email`);
      logToFile(`[EMAIL-FAIL] sendReceiptEmail failed: ${emailErr.message}`);
      // Still consider the webhook successful since donation was saved
      res.json({ 
        received: true, 
        status: 'saved_but_email_failed',
        donationId: updateResult._id,
        emailError: emailErr.message
      });
      return;
    }
  } catch (error) {
    console.error(`\n[PAYMENT-SUCCESS] ❌ Unexpected error in handlePaymentIntentSucceeded:`);
    console.error(`  • ${error.message}`);
    console.error(`  • Stack: ${error.stack?.split('\n').slice(0, 3).join('\n')}`);
    logToFile(`[PAYMENT-SUCCESS-ERROR] ${error.message}`);
    res.status(500).json({ 
      error: error.message,
      received: false 
    });
    return;
  }
  console.log(`[PAYMENT-SUCCESS] <<< EXIT: handlePaymentIntentSucceeded`);
  logToFile(`[PAYMENT-SUCCESS-EXIT] Payment intent=${paymentIntent.id}`);
}