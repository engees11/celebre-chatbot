// api/webhook.js - Full AI Conversation Handler v3

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

// ============ FORM CONFIG ============
const FORM_CONFIG = {
    "Hair Treatment": { needsWeight: false, needsHeight: false, specificField: "hair_loss_stage", specificOptions: ["Mild", "Moderate", "Severe"], photoRequest: true, photoType: "hair" },
    "Face Treatment": { needsWeight: false, needsHeight: false, specificField: "nose_concern", specificOptions: null, photoRequest: true, photoType: "face" },
    "Breast Treatment": { needsWeight: true, needsHeight: true, specificField: "desired_procedure", specificOptions: ["Enhancement", "Reduction", "Lift"], photoRequest: false, photoType: null },
    "Body Treatment": { needsWeight: true, needsHeight: true, specificField: "treatment_areas", specificOptions: null, photoRequest: false, photoType: null },
    "Gynecomastia": { needsWeight: true, needsHeight: true, specificField: null, specificOptions: null, photoRequest: true, photoType: "chest" },
    "Skin Treatment": { needsWeight: false, needsHeight: false, specificField: "skin_concern", specificOptions: null, photoRequest: true, photoType: "skin" }
};

// ============ MESSAGES ============
const MSGS = {
    welcome: {
        en: "👋 Hi {name}! Welcome to *Celebre Aesthetics* 🌸\n\nWe are Gujarat's leading aesthetic surgery & cosmetic treatment clinic with centers in Surat, Ahmedabad & Rajkot.\n\nI can help you explore our treatments and book a free consultation call.",
        hi: "👋 नमस्ते {name}! *Celebre Aesthetics* में आपका स्वागत है 🌸\n\nहम गुजरात की अग्रणी एस्थेटिक सर्जरी और कॉस्मेटिक ट्रीटमेंट क्लिनिक हैं — सूरत, अहमदाबाद और राजकोट में।\n\nमैं आपकी ट्रीटमेंट जानने और फ्री कंसल्टेशन बुक करने में मदद कर सकता/सकती हूँ।",
        gu: "👋 નમસ્તે {name}! *Celebre Aesthetics* માં આપનું સ્વાગત છે 🌸\n\nઅમે ગુજરાતની અગ્રણી એસ્થેટિક સર્જરી અને કોસ્મેટિક ટ્રીટમેન્ટ ક્લિનિક છીએ — સુરત, અમદાવાદ અને રાજકોટમાં.\n\nહું તમને ટ્રીટમેન્ટ વિશે જાણવા અને ફ્રી કન્સલ્ટેશન બુક કરવામાં મદદ કરી શકું છું."
    },
    select_category: { en: "Please select a treatment category to explore:", hi: "कृपया एक ट्रीटमेंट कैटेगरी चुनें:", gu: "કૃપા કરીને એક ટ્રીટમેન્ટ કેટેગરી પસંદ કરો:" },
    select_service: { en: "Here are our {cat} options. Please select one:", hi: "यहाँ हमारे {cat} के विकल्प हैं। कृपया एक चुनें:", gu: "અહીં અમારા {cat} ના વિકલ્પો છે. કૃપા કરીને એક પસંદ કરો:" },
    form_start: { en: "Great choice! To help our specialist prepare for your consultation, please answer a few quick questions. 📋", hi: "बढ़िया चुनाव! कंसल्टेशन के लिए कृपया कुछ सवालों के जवाब दें। 📋", gu: "સરસ પસંદગી! કન્સલ્ટેશન માટે કૃપા કરીને થોડા પ્રશ્નોના જવાબ આપો. 📋" },
    ask_name: { en: "👤 Please share your *Name*:", hi: "👤 कृपया अपना *नाम* बताएं:", gu: "👤 કૃપા કરીને તમારું *નામ* જણાવો:" },
    ask_city: { en: "📍 Please share your *City / Location*:", hi: "📍 कृपया अपना *शहर / लोकेशन* बताएं:", gu: "📍 કૃપા કરીને તમારું *શહેર / સ્થાન* જણાવો:" },
    ask_age: { en: "🎂 Please share your *Age*:", hi: "🎂 कृपया अपनी *उम्र* बताएं:", gu: "🎂 કૃપા કરીને તમારી *ઉંમર* જણાવો:" },
    ask_weight: { en: "⚖️ Please share your *Approx. Weight* (in kg):", hi: "⚖️ कृपया अपना *अनुमानित वज़न* (kg में) बताएं:", gu: "⚖️ કૃપા કરીને તમારું *અંદાજિત વજન* (kg માં) જણાવો:" },
    ask_height: { en: "📏 Please share your *Height*:", hi: "📏 कृपया अपनी *ऊंचाई* बताएं:", gu: "📏 કૃપા કરીને તમારી *ઊંચાઈ* જણાવો:" },
    ask_call_time: { en: "⏰ Please share your *Preferred Time for a Call* (11 AM to 8 PM):", hi: "⏰ कृपया *कॉल के लिए पसंदीदा समय* बताएं (सुबह 11 बजे से रात 8 बजे तक):", gu: "⏰ કૃપા કરીને *કૉલ માટે પસંદગીનો સમય* જણાવો (સવારે 11 થી રાત્રે 8 સુધી):" },
    ask_specific: {
        hair_loss_stage: { en: "💇 Please describe your *Hair Loss Stage*:", hi: "💇 कृपया अपना *हेयर लॉस स्टेज* बताएं:", gu: "💇 કૃપા કરીને તમારો *હેર લોસ સ્ટેજ* જણાવો:" },
        nose_concern: { en: "🎯 Please describe your *Concern with your Nose* (Shape, Size, Bump, Breathing Issue, etc.):", hi: "🎯 कृपया अपनी *नाक से संबंधित समस्या* बताएं (आकार, साइज़, उभार, सांस की समस्या आदि):", gu: "🎯 કૃપા કરીને તમારી *નાક સંબંધિત સમસ્યા* જણાવો:" },
        desired_procedure: { en: "🎯 Please select your *Desired Procedure*:", hi: "🎯 कृपया अपनी *इच्छित प्रक्रिया* चुनें:", gu: "🎯 કૃપા કરીને તમારી *ઈચ્છિત પ્રક્રિયા* પસંદ કરો:" },
        treatment_areas: { en: "📍 Please mention the *Area(s) You Want Treated* (Abdomen, Waist, Thighs, Arms, Chin, etc.):", hi: "📍 कृपया बताएं *किन हिस्सों का इलाज* चाहते हैं (पेट, कमर, जांघ, बाहें, ठुड्डी आदि):", gu: "📍 કૃપા કરીને જણાવો *કયા ભાગની સારવાર* કરાવવા માંગો છો:" },
        skin_concern: { en: "🎯 Please describe your *Skin Concern* (Acne, Scars, Pigmentation, Dark Spots, etc.):", hi: "🎯 कृपया अपनी *त्वचा की समस्या* बताएं (एक्ने, दाग, पिगमेंटेशन आदि):", gu: "🎯 કૃપા કરીને તમારી *ત્વચા સંબંધિત સમસ્યા* જણાવો:" }
    },
    ask_photos: {
        hair: { en: "📸 Please share *2-3 Clear Hair Photos* (Front, Top & Back):", hi: "📸 कृपया *2-3 साफ बालों की फोटो* भेजें (आगे, ऊपर और पीछे):", gu: "📸 કૃપા કરીને *2-3 સ્પષ્ટ વાળના ફોટો* મોકલો:" },
        face: { en: "📸 Please share *Front & Side Profile Photos*:", hi: "📸 कृपया *सामने और साइड प्रोफाइल फोटो* भेजें:", gu: "📸 કૃપા કરીને *આગળ અને સાઈડ પ્રોફાઈલ ફોટો* મોકલો:" },
        chest: { en: "📸 Please share *2-3 Clear Chest Photos*:", hi: "📸 कृपया *2-3 साफ छाती की फोटो* भेजें:", gu: "📸 કૃપા કરીને *2-3 સ્પષ્ટ છાતીના ફોટો* મોકલો:" },
        skin: { en: "📸 Please share *2-3 Clear Photos of the Concerned Area*:", hi: "📸 कृपया *प्रभावित क्षेत्र की 2-3 साफ फोटो* भेजें:", gu: "📸 કૃપા કરીને *અસરગ્રસ્ત વિસ્તારના 2-3 સ્પષ્ટ ફોટો* મોકલો:" }
    },
    confirmed: {
        en: "✅ *Consultation Request Received!*\n\n🏥 Service: *{service}*\n👤 Name: *{name}*\n📍 City: *{city}*\n🎂 Age: *{age}*\n{extra}⏰ Call Time: *{time}*\n\nOur specialist will contact you soon.\n\nThank you for choosing *Celebre Aesthetics*! 💜\n\n📍 Surat | Ahmedabad | Rajkot\n🌐 celebre.in",
        hi: "✅ *कंसल्टेशन रिक्वेस्ट मिल गई!*\n\n🏥 सेवा: *{service}*\n👤 नाम: *{name}*\n📍 शहर: *{city}*\n🎂 उम्र: *{age}*\n{extra}⏰ कॉल का समय: *{time}*\n\nहमारे विशेषज्ञ जल्द ही आपसे संपर्क करेंगे।\n\n*Celebre Aesthetics* चुनने के लिए धन्यवाद! 💜\n\n📍 सूरत | अहमदाबाद | राजकोट\n🌐 celebre.in",
        gu: "✅ *કન્સલ્ટેશન રિક્વેસ્ટ મળી ગઈ!*\n\n🏥 સેવા: *{service}*\n👤 નામ: *{name}*\n📍 શહેર: *{city}*\n🎂 ઉંમર: *{age}*\n{extra}⏰ કૉલનો સમય: *{time}*\n\nઅમારા નિષ્ણાત ટૂંક સમયમાં તમારો સંપર્ક કરશે.\n\n*Celebre Aesthetics* પસંદ કરવા બદલ આભાર! 💜\n\n📍 સુરત | અમદાવાદ | રાજકોટ\n🌐 celebre.in"
    }
};

// ============ HELPERS ============
function m(key, lang, rep) {
    let t = "";
    if (typeof key === "object") t = key[lang] || key["en"] || "";
    else t = MSGS[key]?.[lang] || MSGS[key]?.["en"] || "";
    if (rep) { for (const k in rep) t = t.replace(new RegExp("\\{" + k + "\\}", "g"), rep[k]); }
    return t;
}

async function getConvo(phone, name) {
    let c = await Conversation.findOne({ phone });
    if (!c) { c = new Conversation({ phone, name, state: "language_selection" }); await c.save(); }
    return c;
}

async function up(phone, data) {
    data.updated_at = new Date();
    await Conversation.findOneAndUpdate({ phone }, data, { upsert: true });
}

function isGreeting(msg) {
    return ["hi", "hello", "hey", "hii", "hiii", "start", "helo", "namaste", "celebre", "celebre aesthetics"].includes(msg.toLowerCase());
}

function findCategory(msg) {
    const l = msg.toLowerCase();
    for (const cat of Object.keys(CATEGORIES)) { if (l.includes(cat.toLowerCase().split(" ")[0])) return cat; }
    return null;
}

function findService(msg) {
    const l = msg.toLowerCase();
    for (const cat of Object.keys(CATEGORIES)) {
        for (const svc of CATEGORIES[cat]) {
            if (l.includes(svc.title.toLowerCase()) || svc.title.toLowerCase().includes(l)) return { category: cat, service: svc.title };
        }
    }
    return null;
}

function detectLang(msg) {
    const l = msg.toLowerCase();
    if (l.includes("english") || l === "en") return "en";
    if (l.includes("hindi") || l.includes("हिंदी") || l === "hi") return "hi";
    if (l.includes("gujarati") || l.includes("ગુજરાતી") || l === "gu") return "gu";
    return null;
}

function getConfig(cat) { return FORM_CONFIG[cat] || FORM_CONFIG["Body Treatment"]; }

function getNextState(cur, cat) {
    const c = getConfig(cat);
    const flow = ["form_name", "form_city", "form_age"];
    if (c.needsWeight) flow.push("form_weight");
    if (c.needsHeight) flow.push("form_height");
    if (c.specificField) flow.push("form_specific");
    if (c.photoRequest) flow.push("form_photos");
    flow.push("form_call_time", "service_info");
    const idx = flow.indexOf(cur);
    return (idx >= 0 && idx + 1 < flow.length) ? flow[idx + 1] : flow[0];
}

function isMedia(body) {
    return body.content?.contentType === "media" || body.content?.media;
}

function aiLang(lang) { return lang === "hi" ? "Hindi" : lang === "gu" ? "Gujarati" : "English"; }

// Send next form question
async function sendFormQuestion(phone, nextState, cat, lang) {
    const c = getConfig(cat);
    switch (nextState) {
        case "form_name": await sendText(phone, m("ask_name", lang)); break;
        case "form_city": await sendText(phone, m("ask_city", lang)); break;
        case "form_age": await sendText(phone, m("ask_age", lang)); break;
        case "form_weight": await sendText(phone, m("ask_weight", lang)); break;
        case "form_height": await sendText(phone, m("ask_height", lang)); break;
        case "form_specific":
            if (c.specificOptions) {
                await sendButtons(phone, m(MSGS.ask_specific[c.specificField], lang), c.specificOptions, "Celebre Aesthetics");
            } else {
                await sendText(phone, m(MSGS.ask_specific[c.specificField], lang));
            }
            break;
        case "form_photos": await sendText(phone, m(MSGS.ask_photos[c.photoType], lang)); break;
        case "form_call_time": await sendText(phone, m("ask_call_time", lang)); break;
    }
}

// ============ MAIN HANDLER ============
router.post("/", async (req, res) => {
    try {
        const body = req.body;
        const phone = body.from || "";
        const senderName = body.whatsapp?.senderName || "";
        const mediaReceived = isMedia(body);
        const message = (
            body.content?.text || body.UserResponse || body.whatsapp?.title ||
            body.interactive?.title || body.interactive?.list_reply?.title ||
            body.interactive?.button_reply?.title || body.listReply?.title ||
            body.buttonReply?.title || (mediaReceived ? "__PHOTO__" : "")
        ).trim();

        console.log("Incoming:", phone, message);

        if (!phone || !message) return res.status(200).json({ success: true });

        // Test mode
        const TEST_NUMBERS = ["917820870519"];
        if (!TEST_NUMBERS.includes(phone)) {
            console.log("Skipping:", phone);
            return res.status(200).json({ success: true });
        }

        const convo = await getConvo(phone, senderName);
        const lang = convo.language || "en";

        // ===== RESET =====
        if (isGreeting(message)) {
            await up(phone, { state: "language_selection", language: "", selected_category: "", selected_service: "", form_name: "", form_city: "", form_age: "", form_weight: "", form_height: "", form_specific: "", form_photos: "", form_call_time: "" });
            await sendButtons(phone, "Please select your preferred language / कृपया अपनी भाषा चुनें / કૃપા કરીને તમારી ભાષા પસંદ કરો", ["English", "हिंदी", "ગુજરાતી"], "Celebre Aesthetics");
            return res.status(200).json({ success: true });
        }

        // ===== LANGUAGE =====
        if (convo.state === "language_selection") {
            const dl = detectLang(message);
            if (dl) {
                await up(phone, { language: dl, state: "category_selection" });
                await sendText(phone, m("welcome", dl, { name: senderName || "there" }));
                await sendList(phone, m("select_category", dl), "Our Services",
                    [{ title: "Categories", rows: Object.keys(CATEGORIES).map(c => ({ title: c, description: CATEGORIES[c].length + " procedures" })) }], "Celebre Aesthetics");
                return res.status(200).json({ success: true });
            }
            await sendButtons(phone, "Please select a language", ["English", "हिंदी", "ગુજરાતી"], "Celebre Aesthetics");
            return res.status(200).json({ success: true });
        }

        // ===== CATEGORY =====
        if (convo.state === "category_selection") {
            const cat = findCategory(message) || message;
            const svcs = CATEGORIES[cat];
            if (svcs) {
                if (cat === "Gynecomastia") {
                    await up(phone, { state: "form_name", selected_category: cat, selected_service: "Gynecomastia Surgery" });
                    await sendText(phone, m("form_start", lang));
                    await sendText(phone, m("ask_name", lang));
                    return res.status(200).json({ success: true });
                }
                await sendList(phone, m("select_service", lang, { cat }), cat.split(" ")[0] + " Services", [{ title: cat, rows: svcs }], cat);
                await up(phone, { state: "service_selection", selected_category: cat });
                return res.status(200).json({ success: true });
            }
            const reply = await getAIReply(message + ". Reply in " + aiLang(lang), "Category selection");
            await sendText(phone, reply);
            return res.status(200).json({ success: true });
        }

        // ===== SERVICE =====
        if (convo.state === "service_selection") {
            const svc = findService(message);
            if (svc) {
                await up(phone, { state: "form_name", selected_service: svc.service, selected_category: svc.category });
                await sendText(phone, m("form_start", lang));
                await sendText(phone, m("ask_name", lang));
                return res.status(200).json({ success: true });
            }
            const reply = await getAIReply(message + ". Reply in " + aiLang(lang), "Service selection from " + convo.selected_category);
            await sendText(phone, reply);
            return res.status(200).json({ success: true });
        }

        // ===== FORM: NAME =====
        if (convo.state === "form_name") {
            await up(phone, { form_name: message });
            const ns = getNextState("form_name", convo.selected_category);
            await sendFormQuestion(phone, ns, convo.selected_category, lang);
            await up(phone, { state: ns });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: CITY =====
        if (convo.state === "form_city") {
            await up(phone, { form_city: message });
            const ns = getNextState("form_city", convo.selected_category);
            await sendFormQuestion(phone, ns, convo.selected_category, lang);
            await up(phone, { state: ns });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: AGE =====
        if (convo.state === "form_age") {
            await up(phone, { form_age: message });
            const ns = getNextState("form_age", convo.selected_category);
            await sendFormQuestion(phone, ns, convo.selected_category, lang);
            await up(phone, { state: ns });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: WEIGHT =====
        if (convo.state === "form_weight") {
            await up(phone, { form_weight: message });
            const ns = getNextState("form_weight", convo.selected_category);
            await sendFormQuestion(phone, ns, convo.selected_category, lang);
            await up(phone, { state: ns });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: HEIGHT =====
        if (convo.state === "form_height") {
            await up(phone, { form_height: message });
            const ns = getNextState("form_height", convo.selected_category);
            await sendFormQuestion(phone, ns, convo.selected_category, lang);
            await up(phone, { state: ns });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: SPECIFIC =====
        if (convo.state === "form_specific") {
            await up(phone, { form_specific: message });
            const ns = getNextState("form_specific", convo.selected_category);
            await sendFormQuestion(phone, ns, convo.selected_category, lang);
            await up(phone, { state: ns });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: PHOTOS =====
        if (convo.state === "form_photos") {
            if (message === "__PHOTO__" || mediaReceived) {
                await up(phone, { form_photos: "received" });
                const ns = getNextState("form_photos", convo.selected_category);
                await sendFormQuestion(phone, ns, convo.selected_category, lang);
                await up(phone, { state: ns });
                return res.status(200).json({ success: true });
            }
            // User sent text instead of photo — accept it anyway
            await up(phone, { form_photos: message });
            const ns = getNextState("form_photos", convo.selected_category);
            await sendFormQuestion(phone, ns, convo.selected_category, lang);
            await up(phone, { state: ns });
            return res.status(200).json({ success: true });
        }

        // ===== FORM: CALL TIME =====
        if (convo.state === "form_call_time") {
            await up(phone, { form_call_time: message, state: "service_info" });

            // Get AI info about the service
            const aiInfo = await getAIReply(
                "Tell me about " + convo.selected_service + " at Celebre Aesthetics. Reply in " + aiLang(lang),
                "User selected " + convo.selected_service + " from " + convo.selected_category
            );
            await sendText(phone, "ℹ️ *" + convo.selected_service + "*\n\n" + aiInfo);

            // Send confirmation
            const config = getConfig(convo.selected_category);
            let extra = "";
            if (config.needsWeight) extra += "⚖️ " + (lang === "en" ? "Weight" : lang === "hi" ? "वज़न" : "વજન") + ": *" + convo.form_weight + "*\n";
            if (config.needsHeight) extra += "📏 " + (lang === "en" ? "Height" : lang === "hi" ? "ऊंचाई" : "ઊંચાઈ") + ": *" + convo.form_height + "*\n";
            if (config.specificField) extra += "🎯 " + (lang === "en" ? "Details" : lang === "hi" ? "विवरण" : "વિગતો") + ": *" + convo.form_specific + "*\n";
            if (config.photoRequest) extra += "📸 " + (lang === "en" ? "Photos" : lang === "hi" ? "फोटो" : "ફોટો") + ": *" + (lang === "en" ? "Received" : lang === "hi" ? "प्राप्त" : "પ્રાપ્ત") + "*\n";

            await sendText(phone, m("confirmed", lang, {
                service: convo.selected_service,
                name: convo.form_name,
                city: convo.form_city,
                age: convo.form_age,
                extra: extra,
                time: message
            }));

            await up(phone, { state: "confirmed" });
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
        const reply = await getAIReply(message + ". Reply in " + aiLang(lang), "General query");
        await sendText(phone, reply);
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(200).json({ success: true });
    }
});

module.exports = router;