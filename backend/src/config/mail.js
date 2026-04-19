const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter;

async function createTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'your_username') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback to Ethereal Email for demo/dev
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Ethereal Test Account Created. User:', testAccount.user);
  }
}

createTransporter();

exports.sendVerificationEmail = async (email, token) => {
  if (!transporter) await createTransporter();
  
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const verifyApiUrl = `http://localhost:5000/auth/verify-email?token=${token}`; // Direct link to API for verification
  
  const mailOptions = {
    from: `"TaskHub Pro" <noreply@taskhub.pro>`,
    to: email,
    subject: 'Verify your email address',
    html: `
      <h1>Welcome to TaskHub Pro</h1>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verifyApiUrl}" style="padding: 10px 20px; background-color: #4648D4; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If the button doesn't work, copy and paste this link: ${verifyApiUrl}</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('🔗 Verification Email Preview URL:', previewUrl);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
