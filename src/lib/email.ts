/**
 * Email Service for Boltfy
 * Handles email sending functionality using various providers
 */

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    replyTo?: string;
}

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// Email template types
export type EmailTemplateType =
    | 'welcome'
    | 'password_reset'
    | 'form_submission'
    | 'campaign';

// Base email template with branding
export function getBaseTemplate(content: string, previewText?: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Boltfy</title>
  ${previewText ? `<span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</span>` : ''}
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo img {
      height: 48px;
      width: 48px;
      border-radius: 12px;
    }
    .content {
      line-height: 1.7;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-weight: 600;
      margin: 24px 0;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 14px;
    }
    h1 {
      color: #1e293b;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    p {
      color: #475569;
      margin: 16px 0;
    }
    .highlight {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <img src="{{logoUrl}}" alt="Boltfy" />
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>Sent with ❤️ from Boltfy</p>
        <p>© ${new Date().getFullYear()} Boltfy. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

// Pre-built email templates
export const emailTemplates = {
    welcome: (name: string) => getBaseTemplate(`
    <h1>Welcome to Boltfy, ${name}! 🎉</h1>
    <p>We're thrilled to have you on board. Boltfy helps you create beautiful forms, manage subscribers, and send email campaigns with ease.</p>
    <p>Here's what you can do:</p>
    <ul>
      <li>📝 Create stunning forms in minutes</li>
      <li>👥 Manage your subscriber lists</li>
      <li>📧 Send beautiful email campaigns</li>
      <li>📊 Track your growth with analytics</li>
    </ul>
    <p style="text-align: center;">
      <a href="{{dashboardUrl}}" class="button">Get Started</a>
    </p>
    <p>Need help? We're here for you. Just reply to this email!</p>
    <p>Cheers,<br>The Boltfy Team</p>
  `, `Welcome to Boltfy, ${name}! Let's build something amazing.`),

    passwordReset: (resetLink: string) => getBaseTemplate(`
    <h1>Reset Your Password</h1>
    <p>Hey there! 👋</p>
    <p>We received a request to reset your password. No worries, it happens to the best of us!</p>
    <p style="text-align: center;">
      <a href="${resetLink}" class="button">Reset Password</a>
    </p>
    <p>This link will expire in 1 hour for security reasons.</p>
    <div class="highlight">
      <strong>Didn't request this?</strong><br>
      If you didn't request a password reset, you can safely ignore this email. Your password won't change.
    </div>
    <p>Stay secure,<br>The Boltfy Team</p>
  `, 'Reset your Boltfy password'),

    formSubmission: (formName: string, data: Record<string, string>) => getBaseTemplate(`
    <h1>New Submission: ${formName} 📬</h1>
    <p>Great news! Someone just submitted your form.</p>
    <div class="highlight">
      ${Object.entries(data).map(([key, value]) => `
        <p style="margin: 8px 0;"><strong>${key}:</strong> ${value}</p>
      `).join('')}
    </div>
    <p style="text-align: center;">
      <a href="{{dashboardUrl}}/forms" class="button">View All Submissions</a>
    </p>
    <p>Keep growing! 🚀<br>The Boltfy Team</p>
  `, `New submission on ${formName}`),

    campaign: (subject: string, content: string, unsubscribeLink: string) => getBaseTemplate(`
    ${content}
    <div class="footer" style="margin-top: 40px;">
      <p style="font-size: 12px; color: #94a3b8;">
        You're receiving this because you subscribed to our updates.<br>
        <a href="${unsubscribeLink}" style="color: #6366f1;">Unsubscribe</a> from future emails.
      </p>
    </div>
  `, subject),
};

// Email provider interface
interface EmailProvider {
    name: string;
    send: (options: EmailOptions) => Promise<EmailResult>;
}

// Console provider (for development/testing)
const consoleProvider: EmailProvider = {
    name: 'console',
    send: async (options: EmailOptions): Promise<EmailResult> => {
        console.log('📧 Email would be sent:');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('---');
        console.log(options.text || 'HTML email');
        console.log('---');
        return { success: true, messageId: `mock-${Date.now()}` };
    },
};

// Resend provider (for production)
// To use: npm install resend, then add VITE_RESEND_API_KEY to .env
const resendProvider: EmailProvider = {
    name: 'resend',
    send: async (options: EmailOptions): Promise<EmailResult> => {
        const apiKey = import.meta.env.VITE_RESEND_API_KEY;
        if (!apiKey) {
            console.warn('Resend API key not configured, falling back to console');
            return consoleProvider.send(options);
        }

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: options.from || 'Boltfy <noreply@boltfy.com>',
                    to: Array.isArray(options.to) ? options.to : [options.to],
                    subject: options.subject,
                    html: options.html,
                    text: options.text,
                    reply_to: options.replyTo,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || 'Failed to send email' };
            }

            return { success: true, messageId: data.id };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    },
};

// Email service class
class EmailService {
    private provider: EmailProvider;

    constructor() {
        // Use Resend if API key is available, otherwise use console
        const hasResendKey = !!import.meta.env.VITE_RESEND_API_KEY;
        this.provider = hasResendKey ? resendProvider : consoleProvider;
        console.log(`📧 Email service initialized with ${this.provider.name} provider`);
    }

    async send(options: EmailOptions): Promise<EmailResult> {
        return this.provider.send(options);
    }

    async sendWelcome(email: string, name: string, dashboardUrl: string): Promise<EmailResult> {
        const html = emailTemplates.welcome(name)
            .replace('{{dashboardUrl}}', dashboardUrl)
            .replace('{{logoUrl}}', `${dashboardUrl}/icon.png`);

        return this.send({
            to: email,
            subject: `Welcome to Boltfy, ${name}! 🎉`,
            html,
        });
    }

    async sendPasswordReset(email: string, resetLink: string): Promise<EmailResult> {
        const html = emailTemplates.passwordReset(resetLink)
            .replace('{{logoUrl}}', `${window.location.origin}/icon.png`);

        return this.send({
            to: email,
            subject: 'Reset your Boltfy password',
            html,
        });
    }

    async sendFormNotification(
        email: string,
        formName: string,
        data: Record<string, string>,
        dashboardUrl: string
    ): Promise<EmailResult> {
        const html = emailTemplates.formSubmission(formName, data)
            .replace('{{dashboardUrl}}', dashboardUrl)
            .replace('{{logoUrl}}', `${dashboardUrl}/icon.png`);

        return this.send({
            to: email,
            subject: `New submission: ${formName}`,
            html,
        });
    }

    async sendCampaign(
        emails: string[],
        subject: string,
        content: string,
        unsubscribeBaseUrl: string
    ): Promise<EmailResult[]> {
        const results: EmailResult[] = [];

        for (const email of emails) {
            const unsubscribeLink = `${unsubscribeBaseUrl}?email=${encodeURIComponent(email)}`;
            const html = emailTemplates.campaign(subject, content, unsubscribeLink)
                .replace('{{logoUrl}}', `${window.location.origin}/icon.png`);

            const result = await this.send({
                to: email,
                subject,
                html,
            });
            results.push(result);

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return results;
    }
}

// Export singleton instance
export const emailService = new EmailService();
