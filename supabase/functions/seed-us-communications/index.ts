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

// ─── US-specific email templates ─────────────────────────────────────────────

const usConfig = {
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
};

function generateEmailBody(
  client: Client,
  subject: string,
  category: string,
  direction: string,
  advisorName: string
): { bodyHtml: string; bodyPreview: string } {
  const clientName = `${client.title || ''} ${client.surname}`.trim();
  const firstName = client.first_name;
  const value = `$${(Math.random() * 500000 + 50000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

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

  const bodies = [
    { html: `<p>Dear ${clientName},</p><p>Please find attached the latest information regarding ${subject.toLowerCase()}.</p><p>Your current portfolio value stands at ${value}, reflecting strong performance over the period.</p><p>Please don't hesitate to reach out if you have any questions.</p><p>Kind regards,<br><strong>${advisorName}</strong><br>Financial Adviser | ${usConfig.firmName}</p>`, preview: `Dear ${clientName}, Please find attached the latest information regarding ${subject.toLowerCase()}...` },
    { html: `<p>Dear ${clientName},</p><p>I'm writing to follow up on our recent discussion about your financial planning.</p><p>I've prepared some recommendations which I believe will help optimize your portfolio. I'd like to schedule a meeting to review these with you.</p><p>Warm regards,<br><strong>${advisorName}</strong><br>Financial Adviser | ${usConfig.firmName}</p>`, preview: `Dear ${clientName}, I'm writing to follow up on our recent discussion about your financial planning...` },
    { html: `<p>Dear ${clientName},</p><p>This is to confirm that your request has been processed successfully.</p><p>The changes will take effect within 3-5 business days. You will receive a confirmation once complete.</p><p>Best regards,<br><strong>${advisorName}</strong><br>Financial Adviser | ${usConfig.firmName}</p>`, preview: `Dear ${clientName}, This is to confirm that your request has been processed successfully...` },
    { html: `<p>Dear ${clientName},</p><p>Thank you for meeting with me. As discussed, I've prepared the following action items:</p><ul><li>Review current asset allocation</li><li>Update beneficiary nominations</li><li>Schedule next quarterly review</li></ul><p>Kind regards,<br><strong>${advisorName}</strong><br>Financial Adviser | ${usConfig.firmName}</p>`, preview: `Dear ${clientName}, Thank you for meeting with me. As discussed, I've prepared the following action items...` },
  ];
  const body = bodies[Math.floor(Math.random() * bodies.length)];
  return { bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px;">${body.html}</div>`, bodyPreview: body.preview };
}

const folderConfigs = [
  { folder: 'Inbox', direction: 'Inbound', count: 18 },
  { folder: 'Task Pool', direction: 'Inbound', count: 15 },
  { folder: 'Sent', direction: 'Outbound', count: 18 },
  { folder: 'Draft', direction: 'Outbound', count: 15 },
  { folder: 'Queue', direction: 'Outbound', count: 15 },
  { folder: 'Failed', direction: 'Outbound', count: 15 },
  { folder: 'Archived', direction: 'Mixed', count: 18 },
];

const whatsappConversations = [
  {
    topic: 'portfolio_query',
    messages: [
      { direction: 'inbound', content: 'Hi, I saw the market dropped yesterday. Should I be worried about my 401(k)?' },
      { direction: 'outbound', content: 'Good morning! 👋 No need to worry - these fluctuations are normal. Your portfolio is well-diversified. Would you like me to send you a quick summary?' },
      { direction: 'inbound', content: 'Yes please, that would help put my mind at ease' },
      { direction: 'outbound', content: 'Here\'s your current position. Your long-term performance remains solid at 11.8% p.a. 📈' },
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
      { direction: 'outbound', content: 'Hi! 📅 Just confirming our meeting tomorrow at 10:00 AM EST for your annual review. I\'ll have your updated financial plan ready.' },
      { direction: 'inbound', content: 'Perfect, see you then! Can we also discuss Roth conversions?' },
      { direction: 'outbound', content: 'Absolutely! I\'ll prepare some options for you. See you tomorrow! 👍' },
    ],
  },
  {
    topic: 'payment_query',
    messages: [
      { direction: 'inbound', content: 'Hi, I noticed my auto-contribution didn\'t go through this month. Is everything okay?' },
      { direction: 'outbound', content: 'Good afternoon! Let me check that for you quickly... 🔍' },
      { direction: 'outbound', content: 'I see the issue - there was a bank holiday delay. The contribution will process tomorrow. Nothing to worry about! ✅' },
      { direction: 'inbound', content: 'Thanks for checking! That\'s a relief.' },
      { direction: 'outbound', content: 'Anytime! Let me know if you have any other questions. 😊' },
    ],
  },
  {
    topic: 'investment_advice',
    messages: [
      { direction: 'inbound', content: 'I got a bonus this quarter. Should I max out my 401(k) or contribute to a Roth IRA?' },
      { direction: 'outbound', content: 'Congratulations on the bonus! 🎉 Great question. How much are you thinking of investing?' },
      { direction: 'inbound', content: 'About $15,000' },
      { direction: 'outbound', content: 'I\'d suggest maxing out your 401(k) match first, then funding your Roth IRA up to the $7,000 limit, and the rest into a taxable brokerage. Want me to prepare a formal proposal?' },
      { direction: 'inbound', content: 'Yes please, that sounds like great advice!' },
      { direction: 'outbound', content: 'Perfect! I\'ll email you a detailed proposal by end of day. 📧' },
    ],
  },
  {
    topic: 'claim_update',
    messages: [
      { direction: 'outbound', content: 'Good news! 🎉 Your disability claim has been approved. Payment will reflect in 3-5 business days.' },
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

const smsMessages = [
  {
    topic: 'meeting_reminder',
    messages: [
      { direction: 'outbound', content: 'Reminder: Your financial review is scheduled for tomorrow at 10:00 AM. See you then! - Vantage Financial US' },
      { direction: 'inbound', content: 'Thanks! See you tomorrow.' },
    ],
  },
  {
    topic: 'payment_confirmation',
    messages: [
      { direction: 'outbound', content: 'Your 401(k) contribution has been received. Thank you! - Vantage Financial US' },
    ],
  },
  {
    topic: 'document_ready',
    messages: [
      { direction: 'outbound', content: 'Your 1099 tax form is ready. Please check your email or client portal. - Vantage Financial US' },
      { direction: 'inbound', content: 'Got it, thanks!' },
    ],
  },
  {
    topic: 'urgent_callback',
    messages: [
      { direction: 'inbound', content: 'Please call me when you can. Need to discuss my IRA rollover.' },
      { direction: 'outbound', content: 'Will call you in 10 minutes.' },
    ],
  },
  {
    topic: 'otp_delivery',
    messages: [
      { direction: 'outbound', content: 'Your Vantage OTP is 384719. Valid for 5 minutes. Do not share this code.' },
    ],
  },
];

const pushNotifications = [
  { content: 'Market update: S&P 500 gained 1.2% today. Your portfolio value increased.' },
  { content: 'Your 1099 tax form is ready to download in your client portal.' },
  { content: 'Reminder: Annual review meeting tomorrow at 2:00 PM EST.' },
  { content: '401(k) contribution received. Thank you!' },
  { content: 'Happy Birthday from the Vantage team! 🎂' },
  { content: 'New statement available: View your latest portfolio summary.' },
  { content: 'Compliance reminder: Your documents expire in 30 days. Please update.' },
  { content: 'Market alert: Significant S&P 500 movement detected. No action required.' },
  { content: 'Thank you for attending today\'s meeting. Summary emailed.' },
  { content: 'Your disability claim has been approved! Payment processing.' },
];

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
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const targetEmail = 'nico@advizorstack.com';

    // Look up user by email
    console.log(`Looking up user: ${targetEmail}`);
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw new Error(`Failed to list users: ${listError.message}`);

    const targetUser = usersData?.users?.find((u: any) => u.email === targetEmail);
    if (!targetUser) throw new Error(`User ${targetEmail} not found. Please run create-restricted-user first.`);

    const userId = targetUser.id;
    const adviserEmail = targetEmail;

    console.log(`Found user ${targetEmail} with id ${userId}`);

    // Fetch US clients only
    const { data: usClients, error: clientsError } = await supabase
      .from('clients')
      .select('id, first_name, surname, email, cell_number, title, preferred_name, country_of_issue, advisor')
      .eq('user_id', userId)
      .eq('country_of_issue', 'United States');

    if (clientsError) throw new Error(`Failed to fetch clients: ${clientsError.message}`);

    if (!usClients || usClients.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No US clients found for this user.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${usClients.length} US clients`);

    // Clear existing data for this user
    console.log('Clearing existing communications data for this user...');
    await supabase.from('email_attachments').delete().eq('user_id', userId);
    await supabase.from('direct_message_attachments').delete().eq('user_id', userId);
    await supabase.from('email_clients').delete().eq('user_id', userId);
    await supabase.from('emails').delete().eq('user_id', userId);
    await supabase.from('direct_messages').delete().eq('user_id', userId);
    await supabase.from('communications').delete().eq('user_id', userId);

    const emailsToInsert: any[] = [];
    const directMessagesToInsert: any[] = [];
    const communicationsToInsert: any[] = [];

    // Generate emails for each folder
    console.log('Generating US emails...');
    for (const folderConfig of folderConfigs) {
      for (let i = 0; i < folderConfig.count; i++) {
        const client = usClients[i % usClients.length];
        const clientEmail = client.email || `${client.first_name.toLowerCase()}.${client.surname.toLowerCase()}@email.com`;
        const subjectEntry = usConfig.subjects[i % usConfig.subjects.length];
        const advisorName = usConfig.advisors[i % usConfig.advisors.length];

        let direction: string;
        if (folderConfig.direction === 'Mixed') {
          direction = Math.random() > 0.5 ? 'Inbound' : 'Outbound';
        } else {
          direction = folderConfig.direction;
        }

        const sentAt = randomPastDate(180);
        const isRead = folderConfig.folder === 'Sent' || folderConfig.folder === 'Archived' || Math.random() > 0.3;
        const hasAttachment = ['portfolio', 'tax', 'review', 'onboarding'].includes(subjectEntry.category) && Math.random() > 0.4;

        const { bodyHtml, bodyPreview } = generateEmailBody(client, subjectEntry.subject, subjectEntry.category, direction, advisorName);

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

    // Generate WhatsApp, SMS, Push for subset of clients (up to 10)
    const msgClients = usClients.slice(0, Math.min(10, usClients.length));

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
            from_identifier: msg.direction === 'inbound' ? clientPhone : 'Vantage Financial US',
            to_identifier: msg.direction === 'inbound' ? 'Vantage Financial US' : clientPhone,
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

    // Insert all data in batches
    const batchSize = 200;

    console.log(`Inserting ${emailsToInsert.length} emails...`);
    const allInsertedEmails: any[] = [];
    for (let i = 0; i < emailsToInsert.length; i += batchSize) {
      const batch = emailsToInsert.slice(i, i + batchSize);
      const { data: inserted, error: emailsError } = await supabase
        .from('emails')
        .insert(batch)
        .select('id, subject, has_attachments, client_id');

      if (emailsError) {
        console.error(`Error inserting email batch ${i}:`, emailsError);
        throw emailsError;
      }
      if (inserted) allInsertedEmails.push(...inserted);
    }

    // Create email_clients linkage
    const emailClientsToInsert = allInsertedEmails
      .filter(e => e.client_id)
      .map(e => ({
        user_id: userId,
        email_id: e.id,
        client_id: e.client_id,
      }));

    if (emailClientsToInsert.length > 0) {
      console.log(`Inserting ${emailClientsToInsert.length} email_clients linkages...`);
      for (let i = 0; i < emailClientsToInsert.length; i += batchSize) {
        const batch = emailClientsToInsert.slice(i, i + batchSize);
        const { error: ecError } = await supabase.from('email_clients').insert(batch);
        if (ecError) console.error('Error inserting email_clients batch:', ecError);
      }
    }

    // Create email attachments
    const attachmentMap: Record<string, { fileName: string; filePath: string; fileSize: number }> = {
      'Portfolio': { fileName: 'Portfolio_Report.pdf', filePath: '/downloads/Portfolio_Report.pdf', fileSize: 245000 },
      'Tax': { fileName: 'Tax_Documents.pdf', filePath: '/downloads/Tax_Documents.pdf', fileSize: 89000 },
      '401': { fileName: '401k_Statement.pdf', filePath: '/downloads/401k_Statement.pdf', fileSize: 160000 },
      'Review': { fileName: 'Financial_Review.pdf', filePath: '/downloads/Financial_Review.pdf', fileSize: 320000 },
      'Welcome': { fileName: 'Welcome_Pack.pdf', filePath: '/downloads/Welcome_Pack.pdf', fileSize: 178000 },
      'Statement': { fileName: 'Account_Statement.pdf', filePath: '/downloads/Account_Statement.pdf', fileSize: 95000 },
      'Performance': { fileName: 'Performance_Report.pdf', filePath: '/downloads/Performance_Report.pdf', fileSize: 210000 },
      'IRA': { fileName: 'IRA_Analysis.pdf', filePath: '/downloads/IRA_Analysis.pdf', fileSize: 140000 },
      'HSA': { fileName: 'HSA_Strategy.pdf', filePath: '/downloads/HSA_Strategy.pdf', fileSize: 125000 },
      'Roth': { fileName: 'Roth_Conversion_Summary.pdf', filePath: '/downloads/Roth_Conversion.pdf', fileSize: 110000 },
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
      for (let i = 0; i < emailAttachmentsToInsert.length; i += batchSize) {
        const batch = emailAttachmentsToInsert.slice(i, i + batchSize);
        const { error: attachError } = await supabase.from('email_attachments').insert(batch);
        if (attachError) console.error('Error inserting email attachments:', attachError);
      }
    }

    console.log(`Inserting ${directMessagesToInsert.length} direct messages...`);
    for (let i = 0; i < directMessagesToInsert.length; i += batchSize) {
      const batch = directMessagesToInsert.slice(i, i + batchSize);
      const { error: dmError } = await supabase.from('direct_messages').insert(batch);
      if (dmError) { console.error('Error inserting DMs batch:', dmError); throw dmError; }
    }

    console.log(`Inserting ${communicationsToInsert.length} communications log entries...`);
    for (let i = 0; i < communicationsToInsert.length; i += batchSize) {
      const batch = communicationsToInsert.slice(i, i + batchSize);
      const { error: commError } = await supabase.from('communications').insert(batch);
      if (commError) { console.error('Error inserting comms batch:', commError); throw commError; }
    }

    const summary = {
      success: true,
      user_email: targetEmail,
      user_id: userId,
      us_clients: usClients.length,
      emails_created: emailsToInsert.length,
      email_attachments_created: emailAttachmentsToInsert.length,
      email_clients_linked: emailClientsToInsert.length,
      direct_messages_created: directMessagesToInsert.length,
      communications_log_entries: communicationsToInsert.length,
      folders: folderConfigs.map(f => ({ folder: f.folder, count: f.count })),
    };

    console.log('Seeding complete!', JSON.stringify(summary));

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in seed-us-communications:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
