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

  if (direction === 'Inbound') {
    const bodies = [
      { html: `<p>Hi,</p><p>I have some questions about ${subject.toLowerCase()}. Could we schedule a call to discuss?</p><p>Thanks,<br>${firstName}</p>`, preview: `I have some questions about ${subject.toLowerCase()}. Could we schedule a call...` },
      { html: `<p>Good morning,</p><p>Thank you for the update. I've reviewed the documents and everything looks good.</p><p>Best regards,<br>${firstName}</p>`, preview: `Thank you for the update. I've reviewed the documents and everything looks good.` },
      { html: `<p>Hi,</p><p>Please find attached the requested documents. Let me know if you need anything else.</p><p>Kind regards,<br>${firstName}</p>`, preview: `Please find attached the requested documents. Let me know if you need anything else.` },
      { html: `<p>Hello,</p><p>I'd like to discuss my current investment strategy. Are you available this week?</p><p>Thanks,<br>${firstName}</p>`, preview: `I'd like to discuss my current investment strategy. Are you available this week?` },
      { html: `<p>Hi,</p><p>I noticed a discrepancy in my latest statement. Could you please look into it?</p><p>Regards,<br>${firstName}</p>`, preview: `I noticed a discrepancy in my latest statement. Could you please look into it?` },
    ];
    const body = bodies[Math.floor(Math.random() * bodies.length)];
    return { bodyHtml: `<div style="font-family: Arial, sans-serif;">${body.html}</div>`, bodyPreview: body.preview };
  }

  // Outbound
  const bodies = [
    { html: `<p>Dear ${clientName},</p><p>Please find attached the latest information regarding ${subject.toLowerCase()}.</p><p>Your current portfolio value stands at ${value}, reflecting strong performance over the period.</p><p>Please don't hesitate to reach out if you have any questions.</p><p>Kind regards,<br><strong>${advisorName}</strong><br>Financial Adviser | ${config.firmName}</p>`, preview: `Dear ${clientName}, Please find attached the latest information regarding ${subject.toLowerCase()}...` },
    { html: `<p>Dear ${clientName},</p><p>I'm writing to follow up on our recent discussion about your financial planning.</p><p>I've prepared some recommendations which I believe will help optimise your portfolio. I'd like to schedule a meeting to review these with you.</p><p>Warm regards,<br><strong>${advisorName}</strong><br>Financial Adviser | ${config.firmName}</p>`, preview: `Dear ${clientName}, I'm writing to follow up on our recent discussion about your financial planning...` },
    { html: `<p>Dear ${clientName},</p><p>This is to confirm that your request has been processed successfully.</p><p>The changes will take effect within 3-5 business days. You will receive a confirmation once complete.</p><p>Best regards,<br><strong>${advisorName}</strong><br>Financial Adviser | ${config.firmName}</p>`, preview: `Dear ${clientName}, This is to confirm that your request has been processed successfully...` },
    { html: `<p>Dear ${clientName},</p><p>Thank you for meeting with me. As discussed, I've prepared the following action items:</p><ul><li>Review current asset allocation</li><li>Update beneficiary nominations</li><li>Schedule next quarterly review</li></ul><p>Kind regards,<br><strong>${advisorName}</strong><br>Financial Adviser | ${config.firmName}</p>`, preview: `Dear ${clientName}, Thank you for meeting with me. As discussed, I've prepared the following action items...` },
  ];
  const body = bodies[Math.floor(Math.random() * bodies.length)];
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
