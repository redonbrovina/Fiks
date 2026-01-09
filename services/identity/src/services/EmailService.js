const { Resend } = require('resend');

class EmailService {
    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.from = 'Fiks <onboarding@resend.dev>'; // Default from email using Resend domain
    }

    /**
     * Send password reset email
     * @param {string} email - Recipient email
     * @param {string} token - Reset token
     * @param {string} name - Recipient name
     */
    async sendPasswordResetEmail(email, code, name) {
        console.log(`[EMAIL] Attempting to send reset code to: ${email}`);

        try {
            const data = await this.resend.emails.send({
                from: this.from,
                to: email,
                subject: 'Rivendosja e Fjalëkalimit - Kodi i Konfirmimit',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #6366f1; text-align: center;">Kodi i Konfirmimit</h2>
                        <p>Përshëndetje ${name},</p>
                        <p>Kemi pranuar një kërkesë për të rivendosur fjalëkalimin tuaj. Përdorni kodin e mëposhtëm për të vazhduar:</p>
                        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${code}</span>
                        </div>
                        <p>Ky kod është i vlefshëm për 1 orë.</p>
                        <p>Nëse nuk e keni kërkuar këtë ndryshim, ju lutem injoroni këtë email.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #888; text-align: center;">© 2026 Fiks. Të gjitha të drejtat e rezervuara.</p>
                    </div>
                `
            });
            console.log('[EMAIL] Resend response:', data);
            return data;
        } catch (error) {
            console.error('[EMAIL] Resend error details:', error);
            throw new Error('Dështoi dërgimi i emailit');
        }
    }
}

module.exports = new EmailService();
