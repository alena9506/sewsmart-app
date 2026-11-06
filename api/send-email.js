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

  let subject = 'ALiCo Dublin - Order Update';
  let htmlContent = `<p>Hello ${toName || 'Valued Customer'},</p><p>Your order has been updated successfully.</p>`;

  // 1. Order Creation Confirmation Template
  if (templateId === '3vz9dle67m7gkj50') {
    subject = `ALiCo Dublin - Order Confirmation #${variables?.order_id || ''}`;
    htmlContent = `
      <div style="background-color: #f8fafc; padding: 30px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <div style="background: #ffffff; color: #0f172a; padding: 30px 24px 20px 24px; text-align: center; border-bottom: 2px solid #f1f5f9;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a;">ALiCo DUBLIN</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Alterations & Laundry Service</p>
          </div>
          <div style="padding: 32px 24px; color: #334155;">
            <p style="margin-top: 0; font-size: 15px; font-weight: 600; color: #0f172a;">Hi ${variables?.customer_name || toName},</p>
            <p style="font-size: 14px; line-height: 1.5; color: #475569;">Thank you for choosing ALiCo Dublin! Your digital claim check has been successfully created.</p>
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
              <div style="text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 14px; margin-bottom: 14px;">
                <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block; margin-bottom: 4px;">Ticket / Tag Number</span>
                <span style="font-size: 28px; font-weight: 900; color: #0f172a; font-family: monospace; background: #ffffff; padding: 4px 16px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;">#${variables?.order_id || ''}</span>
              </div>
              <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 500;">Service Type:</td><td style="padding: 6px 0; text-align: right; font-weight: 700; text-transform: uppercase; color: #0f172a;">${variables?.service_type || ''}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 500;">Total Paid:</td><td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0d9488;">€${variables?.total || ''} (${variables?.payment_method || ''})</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 500;">Target Ready Date:</td><td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a;">${variables?.due_date || ''}</td></tr>
              </table>
            </div>
            <p style="font-size: 13px; line-height: 1.5; color: #475569; text-align: center; margin-bottom: 0;">You can show this email or your tag number when picking up your garments. We look forward to seeing you!</p>
          </div>
          <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            <p style="margin: 0;">ALiCo Dublin Counter • Keep this receipt for collection</p>
          </div>
        </div>
      </div>`;
  } 
  // 2. Order Ready for Collection Template
  else if (templateId === '3yxj6lijv9qldo2r') {
    subject = `ALiCo Dublin - Order #${variables?.order_id || ''} Ready for Collection!`;
    htmlContent = `
      <div style="background-color: #f8fafc; padding: 30px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <div style="background: #ffffff; color: #0f172a; padding: 30px 24px 20px 24px; text-align: center; border-bottom: 2px solid #f1f5f9;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a;">ALiCo DUBLIN</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Alterations & Laundry Service</p>
          </div>
          <div style="padding: 32px 24px; color: #334155;">
            <p style="margin-top: 0; font-size: 15px; font-weight: 600; color: #0f172a;">Hi ${variables?.customer_name || toName},</p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0; text-align: center;">
              <span style="font-size: 14px; font-weight: 800; color: #15803d; display: block;">✨ Great News! Your order is ready for collection.</span>
            </div>
            <p style="font-size: 14px; line-height: 1.5; color: #475569;">Your garments have been completed and are ready to be picked up at our counter.</p>
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
              <div style="text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 14px; margin-bottom: 14px;">
                <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block; margin-bottom: 4px;">Ticket / Tag Number</span>
                <span style="font-size: 28px; font-weight: 900; color: #0f172a; font-family: monospace; background: #ffffff; padding: 4px 16px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;">#${variables?.order_id || ''}</span>
              </div>
            </div>
            <p style="font-size: 13px; line-height: 1.5; color: #475569; text-align: center; margin-bottom: 0;">Please show this email or your tag number when you arrive to collect your items. We look forward to seeing you!</p>
          </div>
          <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            <p style="margin: 0;">ALiCo Dublin Counter • Professional Tailoring & Laundry</p>
          </div>
        </div>
      </div>`;
  } 
  // 3. Payslip Statement Template
  else if (templateId === '3yxj6lijv50ldo2r') {
    subject = `ALiCo Dublin - Payslip Statement (${variables?.pay_date || ''})`;
    htmlContent = `
      <div style="background-color: #f8fafc; padding: 30px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <div style="background: #0f172a; color: #ffffff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">ALiCo DUBLIN</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Statement of Earnings (Payslip)</p>
          </div>
          <div style="padding: 32px 24px; color: #334155;">
            <p style="margin-top: 0; font-size: 15px; font-weight: 600;">Hi ${variables?.employee_name || toName},</p>
            <p style="font-size: 14px; line-height: 1.5; color: #475569;">Here is your official payroll statement and tax breakdown for the recent pay period.</p>
            <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
              <div style="text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 14px; margin-bottom: 14px;">
                <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block; margin-bottom: 4px;">Pay Date</span>
                <span style="font-size: 18px; font-weight: 800; color: #0f172a; font-family: monospace; background: #ffffff; padding: 4px 16px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;">${variables?.pay_date || ''}</span>
              </div>
              <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 500;">PPSN:</td><td style="padding: 6px 0; text-align: right; font-weight: 700; font-family: monospace;">${variables?.ppsn || ''}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 500;">Hours Worked:</td><td style="padding: 6px 0; text-align: right; font-weight: 700;">${variables?.hours_worked || ''} hrs (@ €${variables?.hourly_rate || ''}/hr)</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 500;">Gross Pay:</td><td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a;">€${variables?.gross_pay || ''}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 500;">PAYE (Tax):</td><td style="padding: 6px 0; text-align: right; font-weight: 700; color: #dc2626;">-€${variables?.paye || ''}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 500;">PRSI:</td><td style="padding: 6px 0; text-align: right; font-weight: 700; color: #dc2626;">-€${variables?.prsi || ''}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b; font-weight: 500;">USC:</td><td style="padding: 6px 0; text-align: right; font-weight: 700; color: #dc2626;">-€${variables?.usc || ''}</td></tr>
                <tr><td style="padding: 10px 0 0 0; border-top: 1px solid #cbd5e1; color: #0f172a; font-weight: 700;">Net Take-Home Pay:</td><td style="padding: 10px 0 0 0; border-top: 1px solid #cbd5e1; text-align: right; font-weight: 900; color: #0d9488; font-size: 15px;">€${variables?.net_pay || ''}</td></tr>
              </table>
            </div>
            <p style="font-size: 12px; line-height: 1.5; color: #64748b; text-align: center; margin-bottom: 0;">This is an electronically generated statement of earnings from ALiCo Dublin.</p>
          </div>
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
