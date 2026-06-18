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
        dates.push({
            id: "date_" + i,
            title: days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()],
            description: ""
        });
    }
    return dates;
}

// Time slots
function getTimeSlots() {
    const slots = ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];
    return slots.map(function (slot, i) {
        return { id: "time_" + i, title: slot, description: "" };
    });
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

        if (message.toLowerCase() === "get_dates") {
            return res.status(200).json({ success: true, dates: getNext7Days(), reply: "Please select a date:" });
        }

        if (message.toLowerCase() === "get_times") {
            return res.status(200).json({ success: true, times: getTimeSlots(), reply: "Please select a time:" });
        }

        const prompt = `User is asking about: "${message}"\n\nGive a short, accurate, professional response about this procedure/treatment in 3-4 lines. Include what it is, key benefits, and recovery time. End with: "Book a free consultation to know more!"`;

        const aiReply = await getAIReply(prompt);

        return res.status(200).json({ success: true, reply: aiReply, service: message });

    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(200).json({ success: true, reply: "Please contact us at celebre.in for more information." });
    }
});

module.exports = router;