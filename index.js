// index.js

const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const webhookRoute = require("./api/webhook");

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected ✅"))
    .catch(err => console.error("MongoDB error:", err.message));

// Routes
app.get("/", (req, res) => {
    res.send("Celebre Chatbot is running! 🌸");
});

app.use("/api/webhook", webhookRoute);

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

module.exports = app;