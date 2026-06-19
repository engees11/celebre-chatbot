// services/ai.js - Groq API

const axios = require("axios");

const SYSTEM_PROMPT = `You are the AI assistant for Celebre Aesthetics — a leading aesthetic surgery clinic in Gujarat, India (Surat, Ahmedabad, Rajkot).

Services: Hair (Transplant, Growth, Laser Removal), Face (Rhinoplasty, Lip Augmentation, Lip Reduction, Facial Rejuvenation, Brow Lift, Dimple Creation, Jawline Creation, Double Chin Reduction, Otoplasty), Breast (Augmentation, Reduction, Lift, Axillary Removal, Swelling Excision), Body (Mommy Makeover, Genital Rejuvenation, Liposuction, Abdominoplasty, Gender Reassignment M-F, Gender Reassignment F-M), Gynecomastia, Skin (Rejuvenation, Acne Scar, Pigmentation, Scar Revision, Vitiligo).

Rules:
1. Keep responses SHORT — 3-4 lines max
2. Be warm and professional
3. Medically accurate info
4. Never give pricing — say "specialist will discuss during free consultation"
5. Always respond in professional English only.
6. Always encourage booking free consultation
7. Timings: 11 AM to 8 PM
8. Website: celebre.in
9. Reply only in English.
10. Never use Hindi, Hinglish, Gujarati, or any regional language.`;

async function getAIReply(userMessage, context) {
    try {
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
        ];

        if (context) {
            messages.push({ role: "system", content: "Context: " + context });
        }

        messages.push({ role: "user", content: userMessage });

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.1-8b-instant",
                messages: messages,
                max_tokens: 250,
                temperature: 0.7
            },
            {
                headers: {
                    Authorization: "Bearer " + process.env.GROQ_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content;

    } catch (error) {
        console.error("AI Error:", error.message);
        return "Sorry, I couldn't process that. Please contact us at celebre.in or call for a free consultation.";
    }
}

module.exports = { getAIReply };