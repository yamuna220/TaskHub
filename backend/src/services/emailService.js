const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    // Configure SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // If using Ethereal without creds, we'll create them
    if (!process.env.SMTP_USER) {
      this.initEthereal();
    }
  }

  async initEthereal() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('✅ Ethereal Email established for development');
      console.log('User:', testAccount.user);
      console.log('Pass:', testAccount.pass);
    } catch (err) {
      console.error('❌ Failed to create Ethereal account:', err);
    }
  }

  async sendVerificationEmail(email, token, userName) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const apiVerificationLink = `${process.env.BACKEND_URL || 'http://localhost:5000'}/auth/verify-email-get?token=${token}`;

    const htmlContent = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.025em;">TaskHub Pro</h1>
        </div>
        
        <div style="background: white; padding: 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <h2 style="color: #0f172a; margin-top: 0;">Welcome aboard, ${userName}!</h2>
          <p>Thank you for joining TaskHub Pro. To unlock your workspace and start managing your team's performance, please verify your email address.</p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationLink}" 
               style="background-color: #4f46e5; color: white; padding: 14px 32px; 
                      text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;
                      display: inline-block; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);">
              Verify Your Account
            </a>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; margin-top: 32px;">
            <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Testing Shortcut (Local Dev)</p>
            <p style="margin: 8px 0 0; font-size: 14px;">If you can't click the button, use this direct link:</p>
            <a href="${apiVerificationLink}" style="color: #4f46e5; font-size: 14px; word-break: break-all;">${apiVerificationLink}</a>
          </div>

          <p style="color: #94a3b8; font-size: 13px; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
            This link will expire in 24 hours. If you didn't create this account, please ignore this email.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'TaskHub Pro'}" <${process.env.SMTP_FROM_EMAIL || 'no-reply@taskhub.pro'}>`,
        to: email,
        subject: 'Verify Your Email Address - TaskHub Pro',
        html: htmlContent
      });

      console.log('\n' + '='.repeat(60));
      console.log('📧  CONFIRMATION EMAIL SENT!');
      console.log('To: ' + email);
      console.log('Link: ' + apiVerificationLink);
      console.log('='.repeat(60) + '\n');
      
      return true;
    } catch (err) {
      console.error('❌ Failed to send email:', err);
      // Still log the link so user can continue
      console.log('\n' + '!'.repeat(60));
      console.log('⚠️  MAIL FAILED BUT HERE IS YOUR VERIFICATION LINK:');
      console.log(apiVerificationLink);
      console.log('!'.repeat(60) + '\n');
    }
  }

  async sendWelcomeEmail(email, userName, role) {
    const htmlContent = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background: #10b981; padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
           <h1 style="color: white; margin: 0;">Account Verified! 🎉</h1>
        </div>
        <div style="background: white; padding: 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
          <p>Hi ${userName},</p>
          <p>Your account is now fully active. You've been assigned the <strong>${role}</strong> role.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" style="background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Login to Dashboard</a>
          </div>
        </div>
      </div>
    `;

    return this.transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to TaskHub Pro!',
      html: htmlContent
    });
  }

  async sendPasswordResetEmail(email, token, userName) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Password Reset</h2>
        <p>Hi ${userName}, use the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 1 hour.</p>
      </div>
    `;

    return this.transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: 'Reset Your Password - TaskHub Pro',
      html: htmlContent
    });
  }

  async sendInvitationEmail(email, token, orgName) {
    const inviteLink = `${process.env.FRONTEND_URL}/register?invite=${token}`;
    const htmlContent = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background: #4f46e5; padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
           <h1 style="color: white; margin: 0;">You're Invited! 🚀</h1>
        </div>
        <div style="background: white; padding: 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
          <p>Hi there,</p>
          <p>You have been invited to join <strong>${orgName}</strong> on TaskHub Pro — the ultimate platform for team performance.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accept Invitation</a>
          </div>
          <p style="color: #64748b; font-size: 13px;">If the button doesn't work, copy and paste this link: <br/> ${inviteLink}</p>
        </div>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'TaskHub Pro'}" <${process.env.SMTP_FROM_EMAIL || 'no-reply@taskhub.pro'}>`,
        to: email,
        subject: `Invite: Join ${orgName} on TaskHub Pro`,
        html: htmlContent
      });

      console.log('\n' + '='.repeat(60));
      console.log('🚀  INVITATION EMAIL SENT!');
      console.log('To: ' + email);
      
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('🔗  VIEW EMAIL: ' + previewUrl);
      }
      console.log('='.repeat(60) + '\n');
      
      return true;
    } catch (err) {
      console.error('❌ Failed to send invitation email:', err);
      return false;
    }
  }
}

module.exports = new EmailService();
