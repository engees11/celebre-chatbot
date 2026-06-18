// services/ai.js - Groq API

const axios = require("axios");
const { celebreData } = require("./celebreData");

async function getAIReply(userMessage) {
    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: celebreData.systemPrompt },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 200,
                temperature: 0.7
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content;

    } catch (error) {
        console.error("AI Error:", error.message);
        return "I'm sorry, I couldn't process that. Please contact us at celebre.in";
    }
}

module.exports = { getAIReply };