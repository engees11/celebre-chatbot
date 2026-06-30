// models/conversation.js

const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    language: { type: String, default: "" },
    state: { type: String, default: "language_selection" },
    selected_category: { type: String, default: "" },
    selected_service: { type: String, default: "" },
    // Form fields (legacy, not used in new flow but kept for safety)
    form_name: { type: String, default: "" },
    form_city: { type: String, default: "" },
    form_age: { type: String, default: "" },
    form_weight: { type: String, default: "" },
    form_height: { type: String, default: "" },
    form_specific: { type: String, default: "" },
    form_photos: { type: String, default: "" },
    form_call_time: { type: String, default: "" },
    booking_date: { type: String, default: "" },
    booking_date_raw: { type: String, default: "" },
    booking_time: { type: String, default: "" },
    // New dynamic question flow fields
    q_index: { type: Number, default: 0 },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Conversation", conversationSchema);