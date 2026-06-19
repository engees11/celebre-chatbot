// models/conversation.js

const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    state: { type: String, default: "welcome" },
    selected_category: { type: String, default: "" },
    selected_service: { type: String, default: "" },
    booking_date: { type: String, default: "" },
    booking_time: { type: String, default: "" },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Conversation", conversationSchema);