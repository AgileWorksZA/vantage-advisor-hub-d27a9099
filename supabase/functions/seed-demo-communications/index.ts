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
}

// Email thread templates for financial advisers
const emailThreads = [
  {
    category: 'portfolio_update',
    threads: [
      {
        subject: 'Your Q4 2024 Portfolio Performance Summary',
        messages: [
          {
            direction: 'Outbound',
            hasAttachment: true,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>Please find attached your quarterly portfolio performance summary for Q4 2024.</p>
                <p><strong>Key Highlights:</strong></p>
                <ul>
                  <li>Portfolio Value: R${(Math.random() * 3000000 + 500000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (+${(Math.random() * 8 + 2).toFixed(1)}% this quarter)</li>
                  <li>Year-to-date Return: ${(Math.random() * 10 + 8).toFixed(1)}%</li>
                  <li>Asset Allocation: On target</li>
                </ul>
                <p>I'd be happy to schedule a call to discuss these results in more detail.</p>
                <p>Kind regards,<br><strong>Johan Botha</strong><br>Financial Adviser | Vantage Financial Services<br>Tel: +27 21 555 1234</p>
              </div>
            `,
            bodyPreview: (client: Client) => `Dear ${client.title || ''} ${client.surname}, Please find attached your quarterly portfolio performance summary for Q4 2024...`,
          },
          {
            direction: 'Inbound',
            hasAttachment: false,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif;">
                <p>Thank you for sending this through.</p>
                <p>I'm pleased with the performance. Can we schedule a call next week to discuss rebalancing options?</p>
                <p>Regards,<br>${client.first_name}</p>
              </div>
            `,
            bodyPreview: () => `Thank you for sending this through. I'm pleased with the performance. Can we schedule a call next week...`,
            subjectPrefix: 'RE: ',
          },
          {
            direction: 'Outbound',
            hasAttachment: false,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>Absolutely! I have availability on Tuesday at 10:00 or Thursday at 14:00. Please let me know which works best for you.</p>
                <p>I'll prepare some rebalancing scenarios for us to review.</p>
                <p>Kind regards,<br>Johan</p>
              </div>
            `,
            bodyPreview: () => `Absolutely! I have availability on Tuesday at 10:00 or Thursday at 14:00...`,
            subjectPrefix: 'RE: ',
          },
        ],
      },
      {
        subject: 'Monthly Investment Update - January 2025',
        messages: [
          {
            direction: 'Outbound',
            hasAttachment: true,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>I hope this email finds you well. Please find attached your monthly investment update for January 2025.</p>
                <p>The markets showed strong performance this month, with your portfolio benefiting from the positive momentum in both local and global equities.</p>
                <p>Please don't hesitate to reach out if you have any questions.</p>
                <p>Warm regards,<br><strong>Sarah Mostert</strong><br>Financial Adviser | Vantage Financial Services</p>
              </div>
            `,
            bodyPreview: (client: Client) => `Dear ${client.title || ''} ${client.surname}, I hope this email finds you well. Please find attached your monthly investment update...`,
          },
        ],
      },
    ],
  },
  {
    category: 'document_request',
    threads: [
      {
        subject: 'Updated FICA Documents Required',
        messages: [
          {
            direction: 'Outbound',
            hasAttachment: false,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>As part of our ongoing compliance obligations, we need to update your FICA documentation.</p>
                <p><strong>Documents Required:</strong></p>
                <ul>
                  <li>Certified copy of ID document (not older than 3 months)</li>
                  <li>Proof of residence (utility bill or bank statement, not older than 3 months)</li>
                </ul>
                <p>Please submit these at your earliest convenience. You can email them directly to me or upload them through our secure client portal.</p>
                <p>Kind regards,<br><strong>Pieter Naudé</strong><br>Financial Adviser | Vantage Financial Services</p>
              </div>
            `,
            bodyPreview: () => `As part of our ongoing compliance obligations, we need to update your FICA documentation...`,
          },
          {
            direction: 'Inbound',
            hasAttachment: true,
            bodyHtml: () => `
              <div style="font-family: Arial, sans-serif;">
                <p>Hi Pieter,</p>
                <p>Please find attached my updated ID and a recent bank statement.</p>
                <p>Let me know if you need anything else.</p>
                <p>Thanks</p>
              </div>
            `,
            bodyPreview: () => `Please find attached my updated ID and a recent bank statement. Let me know if you need anything else.`,
            subjectPrefix: 'RE: ',
          },
          {
            direction: 'Outbound',
            hasAttachment: false,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>Thank you for sending these through so quickly. I've updated your records - you're now compliant until 2027.</p>
                <p>Best regards,<br>Pieter</p>
              </div>
            `,
            bodyPreview: () => `Thank you for sending these through so quickly. I've updated your records - you're now compliant until 2027.`,
            subjectPrefix: 'RE: ',
          },
        ],
      },
      {
        subject: 'Tax Certificate for 2024 Tax Year',
        messages: [
          {
            direction: 'Outbound',
            hasAttachment: true,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>Your tax certificate for the 2024 tax year is now available. Please find it attached to this email.</p>
                <p>This document reflects all income and capital gains from your investment portfolio for the period 1 March 2023 to 29 February 2024.</p>
                <p>Please forward this to your tax practitioner for inclusion in your annual tax return.</p>
                <p>Kind regards,<br><strong>Linda van Wyk</strong><br>Financial Adviser | Vantage Financial Services</p>
              </div>
            `,
            bodyPreview: (client: Client) => `Dear ${client.title || ''} ${client.surname}, Your tax certificate for the 2024 tax year is now available...`,
          },
        ],
      },
    ],
  },
  {
    category: 'annual_review',
    threads: [
      {
        subject: 'Reminder: Annual Financial Review Meeting',
        messages: [
          {
            direction: 'Outbound',
            hasAttachment: false,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>It's that time of year again! I'd like to schedule your annual financial review.</p>
                <p>During this meeting, we'll:</p>
                <ul>
                  <li>Review your current portfolio performance</li>
                  <li>Assess any changes to your financial goals</li>
                  <li>Discuss market outlook and potential adjustments</li>
                  <li>Update your risk profile if necessary</li>
                </ul>
                <p>Please let me know your availability over the next two weeks, and I'll arrange a suitable time.</p>
                <p>Kind regards,<br><strong>David Greenberg</strong><br>Financial Adviser | Vantage Financial Services</p>
              </div>
            `,
            bodyPreview: () => `It's that time of year again! I'd like to schedule your annual financial review...`,
          },
          {
            direction: 'Inbound',
            hasAttachment: false,
            bodyHtml: () => `
              <div style="font-family: Arial, sans-serif;">
                <p>Hi David,</p>
                <p>Thank you for the reminder. I'm available next Wednesday afternoon or Friday morning. Either works for me.</p>
                <p>Looking forward to it.</p>
                <p>Regards</p>
              </div>
            `,
            bodyPreview: () => `Thank you for the reminder. I'm available next Wednesday afternoon or Friday morning...`,
            subjectPrefix: 'RE: ',
          },
          {
            direction: 'Outbound',
            hasAttachment: true,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>Perfect! Let's meet on Wednesday at 14:00 at our offices. I've attached a meeting invite for your calendar.</p>
                <p>I'll have your updated financial plan ready for discussion.</p>
                <p>See you then!</p>
                <p>Best regards,<br>David</p>
              </div>
            `,
            bodyPreview: () => `Perfect! Let's meet on Wednesday at 14:00 at our offices. I've attached a meeting invite...`,
            subjectPrefix: 'RE: ',
          },
        ],
      },
      {
        subject: 'Action Required: Review your investment goals',
        messages: [
          {
            direction: 'Outbound',
            hasAttachment: true,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>As part of our annual review process, I've prepared an updated analysis of your investment goals and current portfolio positioning.</p>
                <p>Please review the attached document and let me know if your circumstances or objectives have changed since we last spoke.</p>
                <p>It's important that your investment strategy remains aligned with your life goals.</p>
                <p>Kind regards,<br><strong>Sarah Mostert</strong><br>Financial Adviser | Vantage Financial Services</p>
              </div>
            `,
            bodyPreview: () => `As part of our annual review process, I've prepared an updated analysis of your investment goals...`,
          },
        ],
      },
    ],
  },
  {
    category: 'policy_changes',
    threads: [
      {
        subject: 'Important: Changes to your retirement annuity',
        messages: [
          {
            direction: 'Outbound',
            hasAttachment: true,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>I'm writing to inform you of some regulatory changes that will affect your retirement annuity from 1 March 2025.</p>
                <p>Key changes include:</p>
                <ul>
                  <li>Updated contribution limits</li>
                  <li>New withdrawal rules at retirement</li>
                  <li>Enhanced tax benefits for additional contributions</li>
                </ul>
                <p>Please review the attached summary document. I recommend we schedule a brief call to discuss how these changes might benefit your retirement planning.</p>
                <p>Kind regards,<br><strong>Johan Botha</strong><br>Financial Adviser | Vantage Financial Services</p>
              </div>
            `,
            bodyPreview: () => `I'm writing to inform you of some regulatory changes that will affect your retirement annuity from 1 March 2025...`,
          },
        ],
      },
      {
        subject: 'Confirmation: Premium adjustment processed',
        messages: [
          {
            direction: 'Outbound',
            hasAttachment: false,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>This is to confirm that your premium adjustment has been successfully processed.</p>
                <p><strong>Details:</strong></p>
                <ul>
                  <li>Policy Number: POL-${Math.random().toString(36).substring(2, 10).toUpperCase()}</li>
                  <li>New Premium: R${(Math.random() * 5000 + 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} per month</li>
                  <li>Effective Date: 1 February 2025</li>
                </ul>
                <p>Your updated debit order will reflect from the next collection date.</p>
                <p>Kind regards,<br><strong>Linda van Wyk</strong><br>Financial Adviser | Vantage Financial Services</p>
              </div>
            `,
            bodyPreview: () => `This is to confirm that your premium adjustment has been successfully processed...`,
          },
          {
            direction: 'Inbound',
            hasAttachment: false,
            bodyHtml: () => `
              <div style="font-family: Arial, sans-serif;">
                <p>Thank you for the confirmation. Much appreciated!</p>
              </div>
            `,
            bodyPreview: () => `Thank you for the confirmation. Much appreciated!`,
            subjectPrefix: 'RE: ',
          },
        ],
      },
    ],
  },
  {
    category: 'claims',
    threads: [
      {
        subject: 'Your claim reference #CL2024-7892 status update',
        messages: [
          {
            direction: 'Outbound',
            hasAttachment: false,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>I wanted to update you on the status of your claim (Reference: CL2024-7892).</p>
                <p><strong>Current Status:</strong> Under Review</p>
                <p>The claims assessor has received all the required documentation and is currently processing your claim. We expect a decision within the next 5-7 business days.</p>
                <p>I'll keep you updated on any developments. Please don't hesitate to contact me if you have any questions.</p>
                <p>Kind regards,<br><strong>Pieter Naudé</strong><br>Financial Adviser | Vantage Financial Services</p>
              </div>
            `,
            bodyPreview: () => `I wanted to update you on the status of your claim (Reference: CL2024-7892). Current Status: Under Review...`,
          },
          {
            direction: 'Inbound',
            hasAttachment: false,
            bodyHtml: () => `
              <div style="font-family: Arial, sans-serif;">
                <p>Thanks for the update Pieter. Please let me know as soon as you hear anything.</p>
              </div>
            `,
            bodyPreview: () => `Thanks for the update Pieter. Please let me know as soon as you hear anything.`,
            subjectPrefix: 'RE: ',
          },
        ],
      },
      {
        subject: 'Documents received - claim in progress',
        messages: [
          {
            direction: 'Outbound',
            hasAttachment: false,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>This is to confirm that we have received all the required documents for your claim submission.</p>
                <p>Your claim is now being processed by the insurer's claims department. The typical turnaround time is 10-15 business days from receipt of all documentation.</p>
                <p>I will follow up with them and keep you informed of progress.</p>
                <p>Kind regards,<br><strong>David Greenberg</strong><br>Financial Adviser | Vantage Financial Services</p>
              </div>
            `,
            bodyPreview: () => `This is to confirm that we have received all the required documents for your claim submission...`,
          },
        ],
      },
    ],
  },
  {
    category: 'general',
    threads: [
      {
        subject: 'Thank you for your recent meeting',
        messages: [
          {
            direction: 'Outbound',
            hasAttachment: false,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>Thank you for taking the time to meet with me yesterday. It was great to catch up and discuss your financial plans.</p>
                <p>As discussed, I will:</p>
                <ul>
                  <li>Send through the updated investment proposal by end of week</li>
                  <li>Research offshore investment options for your consideration</li>
                  <li>Schedule a follow-up call for next month</li>
                </ul>
                <p>Please don't hesitate to reach out if you have any questions in the meantime.</p>
                <p>Warm regards,<br><strong>Sarah Mostert</strong><br>Financial Adviser | Vantage Financial Services</p>
              </div>
            `,
            bodyPreview: () => `Thank you for taking the time to meet with me yesterday. It was great to catch up and discuss your financial plans...`,
          },
          {
            direction: 'Inbound',
            hasAttachment: false,
            bodyHtml: () => `
              <div style="font-family: Arial, sans-serif;">
                <p>Thank you Sarah! It was a productive meeting. I look forward to receiving the proposal.</p>
                <p>Best</p>
              </div>
            `,
            bodyPreview: () => `Thank you Sarah! It was a productive meeting. I look forward to receiving the proposal.`,
            subjectPrefix: 'RE: ',
          },
        ],
      },
      {
        subject: 'Welcome to Vantage Financial Services',
        messages: [
          {
            direction: 'Outbound',
            hasAttachment: true,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>Welcome to Vantage Financial Services! I'm delighted to have you as a client.</p>
                <p>Please find attached:</p>
                <ul>
                  <li>Our client welcome pack</li>
                  <li>Your personalized financial needs analysis</li>
                  <li>Important regulatory disclosures</li>
                </ul>
                <p>I look forward to working with you to achieve your financial goals.</p>
                <p>Warm regards,<br><strong>Johan Botha</strong><br>Financial Adviser | Vantage Financial Services</p>
              </div>
            `,
            bodyPreview: (client: Client) => `Dear ${client.title || ''} ${client.surname}, Welcome to Vantage Financial Services! I'm delighted to have you as a client...`,
          },
        ],
      },
    ],
  },
  {
    category: 'client_inquiry',
    threads: [
      {
        subject: 'Questions about my investment',
        messages: [
          {
            direction: 'Inbound',
            hasAttachment: false,
            bodyHtml: () => `
              <div style="font-family: Arial, sans-serif;">
                <p>Hi,</p>
                <p>I've been reviewing my latest statement and have a few questions:</p>
                <ol>
                  <li>Why did the value drop last month?</li>
                  <li>Should I be concerned about the current market volatility?</li>
                  <li>Is now a good time to increase my contributions?</li>
                </ol>
                <p>Please call me when you get a chance.</p>
                <p>Thanks</p>
              </div>
            `,
            bodyPreview: () => `I've been reviewing my latest statement and have a few questions: Why did the value drop last month?...`,
          },
          {
            direction: 'Outbound',
            hasAttachment: true,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>Thank you for reaching out with your questions. Let me address each one:</p>
                <ol>
                  <li><strong>Value fluctuation:</strong> The slight decrease was due to normal market movements. Your portfolio is well-diversified and designed for long-term growth.</li>
                  <li><strong>Market volatility:</strong> While volatility can be unsettling, it's a normal part of investing. Historically, markets have always recovered from downturns.</li>
                  <li><strong>Contributions:</strong> Actually, market dips can be a good time to invest more, as you're buying assets at lower prices. I've attached an analysis.</li>
                </ol>
                <p>Would you like to schedule a call to discuss further?</p>
                <p>Kind regards,<br><strong>Pieter Naudé</strong><br>Financial Adviser | Vantage Financial Services</p>
              </div>
            `,
            bodyPreview: () => `Thank you for reaching out with your questions. Let me address each one...`,
            subjectPrefix: 'RE: ',
          },
        ],
      },
      {
        subject: 'Urgent - Please call me',
        messages: [
          {
            direction: 'Inbound',
            hasAttachment: false,
            bodyHtml: () => `
              <div style="font-family: Arial, sans-serif;">
                <p>Hi,</p>
                <p>I need to discuss something urgently regarding my policy. Please call me on my cell as soon as possible.</p>
                <p>Thanks</p>
              </div>
            `,
            bodyPreview: () => `I need to discuss something urgently regarding my policy. Please call me on my cell as soon as possible.`,
          },
          {
            direction: 'Outbound',
            hasAttachment: false,
            bodyHtml: (client: Client) => `
              <div style="font-family: Arial, sans-serif;">
                <p>Dear ${client.title || ''} ${client.surname},</p>
                <p>I tried calling but couldn't reach you. I'll try again in 30 minutes.</p>
                <p>Alternatively, please let me know a good time to call.</p>
                <p>Regards,<br>Linda</p>
              </div>
            `,
            bodyPreview: () => `I tried calling but couldn't reach you. I'll try again in 30 minutes...`,
            subjectPrefix: 'RE: ',
          },
          {
            direction: 'Inbound',
            hasAttachment: false,
            bodyHtml: () => `
              <div style="font-family: Arial, sans-serif;">
                <p>Sorry I missed your call. I'm available now or anytime after 14:00 today.</p>
              </div>
            `,
            bodyPreview: () => `Sorry I missed your call. I'm available now or anytime after 14:00 today.`,
            subjectPrefix: 'RE: ',
          },
        ],
      },
    ],
  },
];

// WhatsApp conversation templates
const whatsappConversations = [
  {
    topic: 'portfolio_query',
    messages: [
      { direction: 'inbound', content: 'Hi, I saw the market dropped yesterday. Should I be worried about my portfolio?' },
      { direction: 'outbound', content: 'Good morning! 👋 No need to worry - these fluctuations are normal. Your portfolio is well-diversified. Would you like me to send you a quick summary?' },
      { direction: 'inbound', content: 'Yes please, that would help put my mind at ease' },
      { direction: 'outbound', content: 'Here\'s your current position. Your long-term performance remains solid at 12.3% p.a. 📈', mediaUrl: 'Portfolio_Summary_Jan2025.pdf' },
      { direction: 'inbound', content: 'Thank you so much! That\'s reassuring 👍' },
    ],
  },
  {
    topic: 'document_request',
    messages: [
      { direction: 'outbound', content: 'Good day! 📋 This is a friendly reminder that your FICA documents expire next month. Could you please send updated proof of address?' },
      { direction: 'inbound', content: 'Thanks for the reminder. I\'ll get that to you this week.' },
      { direction: 'inbound', content: 'Here\'s my latest municipal account', mediaUrl: 'Utility_Bill_Jan2025.pdf' },
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
      { direction: 'inbound', content: 'I got a bonus this month. Should I put it into my RA or save it separately?' },
      { direction: 'outbound', content: 'Congratulations on the bonus! 🎉 Great question. How much are you thinking of investing?' },
      { direction: 'inbound', content: 'About R50,000' },
      { direction: 'outbound', content: 'With R50k, I\'d suggest putting R33k into your RA (to maximize your tax benefit) and the rest into a TFSA for flexible access. Want me to prepare a formal proposal?' },
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
      { direction: 'outbound', content: 'Your premium payment of R3,500 has been received. Thank you! - Vantage Financial' },
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
      { direction: 'outbound', content: 'Will call you in 10 minutes. - Johan' },
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
  { content: 'Market update: JSE All Share up 2.3% today. Your portfolio value increased by R12,450.' },
  { content: 'Your tax certificate is ready to download in your client portal.' },
  { content: 'Reminder: Annual review meeting tomorrow at 14:00.' },
  { content: 'Premium payment of R3,500 received. Thank you!' },
  { content: 'Happy Birthday from the Vantage team! 🎂' },
  { content: 'New statement available: View your January 2025 portfolio summary.' },
  { content: 'FICA reminder: Your documents expire in 30 days. Please update.' },
  { content: 'Market alert: Significant movement detected. No action required.' },
  { content: 'Thank you for attending today\'s meeting. Summary emailed.' },
  { content: 'Your claim has been approved! Payment processing.' },
];

// Helper function to generate random date in the past N days
const randomPastDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 10) + 8); // 8 AM - 6 PM
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
};

// Helper to add minutes to date
const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

// Generate unique external ID
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
    const adviserEmail = user.email || 'adviser@vantage.co.za';

    console.log(`Seeding demo communications for user: ${userId}`);

    // Fetch existing clients for this user
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, surname, email, cell_number, title, preferred_name')
      .eq('user_id', userId)
      .not('email', 'is', null)
      .limit(10);

    if (clientsError) {
      throw new Error(`Failed to fetch clients: ${clientsError.message}`);
    }

    if (!clients || clients.length === 0) {
      console.log('No clients found. Please seed clients first.');
      return new Response(
        JSON.stringify({ success: false, message: 'No clients found. Please run seed-demo-clients first.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${clients.length} clients for seeding communications`);

    // Clear existing demo data
    console.log('Clearing existing communications data...');
    
    // Clear attachments first (due to foreign key constraints)
    await supabase.from('email_attachments').delete().eq('user_id', userId);
    await supabase.from('direct_message_attachments').delete().eq('user_id', userId);
    await supabase.from('emails').delete().eq('user_id', userId);
    await supabase.from('direct_messages').delete().eq('user_id', userId);
    await supabase.from('communications').delete().eq('user_id', userId);

    const emailsToInsert: any[] = [];
    const directMessagesToInsert: any[] = [];
    const communicationsToInsert: any[] = [];

    // Generate data for each client
    for (const client of clients) {
      const clientName = `${client.first_name} ${client.surname}`;
      const clientEmail = client.email || `${client.first_name.toLowerCase()}.${client.surname.toLowerCase()}@email.com`;
      const clientPhone = client.cell_number || '+27 82 000 0000';

      // Generate EMAIL THREADS (3-4 threads per client)
      const numThreads = Math.floor(Math.random() * 2) + 3;
      const usedCategories = new Set<number>();
      
      for (let t = 0; t < numThreads; t++) {
        // Pick unique category for each thread
        let categoryIndex: number;
        do {
          categoryIndex = Math.floor(Math.random() * emailThreads.length);
        } while (usedCategories.has(categoryIndex) && usedCategories.size < emailThreads.length);
        usedCategories.add(categoryIndex);

        const category = emailThreads[categoryIndex];
        const threadTemplate = category.threads[Math.floor(Math.random() * category.threads.length)];
        
        let baseDate = randomPastDate(60);
        const isRead = Math.random() > 0.3; // 70% read

        for (let m = 0; m < threadTemplate.messages.length; m++) {
          const msg = threadTemplate.messages[m];
          const subject = (msg.subjectPrefix || '') + threadTemplate.subject;
          const sentAt = addMinutes(baseDate, m * (Math.floor(Math.random() * 120) + 30)); // 30-150 min between replies
          
          const email = {
            user_id: userId,
            client_id: client.id,
            folder: msg.direction === 'Inbound' ? 'Inbox' : 'Sent',
            direction: msg.direction,
            from_address: msg.direction === 'Inbound' ? clientEmail : adviserEmail,
            to_addresses: msg.direction === 'Inbound' ? [adviserEmail] : [clientEmail],
            cc_addresses: [],
            subject,
            body_preview: typeof msg.bodyPreview === 'function' ? msg.bodyPreview(client) : msg.bodyPreview,
            body_html: typeof msg.bodyHtml === 'function' ? msg.bodyHtml(client) : msg.bodyHtml,
            has_attachments: msg.hasAttachment || false,
            sent_at: sentAt.toISOString(),
            received_at: msg.direction === 'Inbound' ? sentAt.toISOString() : null,
            is_read: isRead || m < threadTemplate.messages.length - 1, // Older messages are read
            status: 'Delivered',
            external_id: generateExternalId(),
          };

          emailsToInsert.push(email);

          // Also add to communications log
          communicationsToInsert.push({
            user_id: userId,
            client_id: client.id,
            channel: 'Email',
            direction: msg.direction,
            from_identifier: email.from_address,
            to_identifier: msg.direction === 'Inbound' ? adviserEmail : clientEmail,
            subject,
            content: email.body_preview,
            sent_at: sentAt.toISOString(),
            status: 'Sent',
          });
        }
      }

      // Generate WHATSAPP CONVERSATIONS (2-4 per client)
      const numWhatsappConvos = Math.floor(Math.random() * 3) + 2;
      const usedWhatsappTopics = new Set<number>();

      for (let w = 0; w < numWhatsappConvos; w++) {
        let topicIndex: number;
        do {
          topicIndex = Math.floor(Math.random() * whatsappConversations.length);
        } while (usedWhatsappTopics.has(topicIndex) && usedWhatsappTopics.size < whatsappConversations.length);
        usedWhatsappTopics.add(topicIndex);

        const convo = whatsappConversations[topicIndex];
        let baseDate = randomPastDate(45);

        for (let m = 0; m < convo.messages.length; m++) {
          const msg = convo.messages[m];
          const sentAt = addMinutes(baseDate, m * (Math.floor(Math.random() * 15) + 2)); // 2-17 min between messages
          
          // Status distribution: older = read, newer = mix
          let status: string;
          if (m < convo.messages.length - 2) {
            status = 'read';
          } else {
            const rand = Math.random();
            status = rand < 0.6 ? 'read' : rand < 0.9 ? 'delivered' : 'sent';
          }

          directMessagesToInsert.push({
            user_id: userId,
            client_id: client.id,
            channel: 'whatsapp',
            direction: msg.direction,
            content: msg.content,
            media_url: msg.mediaUrl || null,
            status,
            sent_at: sentAt.toISOString(),
            external_id: generateExternalId(),
          });

          // Also add to communications log
          communicationsToInsert.push({
            user_id: userId,
            client_id: client.id,
            channel: 'WhatsApp',
            direction: msg.direction === 'inbound' ? 'Inbound' : 'Outbound',
            from_identifier: msg.direction === 'inbound' ? clientPhone : adviserEmail,
            to_identifier: msg.direction === 'inbound' ? adviserEmail : clientPhone,
            subject: null,
            content: msg.content,
            sent_at: sentAt.toISOString(),
            status: 'Sent',
          });
        }
      }

      // Generate SMS MESSAGES (1-3 exchanges per client)
      const numSmsConvos = Math.floor(Math.random() * 3) + 1;
      const usedSmsTopics = new Set<number>();

      for (let s = 0; s < numSmsConvos; s++) {
        let topicIndex: number;
        do {
          topicIndex = Math.floor(Math.random() * smsMessages.length);
        } while (usedSmsTopics.has(topicIndex) && usedSmsTopics.size < smsMessages.length);
        usedSmsTopics.add(topicIndex);

        const convo = smsMessages[topicIndex];
        let baseDate = randomPastDate(30);

        for (let m = 0; m < convo.messages.length; m++) {
          const msg = convo.messages[m];
          const sentAt = addMinutes(baseDate, m * (Math.floor(Math.random() * 30) + 5));

          const status = Math.random() < 0.7 ? 'delivered' : 'sent';

          directMessagesToInsert.push({
            user_id: userId,
            client_id: client.id,
            channel: 'sms',
            direction: msg.direction,
            content: msg.content,
            media_url: null,
            status,
            sent_at: sentAt.toISOString(),
            external_id: generateExternalId(),
          });

          communicationsToInsert.push({
            user_id: userId,
            client_id: client.id,
            channel: 'SMS',
            direction: msg.direction === 'inbound' ? 'Inbound' : 'Outbound',
            from_identifier: msg.direction === 'inbound' ? clientPhone : 'Vantage',
            to_identifier: msg.direction === 'inbound' ? 'Vantage' : clientPhone,
            subject: null,
            content: msg.content,
            sent_at: sentAt.toISOString(),
            status: 'Sent',
          });
        }
      }

      // Generate PUSH NOTIFICATIONS (3-6 per client)
      const numPush = Math.floor(Math.random() * 4) + 3;
      const usedPushIndices = new Set<number>();

      for (let p = 0; p < numPush; p++) {
        let pushIndex: number;
        do {
          pushIndex = Math.floor(Math.random() * pushNotifications.length);
        } while (usedPushIndices.has(pushIndex) && usedPushIndices.size < pushNotifications.length);
        usedPushIndices.add(pushIndex);

        const push = pushNotifications[pushIndex];
        const sentAt = randomPastDate(30);
        const status = Math.random() < 0.8 ? 'read' : 'delivered';

        directMessagesToInsert.push({
          user_id: userId,
          client_id: client.id,
          channel: 'push',
          direction: 'outbound',
          content: push.content,
          media_url: null,
          status,
          sent_at: sentAt.toISOString(),
          external_id: generateExternalId(),
        });

        communicationsToInsert.push({
          user_id: userId,
          client_id: client.id,
          channel: 'Push',
          direction: 'Outbound',
          from_identifier: 'System',
          to_identifier: clientName,
          subject: null,
          content: push.content,
          sent_at: sentAt.toISOString(),
          status: 'Sent',
        });
      }
    }

    // Insert all data
    console.log(`Inserting ${emailsToInsert.length} emails...`);
    const { data: insertedEmails, error: emailsError } = await supabase
      .from('emails')
      .insert(emailsToInsert)
      .select('id, subject, has_attachments');
    
    if (emailsError) {
      console.error('Error inserting emails:', emailsError);
      throw emailsError;
    }

    // Create attachments for emails that have has_attachments = true
    const attachmentMap: Record<string, { fileName: string; filePath: string; fileSize: number }> = {
      'Portfolio': { fileName: 'Portfolio_Report_Q4_2024.pdf', filePath: '/downloads/Portfolio_Report_Q4_2024.pdf', fileSize: 245000 },
      'Tax Certificate': { fileName: 'Tax_Certificate_2024.pdf', filePath: '/downloads/Tax_Certificate_2024.pdf', fileSize: 89000 },
      'FICA': { fileName: 'FICA_Documents.pdf', filePath: '/downloads/FICA_Documents.pdf', fileSize: 156000 },
      'Financial Plan': { fileName: 'Financial_Plan_2025.pdf', filePath: '/downloads/Financial_Plan_2025.pdf', fileSize: 320000 },
      'Policy': { fileName: 'Policy_Schedule.pdf', filePath: '/downloads/Policy_Schedule.pdf', fileSize: 178000 },
      'Statement': { fileName: 'Statement_Jan_2025.pdf', filePath: '/downloads/Statement_Jan_2025.pdf', fileSize: 95000 },
      'investment goals': { fileName: 'Investment_Goals_Analysis.pdf', filePath: '/downloads/Financial_Plan_2025.pdf', fileSize: 210000 },
      'retirement annuity': { fileName: 'Regulatory_Changes_Summary.pdf', filePath: '/downloads/Policy_Schedule.pdf', fileSize: 145000 },
    };

    const emailAttachmentsToInsert: any[] = [];
    
    if (insertedEmails) {
      for (const email of insertedEmails) {
        if (email.has_attachments && email.subject) {
          // Find matching attachment based on subject keywords
          for (const [keyword, attachment] of Object.entries(attachmentMap)) {
            if (email.subject.toLowerCase().includes(keyword.toLowerCase())) {
              emailAttachmentsToInsert.push({
                email_id: email.id,
                user_id: userId,
                file_name: attachment.fileName,
                file_path: attachment.filePath,
                file_size: attachment.fileSize,
                content_type: 'application/pdf',
              });
              break; // Only one attachment per email
            }
          }
        }
      }
    }

    if (emailAttachmentsToInsert.length > 0) {
      console.log(`Inserting ${emailAttachmentsToInsert.length} email attachments...`);
      const { error: attachError } = await supabase.from('email_attachments').insert(emailAttachmentsToInsert);
      if (attachError) {
        console.error('Error inserting email attachments:', attachError);
        // Don't throw - continue with other data
      }
    }

    console.log(`Inserting ${directMessagesToInsert.length} direct messages...`);
    const { error: dmError } = await supabase.from('direct_messages').insert(directMessagesToInsert);
    if (dmError) {
      console.error('Error inserting direct messages:', dmError);
      throw dmError;
    }

    console.log(`Inserting ${communicationsToInsert.length} communications log entries...`);
    const { error: commError } = await supabase.from('communications').insert(communicationsToInsert);
    if (commError) {
      console.error('Error inserting communications:', commError);
      throw commError;
    }

    const summary = {
      success: true,
      message: 'Demo communications seeded successfully',
      counts: {
        emails: emailsToInsert.length,
        emailAttachments: emailAttachmentsToInsert.length,
        directMessages: directMessagesToInsert.length,
        communications: communicationsToInsert.length,
        clientsProcessed: clients.length,
      },
    };

    console.log('Seeding complete:', summary);

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
