import { Resend } from 'resend';

export class ResendService {
  private static resend: Resend | null = null;

  private static getResendClient() {
    if (!this.resend) {
      const apiKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;
      if (!apiKey) {
        throw new Error('RESEND_API_KEY is not configured');
      }
      this.resend = new Resend(apiKey);
    }
    return this.resend;
  }

  static async sendInvitationEmail(
    email: string,
    accessCode: string,
    companyName: string = "",
    portalUrl: string = ""
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const resend = this.getResendClient();
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'max.vanasten@tweetgarot.com';
      
      const emailTemplate = this.generateInvitationEmailTemplate(
        companyName || "Contractor",
        accessCode,
        portalUrl
      );

      const result = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: `Subcontractor Portal Access - ${companyName || "Tweet/Garot Mechanical"}`,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      if (result.error) {
        console.error('Resend error:', result.error);
        return {
          success: false,
          error: result.error.message || 'Failed to send email'
        };
      }

      return {
        success: true,
        messageId: result.data?.id
      };

    } catch (error: any) {
      console.error('ResendService error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  private static generateInvitationEmailTemplate(
    companyName: string,
    accessCode: string,
    portalUrl: string
  ) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Subcontractor Portal Access</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #1C295B 0%, #4361a3 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .header .subtitle {
      margin: 5px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .access-code {
      background: #f3f4f6;
      border: 2px solid #1C295B;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .access-code-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 5px;
    }
    .access-code-value {
      font-size: 24px;
      font-weight: bold;
      color: #1C295B;
      letter-spacing: 2px;
    }
    .cta-button {
      display: inline-block;
      background: #1C295B;
      color: white;
      text-decoration: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
      font-size: 14px;
      color: #6b7280;
    }
    .highlight {
      background: #dbeafe;
      border-left: 4px solid #1C295B;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>TWEET/GAROT</h1>
    <div class="subtitle">MECHANICAL</div>
  </div>
  
  <div class="content">
    <h2>Hello ${companyName},</h2>
    
    <p>You have been invited to complete the <strong>Subcontractor Pre-Qualification Questionnaire</strong> for Tweet/Garot Mechanical.</p>
    
    <div class="highlight">
      <strong>🚀 Features Available:</strong>
      <ul>
        <li>REAL OCR Certificate of Insurance analysis</li>
        <li>Intelligent document processing</li>
        <li>Automated compliance checking</li>
        <li>Risk assessment scoring</li>
      </ul>
    </div>

    <div class="access-code">
      <div class="access-code-label">Your Access Code</div>
      <div class="access-code-value">${accessCode}</div>
    </div>

    ${portalUrl ? `
    <div style="text-align: center;">
      <a href="${portalUrl}" class="cta-button">Access Portal Now</a>
    </div>
    ` : ''}

    <h3>Getting Started:</h3>
    <ol>
      <li>Click the portal link above (or visit the portal URL)</li>
      <li>Enter your email address</li>
      <li>Use access code: <strong>${accessCode}</strong></li>
      <li>Complete the pre-qualification questionnaire</li>
    </ol>

    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <strong>⚡ AI-Powered Processing:</strong> Our system uses advanced OCR technology to automatically extract and validate information from your insurance certificates and other documents.
    </div>

    <p>If you have any questions, please contact us at <a href="mailto:max.vanasten@tweetgarot.com">max.vanasten@tweetgarot.com</a>.</p>

    <p>Best regards,<br>
    <strong>Tweet/Garot Mechanical Team</strong></p>
  </div>

  <div class="footer">
    <p><strong>Tweet/Garot Mechanical</strong><br>
    Professional Subcontractor Portal<br>
    This invitation expires in 30 days.</p>
  </div>
</body>
</html>`;

    const text = `
TWEET/GAROT MECHANICAL
Subcontractor Portal Access

Hello ${companyName},

You have been invited to complete the Subcontractor Pre-Qualification Questionnaire for Tweet/Garot Mechanical.

Access Code: ${accessCode}
${portalUrl ? `Portal URL: ${portalUrl}` : ''}

Features Available:
- REAL OCR Certificate of Insurance analysis
- Intelligent document processing  
- Automated compliance checking
- Risk assessment scoring

Getting Started:
1. Visit the portal URL
2. Enter your email address
3. Use access code: ${accessCode}
4. Complete the pre-qualification questionnaire

If you have any questions, please contact us at max.vanasten@tweetgarot.com.

Best regards,
Tweet/Garot Mechanical Team

---
This invitation expires in 30 days.
`;

    return { html, text };
  }

  static async sendNotificationEmail(
    toEmail: string,
    subject: string,
    message: string,
    data?: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const resend = this.getResendClient();
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'max.vanasten@tweetgarot.com';

      const result = await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1C295B;">${subject}</h2>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              ${message}
            </div>
            ${data ? `
              <div style="margin-top: 20px;">
                <h3>Additional Details:</h3>
                <pre style="background: #f3f4f6; padding: 15px; border-radius: 8px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>
              </div>
            ` : ''}
          </div>
        `,
        text: `${subject}\n\n${message}${data ? `\n\nAdditional Details:\n${JSON.stringify(data, null, 2)}` : ''}`
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message || 'Failed to send notification'
        };
      }

      return {
        success: true,
        messageId: result.data?.id
      };

    } catch (error: any) {
      console.error('Notification email error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }
}
