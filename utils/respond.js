// utils/respond.js

const axios = require("axios");

// 11za ko text message bhejo
async function sendText(phone, message) {
    try {
        await axios.post(
            `${process.env.ELZA_API_URL}/send-message`,
            {
                phone: phone,
                message: message
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.ELZA_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log("Message sent to:", phone);
    } catch (error) {
        console.error("Send message error:", error.message);
    }
}

// 11za ko buttons wala message bhejo
async function sendButtons(phone, message, buttons) {
    try {
        await axios.post(
            `${process.env.ELZA_API_URL}/send-interactive`,
            {
                phone: phone,
                message: message,
                buttons: buttons.map((btn, i) => ({
                    id: `btn_${i}`,
                    title: btn
                }))
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.ELZA_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log("Buttons sent to:", phone);
    } catch (error) {
        console.error("Send buttons error:", error.message);
    }
}

module.exports = { sendText, sendButtons };