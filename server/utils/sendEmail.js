const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // If no credentials are setup, just log the token for dev
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('=================================================');
        console.log('EMAIL SERVICE NOT CONFIGURED. MOCK EMAIL SENT:');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Link: ${options.text}`); // We'll pass the link as text mainly
        console.log('=================================================');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // Or use host/port
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;
