const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587, // 587 is often better supported in cloud environments
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: `"LocalBasket Team" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text, // Plain text fallback
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
                    <h2 style="color: #fc6b03;">LocalBasket</h2>
                    <p style="font-size: 16px; color: #333;">${text.replace(/\n/g, '<br>')}</p>
                    <br/>
                    <p style="font-size: 12px; color: #777;">This is an automated message from LocalBasket. Please do not reply.</p>
                </div>
            `
        });
        
        console.log("✅ Email sent successfully. Message ID:", info.messageId);
    } catch (err) {
        console.error("❌ Email sending failed. Error details:", err.message);
        // We remove 'throw err;' here. Throwing an error in a non-awaited async function causes 
        // the Node.js process to crash completely with an Unhandled Promise Rejection.
    }
};

module.exports = sendEmail;