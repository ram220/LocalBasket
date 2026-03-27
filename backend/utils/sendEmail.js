const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
    try {
        const msg = {
            to,
            from: process.env.EMAIL_USER, // must be verified
            subject,
            text,
        };

        const response = await sgMail.send(msg);

        console.log("✅ Email sent:", response[0].statusCode);

    } catch (err) {
        console.log("❌ SendGrid Error:", err.response?.body || err.message);
        throw err;
    }
};

module.exports = sendEmail;





/*const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port:process.env.EMAIL_PORT,
    secure:true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: `"LocalBasket" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text
        });
    } catch (err) {
        console.log("Email error:", err);
    }
};

module.exports = sendEmail;*/