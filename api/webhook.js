// api/webhook.js

const express = require("express");
const router = express.Router();
const { getAIReply } = require("../services/ai");

// Next 7 days generate karo
function getNext7Days() {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dates = [];
    for (let i = 1; i <= 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear());
    }
    return dates;
}

// Date validate karo
function validateDate(dateStr) {
    try {
        const parsed = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(parsed.getTime())) {
            return { valid: false, message: "Please enter a valid date (e.g. 20 June 2026)" };
        }
        if (parsed < today) {
            return { valid: false, message: "Please select a future date. Past dates are not available." };
        }

        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const formatted = days[parsed.getDay()] + ", " + parsed.getDate() + " " + months[parsed.getMonth()] + " " + parsed.getFullYear();

        return { valid: true, message: "Date confirmed: " + formatted, formatted: formatted };
    } catch (e) {
        return { valid: false, message: "Please enter a valid date (e.g. 20 June 2026)" };
    }
}

router.post("/", async (req, res) => {
    try {
        const body = req.body;
        const phone = body.from || "";
        const message = (body.content?.text || body.UserResponse || body.text || "").trim();

        console.log("Incoming:", phone, message);

        if (!message) {
            return res.status(200).json({ success: true, reply: "" });
        }

        // Date validate
        if (message.toLowerCase().startsWith("validate_date:")) {
            const dateStr = message.replace("validate_date:", "").trim();
            const result = validateDate(dateStr);
            return res.status(200).json({
                success: true,
                valid: result.valid,
                reply: result.message,
                formatted_date: result.formatted || ""
            });
        }

        // Get dates
        if (message.toLowerCase() === "get_dates") {
            return res.status(200).json({
                success: true,
                dates: getNext7Days(),
                reply: "Available dates for next 7 days"
            });
        }

        // Service info - AI se
        const prompt = `User is asking about: "${message}"

Give a short, accurate, professional response about this procedure/treatment in 3-4 lines. Include what it is, key benefits, and recovery time. End with: "Book a free consultation to know more!"`;

        const aiReply = await getAIReply(prompt);

        return res.status(200).json({
            success: true,
            reply: aiReply,
            service: message
        });

    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(200).json({
            success: true,
            reply: "Please contact us at celebre.in for more information."
        });
    }
});

module.exports = router;