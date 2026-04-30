const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends OTP verification email to the user.
 * @param {string} email - Recipient email
 * @param {string} otp   - 6-digit OTP code
 * @param {string} name  - Recipient first name
 */
const sendOTPEmail = async (email, otp, name) => {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: email,
    subject: `${otp} is your TANNMP verification code`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TANNMP OTP Verification</title>
      </head>
      <body style="margin:0;padding:0;background:#F5F5F5;font-family:'Inter',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#C8102E,#8B0000);padding:36px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:2px;">TANNMP</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Tamil Nadu Naidu NMP Portal</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 8px;color:#1A1A1A;font-size:16px;font-weight:600;">Hello, ${name}! 👋</p>
                    <p style="margin:0 0 28px;color:#555;font-size:14px;line-height:1.6;">
                      Thank you for signing up with TANNMP. Use the verification code below to complete your registration.
                    </p>

                    <!-- OTP Box -->
                    <div style="background:#FEF2F2;border:2px solid #C8102E;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                      <p style="margin:0 0 8px;color:#C8102E;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Verification Code</p>
                      <p style="margin:0;color:#1A1A1A;font-size:42px;font-weight:800;letter-spacing:12px;">${otp}</p>
                    </div>

                    <p style="margin:0 0 8px;color:#888;font-size:13px;text-align:center;">
                      ⏱️ This code expires in <strong>5 minutes</strong>
                    </p>
                    
                    <!-- IMPORTANT: Spam notice -->
                    <div style="background:#FFFBEB;border:1px solid #F59E0B;border-radius:8px;padding:14px 18px;margin:20px 0;text-align:center;">
                      <p style="margin:0;color:#92400E;font-size:13px;">
                        📬 <strong>Did this land in spam?</strong><br>
                        Check your <strong>Spam / Junk folder</strong> if you didn't see this in your inbox.
                      </p>
                    </div>

                    <p style="margin:20px 0 0;color:#aaa;font-size:12px;text-align:center;">
                      If you did not create a TANNMP account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#F5F5F5;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
                    <p style="margin:0;color:#aaa;font-size:12px;">
                      © 2024 TANNMP — Tamil Nadu Naidu NMP Portal<br>
                      No. 12, Anna Nagar, Chennai - 600 040, Tamil Nadu
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  // ALWAYS log OTP to console for development convenience
  console.log('-----------------------------------------');
  console.log(`VERIFICATION CODE for ${email}: ${otp}`);
  console.log('-----------------------------------------');

  if (error) {
    console.error('Resend email error:', error);
    
    // Graceful handling for Resend's testing/onboarding restriction
    if (error.name === 'validation_error' && error.message.includes('testing emails')) {
      console.warn('⚠️ RESEND RESTRICTION: Email not sent because recipient is not verified. Use the OTP from the console above.');
      return { sent: false, restricted: true };
    }

    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
};

module.exports = { sendOTPEmail };
