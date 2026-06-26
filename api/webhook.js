// api/webhook.js - Full AI Conversation Handler with Language + Forms

const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation");
const { getAIReply } = require("../services/ai");
const { sendText, sendButtons, sendList } = require("../utils/respond");

// ============ CATEGORIES ============
const CATEGORIES = {
    "Hair Treatment": [
        { title: "Hair Transplant", description: "FUE scar-free method" },
        { title: "Hair Growth", description: "PRP & mesotherapy" },
        { title: "Laser Hair Removal", description: "Permanent hair reduction" }
    ],
    "Face Treatment": [
        { title: "Rhinoplasty", description: "Nose reshaping" },
        { title: "Lip Augmentation", description: "Fuller lips" },
        { title: "Lip Reduction", description: "Lip size reduction" },
        { title: "Facial Rejuvenation", description: "Anti-aging treatments" },
        { title: "Brow Lift", description: "Forehead & brow lift" },
        { title: "Dimple Creation", description: "Natural dimples" },
        { title: "Jawline Creation", description: "Defined jawline" },
        { title: "Double Chin Reduction", description: "Chin fat removal" },
        { title: "Otoplasty", description: "Ear correction" }
    ],
    "Breast Treatment": [
        { title: "Breast Augmentation", description: "Size enhancement" },
        { title: "Breast Reduction", description: "Size reduction" },
        { title: "Breast Lift", description: "Lift & reshape" },
        { title: "Axillary Breast Removal", description: "Armpit tissue removal" },
        { title: "Breast Swelling Excision", description: "Lump removal" }
    ],
    "Body Treatment": [
        { title: "Mommy Makeover", description: "Post-pregnancy restore" },
        { title: "Genital Rejuvenation", description: "Intimate rejuvenation" },
        { title: "Liposuction", description: "Fat removal" },
        { title: "Abdominoplasty", description: "Tummy tuck" },
        { title: "Gender Reassignment M-F", description: "Male to female" },
        { title: "Gender Reassignment F-M", description: "Female to male" }
    ],
    "Gynecomastia": [
        { title: "Gynecomastia Surgery", description: "Male breast reduction" }
    ],
    "Skin Treatment": [
        { title: "Skin Rejuvenation", description: "Youthful glow" },
        { title: "Acne Scar Treatment", description: "Scar removal" },
        { title: "Skin Pigmentation", description: "Dark spots treatment" },
        { title: "Scar Revision", description: "Scar improvement" },
        { title: "Vitiligo", description: "Vitiligo treatment" }
    ]
};

// ============ FORM CONFIG PER CATEGORY ============
const FORM_CONFIG = {
    "Hair Treatment": {
        needsWeight: false,
        needsHeight: false,
        specificField: "hair_loss_stage",
        specificOptions: ["Mild", "Moderate", "Severe"],
        photoRequest: true,
        photoType: "hair"
    },
    "Face Treatment": {
        needsWeight: false,
        needsHeight: false,
        specificField: "nose_concern",
        specificOptions: null,
        photoRequest: true,
        photoType: "face"
    },
    "Breast Treatment": {
        needsWeight: true,
        needsHeight: true,
        specificField: "desired_procedure",
        specificOptions: ["Enhancement", "Reduction", "Lift"],
        photoRequest: false,
        photoType: null
    },
    "Body Treatment": {
        needsWeight: true,
        needsHeight: true,
        specificField: "treatment_areas",
        specificOptions: null,
        photoRequest: false,
        photoType: null
    },
    "Gynecomastia": {
        needsWeight: true,
        needsHeight: true,
        specificField: null,
        specificOptions: null,
        photoRequest: true,
        photoType: "chest"
    },
    "Skin Treatment": {
        needsWeight: false,
        needsHeight: false,
        specificField: "skin_concern",
        specificOptions: null,
        photoRequest: true,
        photoType: "skin"
    }
};

// ============ MULTILINGUAL MESSAGES ============
const MSGS = {
    lang_ask: {
        en: "Please select your preferred language:",
        hi: "Please select your preferred language:",
        gu: "Please select your preferred language:"
    },
    welcome: {
        en: "👋 Hi {name}! Welcome to *Celebre Aesthetics* 🌸\n\nWe are Gujarat's leading aesthetic surgery & cosmetic treatment clinic with centers in Surat, Ahmedabad & Rajkot.\n\nI can help you explore our treatments and book a free consultation call.",
        hi: "👋 नमस्ते {name}! *Celebre Aesthetics* में आपका स्वागत है 🌸\n\nहम गुजरात की अग्रणी एस्थेटिक सर्जरी और कॉस्मेटिक ट्रीटमेंट क्लिनिक हैं — सूरत, अहमदाबाद और राजकोट में।\n\nमैं आपकी ट्रीटमेंट जानने और फ्री कंसल्टेशन बुक करने में मदद कर सकता/सकती हूँ।",
        gu: "👋 નમસ્તે {name}! *Celebre Aesthetics* માં આપનું સ્વાગત છે 🌸\n\nઅમે ગુજરાતની અગ્રણી એસ્થેટિક સર્જરી અને કોસ્મેટિક ટ્રીટમેન્ટ ક્લિનિક છીએ — સુરત, અમદાવાદ અને રાજકોટમાં.\n\nહું તમને ટ્રીટમેન્ટ વિશે જાણવા અને ફ્રી કન્સલ્ટેશન બુક કરવામાં મદદ કરી શકું છું."
    },
    select_category: {
        en: "Please select a treatment category to explore:",
        hi: "कृपया एक ट्रीटमेंट कैटेगरी चुनें:",
        gu: "કૃપા કરીને એક ટ્રીટમેન્ટ કેટેગરી પસંદ કરો:"
    },
    select_service: {
        en: "Here are our {cat} options. Please select one:",
        hi: "यहाँ हमारे {cat} के विकल्प हैं। कृपया एक चुनें:",
        gu: "અહીં અમારા {cat} ના વિકલ્પો છે. કૃપા કરીને એક પસંદ કરો:"
    },
    book_ask: {
        en: "Would you like to book a free consultation call?",
        hi: "क्या आप फ्री कंसल्टेशन कॉल बुक करना चाहेंगे?",
        gu: "શું તમે ફ્રી કન્સલ્ટેશન કૉલ બુક કરવા માંગો છો?"
    },
    ask_name: {
        en: "👤 Please share your *Name*:",
        hi: "👤 कृपया अपना *नाम* बताएं:",
        gu: "👤 કૃપા કરીને તમારું *નામ* જણાવો:"
    },
    ask_city: {
        en: "📍 Please share your *City / Location*:",
        hi: "📍 कृपया अपना *शहर / लोकेशन* बताएं:",
        gu: "📍 કૃપા કરીને તમારું *શહેર / સ્થાન* જણાવો:"
    },
    ask_age: {
        en: "🎂 Please share your *Age*:",
        hi: "🎂 कृपया अपनी *उम्र* बताएं:",
        gu: "🎂 કૃપા કરીને તમારી *ઉંમર* જણાવો:"
    },
    ask_weight: {
        en: "⚖️ Please share your *Approx. Weight* (in kg):",
        hi: "⚖️ कृपया अपना *अनुमानित वज़न* (kg में) बताएं:",
        gu: "⚖️ કૃપા કરીને તમારું *અંદાજિત વજન* (kg માં) જણાવો:"
    },
    ask_height: {
        en: "📏 Please share your *Height*:",
        hi: "📏 कृपया अपनी *ऊंचाई* बताएं:",
        gu: "📏 કૃપા કરીને તમારી *ઊંચાઈ* જણાવો:"
    },
    ask_specific: {
        hair_loss_stage: {
            en: "💇 Please describe your *Hair Loss Stage*:",
            hi: "💇 कृपया अपना *हेयर लॉस स्टेज* बताएं:",
            gu: "💇 કૃપા કરીને તમારો *હેર લોસ સ્ટેજ* જણાવો:"
        },
        nose_concern: {
            en: "🎯 Please describe your *Concern with your Nose* (Shape, Size, Bump, Breathing Issue, etc.):",
            hi: "🎯 कृपया अपनी *नाक से संबंधित समस्या* बताएं (आकार, साइज़, उभार, सांस की समस्या आदि):",
            gu: "🎯 કૃપા કરીને તમારી *નાક સંબંધિત સમસ્યા* જણાવો (આકાર, સાઈઝ, બ્રીથિંગ ઈશ્યુ વગેરે):"
        },
        desired_procedure: {
            en: "🎯 Please select your *Desired Procedure*:",
            hi: "🎯 कृपया अपनी *इच्छित प्रक्रिया* चुनें:",
            gu: "🎯 કૃપા કરીને તમારી *ઈચ્છિત પ્રક્રિયા* પસંદ કરો:"
        },
        treatment_areas: {
            en: "📍 Please mention the *Area(s) You Want Treated* (Abdomen, Waist, Thighs, Arms, Chin, etc.):",
            hi: "📍 कृपया बताएं *किन हिस्सों का इलाज* चाहते हैं (पेट, कमर, जांघ, बाहें, ठुड्डी आदि):",
            gu: "📍 કૃપા કરીને જણાવો *કયા ભાગની સારવાર* કરાવવા માંગો છો (પેટ, કમર, જાંઘ, હાથ, ચિન વગેરે):"
        },
        skin_concern: {
            en: "🎯 Please describe your *Skin Concern* (Acne, Acne Scars, Pigmentation, Dark Spots, Anti-Aging, etc.):",
            hi: "🎯 कृपया अपनी *त्वचा की समस्या* बताएं (एक्ने, दाग, पिगमेंटेशन, डार्क स्पॉट्स, एंटी-एजिंग आदि):",
            gu: "🎯 કૃપા કરીને તમારી *ત્વચા સંબંધિત સમસ્યા* જણાવો (એક્ને, ડાઘ, પિગમેન્ટેશન, ડાર્ક સ્પોટ્સ, એન્ટી-એજિંગ વગેરે):"
        }
    },
    ask_photos: {
        hair: {
            en: "📸 Please share *2-3 Clear Hair Photos* (Front, Top & Back):",
            hi: "📸 कृपया *2-3 साफ बालों की फोटो* भेजें (आगे, ऊपर और पीछे):",
            gu: "📸 કૃપા કરીને *2-3 સ્પષ્ટ વાળના ફોટો* મોકલો (આગળ, ઉપર અને પાછળ):"
        },
        face: {
            en: "📸 Please share *Front & Side Profile Photos*:",
            hi: "📸 कृपया *सामने और साइड प्रोफाइल फोटो* भेजें:",
            gu: "📸 કૃપા કરીને *આગળ અને સાઈડ પ્રોફાઈલ ફોટો* મોકલો:"
        },
        chest: {
            en: "📸 Please share *2-3 Clear Chest Photos*:",
            hi: "📸 कृपया *2-3 साफ छाती की फोटो* भेजें:",
            gu: "📸 કૃપા કરીને *2-3 સ્પષ્ટ છાતીના ફોટો* મોકલો:"
        },
        skin: {
            en: "📸 Please share *2-3 Clear Photos of the Concerned Area*:",
            hi: "📸 कृपया *प्रभावित क्षेत्र की 2-3 साफ फोटो* भेजें:",
            gu: "📸 કૃપા કરીને *અસરગ્રસ્ત વિસ્તારના 2-3 સ્પષ્ટ ફોટો* મોકલો:"
        }
    },
    ask_call_time: {
        en: "⏰ Please share your *Preferred Time for a Call* (11 AM to 8 PM):",
        hi: "⏰ कृपया *कॉल के लिए पसंदीदा समय* बताएं (सुबह 11 बजे से रात 8 बजे तक):",
        gu: "⏰ કૃપા કરીને *કૉલ માટે પસંદગીનો સમય* જણાવો (સવારે 11 થી રાત્રે 8 સુધી):"
    },
    confirmed: {
        en: "✅ *Consultation Request Received!*\n\n🏥 Service: *{service}*\n👤 Name: *{name}*\n📍 City: *{city}*\n🎂 Age: *{age}*\n{extra}⏰ Call Time: *{time}*\n\nOur specialist will contact you soon.\n\nThank you for choosing *Celebre Aesthetics*! 💜\n\n📍 Surat | Ahmedabad | Rajkot\n🌐 celebre.in",
        hi: "✅ *कंसल्टेशन रिक्वेस्ट मिल गई!*\n\n🏥 सेवा: *{service}*\n👤 नाम: *{name}*\n📍 शहर: *{city}*\n🎂 उम्र: *{age}*\n{extra}⏰ कॉल का समय: *{time}*\n\nहमारे विशेषज्ञ जल्द ही आपसे संपर्क करेंगे।\n\n*Celebre Aesthetics* चुनने के लिए धन्यवाद! 💜\n\n📍 सूरत | अहमदाबाद | राजकोट\n🌐 celebre.in",
        gu: "✅ *કન્સલ્ટેશન રિક્વેસ્ટ મળી ગઈ!*\n\n🏥 સેવા: *{service}*\n👤 નામ: *{name}*\n📍 શહેર: *{city}*\n🎂 ઉંમર: *{age}*\n{extra}⏰ કૉલનો સમય: *{time}*\n\nઅમારા નિષ્ણાત ટૂંક સમયમાં તમારો સંપર્ક કરશે.\n\n*Celebre Aesthetics* પસંદ કરવા બદલ આભાર! 💜\n\n📍 સુરત | અમદાવાદ | રાજકોટ\n🌐 celebre.in"
    },
    btn_book: { en: "Yes, Book a Call", hi: "हाँ, कॉल बुक करें", gu: "હા, કૉલ બુક કરો" },
    btn_other: { en: "View Other Services", hi: "अन्य सेवाएं देखें", gu: "અન્ય સેવાઓ જુઓ" },
    btn_ask: { en: "Ask a Question", hi: "सवाल पूछें", gu: "પ્રશ્ન પૂછો" }
};

// ============ HELPERS ============
function msg(key, lang, replacements) {
    let text = "";
    if (typeof key === "object") {
        text = key[lang] || key["en"] || "";
    } else {
        text = MSGS[key]?.[lang] || MSGS[key]?.["en"] || "";
    }
    if (replacements) {
        for (const k in replacements) {
            text = text.replace(new RegExp("\\{" + k + "\\}", "g"), replacements[k]);
        }
    }
    return text;
}

async function getConvo(phone, name) {
    let convo = await Conversation.findOne({ phone });
    if (!convo) {
        convo = new Conversation({ phone, name, state: "language_selection" });
        await convo.save();
    }
    return convo;
}

async function updateConvo(phone, data) {
    data.updated_at = new Date();
    await Conversation.findOneAndUpdate({ phone }, data, { upsert: true });
}

function isGreeting(m) {
    return ["hi", "hello", "hey", "hii", "hiii", "start", "helo", "namaste", "celebre", "celebre aesthetics"].includes(m.toLowerCase());
}

function findCategory(m) {
    const lower = m.toLowerCase();
    for (const cat of Object.keys(CATEGORIES)) {
        if (lower.includes(cat.toLowerCase().split(" ")[0])) return cat;
    }
    return null;
}

function findService(m) {
    const lower = m.toLowerCase();
    for (const cat of Object.keys(CATEGORIES)) {
        for (const svc of CATEGORIES[cat]) {
            if (lower.includes(svc.title.toLowerCase()) || svc.title.toLowerCase().includes(lower)) {
                return { category: cat, service: svc.title };
            }
        }
    }
    return null;
}

function detectLanguage(m) {
    const lower = m.toLowerCase();
    if (lower.includes("english") || lower === "en") return "en";
    if (lower.includes("hindi") || lower.includes("हिंदी") || lower === "hi") return "hi";
    if (lower.includes("gujarati") || lower.includes("ગુજરાતી") || lower === "gu") return "gu";
    return null;
}

function getFormConfig(category) {
    return FORM_CONFIG[category] || FORM_CONFIG["Body Treatment"];
}

function getNextFormState(currentState, category) {
    const config = getFormConfig(category);
    const flow = ["form_name", "form_city", "form_age"];
    if (config.needsWeight) flow.push("form_weight");
    if (config.needsHeight) flow.push("form_height");
    if (config.specificField) flow.push("form_specific");
    if (config.photoRequest) flow.push("form_photos");
    flow.push("form_call_time");
    flow.push("confirmed");

    const idx = flow.indexOf(currentState);
    if (idx === -1) return flow[0];
    if (idx + 1 < flow.length) return flow[idx + 1];
    return "confirmed";
}

// ============ MAIN HANDLER ============
router.post("/", async (req, res) => {
    try {
        const body = req.body;
        const phone = body.from || "";
        const senderName = body.whatsapp?.senderName || "";
        const message = (
            body.content?.text ||
            body.UserResponse ||
            body.whatsapp?.title ||
            body.interactive?.title ||
            body.interactive?.list_reply?.title ||
            body.interactive?.button_reply?.title ||
            body.listReply?.title ||
            body.buttonReply?.title ||
            ""
        ).trim();

        console.log("Incoming:", phone, message);
        console.log("Full body:", JSON.stringify(body));

        if (!phone || !message) {
            return res.status(200).json({ success: true });
        }

        // Test mode
        const TEST_NUMBERS = ["917820870519"];
        if (!TEST_NUMBERS.includes(phone)) {
            console.log("Skipping non-test number:", phone);
            return res.status(200).json({ success: true });
        }

        const convo = await getConvo(phone, senderName);
        const lang = convo.language || "en";

        // ===== RESET on greeting =====
        if (isGreeting(message)) {
            await updateConvo(phone, {
                state: "language_selection", language: "", selected_category: "", selected_service: "",
                form_name: "", form_city: "", form_age: "", form_weight: "", form_height: "",
                form_specific: "", form_photos: "", form_call_time: ""
            });

            await sendButtons(phone,
                "Please select your preferred language / कृपया अपनी भाषा चुनें / કૃપા કરીને તમારી ભાષા પસંદ કરો",
                ["English", "हिंदी", "ગુજરાતી"],
                "Celebre Aesthetics"
            );
            return res.status(200).json({ success: true });
        }

        // ===== LANGUAGE SELECTION =====
        if (convo.state === "language_selection") {
            const detectedLang = detectLanguage(message);
            if (detectedLang) {
                await updateConvo(phone, { language: detectedLang, state: "category_selection" });

                await sendText(phone, msg("welcome", detectedLang, { name: senderName || "there" }));

                await sendList(phone,
                    msg("select_category", detectedLang),
                    "Our Services",
                    [{
                        title: "Treatment Categories",
                        rows: Object.keys(CATEGORIES).map(cat => ({
                            title: cat,
                            description: CATEGORIES[cat].length + " procedures"
                        }))
                    }],
                    "Celebre Aesthetics"
                );
                return res.status(200).json({ success: true });
            }

            await sendButtons(phone,
                "Please select a language / कृपया भाषा चुनें / કૃપા કરીને ભાષા પસંદ કરો",
                ["English", "हिंदी", "ગુજરાતી"],
                "Celebre Aesthetics"
            );
            return res.status(200).json({ success: true });
        }

        // ===== CATEGORY SELECTION =====
        if (convo.state === "category_selection") {
            const cat = findCategory(message) || message;
            const services = CATEGORIES[cat];

            if (services) {
                if (cat === "Gynecomastia") {
                    await updateConvo(phone, { state: "service_info", selected_category: cat, selected_service: "Gynecomastia Surgery" });
                    const aiLang = lang === "hi" ? "Hindi" : lang === "gu" ? "Gujarati" : "English";
                    const aiInfo = await getAIReply("Tell me about Gynecomastia surgery at Celebre Aesthetics. Reply in " + aiLang, "User selected Gynecomastia");
                    await sendText(phone, "ℹ️ *Gynecomastia Surgery*\n\n" + aiInfo);
                    await sendButtons(phone, msg("book_ask", lang), [msg("btn_book", lang), msg("btn_other", lang), msg("btn_ask", lang)], "Celebre Aesthetics");
                    await updateConvo(phone, { state: "booking_ask" });
                } else {
                    await sendList(phone,
                        msg("select_service", lang, { cat: cat }),
                        cat.split(" ")[0] + " Services",
                        [{ title: cat, rows: services }],
                        cat
                    );
                    await updateConvo(phone, { state: "service_selection", selected_category: cat });
                }
                return res.status(200).json({ success: true });
            }

            const aiLang = lang === "hi" ? "Hindi" : lang === "gu" ? "Gujarati" : "English";
            const aiReply = await getAIReply(message + ". Reply in " + aiLang, "User is on category selection");
            await sendText(phone, aiReply);
            return res.status(200).json({ success: true });
        }

        // ===== SERVICE SELECTION =====
        if (convo.state === "service_selection") {
            const svc = findService(message);
            if (svc) {
                await updateConvo(phone, { state: "service_info", selected_service: svc.service });
                const aiLang = lang === "hi" ? "Hindi" : lang === "gu" ? "Gujarati" : "English";
                const aiInfo = await getAIReply("Tell me about " + svc.service + " at Celebre Aesthetics. Reply in " + aiLang, "User selected " + svc.service);
                await sendText(phone, "ℹ️ *" + svc.service + "*\n\n" + aiInfo);
                await sendButtons(phone, msg("book_ask", lang), [msg("btn_book", lang), msg("btn_other", lang), msg("btn_ask", lang)], "Celebre Aesthetics");
                await updateConvo(phone, { state: "booking_ask" });
                return res.status(200).json({ success: true });
            }

            const aiLang = lang === "hi" ? "Hindi" : lang === "gu" ? "Gujarati" : "English";
            const aiReply = await getAIReply(message + ". Reply in " + aiLang, "User selecting service from " + convo.selected_category);
            await sendText(phone, aiReply);
            return res.status(200).json({ success: true });
        }

        // ===== BOOKING ASK =====
        if (convo.state === "booking_ask") {
            const lower = message.toLowerCase();
            if (lower.includes("yes") || lower.includes("book") || lower.includes("हाँ") || lower.includes("હા")) {
                await sendText(phone, msg("ask_name", lang));
                await updateConvo(phone, { state: "form_name" });
                return res.status(200).json({ success: true });
            }
            if (lower.includes("other") || lower.includes("service") || lower.includes("view") || lower.includes("अन्य") || lower.includes("અન્ય")) {
                await sendList(phone, msg("select_category", lang), "Our Services",
                    [{ title: "Treatment Categories", rows: Object.keys(CATEGORIES).map(cat => ({ title: cat, description: CATEGORIES[cat].length + " procedures" })) }],
                    "Celebre Aesthetics"
                );
                await updateConvo(phone, { state: "category_selection", selected_category: "", selected_service: "" });
                return res.status(200).json({ success: true });
            }
            if (lower.includes("ask") || lower.includes("question") || lower.includes("सवाल") || lower.includes("પ્રશ્ન")) {
                const langName = lang === "hi" ? "Hindi" : lang === "gu" ? "Gujarati" : "English";
                await sendText(phone, lang === "en" ? "Sure! Ask anything about " + (convo.selected_service || "our treatments") + " 😊" : lang === "hi" ? "ज़रूर! " + (convo.selected_service || "हमारी सेवाओं") + " के बारे में कुछ भी पूछें 😊" : "ચોક્કસ! " + (convo.selected_service || "અમારી સેવાઓ") + " વિશે કંઈપણ પૂછો 😊");
                await updateConvo(phone, { state: "asking_question" });
                return res.status(200).json({ success: true });
            }

            const aiLang = lang === "hi" ? "Hindi" : lang === "gu" ? "Gujarati" : "English";
            const aiReply = await getAIReply(message + ". Reply in " + aiLang, "User was asked to book for " + convo.selected_service);
            await sendText(phone, aiReply);
            return res.status(200).json({ success: true });
        }

        // ===== ASKING QUESTION =====
        if (convo.state === "asking_question") {
            const aiLang = lang === "hi" ? "Hindi" : lang === "gu" ? "Gujarati" : "English";
            const aiReply = await getAIReply(message + ". Reply in " + aiLang, "User asking about " + (convo.selected_service || "treatments"));
            await sendText(phone, aiReply);
            await sendButtons(phone, lang === "en" ? "Anything else?" : lang === "hi" ? "कुछ और?" : "બીજું કંઈ?",
                [msg("btn_book", lang), msg("btn_other", lang), msg("btn_ask", lang)], "Celebre Aesthetics");
            await updateConvo(phone, { state: "booking_ask" });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: NAME =====
        if (convo.state === "form_name") {
            await updateConvo(phone, { form_name: message });
            await sendText(phone, msg("ask_city", lang));
            await updateConvo(phone, { state: "form_city" });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: CITY =====
        if (convo.state === "form_city") {
            await updateConvo(phone, { form_city: message });
            await sendText(phone, msg("ask_age", lang));
            await updateConvo(phone, { state: "form_age" });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: AGE =====
        if (convo.state === "form_age") {
            await updateConvo(phone, { form_age: message });
            const config = getFormConfig(convo.selected_category);
            const nextState = getNextFormState("form_age", convo.selected_category);

            if (nextState === "form_weight") {
                await sendText(phone, msg("ask_weight", lang));
            } else if (nextState === "form_specific") {
                const sf = config.specificField;
                if (config.specificOptions) {
                    await sendButtons(phone, msg(MSGS.ask_specific[sf], lang), config.specificOptions, "Celebre Aesthetics");
                } else {
                    await sendText(phone, msg(MSGS.ask_specific[sf], lang));
                }
            } else if (nextState === "form_photos") {
                await sendText(phone, msg(MSGS.ask_photos[config.photoType], lang));
            } else if (nextState === "form_call_time") {
                await sendText(phone, msg("ask_call_time", lang));
            }
            await updateConvo(phone, { state: nextState });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: WEIGHT =====
        if (convo.state === "form_weight") {
            await updateConvo(phone, { form_weight: message });
            const config = getFormConfig(convo.selected_category);
            const nextState = getNextFormState("form_weight", convo.selected_category);

            if (nextState === "form_height") {
                await sendText(phone, msg("ask_height", lang));
            } else if (nextState === "form_specific") {
                const sf = config.specificField;
                if (config.specificOptions) {
                    await sendButtons(phone, msg(MSGS.ask_specific[sf], lang), config.specificOptions, "Celebre Aesthetics");
                } else {
                    await sendText(phone, msg(MSGS.ask_specific[sf], lang));
                }
            } else if (nextState === "form_photos") {
                await sendText(phone, msg(MSGS.ask_photos[config.photoType], lang));
            } else if (nextState === "form_call_time") {
                await sendText(phone, msg("ask_call_time", lang));
            }
            await updateConvo(phone, { state: nextState });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: HEIGHT =====
        if (convo.state === "form_height") {
            await updateConvo(phone, { form_height: message });
            const config = getFormConfig(convo.selected_category);
            const nextState = getNextFormState("form_height", convo.selected_category);

            if (nextState === "form_specific") {
                const sf = config.specificField;
                if (config.specificOptions) {
                    await sendButtons(phone, msg(MSGS.ask_specific[sf], lang), config.specificOptions, "Celebre Aesthetics");
                } else {
                    await sendText(phone, msg(MSGS.ask_specific[sf], lang));
                }
            } else if (nextState === "form_photos") {
                await sendText(phone, msg(MSGS.ask_photos[config.photoType], lang));
            } else if (nextState === "form_call_time") {
                await sendText(phone, msg("ask_call_time", lang));
            }
            await updateConvo(phone, { state: nextState });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: SPECIFIC =====
        if (convo.state === "form_specific") {
            await updateConvo(phone, { form_specific: message });
            const config = getFormConfig(convo.selected_category);
            const nextState = getNextFormState("form_specific", convo.selected_category);

            if (nextState === "form_photos") {
                await sendText(phone, msg(MSGS.ask_photos[config.photoType], lang));
            } else if (nextState === "form_call_time") {
                await sendText(phone, msg("ask_call_time", lang));
            }
            await updateConvo(phone, { state: nextState });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: PHOTOS =====
        if (convo.state === "form_photos") {
            await updateConvo(phone, { form_photos: "received" });
            await sendText(phone, msg("ask_call_time", lang));
            await updateConvo(phone, { state: "form_call_time" });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: CALL TIME =====
        if (convo.state === "form_call_time") {
            await updateConvo(phone, { form_call_time: message, state: "confirmed" });

            const config = getFormConfig(convo.selected_category);
            let extra = "";
            if (config.needsWeight) extra += "⚖️ " + (lang === "en" ? "Weight" : lang === "hi" ? "वज़न" : "વજન") + ": *" + convo.form_weight + "*\n";
            if (config.needsHeight) extra += "📏 " + (lang === "en" ? "Height" : lang === "hi" ? "ऊंचाई" : "ઊંચાઈ") + ": *" + convo.form_height + "*\n";
            if (config.specificField) extra += "🎯 " + (lang === "en" ? "Details" : lang === "hi" ? "विवरण" : "વિગતો") + ": *" + convo.form_specific + "*\n";
            if (config.photoRequest) extra += "📸 " + (lang === "en" ? "Photos" : lang === "hi" ? "फोटो" : "ફોટો") + ": *" + (lang === "en" ? "Received" : lang === "hi" ? "प्राप्त" : "પ્રાપ્ત") + "*\n";

            const confirmText = msg("confirmed", lang, {
                service: convo.selected_service,
                name: convo.form_name,
                city: convo.form_city,
                age: convo.form_age,
                extra: extra,
                time: message
            });

            await sendText(phone, confirmText);
            return res.status(200).json({ success: true });
        }

        // ===== CONFIRMED =====
        if (convo.state === "confirmed") {
            const t = lang === "en" ? "Thank you! Your request is confirmed. 💜\nSay *Celebre* to start again!" :
                lang === "hi" ? "धन्यवाद! आपकी रिक्वेस्ट कन्फर्म है। 💜\nफिर से शुरू करने के लिए *Celebre* भेजें!" :
                    "આભાર! તમારી રિક્વેસ્ટ કન્ફર્મ છે. 💜\nફરીથી શરૂ કરવા *Celebre* મોકલો!";
            await sendText(phone, t);
            return res.status(200).json({ success: true });
        }

        // ===== DEFAULT =====
        const aiLang = lang === "hi" ? "Hindi" : lang === "gu" ? "Gujarati" : "English";
        const aiReply = await getAIReply(message + ". Reply in " + aiLang, "General query");
        await sendText(phone, aiReply);
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(200).json({ success: true });
    }
});

module.exports = router;