/**
 * Centralized Email Templates for HALT Shelter
 * Clean, modern design with consistent branding
 */

// Base email wrapper with HALT branding
function emailWrapper(content, { preheader = '' } = {}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HALT Shelter</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:#fff;max-height:0px;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #dc2626; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🐾 HALT Shelter</h1>
      <p style="color: #fecaca; margin: 8px 0 0 0; font-size: 14px;">Help Animals Live & Thrive</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px 24px; background-color: #f9fafb;">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="background-color: #111827; color: #9ca3af; padding: 24px; text-align: center; font-size: 12px;">
      <p style="margin: 0 0 8px 0;"><strong style="color: #ffffff;">HALT Shelter</strong></p>
      <p style="margin: 0 0 8px 0;">EIN: 41-2531054 | Tax-deductible donations</p>
      <p style="margin: 0;">
        <a href="https://haltshelter.org" style="color: #dc2626; text-decoration: none;">haltshelter.org</a>
        &nbsp;|&nbsp;
        <a href="mailto:contact@haltshelter.org" style="color: #dc2626; text-decoration: none;">contact@haltshelter.org</a>
      </p>
    </div>
  </div>
</body>
</html>`.trim();
}

// Donation Receipt Email
function donationReceiptHtml({ donorName, amount, currency, donationType, isEmergency, transactionId, timestamp }) {
  // SIMPLIFIED: No transaction details - focus on appreciation and impact
  const donationTypeText = donationType === 'monthly' ? 'monthly' : donationType === 'quarterly' ? 'quarterly' : donationType === 'annual' ? 'annual' : 'one-time';
  const amountText = amount ? `$${amount.toFixed(2)}` : '';
  
  const content = `
    <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 24px;">Thank You for Making a Difference! 🐾</h2>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Dear <strong>${donorName}</strong>,
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Your generous ${donationTypeText} gift${amountText ? ` of <strong style="color: #059669;">${amountText}</strong>` : ''} has been received and is already making an impact! Every contribution helps us continue our mission to rescue, rehabilitate, and rehome animals in need.
    </p>
    
    ${donationType === 'monthly' ? `
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 0 0 24px 0;">
      <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 18px;">💝 You're a Monthly Hero!</h3>
      <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">
        As a monthly supporter, you're providing consistent care that animals can count on. Your recurring gift means we can plan ahead and help even more animals find their forever homes. Thank you for your ongoing commitment!
      </p>
    </div>
    ` : ''}
    
    ${isEmergency ? `
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 0 0 24px 0;">
      <h3 style="color: #991b1b; margin: 0 0 12px 0; font-size: 18px;">🚨 Emergency Response</h3>
      <p style="color: #991b1b; margin: 0; font-size: 14px; line-height: 1.6;">
        Your emergency contribution will be used immediately for critical cases requiring urgent medical attention. Thank you for responding so quickly to help animals in crisis!
      </p>
    </div>
    ` : ''}
    
    <!-- Impact Section -->
    <div style="background-color: #ffffff; border-radius: 8px; padding: 24px; margin: 0 0 24px 0; border-left: 4px solid #dc2626;">
      <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 18px;">🌟 Your Impact</h3>
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">${donationType === 'monthly' ? 'Your monthly support helps provide:' : 'Every dollar you contribute goes directly to:'}</p>
        Every dollar you contribute goes directly to:
      </p>
      <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>🏥 Emergency veterinary care and life-saving surgeries</li>
        <li>🍲 Daily food, shelter, and compassionate rehabilitation</li>
        <li>🏠 Finding loving forever homes for rescued animals</li>
        <li>💊 Critical medications and ongoing medical treatments</li>
      </ul>
    </div>
    
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
      <strong>Stay Connected:</strong><br/>
      Follow our journey and see the animals you're helping on our social media, or visit our website to read success stories and updates.
    </p>
    
    <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0; font-style: italic;">
      Your donation is 100% secure and has been processed through Stripe. A detailed receipt has been sent separately for your records.
    </p>
    
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">
      With heartfelt gratitude,<br/>
      <strong>The HALT Team</strong> 🐾<br/>
      <span style="color: #6b7280; font-size: 13px;">haltshelter.org</span>
    </p>
  `;

  return emailWrapper(content, { preheader: `Thank you for your compassion and support!` });
}

function donationReceiptText({ donorName, amount, currency, donationType, isEmergency, transactionId, timestamp }) {
  // SIMPLIFIED: No transaction details - focus on appreciation
  const donationTypeText = donationType === 'monthly' ? 'monthly' : donationType === 'quarterly' ? 'quarterly' : donationType === 'annual' ? 'annual' : 'one-time';
  const amountText = amount ? `$${amount.toFixed(2)}` : '';
  
  const monthlyText = donationType === 'monthly' 
    ? '\n\nYOU\'RE A MONTHLY HERO!\nAs a monthly supporter, you\'re providing consistent care that animals can count on. Your recurring gift means we can plan ahead and help even more animals. Thank you for your ongoing commitment!\n' 
    : '';
    
  const emergencyText = isEmergency 
    ? '\n\nEMERGENCY RESPONSE\nYour emergency contribution will be used immediately for critical cases requiring urgent medical attention. Thank you for responding so quickly!\n' 
    : '';
  
  return `
HALT SHELTER - Thank You for Making a Difference!

Dear ${donorName},

Your generous ${donationTypeText} gift${amountText ? ` of ${amountText}` : ''} has been received and is already making an impact! Every contribution helps us continue our mission to rescue, rehabilitate, and rehome animals in need.
${monthlyText}${emergencyText}
YOUR IMPACT
===========
${donationType === 'monthly' ? 'Your monthly support helps provide:' : 'Every dollar you contribute goes directly to:'}
- Emergency veterinary care and life-saving surgeries
- Daily food, shelter, and compassionate rehabilitation
- Finding loving forever homes for rescued animals
- Critical medications and ongoing medical treatments

STAY CONNECTED
==============
Follow our journey and see the animals you're helping on our social media, or visit our website to read success stories and updates.

Your donation is 100% secure and has been processed through Stripe. A detailed receipt has been sent separately for your records.

With heartfelt gratitude,
The HALT Team 🐾

haltshelter.org | contact@haltshelter.org
  `.trim();
}

// Newsletter Confirmation Email
function newsletterConfirmationHtml(email, token, firstName = 'Supporter') {
  const rawBaseUrl = process.env.FRONTEND_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  const confirmationUrl = `${baseUrl}/api/newsletter/confirm/${token}`;

  const content = `
    <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 24px;">Confirm Your Newsletter Subscription</h2>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Hello <strong>${firstName}</strong>,
    </p>
    
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Thank you for joining our newsletter! We're excited to have you as part of the HALT community. 
      You'll be among the first to hear about animal rescues, success stories, and opportunities to make a difference.
    </p>
    
    <!-- Confirmation Card -->
    <div style="background-color: #ffffff; border-radius: 8px; padding: 24px; margin: 0 0 24px 0; border-left: 4px solid #dc2626; text-align: center;">
      <p style="color: #374151; font-size: 14px; margin: 0 0 20px 0;">
        Click the button below to confirm your email address:
      </p>
      <a href="${confirmationUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        ✅ Confirm Subscription
      </a>
      <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">
        Or copy this link: <code style="color: #6b7280; word-break: break-all;">${confirmationUrl}</code>
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
      This link will expire in 30 days. If you didn't sign up for this newsletter, you can safely ignore this email.
    </p>
    
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">
      With gratitude,<br/>
      <strong>The HALT Team</strong>
    </p>
  `;

  return emailWrapper(content, { preheader: 'Please confirm your HALT newsletter subscription' });
}

function newsletterConfirmationText(email, token, firstName = 'Supporter') {
  const rawBaseUrl = process.env.FRONTEND_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  const confirmationUrl = `${baseUrl}/api/newsletter/confirm/${token}`;

  return `
HALT SHELTER - Confirm Your Newsletter Subscription

Hello ${firstName},

Thank you for joining our newsletter! We're excited to have you as part of the HALT community.

CONFIRM YOUR SUBSCRIPTION
=========================
Click the link below to confirm your email address:

${confirmationUrl}

This link will expire in 30 days.

If you didn't sign up for this newsletter, you can safely ignore this email.

With gratitude,
The HALT Team

---
HALT Shelter | haltshelter.org | contact@haltshelter.org
  `.trim();
}

// Newsletter Welcome Email (after confirmation)
function newsletterWelcomeHtml(firstName = 'Supporter') {
  const content = `
    <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 24px;">🎉 Welcome to the HALT Family!</h2>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Hello <strong>${firstName}</strong>,
    </p>
    
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Your subscription is confirmed! You're now officially part of the HALT community. Thank you for supporting our mission to help animals live and thrive.
    </p>
    
    <!-- What to Expect Card -->
    <div style="background-color: #ffffff; border-radius: 8px; padding: 24px; margin: 0 0 24px 0; border-left: 4px solid #dc2626;">
      <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 16px;">📬 What You'll Receive:</h3>
      <ul style="color: #4b5563; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
        <li>🐾 <strong>Animal Rescues</strong> - Stories of animals we've helped</li>
        <li>📖 <strong>Success Stories</strong> - Heartwarming tales of recovery & adoption</li>
        <li>🚨 <strong>Urgent Updates</strong> - Critical situations where help is needed</li>
        <li>💝 <strong>Special Opportunities</strong> - Sponsorships, volunteering & events</li>
        <li>🎯 <strong>Mission Updates</strong> - How your support makes a difference</li>
      </ul>
    </div>
    
    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
      <p style="color: #92400e; margin: 0; font-size: 14px;">
        <strong>💡 Tip:</strong> Add <a href="mailto:contact@haltshelter.org" style="color: #dc2626;">contact@haltshelter.org</a> to your contacts to ensure our emails reach your inbox!
      </p>
    </div>
    
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">
      Thank you for being a part of our mission!<br/>
      <strong>The HALT Team</strong>
    </p>
  `;

  return emailWrapper(content, { preheader: 'Your HALT newsletter subscription is confirmed!' });
}

function newsletterWelcomeText(firstName = 'Supporter') {
  return `
HALT SHELTER - Welcome to the HALT Family!

Hello ${firstName},

🎉 Your subscription is confirmed! You're now officially part of the HALT community.

WHAT YOU'LL RECEIVE
===================
- 🐾 Animal Rescues - Stories of animals we've helped
- 📖 Success Stories - Heartwarming tales of recovery & adoption
- 🚨 Urgent Updates - Critical situations where help is needed
- 💝 Special Opportunities - Sponsorships, volunteering & events
- 🎯 Mission Updates - How your support makes a difference

TIP: Add contact@haltshelter.org to your contacts to ensure our emails reach your inbox!

Thank you for being a part of our mission!
The HALT Team

---
HALT Shelter | haltshelter.org | contact@haltshelter.org
  `.trim();
}

// Newsletter Broadcast Email (for sending newsletters to subscribers)
function newsletterBroadcastHtml(subject, content, unsubscribeToken) {
  const baseUrl = (process.env.FRONTEND_URL || 'https://haltshelter.org').replace(/\/+$/, '');
  const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`;
  
  const htmlContent = `
    <h2 style="color: #111827; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">
      ${subject}
    </h2>
    
    <div style="color: #374151; font-size: 15px; line-height: 1.8; margin: 0 0 24px 0;">
      ${content}
    </div>
    
    <!-- Call to Action -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${baseUrl}/donate" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        ❤️ Support Our Mission
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
      You're receiving this because you subscribed to the HALT newsletter.<br/>
      <a href="${unsubscribeUrl}" style="color: #dc2626; text-decoration: underline;">Unsubscribe</a> from future emails.
    </p>
  `;

  return emailWrapper(htmlContent, { preheader: subject });
}

function newsletterBroadcastText(subject, content, unsubscribeToken) {
  const baseUrl = (process.env.FRONTEND_URL || 'https://haltshelter.org').replace(/\/+$/, '');
  const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`;
  
  // Strip HTML tags from content for plain text version
  const plainContent = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
  
  return `
${subject}
${'='.repeat(subject.length)}

${plainContent}

---
Support Our Mission: ${baseUrl}/donate

---
HALT Shelter | haltshelter.org | contact@haltshelter.org
You're receiving this because you subscribed to the HALT newsletter.
Unsubscribe: ${unsubscribeUrl}
  `.trim();
}

module.exports = {
  emailWrapper,
  donationReceiptHtml,
  donationReceiptText,
  newsletterConfirmationHtml,
  newsletterConfirmationText,
  newsletterWelcomeHtml,
  newsletterWelcomeText,
  newsletterBroadcastHtml,
  newsletterBroadcastText
};
