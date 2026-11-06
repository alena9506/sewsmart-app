export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail, toName, templateId, variables } = req.body;

  if (!toEmail) {
    return res.status(400).json({ error: 'Missing required field: toEmail' });
  }

  const API_KEY = 'mlsn.4d7a02a6f2412d7a463619372d556abd47e1072beca9d992e31e5fffa7b53fac';

  // Build dynamic content based on which action triggered the email
  let subject = 'ALiCo Dublin - Order Update';
  let htmlContent = `<p>Hello ${toName || 'Valued Customer'},</p><p>Thank you for choosing ALiCo Dublin! Your order has been updated successfully.</p>`;

  if (templateId === '3vz9dle67m7gkj50') {
    subject = 'ALiCo Dublin - Order Confirmation';
    htmlContent = `<p>Dear ${toName},</p><p>Your order <strong>#${variables?.order_id || ''}</strong> has been successfully created.</p><p><b>Service:</b> ${variables?.service_type || ''}<br><b>Total:</b> €${variables?.total || ''}<br><b>Ready Date:</b> ${variables?.due_date || ''}</p><p>Thank you for your business!</p>`;
  } else if (templateId === '3yxj6lijv9qldo2r') {
    subject = 'ALiCo Dublin - Order Ready for Collection!';
    htmlContent = `<p>Dear ${toName},</p><p>Great news! Your tailoring/laundry order <strong>#${variables?.order_id || ''}</strong> is now <strong>completed</strong> and ready for collection at our Dublin shop.</p><p>We look forward to seeing you!</p>`;
  } else if (templateId === '3yxj6lijv50ldo2r') {
    subject = 'ALiCo Dublin - Payslip Statement';
    htmlContent = `<p>Dear ${toName},</p><p>Your weekly payslip statement for <strong>${variables?.pay_date || ''}</strong> has been processed.</p><p><b>Gross Pay:</b> €${variables?.gross_pay || ''}<br><b>Net Pay:</b> €${variables?.net_pay || ''}</p>`;
  }

  const payload = {
    from: {
      email: 'info@trial-z86org89z1pger13.mlsender.net',
      name: 'ALiCo Dublin'
    },
    to: [
      {
        email: toEmail,
        name: toName || 'Valued Customer / Employee'
      }
    ],
    subject: subject,
    html: htmlContent,
    text: htmlContent.replace(/<[^>]*>?/gm, '') // Plain text fallback
  };

  try {
    const mailerSendResponse = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!mailerSendResponse.ok) {
      const errorText = await mailerSendResponse.text();
      console.error('MailerSend API error:', errorText);
      return res.status(500).json({ error: 'Failed to send email via MailerSend', details: errorText });
    }

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error('Serverless function error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
