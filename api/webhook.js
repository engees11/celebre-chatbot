// api/webhook.js

const express = require("express");
const router = express.Router();
const { getServiceInfo } = require("../services/celebreData");
const { getAIReply } = require("../services/ai");
const { sendText, sendButtons } = require("../utils/respond");

router.post("/", async (req, res) => {
    try {
        const body = req.body;
        const phone = body.phone || body.from;
        const message = (body.message || body.text || "").toLowerCase().trim();

        console.log("Incoming:", phone, message);

        // Step 1 - User ne hi/hello bola
        if (["hi", "hello", "hey", "hii", "helo", "start"].includes(message)) {
            await sendText(phone, "👋 Welcome to *Celebre Aesthetics*! 🌸\n\nI'm your AI assistant. I can help you explore our treatments and book a free consultation call.\n\nHow may I help you today?");
            await sendButtons(phone, "Please select an option:", [
                "Know about services",
                "Book a consultation"
            ]);
            return res.status(200).json({ success: true });
        }

        // Step 2 - Services list
        if (message.includes("know about services") || message.includes("services")) {
            await sendButtons(phone, "Please select a treatment you are interested in:", [
                "Rhinoplasty (Nose)",
                "Liposuction",
                "Breast Augmentation",
                "Face Lift",
                "Blepharoplasty (Eyes)",
                "Hair Transplant",
                "Tummy Tuck"
            ]);
            return res.status(200).json({ success: true });
        }

        // Step 3 - Service select ki — info bhejo
        const serviceInfo = getServiceInfo(message);
        if (serviceInfo) {
            await sendText(phone, `ℹ️ *${serviceInfo.name}*\n\n${serviceInfo.shortInfo}`);
            await sendButtons(phone, "Would you like to book a free consultation call?", [
                "Yes, book a call",
                "Know about other services"
            ]);
            return res.status(200).json({ success: true });
        }

        // Step 4 - Book a consultation
        if (message.includes("book") || message.includes("consultation") || message.includes("yes")) {
            await sendText(phone, "Great! 📅 Please select a date and time for your consultation call.\n\n🕐 *Available timings: 11 AM to 8 PM*");
            await sendButtons(phone, "Choose a time slot:", [
                "11:00 AM",
                "1:00 PM",
                "3:00 PM",
                "5:00 PM",
                "7:00 PM",
                "8:00 PM"
            ]);
            return res.status(200).json({ success: true });
        }

        // Step 5 - Time slot select hua
        const timeSlots = ["11:00 am", "1:00 pm", "3:00 pm", "5:00 pm", "7:00 pm", "8:00 pm"];
        if (timeSlots.some(slot => message.includes(slot))) {
            await sendText(phone, `✅ *Booking Confirmed!*\n\nYour consultation call is scheduled for *${message.toUpperCase()}*.\n\nOur specialist will call you at that time. See you soon! 💜\n\n— Celebre Aesthetics Team`);
            return res.status(200).json({ success: true });
        }

        // Default - AI se reply lo
        const aiReply = await getAIReply(message);
        await sendText(phone, aiReply);
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;