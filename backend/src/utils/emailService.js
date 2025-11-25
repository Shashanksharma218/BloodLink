require('dotenv').config();
const { Resend } = require('resend');

// Initialize Resend client
if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY missing in .env');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendDonationCompletionEmail = async (donorEmail, donorName, certificateBuffer) => {
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️  RESEND_API_KEY not configured. Skipping email notification.');
    console.log('Please set up RESEND_API_KEY in backend/.env file');
    return false;
  }

  // Convert PDF buffer to base64 for Resend attachment
  const pdfBase64 = certificateBuffer.toString('base64');

  try {
    const response = await resend.emails.send({
      from: 'BloodLink <onboarding@resend.dev>', // Update this with your verified domain
      to: donorEmail,
      subject: '🎉 Thank You! Your Blood Donation is Complete - BloodLink',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            background: linear-gradient(135deg, #6B1F1F 0%, #8B2E2E 100%);
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            margin: -30px -30px 30px -30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .content {
            text-align: center;
          }
          .message {
            background-color: #fef0f0;
            border-left: 4px solid #6B1F1F;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .highlight {
            color: #6B1F1F;
            font-weight: bold;
            font-size: 20px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .emoji {
            font-size: 48px;
            margin-bottom: 20px;
          }
          .certificate-notice {
            background-color: #e8f5e9;
            border: 1px solid #4caf50;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🩸 BloodLink Una</h1>
          </div>
          
          <div class="content">
            <div class="emoji">🎉</div>
            <h2 style="color: #6B1F1F; margin-bottom: 20px;">Dear ${donorName},</h2>
            
            <div class="message">
              <p style="margin: 0; font-size: 16px;">
                We <strong>heartfelt thank you</strong> for your noble act of blood donation. 
                Your contribution helps save lives and makes a real difference in our community.
              </p>
            </div>

            <p style="font-size: 15px; line-height: 1.8;">
              We are delighted that you have successfully completed your blood donation. Your generosity 
              and dedication serve as an inspiration to our community.
            </p>

            <div class="certificate-notice">
              <strong>📄 Blood Donation Certificate:</strong><br>
              Your blood donation certificate is attached to this email. Please download and 
              keep it safe for your records.
            </div>

            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <strong>💝 Benefit:</strong><br>
              <p style="margin: 5px 0;">
                <strong>FREE BLOOD (1 unit) for one year</strong> - 
                This benefit is available to you and your immediate family members.
              </p>
            </div>

            <p style="color: #555; font-size: 14px;">
              Thank you once again for your selfless contribution.<br>
              <strong style="color: #6B1F1F;">BloodLink Una Team</strong><br>
              Government Hospital, Una, Himachal Pradesh
            </p>
          </div>

          <div class="footer">
            <p style="margin: 5px 0;">
              🌟 <em>Connecting Hearts • Saving Lives</em> 🌟
            </p>
            <p style="margin: 5px 0; font-size: 11px;">
              This is an automated email, please do not reply.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
      attachments: [
        {
          filename: `BloodDonationCertificate_${donorName}.pdf`,
          content: pdfBase64
        }
      ]
    });

    console.log(`✅ Email successfully sent to ${donorEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendDonationCompletionEmail
};

