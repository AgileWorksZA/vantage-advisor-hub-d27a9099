import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Client {
  id: string;
  first_name: string;
  surname: string;
  email: string | null;
  cell_number: string | null;
  title: string | null;
  preferred_name: string | null;
  country_of_issue: string | null;
  advisor: string | null;
}

// ─── Jurisdiction-specific email templates ─────────────────────────────────────

interface JurisdictionConfig {
  country: string;
  currency: string;
  advisors: string[];
  firmName: string;
  subjects: { subject: string; category: string }[];
}

const jurisdictionConfigs: Record<string, JurisdictionConfig> = {
  'South Africa': {
    country: 'South Africa',
    currency: 'R',
    advisors: ['Johan Botha', 'Sarah Mostert', 'Pieter Naudé', 'Linda van Wyk', 'David Greenberg'],
    firmName: 'Vantage Financial Services',
    subjects: [
      { subject: 'Updated FICA Documents Required', category: 'compliance' },
      { subject: 'Your Q4 Portfolio Performance Summary', category: 'portfolio' },
      { subject: 'RA Top-Up Opportunity Before Tax Year End', category: 'investment' },
      { subject: 'Tax Certificate for 2024 Tax Year', category: 'tax' },
      { subject: 'Reminder: Annual Financial Review Meeting', category: 'review' },
      { subject: 'Important: Changes to Your Retirement Annuity', category: 'policy' },
      { subject: 'Confirmation: Premium Adjustment Processed', category: 'confirmation' },
      { subject: 'Your Claim Reference #CL2024-7892 Status', category: 'claims' },
      { subject: 'Monthly Investment Update - January 2025', category: 'portfolio' },
      { subject: 'Welcome to Vantage Financial Services', category: 'onboarding' },
      { subject: 'Offshore Investment Options for Your Consideration', category: 'investment' },
      { subject: 'Action Required: Review Your Investment Goals', category: 'review' },
      { subject: 'TFSA Contribution Limit Update for 2025', category: 'tax' },
      { subject: 'Thank You for Your Recent Meeting', category: 'general' },
      { subject: 'Documents Received - Claim in Progress', category: 'claims' },
      { subject: 'Questions About My Investment', category: 'inquiry' },
      { subject: 'Urgent - Please Call Me', category: 'urgent' },
      { subject: 'Living Annuity Withdrawal Rate Review', category: 'policy' },
      { subject: 'JSE Market Update and Portfolio Impact', category: 'portfolio' },
      { subject: 'Section 11F Certificate Now Available', category: 'tax' },
    ],
  },
  'Australia': {
    country: 'Australia',
    currency: 'A$',
    advisors: ['James Mitchell', 'Emma Thompson', 'Liam O\'Brien', 'Sophie Chen', 'Ryan Patel'],
    firmName: 'Vantage Financial Australia',
    subjects: [
      { subject: 'TFN Declaration Update Required', category: 'compliance' },
      { subject: 'Your Superannuation Performance Review', category: 'portfolio' },
      { subject: 'Super Contribution Strategy Before EOFY', category: 'investment' },
      { subject: 'ATO Tax Summary for FY2024', category: 'tax' },
      { subject: 'Reminder: Annual Financial Review Meeting', category: 'review' },
      { subject: 'Changes to Superannuation Guarantee Rate', category: 'policy' },
      { subject: 'Confirmation: Super Salary Sacrifice Processed', category: 'confirmation' },
      { subject: 'TPD Claim Status Update', category: 'claims' },
      { subject: 'Monthly Market Update - January 2025', category: 'portfolio' },
      { subject: 'Welcome to Vantage Financial Australia', category: 'onboarding' },
      { subject: 'Franking Credits and Your Portfolio', category: 'investment' },
      { subject: 'Action Required: Review Your SMSF Strategy', category: 'review' },
      { subject: 'Concessional Contributions Cap Update 2025', category: 'tax' },
      { subject: 'Thank You for Your Recent Meeting', category: 'general' },
      { subject: 'Insurance Claim Documents Received', category: 'claims' },
      { subject: 'Questions About My Super Balance', category: 'inquiry' },
      { subject: 'Urgent: Please Call Regarding Your Account', category: 'urgent' },
      { subject: 'Transition to Retirement Strategy Review', category: 'policy' },
      { subject: 'ASX Market Update and Portfolio Impact', category: 'portfolio' },
      { subject: 'Div 293 Tax Assessment Notification', category: 'tax' },
    ],
  },
  'Canada': {
    country: 'Canada',
    currency: 'C$',
    advisors: ['Pierre Tremblay', 'Marie Leclerc', 'David Wilson', 'Sarah MacDonald', 'Jean-Luc Beaumont'],
    firmName: 'Vantage Financial Canada',
    subjects: [
      { subject: 'SIN Verification Update Required', category: 'compliance' },
      { subject: 'Your RRSP Portfolio Performance Review', category: 'portfolio' },
      { subject: 'RRSP Contribution Room - Maximize Before Deadline', category: 'investment' },
      { subject: 'T4 and T5 Tax Slips for 2024', category: 'tax' },
      { subject: 'Reminder: Annual Financial Planning Review', category: 'review' },
      { subject: 'Changes to TFSA Contribution Limits 2025', category: 'policy' },
      { subject: 'Confirmation: RRSP Contribution Processed', category: 'confirmation' },
      { subject: 'Disability Claim Status Update', category: 'claims' },
      { subject: 'Monthly Investment Update - January 2025', category: 'portfolio' },
      { subject: 'Welcome to Vantage Financial Canada', category: 'onboarding' },
      { subject: 'RESP Strategy for Education Savings', category: 'investment' },
      { subject: 'Action Required: Review Your Retirement Goals', category: 'review' },
      { subject: 'FHSA Contribution Strategy for 2025', category: 'tax' },
      { subject: 'Thank You for Your Recent Meeting', category: 'general' },
      { subject: 'Insurance Claim Documentation Received', category: 'claims' },
      { subject: 'Questions About My RRSP Withdrawals', category: 'inquiry' },
      { subject: 'Urgent: Please Call About Your Account', category: 'urgent' },
      { subject: 'RRIF Minimum Withdrawal Review', category: 'policy' },
      { subject: 'TSX Market Update and Portfolio Impact', category: 'portfolio' },
      { subject: 'Capital Gains Inclusion Rate Changes', category: 'tax' },
    ],
  },
  'United Kingdom': {
    country: 'United Kingdom',
    currency: '£',
    advisors: ['William Smith', 'Charlotte Brown', 'Oliver Davies', 'Jessica Taylor', 'Henry Wilson'],
    firmName: 'Vantage Financial UK',
    subjects: [
      { subject: 'NI Number Verification Required', category: 'compliance' },
      { subject: 'Your ISA Portfolio Performance Summary', category: 'portfolio' },
      { subject: 'ISA Top-Up Before End of Tax Year', category: 'investment' },
      { subject: 'HMRC Tax Summary for 2023/24', category: 'tax' },
      { subject: 'Reminder: Annual Financial Review Meeting', category: 'review' },
      { subject: 'Changes to Pension Annual Allowance', category: 'policy' },
      { subject: 'Confirmation: ISA Transfer Completed', category: 'confirmation' },
      { subject: 'Life Insurance Claim Status Update', category: 'claims' },
      { subject: 'Monthly Market Review - January 2025', category: 'portfolio' },
      { subject: 'Welcome to Vantage Financial UK', category: 'onboarding' },
      { subject: 'SIPP Contribution Strategy Review', category: 'investment' },
      { subject: 'Action Required: Review Your Pension Plans', category: 'review' },
      { subject: 'Lifetime ISA Withdrawal Rules Update', category: 'tax' },
      { subject: 'Thank You for Your Recent Meeting', category: 'general' },
      { subject: 'Protection Claim Documents Received', category: 'claims' },
      { subject: 'Questions About My Pension Drawdown', category: 'inquiry' },
      { subject: 'Urgent: Please Call About Your Account', category: 'urgent' },
      { subject: 'Flexi-Access Drawdown Strategy Review', category: 'policy' },
      { subject: 'FTSE Market Update and Portfolio Impact', category: 'portfolio' },
      { subject: 'Dividend Allowance Changes for 2025/26', category: 'tax' },
    ],
  },
  'United States': {
    country: 'United States',
    currency: '$',
    advisors: ['Michael Johnson', 'Emily Davis', 'Robert Martinez', 'Jennifer Williams', 'Christopher Lee'],
    firmName: 'Vantage Financial US',
    subjects: [
      { subject: 'SSN Verification Update Required', category: 'compliance' },
      { subject: 'Your 401(k) Performance Review', category: 'portfolio' },
      { subject: '401(k) Rollover Options and Strategy', category: 'investment' },
      { subject: 'Form 1099 and W-2 Tax Documents for 2024', category: 'tax' },
      { subject: 'Reminder: Annual Financial Review Meeting', category: 'review' },
      { subject: 'Changes to IRA Contribution Limits 2025', category: 'policy' },
      { subject: 'Confirmation: Roth Conversion Processed', category: 'confirmation' },
      { subject: 'Long-Term Disability Claim Update', category: 'claims' },
      { subject: 'Monthly Investment Update - January 2025', category: 'portfolio' },
      { subject: 'Welcome to Vantage Financial US', category: 'onboarding' },
      { subject: 'Roth IRA vs Traditional IRA Analysis', category: 'investment' },
      { subject: 'Action Required: Review Your Estate Plan', category: 'review' },
      { subject: 'HSA Contribution Strategy for 2025', category: 'tax' },
      { subject: 'Thank You for Your Recent Meeting', category: 'general' },
      { subject: 'Insurance Claim Documentation Received', category: 'claims' },
      { subject: 'Questions About My 401(k) Allocation', category: 'inquiry' },
      { subject: 'Urgent: Please Call About Your Account', category: 'urgent' },
      { subject: 'Required Minimum Distribution Review', category: 'policy' },
      { subject: 'S&P 500 Market Update and Portfolio Impact', category: 'portfolio' },
      { subject: 'Capital Gains Tax Planning for 2025', category: 'tax' },
    ],
  },
};

// Generate email body based on category and direction
function generateEmailBody(
  config: JurisdictionConfig,
  client: Client,
  subject: string,
  category: string,
  direction: string,
  advisorName: string
): { bodyHtml: string; bodyPreview: string } {
  const clientName = `${client.title || ''} ${client.surname}`.trim();
  const firstName = client.first_name;
  const value = `${config.currency}${(Math.random() * 500000 + 50000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  const sign = config.firmName;
  const adv = advisorName;

  if (direction === 'Inbound') {
    // Category-specific inbound templates
    const categoryBodies: Record<string, { html: string; preview: string }[]> = {
      compliance: [
        { html: `<p>Hi,</p><p>I've been meaning to send through my updated documents. I have a new proof of address (utility bill from last month) and my ID is still the same. Should I email them or upload somewhere?</p><p>Also, could you confirm what else might be outstanding on my file?</p><p>Thanks,<br>${firstName}</p>`, preview: `I've been meaning to send through my updated documents. I have a new proof of address...` },
        { html: `<p>Good morning,</p><p>I received your letter about my compliance documents expiring. I'll get the updated proof of address to you by end of week. Do you also need a new copy of my ID?</p><p>Regards,<br>${firstName}</p>`, preview: `I received your letter about my compliance documents expiring...` },
      ],
      portfolio: [
        { html: `<p>Hi,</p><p>I saw the market dropped quite a bit yesterday. My portfolio seems to have lost about 3% this month. Should I be concerned? I'm wondering if we should move some funds to more conservative options.</p><p>Can we set up a call to discuss?</p><p>Thanks,<br>${firstName}</p>`, preview: `I saw the market dropped quite a bit yesterday. My portfolio seems to have lost about 3%...` },
        { html: `<p>Hello,</p><p>I've been looking at my latest statement and noticed my equity allocation seems higher than we agreed. It looks like it's drifted from 60% to about 68%. Should we rebalance?</p><p>Kind regards,<br>${firstName}</p>`, preview: `I noticed my equity allocation seems higher than we agreed. It looks like it's drifted...` },
      ],
      investment: [
        { html: `<p>Hi,</p><p>I'd like to increase my monthly debit order from ${config.currency}5,000 to ${config.currency}8,000 starting next month. Can you also check if my beneficiary nominations are up to date?</p><p>Also, I received a bonus of ${config.currency}50,000 and would like your advice on where to invest it - perhaps a top-up to my retirement fund?</p><p>Thanks,<br>${firstName}</p>`, preview: `I'd like to increase my monthly debit order and invest my bonus of ${config.currency}50,000...` },
        { html: `<p>Good day,</p><p>I've been thinking about diversifying into offshore investments. What options do you recommend? I have about ${config.currency}200,000 available to invest.</p><p>Can we schedule a meeting to discuss?</p><p>Regards,<br>${firstName}</p>`, preview: `I've been thinking about diversifying into offshore investments. What options do you recommend?` },
      ],
      tax: [
        { html: `<p>Hi,</p><p>Tax season is coming up and I wanted to check - do I have any remaining contribution room for my retirement fund? I'd like to maximize my deduction before the deadline.</p><p>Also, could you send me my tax certificate for the past financial year?</p><p>Thanks,<br>${firstName}</p>`, preview: `Tax season is coming up. Do I have any remaining contribution room for my retirement fund?` },
        { html: `<p>Hello,</p><p>My accountant is asking for all investment-related tax documents. Could you please send through the relevant certificates and a capital gains summary for the year?</p><p>Kind regards,<br>${firstName}</p>`, preview: `My accountant is asking for all investment-related tax documents...` },
      ],
      claims: [
        { html: `<p>Hi,</p><p>I submitted my disability claim last month and haven't heard back. Could you please check the status? The claim reference was #CL-7892. My doctor has additional reports if needed.</p><p>Thanks,<br>${firstName}</p>`, preview: `I submitted my disability claim last month. Could you check the status? Claim #CL-7892...` },
      ],
      review: [
        { html: `<p>Hi,</p><p>Thanks for the reminder about our annual review. I'm available next Tuesday or Thursday afternoon. Before we meet, I'd like to discuss: 1) My retirement readiness, 2) Life cover adequacy, 3) Whether my investment mix is still appropriate.</p><p>Looking forward to it,<br>${firstName}</p>`, preview: `Thanks for the reminder about our annual review. I'm available next Tuesday or Thursday...` },
      ],
      inquiry: [
        { html: `<p>Hi,</p><p>I have a few questions about my portfolio: What is my current total value? What returns have I earned over the past 12 months? And are there any fees I should be aware of?</p><p>Thanks,<br>${firstName}</p>`, preview: `I have a few questions about my portfolio: current value, 12-month returns, and fees...` },
      ],
      urgent: [
        { html: `<p>Hi,</p><p>Please call me as soon as possible. I need to make an urgent withdrawal from my investment account due to an unforeseen expense. I need about ${config.currency}75,000 within the next few days if possible.</p><p>Thanks,<br>${firstName}</p>`, preview: `Please call me urgently. I need to make an urgent withdrawal of ${config.currency}75,000...` },
      ],
    };
    const pool = categoryBodies[category] || [
      { html: `<p>Hi,</p><p>I have some questions about ${subject.toLowerCase()}. Could we schedule a call to discuss?</p><p>Thanks,<br>${firstName}</p>`, preview: `I have some questions about ${subject.toLowerCase()}. Could we schedule a call...` },
      { html: `<p>Good morning,</p><p>Thank you for the update. I've reviewed the documents and everything looks good.</p><p>Best regards,<br>${firstName}</p>`, preview: `Thank you for the update. I've reviewed the documents and everything looks good.` },
    ];
    const body = pool[Math.floor(Math.random() * pool.length)];
    return { bodyHtml: `<div style="font-family: Arial, sans-serif;">${body.html}</div>`, bodyPreview: body.preview };
  }

  // Outbound - category-specific
  const categoryBodies: Record<string, { html: string; preview: string }[]> = {
    compliance: [
      { html: `<p>Dear ${clientName},</p><p>Our records indicate that your FICA/KYC compliance documents are due for renewal. Specifically, we require:</p><ul><li>Updated proof of residence (not older than 3 months)</li><li>Copy of valid identification document</li><li>Updated source of funds declaration</li></ul><p>Please submit these at your earliest convenience to ensure uninterrupted service on your accounts.</p><p>Kind regards,<br><strong>${adv}</strong><br>Financial Adviser | ${sign}</p>`, preview: `Your FICA/KYC compliance documents are due for renewal. We require updated proof of residence, ID, and source of funds...` },
    ],
    portfolio: [
      { html: `<p>Dear ${clientName},</p><p>I'm pleased to share your quarterly portfolio review. Here are the key highlights:</p><ul><li><strong>Current portfolio value:</strong> ${value}</li><li><strong>Quarterly return:</strong> +3.8%</li><li><strong>Allocation drift:</strong> Your equity exposure has increased from 60% to 68% due to market gains</li></ul><p>I recommend we rebalance your portfolio to bring it back in line with your risk profile. This would involve reducing equity by approximately 8% and increasing fixed income holdings.</p><p>Shall I proceed with the rebalancing, or would you prefer to discuss first?</p><p>Kind regards,<br><strong>${adv}</strong><br>Financial Adviser | ${sign}</p>`, preview: `Your quarterly portfolio review: current value ${value}, quarterly return +3.8%. Allocation drift detected - recommend rebalancing...` },
      { html: `<p>Dear ${clientName},</p><p>Following recent market movements, I wanted to provide you with an update on your portfolio performance.</p><p>Your portfolio is currently valued at ${value}. Despite short-term volatility, your diversified strategy continues to perform well against benchmarks. Year-to-date returns are at 8.2% vs the benchmark of 7.1%.</p><p>No immediate action is required, but I'd recommend we schedule a review in the coming weeks.</p><p>Warm regards,<br><strong>${adv}</strong><br>Financial Adviser | ${sign}</p>`, preview: `Portfolio update: currently valued at ${value}. Year-to-date returns 8.2% vs benchmark 7.1%...` },
    ],
    investment: [
      { html: `<p>Dear ${clientName},</p><p>With the tax year end approaching, I'd like to highlight an opportunity to maximize your retirement fund contribution.</p><p>Based on my calculations, you have approximately ${config.currency}120,000 in remaining contribution room. A top-up before the deadline would provide a significant tax deduction and boost your long-term retirement savings.</p><p>I've also identified some attractive offshore investment options that could complement your current portfolio. Would you like me to prepare a detailed proposal?</p><p>Kind regards,<br><strong>${adv}</strong><br>Financial Adviser | ${sign}</p>`, preview: `Tax year end opportunity: you have ${config.currency}120,000 remaining contribution room. A top-up would provide a significant tax deduction...` },
    ],
    tax: [
      { html: `<p>Dear ${clientName},</p><p>I've prepared a summary of your tax-relevant investment information for the current tax year:</p><ul><li><strong>Estimated capital gains:</strong> ${config.currency}45,000</li><li><strong>Dividend income:</strong> ${config.currency}12,500</li><li><strong>Deductible contributions:</strong> ${config.currency}87,000</li></ul><p>I notice potential tax-loss harvesting opportunities on two underperforming funds that could offset approximately ${config.currency}15,000 in capital gains. Shall I proceed with switching these to similar funds?</p><p>Your tax certificates will be available for download shortly.</p><p>Best regards,<br><strong>${adv}</strong><br>Financial Adviser | ${sign}</p>`, preview: `Tax summary: estimated capital gains ${config.currency}45,000, dividend income ${config.currency}12,500. Tax-loss harvesting opportunity identified...` },
    ],
    claims: [
      { html: `<p>Dear ${clientName},</p><p>I have an update on your disability claim (Reference: #CL-7892).</p><p>The insurer has reviewed the initial documentation and requires the following additional information:</p><ul><li>Updated medical report from your treating physician</li><li>Most recent blood test results</li><li>Specialist referral letter</li></ul><p>Please submit these documents by the end of the month to avoid any delays in processing. I'm happy to assist with coordinating with your healthcare providers.</p><p>Kind regards,<br><strong>${adv}</strong><br>Financial Adviser | ${sign}</p>`, preview: `Update on disability claim #CL-7892: insurer requires additional medical documentation...` },
    ],
    review: [
      { html: `<p>Dear ${clientName},</p><p>Following our annual review meeting, here is a summary of the agreed action items:</p><ol><li>Switch Fund A to Fund B to reduce fees and improve diversification</li><li>Update beneficiary nomination to include your spouse</li><li>Increase life cover by ${config.currency}500,000 to match updated needs analysis</li><li>Submit updated FICA compliance documents</li><li>Schedule quarterly portfolio reviews going forward</li></ol><p>I will begin processing items 1-3 immediately. Please submit the compliance documents at your earliest convenience.</p><p>Our next review is scheduled for 3 months from now.</p><p>Warm regards,<br><strong>${adv}</strong><br>Financial Adviser | ${sign}</p>`, preview: `Annual review summary: 1) Switch Fund A→B, 2) Update beneficiary, 3) Increase life cover by ${config.currency}500k, 4) Submit FICA docs...` },
    ],
    confirmation: [
      { html: `<p>Dear ${clientName},</p><p>This is to confirm that the following changes have been processed on your account:</p><ul><li>Premium adjustment from ${config.currency}3,500 to ${config.currency}4,200 per month</li><li>Effective date: 1st of next month</li><li>Updated debit order instruction sent to your bank</li></ul><p>Please ensure sufficient funds are available on the debit date. You will receive a revised policy schedule within 10 business days.</p><p>Best regards,<br><strong>${adv}</strong><br>Financial Adviser | ${sign}</p>`, preview: `Confirmation: premium adjustment from ${config.currency}3,500 to ${config.currency}4,200/month processed. Effective 1st of next month...` },
    ],
    policy: [
      { html: `<p>Dear ${clientName},</p><p>I'm writing to inform you of important changes affecting your retirement annuity/pension:</p><ul><li>The fund has announced a change in fee structure, reducing annual management charges from 1.2% to 0.95%</li><li>New investment options have been added including a balanced ESG fund</li><li>Your current withdrawal rate of 5.5% is within the recommended range</li></ul><p>I recommend we review your drawdown strategy at our next meeting to ensure it remains sustainable over the long term.</p><p>Kind regards,<br><strong>${adv}</strong><br>Financial Adviser | ${sign}</p>`, preview: `Important changes to your retirement annuity: fee reduction to 0.95%, new ESG fund option, withdrawal rate review recommended...` },
    ],
    onboarding: [
      { html: `<p>Dear ${clientName},</p><p>Welcome to ${sign}! We're delighted to have you as a client.</p><p>As your dedicated financial adviser, I'll be working with you to create a comprehensive financial plan. Here's what to expect:</p><ol><li>Initial fact-finding meeting to understand your goals and circumstances</li><li>Risk profiling assessment</li><li>Comprehensive financial needs analysis</li><li>Tailored investment and protection recommendations</li></ol><p>I've attached our client onboarding pack which includes the necessary forms. Please complete and return these before our first meeting.</p><p>I look forward to working with you.</p><p>Warm regards,<br><strong>${adv}</strong><br>Financial Adviser | ${sign}</p>`, preview: `Welcome to ${sign}! Here's what to expect: fact-finding meeting, risk profiling, needs analysis, and tailored recommendations...` },
    ],
  };

  const pool = categoryBodies[category] || [
    { html: `<p>Dear ${clientName},</p><p>Please find attached the latest information regarding ${subject.toLowerCase()}.</p><p>Your current portfolio value stands at ${value}, reflecting strong performance over the period.</p><p>Please don't hesitate to reach out if you have any questions.</p><p>Kind regards,<br><strong>${adv}</strong><br>Financial Adviser | ${sign}</p>`, preview: `Dear ${clientName}, Please find attached the latest information regarding ${subject.toLowerCase()}...` },
    { html: `<p>Dear ${clientName},</p><p>Thank you for meeting with me. As discussed, I've prepared the following action items:</p><ul><li>Review current asset allocation</li><li>Update beneficiary nominations</li><li>Schedule next quarterly review</li></ul><p>Kind regards,<br><strong>${adv}</strong><br>Financial Adviser | ${sign}</p>`, preview: `Dear ${clientName}, Thank you for meeting with me. Action items: review allocation, update beneficiaries, schedule review...` },
  ];
  const body = pool[Math.floor(Math.random() * pool.length)];
  return { bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px;">${body.html}</div>`, bodyPreview: body.preview };
}

// Folder distribution config
const folderConfigs: { folder: string; direction: string; count: number }[] = [
  { folder: 'Inbox', direction: 'Inbound', count: 18 },
  { folder: 'Task Pool', direction: 'Inbound', count: 15 },
  { folder: 'Sent', direction: 'Outbound', count: 18 },
  { folder: 'Draft', direction: 'Outbound', count: 15 },
  { folder: 'Queue', direction: 'Outbound', count: 15 },
  { folder: 'Failed', direction: 'Outbound', count: 15 },
  { folder: 'Archived', direction: 'Mixed', count: 18 },
];

// WhatsApp conversation templates
const whatsappConversations = [
  {
    topic: 'portfolio_query',
    messages: [
      { direction: 'inbound', content: 'Hi, I saw the market dropped yesterday. Should I be worried about my portfolio?' },
      { direction: 'outbound', content: 'Good morning! 👋 No need to worry - these fluctuations are normal. Your portfolio is well-diversified. Would you like me to send you a quick summary?' },
      { direction: 'inbound', content: 'Yes please, that would help put my mind at ease' },
      { direction: 'outbound', content: 'Here\'s your current position. Your long-term performance remains solid at 12.3% p.a. 📈' },
      { direction: 'inbound', content: 'Thank you so much! That\'s reassuring 👍' },
    ],
  },
  {
    topic: 'document_request',
    messages: [
      { direction: 'outbound', content: 'Good day! 📋 This is a friendly reminder that your compliance documents expire next month. Could you please send updated proof of address?' },
      { direction: 'inbound', content: 'Thanks for the reminder. I\'ll get that to you this week.' },
      { direction: 'inbound', content: 'Here\'s my latest utility bill' },
      { direction: 'outbound', content: 'Received, thank you! ✅ I\'ll update your records. You\'re all set until 2027.' },
    ],
  },
  {
    topic: 'meeting_reminder',
    messages: [
      { direction: 'outbound', content: 'Hi! 📅 Just confirming our meeting tomorrow at 10:00 for your annual review. I\'ll have your updated financial plan ready.' },
      { direction: 'inbound', content: 'Perfect, see you then! Can we also discuss offshore investments?' },
      { direction: 'outbound', content: 'Absolutely! I\'ll prepare some options for you. See you tomorrow! 👍' },
    ],
  },
  {
    topic: 'payment_query',
    messages: [
      { direction: 'inbound', content: 'Hi, I noticed my debit order didn\'t go off this month. Is everything okay?' },
      { direction: 'outbound', content: 'Good afternoon! Let me check that for you quickly... 🔍' },
      { direction: 'outbound', content: 'I see the issue - there was a bank holiday delay. The debit will process tomorrow. Nothing to worry about! ✅' },
      { direction: 'inbound', content: 'Thanks for checking! That\'s a relief.' },
      { direction: 'outbound', content: 'Anytime! Let me know if you have any other questions. 😊' },
    ],
  },
  {
    topic: 'investment_advice',
    messages: [
      { direction: 'inbound', content: 'I got a bonus this month. Should I put it into my retirement fund or save it separately?' },
      { direction: 'outbound', content: 'Congratulations on the bonus! 🎉 Great question. How much are you thinking of investing?' },
      { direction: 'inbound', content: 'About 50,000' },
      { direction: 'outbound', content: 'I\'d suggest splitting it - part into your retirement fund for tax benefits and the rest into a tax-free account for flexible access. Want me to prepare a formal proposal?' },
      { direction: 'inbound', content: 'Yes please, that sounds like good advice!' },
      { direction: 'outbound', content: 'Perfect! I\'ll email you a detailed proposal by end of day. 📧' },
    ],
  },
  {
    topic: 'claim_update',
    messages: [
      { direction: 'outbound', content: 'Good news! 🎉 Your claim has been approved. Payment will reflect in 3-5 business days.' },
      { direction: 'inbound', content: 'That\'s wonderful news! Thank you for your help with this.' },
      { direction: 'outbound', content: 'My pleasure! Please let me know once it reflects and if you need anything else. 😊' },
    ],
  },
  {
    topic: 'general_greeting',
    messages: [
      { direction: 'outbound', content: 'Hi there! 👋 Hope you\'re having a great week. Just wanted to check in - do you have any questions about your investments?' },
      { direction: 'inbound', content: 'Hi! All good thanks. I\'ll reach out if I need anything.' },
      { direction: 'outbound', content: 'Perfect! Have a lovely week ahead. 🌟' },
    ],
  },
];

// SMS templates
const smsMessages = [
  {
    topic: 'meeting_reminder',
    messages: [
      { direction: 'outbound', content: 'Reminder: Your financial review is scheduled for tomorrow at 10:00. See you then! - Vantage Financial' },
      { direction: 'inbound', content: 'Thanks! See you tomorrow.' },
    ],
  },
  {
    topic: 'payment_confirmation',
    messages: [
      { direction: 'outbound', content: 'Your premium payment has been received. Thank you! - Vantage Financial' },
    ],
  },
  {
    topic: 'document_ready',
    messages: [
      { direction: 'outbound', content: 'Your tax certificate is ready. Please check your email or client portal. - Vantage Financial' },
      { direction: 'inbound', content: 'Got it, thanks!' },
    ],
  },
  {
    topic: 'urgent_callback',
    messages: [
      { direction: 'inbound', content: 'Please call me when you can. Need to discuss my policy.' },
      { direction: 'outbound', content: 'Will call you in 10 minutes.' },
    ],
  },
  {
    topic: 'otp_delivery',
    messages: [
      { direction: 'outbound', content: 'Your Vantage OTP is 847291. Valid for 5 minutes. Do not share this code.' },
    ],
  },
];

// Push notification templates
const pushNotifications = [
  { content: 'Market update: Your portfolio value increased today.' },
  { content: 'Your tax certificate is ready to download in your client portal.' },
  { content: 'Reminder: Annual review meeting tomorrow at 14:00.' },
  { content: 'Premium payment received. Thank you!' },
  { content: 'Happy Birthday from the Vantage team! 🎂' },
  { content: 'New statement available: View your latest portfolio summary.' },
  { content: 'Compliance reminder: Your documents expire in 30 days. Please update.' },
  { content: 'Market alert: Significant movement detected. No action required.' },
  { content: 'Thank you for attending today\'s meeting. Summary emailed.' },
  { content: 'Your claim has been approved! Payment processing.' },
];

// ─── Document type definitions for seeding ─────────────────────────────────────

interface DocTypeSeed {
  name: string;
  code: string;
  category: 'Client' | 'FICA' | 'Product';
}

const documentTypesToSeed: DocTypeSeed[] = [
  // Client documents
  { name: 'Record of advice', code: 'ROA', category: 'Client' },
  { name: 'Client pack', code: 'CP', category: 'Client' },
  { name: 'Planning document', code: 'PLAN', category: 'Client' },
  { name: 'Application form', code: 'APP', category: 'Client' },
  { name: 'Letter of authority', code: 'LOA', category: 'Client' },
  { name: 'Will', code: 'WILL', category: 'Client' },
  { name: 'Mandate', code: 'MAND', category: 'Client' },
  // FICA documents
  { name: 'Proof of ID', code: 'POID', category: 'FICA' },
  { name: 'Proof of address', code: 'POA', category: 'FICA' },
  { name: 'Proof of bank', code: 'POB', category: 'FICA' },
  { name: 'Source of Funds', code: 'SOF', category: 'FICA' },
  { name: 'Self certification', code: 'SC', category: 'FICA' },
  { name: 'Sanction list', code: 'SL', category: 'FICA' },
  { name: 'Tax certificate', code: 'TC', category: 'FICA' },
  // Product documents
  { name: 'Policy form', code: 'PF', category: 'Product' },
  { name: 'Fee form', code: 'FF', category: 'Product' },
  { name: 'Beneficiary change', code: 'BC', category: 'Product' },
  { name: 'Fund switch or rebalance', code: 'FSR', category: 'Product' },
  { name: 'Quote', code: 'QT', category: 'Product' },
];

// Jurisdiction-specific product names for product documents
const jurisdictionProductNames: Record<string, string[]> = {
  'South Africa': ['Allan Gray Balanced Fund', 'Sanlam RA', 'Old Mutual Wealth', 'Discovery Life Plan'],
  'Australia': ['AMP Super Fund', 'Australian Super', 'REST Industry Super', 'Colonial First State'],
  'Canada': ['Manulife RRSP', 'Sun Life TFSA', 'Great-West RESP', 'RBC Wealth Management'],
  'United Kingdom': ['Aviva ISA', 'Scottish Widows SIPP', 'Prudential Pension', 'HL Fund & Share'],
  'United States': ['Vanguard 401(k)', 'Fidelity IRA', 'Schwab Roth IRA', 'T. Rowe Price 529'],
};

// Helper function to generate random date in the past N days
const randomPastDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 10) + 8);
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
};

const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

const generateExternalId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const userId = user.id;
    const adviserEmail = user.email || 'adviser@vantage.co';

    console.log(`Seeding demo communications for user: ${userId}`);

    // Fetch ALL clients grouped by country_of_issue
    const { data: allClients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, surname, email, cell_number, title, preferred_name, country_of_issue, advisor')
      .eq('user_id', userId)
      .not('email', 'is', null);

    if (clientsError) {
      throw new Error(`Failed to fetch clients: ${clientsError.message}`);
    }

    if (!allClients || allClients.length === 0) {
      console.log('No clients found. Please seed clients first.');
      return new Response(
        JSON.stringify({ success: false, message: 'No clients found. Please run seed-demo-clients first.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group clients by jurisdiction
    const clientsByJurisdiction: Record<string, Client[]> = {};
    for (const client of allClients) {
      const country = client.country_of_issue || 'South Africa';
      if (!clientsByJurisdiction[country]) {
        clientsByJurisdiction[country] = [];
      }
      clientsByJurisdiction[country].push(client);
    }

    console.log(`Found clients across ${Object.keys(clientsByJurisdiction).length} jurisdictions:`,
      Object.entries(clientsByJurisdiction).map(([k, v]) => `${k}: ${v.length}`).join(', '));

    // Clear existing demo data
    console.log('Clearing existing communications and documents data...');
    await supabase.from('task_documents').delete().eq('user_id', userId);
    await supabase.from('email_attachments').delete().eq('user_id', userId);
    await supabase.from('direct_message_attachments').delete().eq('user_id', userId);
    await supabase.from('documents').delete().eq('user_id', userId);
    await supabase.from('document_types').delete().eq('user_id', userId);
    await supabase.from('emails').delete().eq('user_id', userId);
    await supabase.from('direct_messages').delete().eq('user_id', userId);
    await supabase.from('communications').delete().eq('user_id', userId);

    const emailsToInsert: any[] = [];
    const directMessagesToInsert: any[] = [];
    const communicationsToInsert: any[] = [];

    // Generate emails for each jurisdiction
    for (const [country, clients] of Object.entries(clientsByJurisdiction)) {
      const config = jurisdictionConfigs[country];
      if (!config) {
        console.log(`No config for jurisdiction: ${country}, skipping`);
        continue;
      }

      console.log(`Generating emails for ${country} (${clients.length} clients)`);

      // For each folder, generate 15-20 emails
      for (const folderConfig of folderConfigs) {
        const emailCount = folderConfig.count;

        for (let i = 0; i < emailCount; i++) {
          // Pick a random client from this jurisdiction
          const client = clients[i % clients.length];
          const clientEmail = client.email || `${client.first_name.toLowerCase()}.${client.surname.toLowerCase()}@email.com`;

          // Pick a subject
          const subjectEntry = config.subjects[i % config.subjects.length];
          const advisorName = config.advisors[i % config.advisors.length];

          // Determine direction
          let direction: string;
          if (folderConfig.direction === 'Mixed') {
            direction = Math.random() > 0.5 ? 'Inbound' : 'Outbound';
          } else {
            direction = folderConfig.direction;
          }

          // Generate date spread over past 6 months (approx 180 days)
          const sentAt = randomPastDate(180);
          const isRead = folderConfig.folder === 'Sent' || folderConfig.folder === 'Archived' || Math.random() > 0.3;
          const hasAttachment = ['portfolio', 'tax', 'review', 'onboarding'].includes(subjectEntry.category) && Math.random() > 0.4;

          const { bodyHtml, bodyPreview } = generateEmailBody(config, client, subjectEntry.subject, subjectEntry.category, direction, advisorName);

          // Add reply prefix for some emails
          let subject = subjectEntry.subject;
          if (Math.random() > 0.6 && folderConfig.folder !== 'Draft') {
            subject = 'RE: ' + subject;
          }

          const email = {
            user_id: userId,
            client_id: client.id,
            folder: folderConfig.folder,
            direction,
            from_address: direction === 'Inbound' ? clientEmail : adviserEmail,
            to_addresses: direction === 'Inbound' ? [adviserEmail] : [clientEmail],
            cc_addresses: [],
            subject,
            body_preview: bodyPreview,
            body_html: bodyHtml,
            has_attachments: hasAttachment,
            sent_at: sentAt.toISOString(),
            received_at: direction === 'Inbound' ? sentAt.toISOString() : null,
            is_read: isRead,
            status: folderConfig.folder === 'Failed' ? 'Failed' : folderConfig.folder === 'Queue' ? 'Queued' : folderConfig.folder === 'Draft' ? 'Draft' : 'Delivered',
            external_id: generateExternalId(),
          };

          emailsToInsert.push(email);

          // Also add to communications log (skip drafts)
          if (folderConfig.folder !== 'Draft') {
            communicationsToInsert.push({
              user_id: userId,
              client_id: client.id,
              channel: 'Email',
              direction,
              from_identifier: email.from_address,
              to_identifier: direction === 'Inbound' ? adviserEmail : clientEmail,
              subject,
              content: bodyPreview,
              sent_at: sentAt.toISOString(),
              status: 'Sent',
            });
          }
        }
      }

      // Generate WhatsApp, SMS, Push for a subset of clients (up to 10 per jurisdiction)
      const msgClients = clients.slice(0, Math.min(10, clients.length));

      for (const client of msgClients) {
        const clientPhone = client.cell_number || '+1 555 000 0000';

        // WhatsApp (2-3 convos per client)
        const numWhatsapp = Math.floor(Math.random() * 2) + 2;
        const usedWA = new Set<number>();
        for (let w = 0; w < numWhatsapp; w++) {
          let idx: number;
          do { idx = Math.floor(Math.random() * whatsappConversations.length); } while (usedWA.has(idx) && usedWA.size < whatsappConversations.length);
          usedWA.add(idx);

          const convo = whatsappConversations[idx];
          let baseDate = randomPastDate(45);

          for (let m = 0; m < convo.messages.length; m++) {
            const msg = convo.messages[m];
            const sentAt = addMinutes(baseDate, m * (Math.floor(Math.random() * 15) + 2));
            let status: string;
            if (m < convo.messages.length - 2) { status = 'read'; }
            else { const r = Math.random(); status = r < 0.6 ? 'read' : r < 0.9 ? 'delivered' : 'sent'; }

            directMessagesToInsert.push({
              user_id: userId, client_id: client.id, channel: 'whatsapp', direction: msg.direction,
              content: msg.content, media_url: null, status, sent_at: sentAt.toISOString(), external_id: generateExternalId(),
            });
            communicationsToInsert.push({
              user_id: userId, client_id: client.id, channel: 'WhatsApp',
              direction: msg.direction === 'inbound' ? 'Inbound' : 'Outbound',
              from_identifier: msg.direction === 'inbound' ? clientPhone : adviserEmail,
              to_identifier: msg.direction === 'inbound' ? adviserEmail : clientPhone,
              subject: null, content: msg.content, sent_at: sentAt.toISOString(), status: 'Sent',
            });
          }
        }

        // SMS (1-2 convos per client)
        const numSms = Math.floor(Math.random() * 2) + 1;
        const usedSMS = new Set<number>();
        for (let s = 0; s < numSms; s++) {
          let idx: number;
          do { idx = Math.floor(Math.random() * smsMessages.length); } while (usedSMS.has(idx) && usedSMS.size < smsMessages.length);
          usedSMS.add(idx);

          const convo = smsMessages[idx];
          let baseDate = randomPastDate(30);

          for (let m = 0; m < convo.messages.length; m++) {
            const msg = convo.messages[m];
            const sentAt = addMinutes(baseDate, m * (Math.floor(Math.random() * 30) + 5));
            const status = Math.random() < 0.7 ? 'delivered' : 'sent';

            directMessagesToInsert.push({
              user_id: userId, client_id: client.id, channel: 'sms', direction: msg.direction,
              content: msg.content, media_url: null, status, sent_at: sentAt.toISOString(), external_id: generateExternalId(),
            });
            communicationsToInsert.push({
              user_id: userId, client_id: client.id, channel: 'SMS',
              direction: msg.direction === 'inbound' ? 'Inbound' : 'Outbound',
              from_identifier: msg.direction === 'inbound' ? clientPhone : 'Vantage',
              to_identifier: msg.direction === 'inbound' ? 'Vantage' : clientPhone,
              subject: null, content: msg.content, sent_at: sentAt.toISOString(), status: 'Sent',
            });
          }
        }

        // Push (3-5 per client)
        const numPush = Math.floor(Math.random() * 3) + 3;
        const usedPush = new Set<number>();
        for (let p = 0; p < numPush; p++) {
          let idx: number;
          do { idx = Math.floor(Math.random() * pushNotifications.length); } while (usedPush.has(idx) && usedPush.size < pushNotifications.length);
          usedPush.add(idx);

          const push = pushNotifications[idx];
          const sentAt = randomPastDate(30);
          const status = Math.random() < 0.8 ? 'read' : 'delivered';
          const clientName = `${client.first_name} ${client.surname}`;

          directMessagesToInsert.push({
            user_id: userId, client_id: client.id, channel: 'push', direction: 'outbound',
            content: push.content, media_url: null, status, sent_at: sentAt.toISOString(), external_id: generateExternalId(),
          });
          communicationsToInsert.push({
            user_id: userId, client_id: client.id, channel: 'Push', direction: 'Outbound',
            from_identifier: 'System', to_identifier: clientName,
            subject: null, content: push.content, sent_at: sentAt.toISOString(), status: 'Sent',
          });
        }
      }
    }

    // Insert all data in batches
    console.log(`Inserting ${emailsToInsert.length} emails...`);

    // Insert emails in batches of 200 (Supabase limit)
    const emailBatchSize = 200;
    const allInsertedEmails: any[] = [];
    for (let i = 0; i < emailsToInsert.length; i += emailBatchSize) {
      const batch = emailsToInsert.slice(i, i + emailBatchSize);
      const { data: inserted, error: emailsError } = await supabase
        .from('emails')
        .insert(batch)
        .select('id, subject, has_attachments');
      
      if (emailsError) {
        console.error(`Error inserting email batch ${i}:`, emailsError);
        throw emailsError;
      }
      if (inserted) allInsertedEmails.push(...inserted);
    }

    // Create attachments
    const attachmentMap: Record<string, { fileName: string; filePath: string; fileSize: number }> = {
      'Portfolio': { fileName: 'Portfolio_Report.pdf', filePath: '/downloads/Portfolio_Report.pdf', fileSize: 245000 },
      'Tax': { fileName: 'Tax_Certificate.pdf', filePath: '/downloads/Tax_Certificate.pdf', fileSize: 89000 },
      'FICA': { fileName: 'FICA_Documents.pdf', filePath: '/downloads/FICA_Documents.pdf', fileSize: 156000 },
      'Review': { fileName: 'Financial_Review.pdf', filePath: '/downloads/Financial_Review.pdf', fileSize: 320000 },
      'Welcome': { fileName: 'Welcome_Pack.pdf', filePath: '/downloads/Welcome_Pack.pdf', fileSize: 178000 },
      'Statement': { fileName: 'Statement.pdf', filePath: '/downloads/Statement.pdf', fileSize: 95000 },
      'Performance': { fileName: 'Performance_Report.pdf', filePath: '/downloads/Performance_Report.pdf', fileSize: 210000 },
      'Super': { fileName: 'Superannuation_Report.pdf', filePath: '/downloads/Super_Report.pdf', fileSize: 180000 },
      'RRSP': { fileName: 'RRSP_Statement.pdf', filePath: '/downloads/RRSP_Statement.pdf', fileSize: 140000 },
      'ISA': { fileName: 'ISA_Summary.pdf', filePath: '/downloads/ISA_Summary.pdf', fileSize: 125000 },
      '401': { fileName: '401k_Statement.pdf', filePath: '/downloads/401k_Statement.pdf', fileSize: 160000 },
    };

    const emailAttachmentsToInsert: any[] = [];
    for (const email of allInsertedEmails) {
      if (email.has_attachments && email.subject) {
        for (const [keyword, attachment] of Object.entries(attachmentMap)) {
          if (email.subject.toLowerCase().includes(keyword.toLowerCase())) {
            emailAttachmentsToInsert.push({
              email_id: email.id, user_id: userId,
              file_name: attachment.fileName, file_path: attachment.filePath,
              file_size: attachment.fileSize, content_type: 'application/pdf',
            });
            break;
          }
        }
      }
    }

    if (emailAttachmentsToInsert.length > 0) {
      console.log(`Inserting ${emailAttachmentsToInsert.length} email attachments...`);
      for (let i = 0; i < emailAttachmentsToInsert.length; i += emailBatchSize) {
        const batch = emailAttachmentsToInsert.slice(i, i + emailBatchSize);
        const { error: attachError } = await supabase.from('email_attachments').insert(batch);
        if (attachError) console.error('Error inserting email attachments batch:', attachError);
      }
    }

    console.log(`Inserting ${directMessagesToInsert.length} direct messages...`);
    for (let i = 0; i < directMessagesToInsert.length; i += emailBatchSize) {
      const batch = directMessagesToInsert.slice(i, i + emailBatchSize);
      const { error: dmError } = await supabase.from('direct_messages').insert(batch);
      if (dmError) { console.error('Error inserting DMs batch:', dmError); throw dmError; }
    }

    console.log(`Inserting ${communicationsToInsert.length} communications log entries...`);
    for (let i = 0; i < communicationsToInsert.length; i += emailBatchSize) {
      const batch = communicationsToInsert.slice(i, i + emailBatchSize);
      const { error: commError } = await supabase.from('communications').insert(batch);
      if (commError) { console.error('Error inserting comms batch:', commError); throw commError; }
    }

    // ─── DOCUMENT SEEDING ─────────────────────────────────────────────────────────

    // 1. Seed document_types
    console.log('Seeding document_types...');
    const docTypeRows = documentTypesToSeed.map(dt => ({
      user_id: userId,
      name: dt.name,
      code: dt.code,
      category: dt.category,
      is_active: true,
    }));

    const { data: insertedDocTypes, error: dtError } = await supabase
      .from('document_types')
      .insert(docTypeRows)
      .select('id, name, category, code');

    if (dtError) {
      console.error('Error inserting document_types:', dtError);
      throw dtError;
    }

    console.log(`Inserted ${insertedDocTypes?.length || 0} document types`);

    // Build lookup maps
    const clientDocTypes = (insertedDocTypes || []).filter(dt => dt.category === 'Client');
    const ficaDocTypes = (insertedDocTypes || []).filter(dt => dt.category === 'FICA');
    const productDocTypes = (insertedDocTypes || []).filter(dt => dt.category === 'Product');

    // 2. Seed documents for each client
    console.log('Seeding documents for all clients...');
    const documentsToInsert: any[] = [];

    // Build a map of client_id -> inserted email attachments for linking later
    const clientEmailAttachments: { attachmentId: string; clientId: string; fileName: string }[] = [];

    // We need to query email_attachments we just inserted to get their IDs and client linkage
    const { data: allAttachments } = await supabase
      .from('email_attachments')
      .select('id, email_id, file_name')
      .eq('user_id', userId);

    // Build email_id -> client_id map from inserted emails
    const emailClientMap: Record<string, string> = {};
    for (const e of emailsToInsert) {
      // We stored client_id on the email object
      // But we need the actual inserted email IDs - use allInsertedEmails
    }
    // Rebuild from allInsertedEmails + emailsToInsert alignment
    for (let i = 0; i < allInsertedEmails.length; i++) {
      const insertedEmail = allInsertedEmails[i];
      const originalEmail = emailsToInsert[i];
      if (originalEmail?.client_id) {
        emailClientMap[insertedEmail.id] = originalEmail.client_id;
      }
    }

    // Map attachments to clients
    for (const att of (allAttachments || [])) {
      const clientId = emailClientMap[att.email_id];
      if (clientId) {
        clientEmailAttachments.push({ attachmentId: att.id, clientId, fileName: att.file_name });
      }
    }

    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    for (const client of allClients) {
      const country = client.country_of_issue || 'South Africa';
      const productNames = jurisdictionProductNames[country] || jurisdictionProductNames['South Africa'];

      // 2-3 Client docs
      const numClientDocs = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < numClientDocs; i++) {
        const docType = clientDocTypes[i % clientDocTypes.length];
        const createdAt = new Date(oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime()));
        const statusRand = Math.random();
        const status = statusRand < 0.6 ? 'Complete' : statusRand < 0.9 ? 'Pending' : 'Expired';

        documentsToInsert.push({
          user_id: userId,
          client_id: client.id,
          document_type_id: docType.id,
          name: `${docType.name} - ${client.first_name} ${client.surname}`,
          file_path: `/documents/${client.id}/${docType.code.toLowerCase()}_${createdAt.getFullYear()}.pdf`,
          file_size: Math.floor(Math.random() * 300000) + 50000,
          mime_type: 'application/pdf',
          version: 1,
          status,
          created_at: createdAt.toISOString(),
          uploaded_by: userId,
          approved_by: status === 'Complete' ? userId : null,
          approval_date: status === 'Complete' ? new Date(createdAt.getTime() + 86400000 * Math.floor(Math.random() * 7 + 1)).toISOString() : null,
        });
      }

      // 2-3 FICA docs
      const numFicaDocs = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < numFicaDocs; i++) {
        const docType = ficaDocTypes[i % ficaDocTypes.length];
        const createdAt = new Date(oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime()));
        const statusRand = Math.random();
        // FICA docs: some expired based on expiry_date
        const expiryDate = new Date(createdAt);
        expiryDate.setFullYear(expiryDate.getFullYear() + (Math.random() < 0.3 ? 0 : 1)); // 30% expire within same year = likely expired
        const isExpired = expiryDate < now;
        const status = isExpired ? 'Expired' : (statusRand < 0.7 ? 'Complete' : 'Pending');

        documentsToInsert.push({
          user_id: userId,
          client_id: client.id,
          document_type_id: docType.id,
          name: `${docType.name} - ${client.first_name} ${client.surname}`,
          file_path: `/documents/${client.id}/${docType.code.toLowerCase()}_${createdAt.getFullYear()}.pdf`,
          file_size: Math.floor(Math.random() * 200000) + 30000,
          mime_type: 'application/pdf',
          version: 1,
          status,
          expiry_date: expiryDate.toISOString().split('T')[0],
          created_at: createdAt.toISOString(),
          uploaded_by: userId,
          approved_by: status === 'Complete' ? userId : null,
          approval_date: status === 'Complete' ? new Date(createdAt.getTime() + 86400000 * Math.floor(Math.random() * 5 + 1)).toISOString() : null,
        });
      }

      // 1-2 Product docs
      const numProductDocs = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numProductDocs; i++) {
        const docType = productDocTypes[i % productDocTypes.length];
        const productName = productNames[i % productNames.length];
        const createdAt = new Date(oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime()));
        const status = Math.random() < 0.7 ? 'Complete' : 'Pending';

        documentsToInsert.push({
          user_id: userId,
          client_id: client.id,
          document_type_id: docType.id,
          name: `${docType.name} - ${productName}`,
          file_path: `/documents/${client.id}/${docType.code.toLowerCase()}_${productName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.pdf`,
          file_size: Math.floor(Math.random() * 250000) + 40000,
          mime_type: 'application/pdf',
          version: 1,
          status,
          created_at: createdAt.toISOString(),
          uploaded_by: userId,
          approved_by: status === 'Complete' ? userId : null,
          approval_date: status === 'Complete' ? new Date(createdAt.getTime() + 86400000 * Math.floor(Math.random() * 5 + 1)).toISOString() : null,
        });
      }
    }

    // Insert documents in batches
    console.log(`Inserting ${documentsToInsert.length} documents...`);
    const allInsertedDocs: any[] = [];
    const docBatchSize = 200;
    for (let i = 0; i < documentsToInsert.length; i += docBatchSize) {
      const batch = documentsToInsert.slice(i, i + docBatchSize);
      const { data: inserted, error: docError } = await supabase
        .from('documents')
        .insert(batch)
        .select('id, client_id, document_type_id, name');

      if (docError) {
        console.error(`Error inserting documents batch ${i}:`, docError);
        throw docError;
      }
      if (inserted) allInsertedDocs.push(...inserted);
    }

    console.log(`Inserted ${allInsertedDocs.length} documents`);

    // 3. Link email_attachments to documents
    console.log('Linking email attachments to documents...');
    let attachmentLinked = 0;

    // Build client_id -> documents map
    const docsByClient: Record<string, any[]> = {};
    for (const doc of allInsertedDocs) {
      if (!docsByClient[doc.client_id]) docsByClient[doc.client_id] = [];
      docsByClient[doc.client_id].push(doc);
    }

    for (const att of clientEmailAttachments) {
      const clientDocs = docsByClient[att.clientId];
      if (clientDocs && clientDocs.length > 0) {
        // Pick a random document from this client to link
        const doc = clientDocs[Math.floor(Math.random() * clientDocs.length)];
        const { error: linkError } = await supabase
          .from('email_attachments')
          .update({ document_id: doc.id })
          .eq('id', att.attachmentId);

        if (!linkError) attachmentLinked++;
      }
    }

    console.log(`Linked ${attachmentLinked} email attachments to documents`);

    // 4. Seed task_documents
    console.log('Seeding task_documents...');
    const { data: tasksWithClients } = await supabase
      .from('tasks')
      .select('id, client_id')
      .eq('user_id', userId)
      .not('client_id', 'is', null)
      .limit(300);

    const taskDocsToInsert: any[] = [];
    if (tasksWithClients) {
      for (const task of tasksWithClients) {
        const clientDocs = docsByClient[task.client_id!];
        if (!clientDocs || clientDocs.length === 0) continue;

        // Link 1-2 documents per task
        const numLinks = Math.floor(Math.random() * 2) + 1;
        const usedDocIds = new Set<string>();

        for (let i = 0; i < numLinks; i++) {
          const doc = clientDocs[Math.floor(Math.random() * clientDocs.length)];
          if (usedDocIds.has(doc.id)) continue;
          usedDocIds.add(doc.id);

          // Find the doc type name from insertedDocTypes
          const docType = (insertedDocTypes || []).find(dt => dt.id === doc.document_type_id);

          taskDocsToInsert.push({
            user_id: userId,
            task_id: task.id,
            document_id: doc.id,
            document_type: docType?.name || 'Other',
            notes: null,
            uploaded_by: userId,
          });
        }
      }
    }

    if (taskDocsToInsert.length > 0) {
      console.log(`Inserting ${taskDocsToInsert.length} task_documents...`);
      for (let i = 0; i < taskDocsToInsert.length; i += docBatchSize) {
        const batch = taskDocsToInsert.slice(i, i + docBatchSize);
        const { error: tdError } = await supabase.from('task_documents').insert(batch);
        if (tdError) console.error('Error inserting task_documents batch:', tdError);
      }
    }

    console.log(`Inserted ${taskDocsToInsert.length} task_documents`);

    // ─── SUMMARY ─────────────────────────────────────────────────────────────────

    // Count emails per jurisdiction
    const emailsByJurisdiction: Record<string, number> = {};
    for (const email of emailsToInsert) {
      const client = allClients.find(c => c.id === email.client_id);
      const country = client?.country_of_issue || 'Unknown';
      emailsByJurisdiction[country] = (emailsByJurisdiction[country] || 0) + 1;
    }

    const summary = {
      success: true,
      message: 'Demo communications and documents seeded successfully',
      counts: {
        emails: emailsToInsert.length,
        emailAttachments: emailAttachmentsToInsert.length,
        directMessages: directMessagesToInsert.length,
        communications: communicationsToInsert.length,
        documentTypes: insertedDocTypes?.length || 0,
        documents: allInsertedDocs.length,
        taskDocuments: taskDocsToInsert.length,
        attachmentsLinked: attachmentLinked,
        jurisdictions: Object.keys(clientsByJurisdiction).length,
        emailsByJurisdiction,
      },
    };

    console.log('Seeding complete:', JSON.stringify(summary));

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding communications:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
