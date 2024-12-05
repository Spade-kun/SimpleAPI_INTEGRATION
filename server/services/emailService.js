const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
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

    async sendDocumentStatusEmail(userEmail, documentTitle, status, rejectionReason = null) {
        let subject, messageContent;

        if (status === "Approved") {
            subject = "Document Request Approved";
            messageContent = `
                <h2>Document Request Approved</h2>
                <p>Your document request "${documentTitle}" has been approved.</p>
                <p>You can now proceed with the next steps of your document request process.</p>
            `;
        } else if (status === "Rejected") {
            subject = "Document Request Rejected";
            messageContent = `
                <h2>Document Request Rejected</h2>
                <p>Your document request "${documentTitle}" has been rejected.</p>
                <p><strong>Reason for rejection:</strong> ${rejectionReason}</p>
                <p>If you have any questions about this decision, please contact the administrator.</p>
            `;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    ${messageContent}
                    <br/>
                    <p style="color: #666; font-size: 14px;">
                        This is an automated message from the BukSU Document Request System.
                        Please do not reply to this email.
                    </p>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✉️ Document status notification email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('📧 Failed to send document status notification:', error);
            return false;
        }
    }
}

module.exports = new EmailService();