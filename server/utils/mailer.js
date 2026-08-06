const nodemailer = require("nodemailer");
const { renderInquiryNotificationEmail } = require("./emailTemplates");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error("EMAIL_USER / EMAIL_APP_PASSWORD are not set in .env");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  return transporter;
}

async function sendPasswordResetEmail(toEmail, resetUrl) {
  await getTransporter().sendMail({
    from: `"DreamHome" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your DreamHome password",
    html: `
      <p>Someone requested a password reset for your DreamHome account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a> (expires in 1 hour).</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

async function sendInquiryNotificationEmail(toEmail, data) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const html = renderInquiryNotificationEmail({
    website: "DreamHome",
    supportEmail: process.env.EMAIL_USER,
    propertyUrl: `${appUrl}/property-details.html?id=${data.propertyId}`,
    dashboardUrl: `${appUrl}/dashboard.html`,
    ...data,
  });

  await getTransporter().sendMail({
    from: `"DreamHome" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    // "From" must stay the app's authenticated sending account — mail providers
    // block/rewrite a From address you don't own. Reply-To is how the seller's
    // reply actually reaches the buyer instead of bouncing back to the app.
    replyTo: `"${data.buyerName}" <${data.buyerEmail}>`,
    subject: `New inquiry about "${data.propertyTitle}"`,
    html,
  });
}

module.exports = { sendPasswordResetEmail, sendInquiryNotificationEmail };
