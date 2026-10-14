const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass && !user.includes('your_smtp_user')) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback to local transport logger for development/test if unconfigured
  return {
    sendMail: async (mailOptions) => {
      console.log(`\n================== [EMAIL DISPATCHED] ==================`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Content:\n${mailOptions.text || mailOptions.html}`);
      console.log(`========================================================\n`);
      return { messageId: `mock-${Date.now()}` };
    },
  };
};

const sendVerificationEmail = async (to, token, name, preferredLanguage = 'en') => {
  const transporter = createTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

  const subject = preferredLanguage === 'hi' 
    ? 'स्लाइसक्राफ्ट पिज़्ज़ा - अपने ईमेल पते की पुष्टि करें' 
    : preferredLanguage === 'pa'
    ? 'ਸਲਾਈਸਕ੍ਰਾਫਟ ਪੀਜ਼ਾ - ਆਪਣਾ ਈਮੇਲ ਤਸਦੀਕ ਕਰੋ'
    : 'SliceCraft Pizza - Verify Your Email Address';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #d62828; margin-top: 0;">🍕 SliceCraft Pizza</h2>
      <p style="font-size: 16px; color: #374151;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 15px; color: #4b5563; line-height: 1.5;">
        Thank you for joining SliceCraft Pizza! Please verify your email address to complete your registration and start ordering delicious, freshly baked handcrafted pizzas.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #d62828; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
          Verify My Account
        </a>
      </div>
      <p style="font-size: 13px; color: #6b7280; line-height: 1.4;">
        Or copy and paste this verification URL into your browser:<br/>
        <a href="${verificationLink}" style="color: #2563eb; word-break: break-all;">${verificationLink}</a>
      </p>
      <p style="font-size: 13px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
        This verification link will expire in 24 hours. If you did not create an account, please ignore this email.
      </p>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || '"SliceCraft Pizza" <no-reply@slicecraftpizza.com>',
    to,
    subject,
    html,
  });
};

const sendPasswordResetEmail = async (to, token, name, preferredLanguage = 'en') => {
  const transporter = createTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  const subject = preferredLanguage === 'hi' 
    ? 'स्लाइसक्राफ्ट पिज़्ज़ा - पासवर्ड रीसेट अनुरोध' 
    : preferredLanguage === 'pa'
    ? 'ਸਲਾਈਸਕ੍ਰਾਫਟ ਪੀਜ਼ਾ - ਪਾਸਵਰਡ ਰੀਸੈੱਟ'
    : 'SliceCraft Pizza - Password Reset Request';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #d62828; margin-top: 0;">🍕 SliceCraft Pizza</h2>
      <p style="font-size: 16px; color: #374151;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 15px; color: #4b5563; line-height: 1.5;">
        We received a request to reset your password. Click the button below to choose a new secure password for your account:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #d62828; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
          Reset My Password
        </a>
      </div>
      <p style="font-size: 13px; color: #6b7280; line-height: 1.4;">
        Or open this link directly:<br/>
        <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
      </p>
      <p style="font-size: 13px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
        This password reset link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || '"SliceCraft Pizza" <no-reply@slicecraftpizza.com>',
    to,
    subject,
    html,
  });
};

const sendLowStockAlert = async (lowStockItems, adminEmail) => {
  const transporter = createTransporter();
  const targetEmail = adminEmail || process.env.ADMIN_ALERT_EMAIL || 'admin@slicecraftpizza.com';

  const itemsRows = lowStockItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>${item.name}</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-transform: capitalize;">${item.category}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: bold;">${item.stockQuantity} ${item.unit || 'units'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.lowStockThreshold} ${item.unit || 'units'}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #b91c1c; margin-top: 0;">⚠️ Low Stock Inventory Alert</h2>
      <p style="font-size: 15px; color: #374151;">
        The scheduled inventory monitor has detected that one or more pizza ingredients have fallen below their configured minimum threshold.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <thead>
          <tr style="background-color: #f9fafb; text-align: left;">
            <th style="padding: 10px; border-bottom: 2px solid #d1d5db;">Ingredient</th>
            <th style="padding: 10px; border-bottom: 2px solid #d1d5db;">Category</th>
            <th style="padding: 10px; border-bottom: 2px solid #d1d5db;">Current Stock</th>
            <th style="padding: 10px; border-bottom: 2px solid #d1d5db;">Threshold</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      <p style="font-size: 14px; color: #4b5563;">
        <strong>Recommended Action:</strong> Please log in to the SliceCraft Admin Inventory Dashboard and restock these items to prevent orders from being blocked.
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 12px;">
        Automated alert generated by SliceCraft node-cron inventory monitoring system at ${new Date().toISOString()}.
      </p>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || '"SliceCraft Inventory Alert" <alerts@slicecraftpizza.com>',
    to: targetEmail,
    subject: `🚨 [URGENT] SliceCraft Pizza: Low Stock Alert (${lowStockItems.length} items)`,
    html,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLowStockAlert,
};
