const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Check for required environment variables
        if (!process.env.EMAIL_APP_PASSWORD) {
            console.error('⚠️ EMAIL_APP_PASSWORD is not set in environment variables');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: '2201105612@student.buksu.edu.ph',
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });

        // Verify connection configuration
        this.verifyConnection();
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('📧 SMTP connection established successfully');
        } catch (error) {
            console.error('📧 SMTP connection failed:', error.message);
        }
    }

    async sendEmail(userEmail, subject, message) {
        if (!this.transporter) {
            console.error('📧 Email service not properly initialized');
            return false;
        }

        const mailOptions = {
            from: {
                name: 'BukSU DRS',
                address: '2201105612@student.buksu.edu.ph'
            },
            to: userEmail,
            subject: subject,
            text: message
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✉️ Email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('📧 Failed to send email:', {
                error: error.message,
                code: error.code,
                command: error.command
            });
            return false;
        }
    }

    async sendLoginNotification(userEmail) {
        const message = `
Hello!

A new login has been detected on your Document Request System account.

Login Time: ${new Date().toLocaleString()}

If this wasn't you, please contact the system administrator immediately.

Best regards,
BukSU Document Request System
        `.trim();

        return await this.sendEmail(
            userEmail,
            'New Login Alert - BukSU DRS',
            message
        );
    }

    async sendDocumentRequestNotification(adminEmail, userEmail, documentTitle) {
        const message = `
Hello Admin,

A new document request has been submitted.

Document Title: ${documentTitle}
Requested By: ${userEmail}
Request Time: ${new Date().toLocaleString()}

Please review this request at your earliest convenience.

Best regards,
BukSU Document Request System
        `.trim();

        return await this.sendEmail(
            adminEmail,
            'New Document Request - BukSU DRS',
            message
        );
    }

    async sendDocumentStatusNotification(userEmail, documentTitle, status, remarks = '') {
        const message = `
Hello!

Your document request status has been updated.

Document Title: ${documentTitle}
Status: ${status}
${remarks ? `Remarks: ${remarks}` : ''}
Update Time: ${new Date().toLocaleString()}

You can check the details in your dashboard.

Best regards,
BukSU Document Request System
        `.trim();

        return await this.sendEmail(
            userEmail,
            `Document Request ${status} - BukSU DRS`,
            message
        );
    }
}

module.exports = new EmailService();