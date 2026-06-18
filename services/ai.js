// services/ai.js - Gemini API

const axios = require("axios");
const { celebreData } = require("./celebreData");

async function getAIReply(userMessage) {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `${celebreData.systemPrompt}\n\nUser: ${userMessage}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 200,
                    temperature: 0.7
                }
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Gemini Error:", error.message);
        return "I'm sorry, I couldn't process that right now. Please contact us at celebre.in";
    }
}

module.exports = { getAIReply };