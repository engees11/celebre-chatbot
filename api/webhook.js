// api/webhook.js

const express = require("express");
const router = express.Router();
const { getAIReply } = require("../services/ai");

router.post("/", async (req, res) => {
    try {
        const body = req.body;
        const phone = body.from || "";
        const message = (body.content?.text || body.UserResponse || body.text || "").trim();

        console.log("Incoming:", phone, message);

        if (!message) {
            return res.status(200).json({ success: true, reply: "" });
        }

        // AI se info lo
        const prompt = `User is asking about: "${message}"

Give a short, accurate, professional response about this procedure/treatment in 3-4 lines. Include what it is, key benefits, and recovery time. End with: "Book a free consultation to know more!"`;

        const aiReply = await getAIReply(prompt);

        // Sirf response return karo - 11za khud display karega
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