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
    async sendPasswordResetEmail(email, token, name) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        console.log(`[EMAIL] Attempting to send reset email to: ${email}`);

        try {
            const data = await this.resend.emails.send({
                from: this.from,
                to: email,
                subject: 'Rivendosja e Fjalëkalimit - Fiks',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #C00F0C; text-align: center;">Kërkesë për Rivendosje të Fjalëkalimit</h2>
                        <p>Përshëndetje ${name},</p>
                        <p>Kemi pranuar një kërkesë për të rivendosur fjalëkalimin e llogarisë tuaj në platformën <strong>Fiks</strong>.</p>
                        <p>Nëse nuk e keni bërë këtë kërkesë, ju lutem injoroni këtë email.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background-color: #C00F0C; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">Rivendos Fjalëkalimin</a>
                        </div>
                        <p>Ky link do të jetë i vlefshëm për 1 orë.</p>
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
