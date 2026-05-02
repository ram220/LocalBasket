const sgMail = require("@sendgrid/mail");

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendEmail = async (to, subject, text) => {
    try {
        if (!process.env.SENDGRID_API_KEY) {
            console.warn("⚠️ SENDGRID_API_KEY is missing from environment variables.");
            return { success: false, error: "SENDGRID_API_KEY is missing" };
        }

        const msg = {
            to,
            from: process.env.EMAIL_USER, // This MUST be the email you verified in SendGrid
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
        };

        const response = await sgMail.send(msg);

        console.log("✅ SendGrid Email sent successfully:", response[0].statusCode);
        return { success: true, messageId: response[0].headers['x-message-id'] || "SendGrid" };

    } catch (err) {
        console.error("❌ SendGrid Error details:", JSON.stringify(err.response?.body) || err.message);
        return { success: false, error: err.response?.body || err.message };
    }
};

module.exports = sendEmail;