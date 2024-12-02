const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Use TLS
            auth: {
                user: process.env.EMAIL_USER || '2201104232@student.buksu.edu.ph',
                pass: process.env.EMAIL_PASS || 'stmspdqhydwvslwg'
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        this.verifyConnection();
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('📧 Email service connected successfully');
        } catch (error) {
            console.error('📧 Email service connection failed:', error);
        }
    }

    async sendLoginNotification(userEmail, userName) {
        const mailOptions = {
            from: {
                name: 'BukSU DRS',
                address: process.env.EMAIL_USER
            },
            to: userEmail,
            subject: 'New Login Detected - BukSU DRS',
            text: `
Hello ${userName}!

A new login has been detected on your Document Request System account.

Login Time: ${new Date().toLocaleString()}

If this wasn't you, please contact the system administrator immediately.

Best regards,
BukSU Document Request System
            `.trim()
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✉️ Login notification email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('📧 Failed to send login notification:', error);
            return false;
        }
    }
}

module.exports = new EmailService();