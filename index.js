// index.js

const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const webhookRoute = require("./api/webhook");

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB cached connection for Vercel serverless
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        }).then(m => {
            console.log("MongoDB connected ✅");
            return m;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

// Connect before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("MongoDB error:", err.message);
        next();
    }
});

app.get("/", (req, res) => { res.send("Celebre Chatbot is running! 🌸"); });
app.use("/api/webhook", webhookRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log("Server running on port " + PORT); });

module.exports = app;