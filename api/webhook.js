// api/webhook.js

const express = require("express");
const router = express.Router();
const { getAIReply } = require("../services/ai");
const { sendText } = require("../utils/respond");

router.post("/", async (req, res) => {
    try {
        const body = req.body;
        const phone = body.from;
        const message = (body.content?.text || body.UserResponse || "").trim();

        console.log("Incoming:", phone, message);

        if (!message) {
            return res.status(200).json({ success: true, reply: "" });
        }

        // AI se info lo - har cheez ke liye
        const prompt = `User is asking about: "${message}"

Give a short, accurate, professional response about this procedure/treatment in 3-4 lines. Include:
- What it is
- Key benefits
- Recovery time if applicable

End with: "Book a free consultation to know more!"

Keep it simple, easy to understand, and medically accurate.`;

        const aiReply = await getAIReply(prompt);

        // User ko WhatsApp pe bhejo
        if (phone) {
            await sendText(phone, `ℹ️ *${message}*\n\n${aiReply}`);
        }

        return res.status(200).json({
            success: true,
            reply: aiReply,
            service: message
        });

    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(200).json({
            success: true,
            reply: "Sorry, something went wrong. Please try again."
        });
    }
});

module.exports = router;