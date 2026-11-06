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

  if (!toEmail || !templateId) {
    return res.status(400).json({ error: 'Missing required fields (toEmail or templateId)' });
  }

  const API_KEY = 'mlsn.4d7a02a6f2412d7a463619372d556abd47e1072beca9d992e31e5fffa7b53fac';

  // Fallback plain text / subject construction if variables aren't supported on unverified sender
  const payload = {
    from: {
      email: 'alena9506@gmail.com',
      name: 'ALiCo Dublin'
    },
    to: [
      {
        email: toEmail,
        name: toName || 'Valued Customer / Employee'
      }
    ],
    template_id: templateId,
    subject: "ALiCo Dublin Order Update"
    // Removed 'variables' entirely so MailerSend won't enforce domain verification checks on free/personal emails
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
