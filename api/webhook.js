// api/webhook.js - Full AI Conversation Handler

const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation");
const { getAIReply } = require("../services/ai");
const { sendText, sendButtons, sendList } = require("../utils/respond");

// Service categories
const CATEGORIES = {
    "Hair Treatment": [
        { title: "Hair Transplant", description: "FUE scar-free method" },
        { title: "Hair Growth", description: "PRP & mesotherapy" },
        { title: "Laser Hair Removal", description: "Permanent hair reduction" }
    ],
    "Face Treatment": [
        { title: "Rhinoplasty", description: "Nose reshaping" },
        { title: "Lip Augmentation", description: "Fuller lips" },
        { title: "Lip Reduction", description: "Lip size reduction" },
        { title: "Facial Rejuvenation", description: "Anti-aging treatments" },
        { title: "Brow Lift", description: "Forehead & brow lift" },
        { title: "Dimple Creation", description: "Natural dimples" },
        { title: "Jawline Creation", description: "Defined jawline" },
        { title: "Double Chin Reduction", description: "Chin fat removal" },
        { title: "Otoplasty", description: "Ear correction" }
    ],
    "Breast Treatment": [
        { title: "Breast Augmentation", description: "Size enhancement" },
        { title: "Breast Reduction", description: "Size reduction" },
        { title: "Breast Lift", description: "Lift & reshape" },
        { title: "Axillary Breast Removal", description: "Armpit tissue removal" },
        { title: "Breast Swelling Excision", description: "Lump removal" }
    ],
    "Body Treatment": [
        { title: "Mommy Makeover", description: "Post-pregnancy restore" },
        { title: "Genital Rejuvenation", description: "Intimate rejuvenation" },
        { title: "Liposuction", description: "Fat removal" },
        { title: "Abdominoplasty", description: "Tummy tuck" },
        { title: "Gender Reassignment M-F", description: "Male to female" },
        { title: "Gender Reassignment F-M", description: "Female to male" }
    ],
    "Gynecomastia": [
        { title: "Gynecomastia Surgery", description: "Male breast reduction" }
    ],
    "Skin Treatment": [
        { title: "Skin Rejuvenation", description: "Youthful glow" },
        { title: "Acne Scar Treatment", description: "Scar removal" },
        { title: "Skin Pigmentation", description: "Dark spots treatment" },
        { title: "Scar Revision", description: "Scar improvement" },
        { title: "Vitiligo", description: "Vitiligo treatment" }
    ]
};

// Time slots
const TIME_SLOTS = [
    "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
];

// Get or create conversation
async function getConvo(phone, name) {
    let convo = await Conversation.findOne({ phone });
    if (!convo) {
        convo = new Conversation({ phone, name, state: "welcome" });
        await convo.save();
    }
    return convo;
}

// Update conversation
async function updateConvo(phone, data) {
    data.updated_at = new Date();
    await Conversation.findOneAndUpdate({ phone }, data, { upsert: true });
}

// Date validate
function isValidFutureDate(dateStr) {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsed >= today;
}

// Check if message is a greeting
function isGreeting(msg) {
    return ["hi", "hello", "hey", "hii", "hiii", "start", "helo", "namaste", "celebre", "celebre aesthetics"].includes(msg.toLowerCase());
}

// Find matching category
function findCategory(msg) {
    const lower = msg.toLowerCase();
    for (const cat of Object.keys(CATEGORIES)) {
        if (lower.includes(cat.toLowerCase().split(" ")[0])) return cat;
    }
    return null;
}

// Find matching service
function findService(msg) {
    const lower = msg.toLowerCase();
    for (const cat of Object.keys(CATEGORIES)) {
        for (const svc of CATEGORIES[cat]) {
            if (lower.includes(svc.title.toLowerCase()) || svc.title.toLowerCase().includes(lower)) {
                return { category: cat, service: svc.title };
            }
        }
    }
    return null;
}

// Find time slot
function findTimeSlot(msg) {
    const lower = msg.toLowerCase().replace(/\s/g, "");
    for (const slot of TIME_SLOTS) {
        if (lower.includes(slot.toLowerCase().replace(/\s/g, ""))) return slot;
    }
    return null;
}

// Main handler
router.post("/", async (req, res) => {
    try {
        const body = req.body;
        const phone = body.from || "";
        const senderName = body.whatsapp?.senderName || "";
        const message = (
            body.UserResponse ||
            body.whatsapp?.title ||
            body.postback?.data ||
            body.content?.text ||
            body.interactive?.title ||
            body.interactive?.list_reply?.title ||
            body.interactive?.button_reply?.title ||
            body.listReply?.title ||
            body.buttonReply?.title ||
            ""
        ).toString().trim();
        console.log("TITLE =", body.whatsapp?.title);
        console.log("MESSAGE =", message);

        console.log("Full body:", JSON.stringify(body));

        console.log("Incoming:", phone, message);

        if (!phone) {
            return res.status(200).json({ success: true });
        }
        // Sirf test number pe reply karo
        const TEST_NUMBERS = ["917820870519"];
        if (!TEST_NUMBERS.includes(phone)) {
            console.log("Skipping non-test number:", phone);
            return res.status(200).json({ success: true });
        }

        const convo = await getConvo(phone, senderName);

        // RESET - agar user "hi" bole toh fresh start
        if (isGreeting(message)) {
            await updateConvo(phone, { state: "welcome", selected_category: "", selected_service: "", booking_date: "", booking_time: "" });

            await sendText(phone, "👋 Hi " + (senderName || "there") + "! Welcome to *Celebre Aesthetics* 🌸\n\nWe are Gujarat's leading aesthetic surgery & cosmetic treatment clinic with centers in Surat, Ahmedabad & Rajkot.\n\nI can help you explore our treatments and book a free consultation call.");

            await sendList(phone,
                "Please select a treatment category to explore:",
                "Our Services",
                [{
                    title: "Treatment Categories",
                    rows: Object.keys(CATEGORIES).map(cat => ({
                        title: cat,
                        description: CATEGORIES[cat].length + " procedures available"
                    }))
                }],
                "Celebre Aesthetics",
                "Powered by AI"
            );

            await updateConvo(phone, { state: "category_selection" });
            return res.status(200).json({ success: true });
        }

        // STATE: category_selection
        if (convo.state === "category_selection") {
            const cat = findCategory(message) || message;
            const services = CATEGORIES[cat];

            if (services) {
                if (cat === "Gynecomastia") {
                    // Single service — seedha info do
                    await updateConvo(phone, { state: "service_info", selected_category: cat, selected_service: "Gynecomastia Surgery" });

                    const aiInfo = await getAIReply("Tell me about Gynecomasia surgery at Celebre Aesthetics", "User selected Gynecomastia");
                    await sendText(phone, "ℹ️ *Gynecomastia Surgery*\n\n" + aiInfo);

                    await sendButtons(phone, "Would you like to book a free consultation call?", ["Yes, Book a Call", "View Other Services"]);
                    await updateConvo(phone, { state: "booking_ask" });
                } else {
                    await sendList(phone,
                        "Here are our " + cat + " options. Please select one:",
                        cat.split(" ")[0] + " Services",
                        [{
                            title: cat,
                            rows: services
                        }],
                        cat
                    );
                    await updateConvo(phone, { state: "service_selection", selected_category: cat });
                }
                return res.status(200).json({ success: true });
            }

            // Category match nahi hua — AI se handle karo
            const aiReply = await getAIReply(message, "User is on category selection screen");
            await sendText(phone, aiReply);
            return res.status(200).json({ success: true });
        }

        // STATE: service_selection
        if (convo.state === "service_selection") {
            const svc = findService(message);

            if (svc) {
                await updateConvo(phone, { state: "service_info", selected_service: svc.service });

                const aiInfo = await getAIReply(
                    "Tell me about " + svc.service + " procedure at Celebre Aesthetics",
                    "User selected " + svc.service + " from " + convo.selected_category
                );
                await sendText(phone, "ℹ️ *" + svc.service + "*\n\n" + aiInfo);

                await sendButtons(phone, "Would you like to book a free consultation call?", ["Yes, Book a Call", "View Other Services"]);
                await updateConvo(phone, { state: "booking_ask" });
                return res.status(200).json({ success: true });
            }

            // Service match nahi hua
            const aiReply = await getAIReply(message, "User is selecting a service from " + convo.selected_category);
            await sendText(phone, aiReply);
            return res.status(200).json({ success: true });
        }

        // STATE: booking_ask
        if (convo.state === "booking_ask") {
            const lower = message.toLowerCase();

            if (lower.includes("yes") || lower.includes("book")) {
                await sendText(phone, "Great! 📅 Please type your preferred date for the consultation call.\n\n*Format: 20 June 2026*\n\n(Only future dates accepted. We are available Mon-Sat)");
                await updateConvo(phone, { state: "date_selection" });
                return res.status(200).json({ success: true });
            }

            if (lower.includes("other") || lower.includes("service") || lower.includes("view")) {
                await sendList(phone,
                    "Please select a treatment category:",
                    "Our Services",
                    [{
                        title: "Treatment Categories",
                        rows: Object.keys(CATEGORIES).map(cat => ({
                            title: cat,
                            description: CATEGORIES[cat].length + " procedures available"
                        }))
                    }],
                    "Celebre Aesthetics"
                );
                await updateConvo(phone, { state: "category_selection", selected_category: "", selected_service: "" });
                return res.status(200).json({ success: true });
            }

            // Default
            const aiReply = await getAIReply(message, "User was asked to book a call for " + convo.selected_service);
            await sendText(phone, aiReply);
            return res.status(200).json({ success: true });
        }
        // STATE: date_selection
        if (convo.state === "date_selection") {
            if (isValidFutureDate(message)) {
                const parsed = new Date(message);
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                const formatted = days[parsed.getDay()] + ", " + parsed.getDate() + " " + months[parsed.getMonth()] + " " + parsed.getFullYear();

                await updateConvo(phone, { state: "time_selection", booking_date: formatted });

                await sendList(phone,
                    "📅 Date selected: *" + formatted + "*\n\n🕐 Please select a time slot:",
                    "Available Slots",
                    [{
                        title: "Time Slots (11AM - 8PM)",
                        rows: TIME_SLOTS.map(slot => ({
                            title: slot,
                            description: "Available"
                        }))
                    }],
                    "Select Time"
                );
                return res.status(200).json({ success: true });
            } else {
                await sendText(phone, "❌ Please enter a valid future date.\n\n*Format: 20 June 2026*\n\nPast dates are not accepted.");
                return res.status(200).json({ success: true });
            }
        }

        // STATE: time_selection
        if (convo.state === "time_selection") {
            const slot = findTimeSlot(message);

            if (slot) {
                await updateConvo(phone, { state: "confirmed", booking_time: slot });

                const confirmMsg = "✅ *Booking Confirmed!*\n\n" +
                    "🏥 Service: *" + convo.selected_service + "*\n" +
                    "📅 Date: *" + convo.booking_date + "*\n" +
                    "🕐 Time: *" + slot + "*\n\n" +
                    "Our specialist will call you at your chosen time.\n\n" +
                    "Thank you for choosing *Celebre Aesthetics*! 💜\n\n" +
                    "📍 Surat | Ahmedabad | Rajkot\n" +
                    "🌐 celebre.in\n\n" +
                    "— Celebre Aesthetics Team";

                await sendText(phone, confirmMsg);
                return res.status(200).json({ success: true });
            } else {
                await sendText(phone, "Please select a valid time from the list (11:00 AM to 8:00 PM).");
                return res.status(200).json({ success: true });
            }
        }

        // STATE: confirmed or any other
        if (convo.state === "confirmed") {
            await sendText(phone, "Thank you! Your booking is confirmed. 💜\n\nIf you need anything else, just say *Hi* to start again!");
            return res.status(200).json({ success: true });
        }

        // DEFAULT — AI handles
        const aiReply = await getAIReply(message, "General query");
        await sendText(phone, aiReply);
        await sendButtons(phone, "How can I help you further?", ["View Services", "Book a Call"]);
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(200).json({ success: true });
    }
});

module.exports = router;