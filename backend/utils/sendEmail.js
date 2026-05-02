const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: `"LocalBasket" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text
        });
        
        console.log("✅ Email sent successfully. Message ID:", info.messageId);
    } catch (err) {
        console.log("❌ Email sending failed. Error details:", err.message);
        throw err; // throw error so the calling function knows it failed
    }
};

module.exports = sendEmail;