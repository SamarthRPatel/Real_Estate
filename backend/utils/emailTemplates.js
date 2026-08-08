function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(amount) {
  const n = Number(amount);
  return Number.isFinite(n) ? n.toLocaleString("en-US") : "0";
}

const COLORS = {
  primary: "#006AFF",
  secondary: "#0F172A",
  bg: "#F5F7FA",
  card: "#FFFFFF",
  border: "#E5E7EB",
  success: "#22C55E",
  text: "#1F2937",
  muted: "#6B7280",
};

const FONT = "Arial, Helvetica, sans-serif";

/**
 * Renders the seller "new inquiry" notification email.
 * All string inputs are HTML-escaped; only urls/image are trusted as-is.
 */
function renderInquiryNotificationEmail(data) {
  const {
    website = "DreamHome",
    supportEmail = "support@dreamhome.com",
    currentYear = new Date().getFullYear(),
    sellerName = "there",
    propertyTitle,
    propertyPrice,
    propertyAddress,
    propertyImage,
    propertyType,
    listingType, // "sale" | "rent"
    bedrooms,
    bathrooms,
    area,
    buyerName,
    buyerEmail,
    buyerPhone,
    message,
    propertyUrl,
    dashboardUrl,
    inquiryDate = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
  } = data;

  const statusLabel = listingType === "rent" ? "For Rent" : "For Sale";
  const priceLabel = `$${formatMoney(propertyPrice)}${listingType === "rent" ? "/mo" : ""}`;

  const statRow = (icon, label, value) =>
    value === undefined || value === null || value === ""
      ? ""
      : `
        <td align="center" style="padding:12px 8px;">
          <div style="font-size:18px; line-height:1;">${icon}</div>
          <div style="font-family:${FONT}; font-size:16px; font-weight:700; color:${COLORS.text}; margin-top:4px;">${escapeHtml(value)}</div>
          <div style="font-family:${FONT}; font-size:13px; color:${COLORS.muted}; margin-top:2px;">${escapeHtml(label)}</div>
        </td>
      `;

  const buyerRow = (icon, value) =>
    value
      ? `
        <tr>
          <td style="padding:6px 0; font-family:${FONT}; font-size:16px; color:${COLORS.text};">
            <span style="display:inline-block; width:22px;">${icon}</span>
            ${escapeHtml(value)}
          </td>
        </tr>
      `
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Property Inquiry</title>
<!--[if mso]>
<style type="text/css">
  table, td { font-family: Arial, sans-serif !important; }
</style>
<![endif]-->
<style type="text/css">
  @media only screen and (max-width: 600px) {
    .email-container { width: 100% !important; }
    .stack-col { display: block !important; width: 100% !important; padding: 0 0 12px 0 !important; }
    .btn-td { display: block !important; width: 100% !important; padding: 0 0 10px 0 !important; }
  }
  a.btn-primary:hover { background-color: #0055D4 !important; }
  a.btn-secondary:hover { background-color: #16233B !important; }
</style>
</head>
<body style="margin:0; padding:0; background-color:${COLORS.bg};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.bg};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="background-color:${COLORS.primary}; border-radius:16px 16px 0 0; padding:28px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:${FONT}; font-size:16px; font-weight:700; color:#FFFFFF;">
                  &#127968; ${escapeHtml(website)}
                </td>
              </tr>
            </table>
            <h1 style="font-family:${FONT}; font-size:28px; line-height:1.3; color:#FFFFFF; margin:20px 0 6px;">New Property Inquiry</h1>
            <p style="font-family:${FONT}; font-size:16px; color:rgba(255,255,255,0.85); margin:0;">A buyer has contacted you about your property.</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="background-color:${COLORS.card}; padding:28px 32px 4px;">
            <p style="font-family:${FONT}; font-size:16px; color:${COLORS.text}; margin:0;">Hi ${escapeHtml(sellerName)},</p>
          </td>
        </tr>

        <!-- Property Summary Card -->
        <tr>
          <td style="background-color:${COLORS.card}; padding:16px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border:1px solid ${COLORS.border}; border-radius:12px; box-shadow:0 4px 14px rgba(15,23,42,0.06); overflow:hidden;">
              ${propertyImage ? `
              <tr>
                <td>
                  <img src="${propertyImage}" width="536" alt="${escapeHtml(propertyTitle)}"
                       style="display:block; width:100%; max-width:536px; height:auto; border-radius:12px 12px 0 0;">
                </td>
              </tr>` : ""}
              <tr>
                <td style="padding:20px 20px 4px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-family:${FONT}; font-size:20px; font-weight:700; color:${COLORS.text};">
                        ${escapeHtml(propertyTitle)}
                      </td>
                      <td align="right">
                        <span style="display:inline-block; background-color:${COLORS.success}1A; color:${COLORS.success}; font-family:${FONT}; font-size:13px; font-weight:700; padding:5px 12px; border-radius:999px; white-space:nowrap;">
                          ${escapeHtml(statusLabel)}
                        </span>
                      </td>
                    </tr>
                  </table>
                  <p style="font-family:${FONT}; font-size:22px; font-weight:700; color:${COLORS.primary}; margin:8px 0 4px;">${priceLabel}</p>
                  <p style="font-family:${FONT}; font-size:15px; color:${COLORS.muted}; margin:0 0 4px;">&#128205; ${escapeHtml(propertyAddress)}</p>
                  <p style="font-family:${FONT}; font-size:13px; color:${COLORS.muted}; margin:0;">${escapeHtml(propertyType)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 12px 16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${COLORS.border};">
                    <tr>
                      ${statRow("&#128716;", "Bedrooms", bedrooms)}
                      ${statRow("&#128703;", "Bathrooms", bathrooms)}
                      ${statRow("&#128207;", "Sqft", area)}
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Buyer Information Card -->
        <tr>
          <td style="background-color:${COLORS.card}; padding:8px 32px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="border:1px solid ${COLORS.border}; border-radius:12px; box-shadow:0 4px 14px rgba(15,23,42,0.06);">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="font-family:${FONT}; font-size:16px; font-weight:700; color:${COLORS.text}; margin:0 0 10px;">Buyer Information</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${buyerRow("&#128100;", buyerName)}
                    ${buyerRow("&#128231;", buyerEmail)}
                    ${buyerRow("&#128222;", buyerPhone)}
                    ${buyerRow("&#128337;", inquiryDate)}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Message Section -->
        <tr>
          <td style="background-color:${COLORS.card}; padding:8px 32px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background-color:${COLORS.bg}; border-left:4px solid ${COLORS.primary}; border-radius:8px;">
              <tr>
                <td style="padding:16px 18px;">
                  <p style="font-family:${FONT}; font-size:13px; font-weight:700; color:${COLORS.muted}; text-transform:uppercase; letter-spacing:0.04em; margin:0 0 8px;">Buyer's Message</p>
                  <p style="font-family:${FONT}; font-size:16px; color:${COLORS.text}; line-height:1.6; margin:0;">${escapeHtml(message)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Action Buttons -->
        <tr>
          <td style="background-color:${COLORS.card}; padding:8px 32px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="btn-td" width="50%" align="center" style="padding:6px;">
                  <a href="${propertyUrl}" class="btn-primary" style="display:block; background-color:${COLORS.primary}; color:#FFFFFF; font-family:${FONT}; font-size:15px; font-weight:700; text-decoration:none; text-align:center; padding:13px 20px; border-radius:999px;">
                    View Property
                  </a>
                </td>
                <td class="btn-td" width="50%" align="center" style="padding:6px;">
                  <a href="${dashboardUrl}" class="btn-secondary" style="display:block; background-color:${COLORS.secondary}; color:#FFFFFF; font-family:${FONT}; font-size:15px; font-weight:700; text-decoration:none; text-align:center; padding:13px 20px; border-radius:999px;">
                    Go to Dashboard
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:${COLORS.secondary}; border-radius:0 0 16px 16px; padding:28px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:${FONT}; font-size:16px; font-weight:700; color:#FFFFFF; padding-bottom:10px;">
                  &#127968; ${escapeHtml(website)}
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-bottom:14px;">
                  ${["f", "X", "in"].map((label) => `
                    <span style="display:inline-block; width:28px; height:28px; line-height:28px; text-align:center; background-color:rgba(255,255,255,0.1); border-radius:999px; color:#FFFFFF; font-family:${FONT}; font-size:12px; font-weight:700; margin:0 4px;">${label}</span>
                  `).join("")}
                </td>
              </tr>
              <tr>
                <td align="center" style="font-family:${FONT}; font-size:13px; color:rgba(255,255,255,0.6); padding-bottom:10px;">
                  Support: <a href="mailto:${supportEmail}" style="color:rgba(255,255,255,0.85);">${escapeHtml(supportEmail)}</a>
                </td>
              </tr>
              <tr>
                <td align="center" style="font-family:${FONT}; font-size:13px; color:rgba(255,255,255,0.6); padding-bottom:10px;">
                  <a href="#" style="color:rgba(255,255,255,0.7); text-decoration:underline;">Privacy Policy</a>
                  &nbsp;&middot;&nbsp;
                  <a href="#" style="color:rgba(255,255,255,0.7); text-decoration:underline;">Terms</a>
                </td>
              </tr>
              <tr>
                <td align="center" style="font-family:${FONT}; font-size:13px; color:rgba(255,255,255,0.45);">
                  &copy; ${escapeHtml(currentYear)} ${escapeHtml(website)}. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

module.exports = { renderInquiryNotificationEmail };
