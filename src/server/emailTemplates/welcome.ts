// emailTemplates/welcome.ts

export interface WelcomeEmailParams {
  fullName: string;
  email: string;
  maskedEmail: string;
  referralCode: string;
  referralLink: string;
  isConfirmed: boolean;
  siteUrl: string;
  appUrl: string;
  supportEmail: string;
  supportPhone: string;
}

const FIRST_NAME_RE = /^\s*(\S+)/;

function firstName(fullName: string): string {
  const m = fullName.match(FIRST_NAME_RE);
  return m ? m[1] : 'there';
}

export const WELCOME_SUBJECT = "Welcome to Sealify, {{firstName}} \u2014 here's how to start selling";

function preheader(): string {
  return '<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff;">You\'re in. Here\'s how to turn your Sealify listings into real sales \u2014 and how to earn a free month of promo ads by referring friends.</div>';
}

function gradientBand(title: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:8px 8px 0 0;padding:28px 24px;">
  <tr>
    <td align="center">
      <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">${title}</span>
    </td>
  </tr>
</table>`;
}

function cardOpen(): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e1e5e9;border-radius:0 0 8px 8px;padding:28px 24px;">
  <tr><td>`;
}

function cardClose(): string {
  return '</td></tr></table>';
}

function textBlock(html: string): string {
  return `<div style="margin:16px 0;font-size:16px;line-height:1.6;color:#333333;">${html}</div>`;
}

function button(url: string, label: string): string {
  return `
<div style="text-align:center;margin:24px 0;">
  <!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:44px;v-text-anchor:middle;width:260px;" arcsize="12%" strokecolor="#667eea" fillcolor="#667eea">
    <w:anchorlock/>
    <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:700;">${label}</center>
  </v:roundrect>
  <![endif]-->
  <a href="${url}" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:6px;font-weight:700;font-size:16px;display:inline-block;font-family:Arial,sans-serif;mso-hide:all;">${label}</a>
</div>`;
}

function secondaryButton(url: string, label: string): string {
  return `
<div style="text-align:center;margin:16px 0;">
  <a href="${url}" style="background:#f3f4f6;color:#374151;text-decoration:none;padding:10px 24px;border-radius:6px;font-weight:600;font-size:15px;display:inline-block;font-family:Arial,sans-serif;">${label}</a>
</div>`;
}

function divider(): string {
  return `<div style="height:1px;background:#e5e7eb;margin:20px 0;"></div>`;
}

function referralBlock(referralLink: string): string {
  return `
<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:20px;margin:20px 0;">
  <div style="font-size:14px;color:#92400e;margin-bottom:8px;"><strong>Your invite link:</strong></div>
  <div style="font-family:monospace;font-size:13px;background:#f3f4f6;padding:10px;border-radius:4px;word-break:break-all;">${referralLink}</div>
  <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
    <a href="https://wa.me/?text=${encodeURIComponent(`Join me on Sealify — ${referralLink}`)}" target="_blank" rel="noopener noreferrer" style="background:#25D366;color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none;font-size:13px;font-weight:600;">WhatsApp</a>
    <a href="https://x.com/intent/tweet?text=${encodeURIComponent(`Join me on Sealify — ${referralLink}`)}" target="_blank" rel="noopener noreferrer" style="background:#1DA1F2;color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none;font-size:13px;font-weight:600;">X</a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}" target="_blank" rel="noopener noreferrer" style="background:#1877F2;color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none;font-size:13px;font-weight:600;">Facebook</a>
  </div>
</div>`;
}

function rewardDisclosure(): string {
  return `
<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:20px;margin:20px 0;">
  <h3 style="margin:0 0 12px;font-size:16px;color:#9a3412;">\uD83C\uDFF0 Referrals may earn you 1 month of free promotional ad listings</h3>
  <p style="margin:0 0 8px;font-size:14px;color:#9a3412;">When your referrals reach the qualifying threshold, you may be eligible for <strong>one (1) month of free promotional ad listings</strong> \u2014 a full month of promoted visibility for your ads, on us.</p>
  <p style="margin:0 0 8px;font-size:14px;color:#9a3412;">Every referral is reviewed before a reward is granted. <strong>Final approval of any referral reward is at the sole discretion of the Root System Admin.</strong> We verify each referral to keep the community fair and genuine, so rewards are not guaranteed or automatic.</p>
  <p style="margin:0;font-size:14px;color:#9a3412;">Track your progress any time from <strong>Referrals</strong> in your dashboard.</p>
</div>`;
}

function footer(supportEmail: string, supportPhone: string, year: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
  <tr>
    <td align="center" style="font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">
      Questions? Just reply to this email, or reach us at<br>
      <a href="mailto:${supportEmail}" style="color:#667eea;text-decoration:none;">${supportEmail}</a> &middot; <a href="tel:${supportPhone.replace(/\D/g,'')}" style="color:#667eea;text-decoration:none;">${supportPhone}</a>
    </td>
  </tr>
  <tr>
    <td align="center" style="font-size:12px;color:#6b7280;font-family:Arial,sans-serif;padding-top:16px;">
      \u00A9 ${year} Sealify Nigeria. All rights reserved.
    </td>
  </tr>
  <tr>
    <td align="center" style="font-size:12px;color:#6b7280;font-family:Arial,sans-serif;padding-top:8px;">
      You\'re receiving this because you created a Sealify account.<br>
      <a href="${supportEmail}" style="color:#667eea;text-decoration:none;">Notification preferences</a>
    </td>
  </tr>
</table>`;
}

export function renderWelcomeHtml(p: WelcomeEmailParams): string {
  const fn = firstName(p.fullName);
  const year = new Date().getFullYear().toString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Welcome to Sealify</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .page { background:#111827 !important; }
      .card { background:#1f2937 !important; border-color:#374151 !important; }
      .text { color:#e5e7eb !important; }
      .muted { color:#9ca3af !important; }
      .link { color:#a5b4fc !important; }
      .btn-primary { background:linear-gradient(135deg,#818cf8 0%,#a78bfa 100%) !important; }
    }
  </style>
</head>
<body style="margin:0;padding:24px 12px;background:#f4f5f7;font-family:Arial,sans-serif;line-height:1.6;-webkit-text-size-adjust:100%;" class="page">
  ${preheader()}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td>
              ${gradientBand('Sealify')}
              ${cardOpen()}
              <h1 style="margin:0 0 8px;font-size:24px;color:#111827;">Hi ${fn}, welcome to Sealify! \uD83D\uDC4B</h1>
              ${textBlock('Your account is live. In the next two minutes you\'ll learn what you can do here for free, how to turn a listing into a sale, and how your friends can earn you a free month of promoted listings.')}

              <h2 style="margin:24px 0 12px;font-size:18px;color:#111827;">Your account</h2>
              ${textBlock(`
                <strong>Sign in with</strong> ${p.email}<br>
                <strong>Password:</strong> the one you chose when you signed up \u2014 we never email passwords, for good reason.
              `)}
              ${button(`${p.appUrl}/reset-password`, 'Set or change my password')}
              ${textBlock('<span style="color:#6b7280;font-size:14px;">Not you? You can safely ignore this email. No action is needed.</span>')}

              ${divider()}

              <h2 style="margin:16px 0 12px;font-size:18px;color:#111827;">What is Sealify?</h2>
              ${textBlock(`
                Sealify is a marketplace that connects the people of Nigeria directly \u2014 buyers who are actively searching, and sellers who have real things to sell. Post a listing in under a minute, reach buyers in your area and beyond, and handle enquiries, offers and safe meetups in one place.
              `)}
              ${textBlock(`
                Whether you\'re clearing stock, running a small business, or just finding a better deal, Sealify is built to make buying and selling feel safe, simple and local.
              `)}

              ${divider()}

              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0;">
                <h3 style="margin:0 0 12px;font-size:16px;color:#166534;">\uD83D\uDCE1 Sealify is completely free \u2014 until you choose otherwise</h3>
                <p style="margin:0 0 8px;font-size:14px;color:#166534;">You can create your account, post listings, browse, message sellers and make sales <strong>without paying anything at all.</strong></p>
                <p style="margin:0 0 8px;font-size:14px;color:#166534;">The only time money comes into play is if <strong>you</strong> decide you want your ads promoted. Promoted listings are entirely optional \u2014 they\'re a way to put your ad in front of more buyers faster.</p>
                <p style="margin:0;font-size:14px;color:#166534;"><strong>Sealify only costs you money if, and when, you choose to subscribe to promotional ad listings. Until then, it\'s yours at no cost.</strong></p>
              </div>

              ${divider()}

              <h2 style="margin:16px 0 12px;font-size:18px;color:#111827;">Turn Sealify into sales, leads and customers</h2>
              ${textBlock(`
                <strong>1. Post one listing today \u2014 it takes a minute.</strong> A complete listing with a real photo, a fair price and a clear description gets 5\u00D7 more enquiries than a bare one. Add your location so nearby buyers can find you.
              `)}
              ${textBlock(`
                <strong>2. Treat enquiries like conversations, not transactions.</strong> Reply quickly \u2014 buyers often message three sellers. Ask a question, offer something small extra, and be straightforward about what\'s wrong with an item. Good-faith replies turn into completed deals.
              `)}
              ${textBlock(`
                <strong>3. Keep fresh listings at the top.</strong> Renew and update your ads regularly. Fresh activity makes your shop look active and trustworthy, which brings more buyers back.
              `)}
              ${textBlock(`
                <strong>4. Get found \u2014 locally and by buyers who want what you sell.</strong> Use your full location and clear category. Sellers with complete profiles appear higher in results and in buyer searches, so finish your profile to appear in the shops directory.
              `)}
              ${textBlock(`
                <strong>5. Promote the ads that already work.</strong> Start with your best-performing listing, subscribe to a promotional ad listing plan, and put it in front of more buyers. Only pay when a boost is already earning you attention \u2014 never to rescue a listing that nobody wants.
              `)}

              ${divider()}

              ${button(`${p.appUrl}/post-ad`, 'Post your first listing')}

              ${divider()}

              <h2 style="margin:16px 0 12px;font-size:18px;color:#111827;">\uD83E\uDDB8 Refer friends, family and college mates \u2014 earn a free month</h2>
              ${textBlock('You know people who\'d love this. Share your personal invite link and when they join Sealify, it counts toward your referral total.')}
              ${referralBlock(p.referralLink)}
              ${rewardDisclosure()}

              ${divider()}

              ${secondaryButton(`${p.appUrl}/settings`, 'Go to my dashboard')}
              ${secondaryButton(`${p.appUrl}/settings`, 'Complete my profile')}

              ${cardClose()}
              ${footer(p.supportEmail, p.supportPhone, year)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderWelcomeText(p: WelcomeEmailParams): string {
  const fn = firstName(p.fullName);
  const year = new Date().getFullYear().toString();

  return `
SEALIFY NIGERIA — WELCOME

Hi ${fn}!

Your account is live. In the next two minutes you'll learn what you can do here for free, how to turn a listing into a sale, and how your friends can earn you a free month of promoted listings.

YOUR ACCOUNT
Email: ${p.email}
Password: the one you chose when you signed up — we never email passwords, for good reason.
Set or change your password: ${p.appUrl}/reset-password

Not you? You can safely ignore this email. No action is needed.

WHAT IS SEALIFY?
Sealify is a marketplace that connects the people of Nigeria directly — buyers who are actively searching, and sellers who have real things to sell. Post a listing in under a minute, reach buyers in your area and beyond, and handle enquiries, offers and safe meetups in one place.

Whether you're clearing stock, running a small business, or just finding a better deal, Sealify is built to make buying and selling feel safe, simple and local.

SEALIFY IS COMPLETELY FREE — UNTIL YOU CHOOSE OTHERWISE
You can create your account, post listings, browse, message sellers and make sales WITHOUT PAYING ANYTHING AT ALL.
The only time money comes into play is if YOU decide you want your ads promoted. Promoted listings are entirely optional — they're a way to put your ad in front of more buyers faster.
SEALIFY ONLY COSTS YOU MONEY IF, AND WHEN, YOU CHOOSE TO SUBSCRIBE TO PROMOTIONAL AD LISTINGS. Until then, it's yours at no cost.

TURN SEALIFY INTO SALES, LEADS AND CUSTOMERS
1. Post one listing today — it takes a minute. A complete listing with a real photo, a fair price and a clear description gets 5× more enquiries than a bare one. Add your location so nearby buyers can find you.
2. Treat enquiries like conversations, not transactions. Reply quickly — buyers often message three sellers. Ask a question, offer something small extra, and be straightforward about what's wrong with an item. Good-faith replies turn into completed deals.
3. Keep fresh listings at the top. Renew and update your ads regularly. Fresh activity makes your shop look active and trustworthy, which brings more buyers back.
4. Get found — locally and by buyers who want what you sell. Use your full location and clear category. Sellers with complete profiles appear higher in results and in buyer searches, so finish your profile to appear in the shops directory.
5. Promote the ads that already work. Start with your best-performing listing, subscribe to a promotional ad listing plan, and put it in front of more buyers. Only pay when a boost is already earning you attention — never to rescue a listing that nobody wants.

Post your first listing: ${p.appUrl}/post-ad

👨‍👩‍👧‍👦 REFER FRIENDS, FAMILY AND COLLEGE MATES — EARN A FREE MONTH
You know people who'd love this. Share your personal invite link and when they join Sealify, it counts toward your referral total.

Your invite link:
${p.referralLink}

Share on WhatsApp: https://wa.me/?text=${encodeURIComponent(`Join me on Sealify — ${p.referralLink}`)}
Share on X: https://x.com/intent/tweet?text=${encodeURIComponent(`Join me on Sealify — ${p.referralLink}`)}
Share on Facebook: https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(p.referralLink)}

🌟 REFERRALS MAY EARN YOU 1 MONTH OF FREE PROMOTIONAL AD LISTINGS
When your referrals reach the qualifying threshold, you may be eligible for ONE (1) MONTH OF FREE PROMOTIONAL AD LISTINGS — a full month of promoted visibility for your ads, on us.

Every referral is reviewed before a reward is granted. FINAL APPROVAL OF ANY REFERRAL REWARD IS AT THE SOLE DISCRETION OF THE ROOT SYSTEM ADMIN. We verify each referral to keep the community fair and genuine, so rewards are not guaranteed or automatic.

Track your progress any time from Referrals in your dashboard.

Go to my dashboard: ${p.appUrl}/settings
Complete my profile: ${p.appUrl}/settings

© ${year} Sealify Nigeria. All rights reserved.
You're receiving this because you created a Sealify account.
Questions? support@sealify.ng · +234 813 120 8468
Notification preferences: ${p.appUrl}/settings
`;
}