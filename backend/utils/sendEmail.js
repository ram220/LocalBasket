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
        // Convert plain URLs into clickable HTML links to avoid spam flags
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const htmlContent = text
            .replace(urlRegex, '<a href="$1" style="color: #fc6b03; text-decoration: none; font-weight: bold;">Click Here to Proceed</a>')
            .replace(/\n/g, '<br><br>');

        const info = await transporter.sendMail({
            from: `"LocalBasket Team" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text, // Plain text fallback
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f5f7;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; border: 0; border-spacing: 0; background-color: #f4f5f7; padding: 20px;">
        <tr>
            <td align="center" style="padding: 40px 10px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; border: 0; border-spacing: 0; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="background-color: #fc6b03; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">LocalBasket</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                            <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px;">${subject}</h2>
                            <div style="color: #4a4a4a;">
                                ${htmlContent}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #888888; font-size: 13px;">This is an automated message from LocalBasket. Please do not reply.</p>
                            <p style="margin: 8px 0 0 0; color: #aaaaaa; font-size: 12px;">&copy; ${new Date().getFullYear()} LocalBasket. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
        });
        
        console.log("✅ Email sent successfully. Message ID:", info.messageId);
    } catch (err) {
        console.log("❌ Email sending failed. Error details:", err.message);
        throw err; // throw error so the calling function knows it failed
    }
};

module.exports = sendEmail;