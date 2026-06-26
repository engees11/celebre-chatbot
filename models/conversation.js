// models/conversation.js

const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    language: { type: String, default: "" },
    state: { type: String, default: "language_selection" },
    selected_category: { type: String, default: "" },
    selected_service: { type: String, default: "" },
    // Form fields
    form_name: { type: String, default: "" },
    form_city: { type: String, default: "" },
    form_age: { type: String, default: "" },
    form_weight: { type: String, default: "" },
    form_height: { type: String, default: "" },
    form_specific: { type: String, default: "" },
    form_photos: { type: String, default: "" },
    form_call_time: { type: String, default: "" },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Conversation", conversationSchema);