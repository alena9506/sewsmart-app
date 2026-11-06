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

  // Build clean, professional HTML matching your templates
  let subject = 'ALiCo Dublin - Order Update';
  let htmlContent = `<div style="font-family:sans-serif;padding:20px;color:#333;"><h2>ALiCo Dublin</h2><p>Hello ${toName || 'Valued Customer'},</p><p>Your order has been updated successfully.</p></div>`;

  if (templateId === '3vz9dle67m7gkj50') {
    subject = `ALiCo Dublin - Order Confirmation #${variables?.order_id || ''}`;
    htmlContent = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eaeaea;border-radius:10px;">
        <h2 style="color:#0d9488;">ALiCo Dublin</h2>
        <p>Hi <strong>${toName}</strong>,</p>
        <p>Thank you for choosing ALiCo Dublin! Your digital claim check has been successfully created.</p>
        <div style="background:#f8fafc;padding:15px;border-radius:8px;margin:15px 0;">
          <p style="margin:5px 0;"><strong>Ticket / Tag Number:</strong> #${variables?.order_id || ''}</p>
          <p style="margin:5px 0;"><strong>Service Type:</strong> ${variables?.service_type || ''}</p>
          <p style="margin:5px 0;"><strong>Total Paid:</strong> €${variables?.total || ''} (${variables?.payment_method || ''})</p>
          <p style="margin:5px 0;"><strong>Target Ready Date:</strong> ${variables?.due_date || ''}</p>
        </div>
        <p style="font-size:12px;color:#666;">You can show this email or your tag number when picking up your garments.</p>
      </div>`;
  } else if (templateId === '3yxj6lijv9qldo2r') {
    subject = `ALiCo Dublin - Order #${variables?.order_id || ''} Ready for Collection!`;
    htmlContent = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eaeaea;border-radius:10px;">
        <h2 style="color:#0d9488;">ALiCo Dublin</h2>
        <p>Hi <strong>${toName}</strong>,</p>
        <div style="background:#ecfdf5;color:#065f46;padding:15px;border-radius:8px;margin:15px 0;font-weight:bold;">
          ✨ Great News! Your order is ready for collection.
        </div>
        <p>Your garments for order <strong>#${variables?.order_id || ''}</strong> have been completed and are ready to be picked up at our counter.</p>
        <p>We look forward to seeing you!</p>
      </div>`;
  } else if (templateId === '3yxj6lijv50ldo2r') {
    subject = `ALiCo Dublin - Payslip Statement (${variables?.pay_date || ''})`;
    htmlContent = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eaeaea;border-radius:10px;">
        <h2 style="color:#0d9488;">ALiCo Dublin</h2>
        <p>Hi <strong>${toName}</strong>,</p>
        <p>Here is your official payroll statement and tax breakdown for the recent pay period (${variables?.pay_date || ''}).</p>
        <div style="background:#f8fafc;padding:15px;border-radius:8px;margin:15px 0;font-size:13px;">
          <p><strong>PPSN:</strong> ${variables?.ppsn || ''}</p>
          <p><strong>Hours Worked:</strong> ${variables?.hours_worked || ''} hrs (@ €${variables?.hourly_rate || ''}/hr)</p>
          <p><strong>Gross Pay:</strong> €${variables?.gross_pay || ''}</p>
          <p><strong>PAYE:</strong> -€${variables?.paye || ''}</p>
          <p><strong>PRSI:</strong> -€${variables?.prsi || ''}</p>
          <p><strong>USC:</strong> -€${variables?.usc || ''}</p>
          <p style="font-size:15px;color:#0d9488;margin-top:10px;"><strong>Net Take-Home Pay: €${variables?.net_pay || ''}</strong></p>
        </div>
      </div>`;
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
    subject: subject,
    html: htmlContent,
    text: htmlContent.replace(/<[^>]*>?/gm, '')
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
