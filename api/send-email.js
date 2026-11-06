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

  // Map your alphanumeric IDs to your MailerSend NUMERIC template IDs
  let numericTemplateId;
  let defaultSubject = 'ALiCo Dublin - Order Update';

  if (templateId === '3vz9dle67m7gkj50') {
    numericTemplateId = 1; // Replace with your numeric ID for Order Confirmation
    defaultSubject = 'ALiCo Dublin - Order Confirmation';
  } else if (templateId === '3yxj6lijv9qldo2r') {
    numericTemplateId = 2; // Replace with your numeric ID for Ready for Collection
    defaultSubject = 'ALiCo Dublin - Order Ready for Collection!';
  } else if (templateId === '3yxj6lijv50ldo2r') {
    numericTemplateId = 3; // Replace with your numeric ID for Payslip
    defaultSubject = 'ALiCo Dublin - Payslip Statement';
  } else {
    numericTemplateId = Number(templateId) || 1;
  }

  const payload = {
    from: {
      email: 'info@test-69oxl5envwdl785k.mlsender.net',
      name: 'ALiCo Dublin'
    },
    to: [
      {
        email: toEmail,
        name: toName || 'Valued Customer / Employee'
      }
    ],
    subject: defaultSubject, // Required by MailerSend API when personalizations are used
    template_id: numericTemplateId,
    variables: [
      {
        email: toEmail,
        substitutions: variables || {}
      }
    ]
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

    return res.status(200).json({ success: true, message: 'Email sent successfully via MailerSend template' });
  } catch (err) {
    console.error('Serverless function error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
