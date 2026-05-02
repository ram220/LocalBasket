const Razorpay = require('razorpay');

let razorpay = null;

try {
    if (process.env.RAZORPAY_KEY_ID) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    } else {
        console.warn("⚠️ Razorpay keys not found in environment variables. Razorpay is disabled.");
    }
} catch (error) {
    console.error("❌ Failed to initialize Razorpay:", error.message);
}

module.exports = razorpay;