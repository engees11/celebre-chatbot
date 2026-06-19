// utils/respond.js - 11za API

const axios = require("axios");

const AUTH_TOKEN = process.env.ELZA_API_KEY;
const ORIGIN = "https://celebre.in/";

// Simple text bhejo
async function sendText(phone, message) {
    try {
        await axios.post("https://api.11za.in/apis/sendMessage/sendMessages", {
            sendto: phone,
            authToken: AUTH_TOKEN,
            originWebsite: ORIGIN,
            contentType: "text",
            text: message
        });
        console.log("Text sent to:", phone);
    } catch (err) {
        console.error("sendText error:", err.response?.data || err.message);
    }
}

// Buttons bhejo (max 3)
async function sendButtons(phone, bodyText, buttons, headerText, footerText) {
    try {
        const btnArray = buttons.slice(0, 3).map((btn, i) => ({
            type: "reply",
            reply: {
                payload: "btn_" + i + "_" + Date.now(),
                title: btn.substring(0, 20)
            }
        }));

        await axios.post("https://api.11za.in/apis/listMassage/sendListMessage", {
            to: phone,
            authToken: AUTH_TOKEN,
            contentType: "interactive",
            interactive: {
                subType: "buttons",
                header: headerText ? { type: "text", text: headerText.substring(0, 60) } : { type: "none" },
                body: { type: "text", text: bodyText.substring(0, 1024) },
                footer: { type: "text", text: (footerText || "Celebre Aesthetics").substring(0, 60) },
                buttons: btnArray
            }
        });
        console.log("Buttons sent to:", phone);
    } catch (err) {
        console.error("sendButtons error:", err.response?.data || err.message);
    }
}

// List bhejo (max 10 items per section)
async function sendList(phone, bodyText, listTitle, sections, headerText, footerText) {
    try {
        const formattedSections = sections.map(section => ({
            title: (section.title || "Options").substring(0, 24),
            rows: section.rows.slice(0, 10).map((row, i) => ({
                payload: "row_" + i + "_" + Date.now(),
                title: row.title.substring(0, 24),
                description: (row.description || "").substring(0, 72)
            }))
        }));

        await axios.post("https://api.11za.in/apis/listMassage/sendListMessage", {
            to: phone,
            authToken: AUTH_TOKEN,
            contentType: "interactive",
            interactive: {
                subType: "list",
                header: headerText ? { type: "text", text: headerText.substring(0, 60) } : { type: "none" },
                body: { type: "text", text: bodyText.substring(0, 1024) },
                footer: { type: "text", text: (footerText || "Celebre Aesthetics").substring(0, 60) },
                list: {
                    title: (listTitle || "Select").substring(0, 20),
                    sections: formattedSections
                }
            }
        });
        console.log("List sent to:", phone);
    } catch (err) {
        console.error("sendList error:", err.response?.data || err.message);
    }
}

module.exports = { sendText, sendButtons, sendList };