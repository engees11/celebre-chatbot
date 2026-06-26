// api/webhook.js - v4 Final Flow

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

// ============ TIME SLOTS ============
const TIME_SLOTS = ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];

// ============ MULTILINGUAL MESSAGES ============
const M = {
    welcome: {
        en: "👋 Hi {name}! Welcome to *Celebre Aesthetics* 🌸\n\nWe are Gujarat's leading aesthetic surgery & cosmetic treatment clinic with centers in Surat, Ahmedabad & Rajkot.\n\nI can help you explore our treatments and book a free consultation call.",
        hi: "👋 नमस्ते {name}! *Celebre Aesthetics* में आपका स्वागत है 🌸\n\nहम गुजरात की अग्रणी सर्जरी और कॉस्मेटिक क्लिनिक हैं — सूरत, अहमदाबाद और राजकोट में।\n\nमैं आपकी मदद कर सकता/सकती हूँ।",
        gu: "👋 નમસ્તે {name}! *Celebre Aesthetics* માં આપનું સ્વાગત છે 🌸\n\nઅમે ગુજરાતની અગ્રણી સર્જરી અને કોસ્મેટિક ક્લિનિક છીએ — સુરત, અમદાવાદ અને રાજકોટમાં.\n\nહું તમારી મદદ કરી શકું છું."
    },
    select_cat: { en: "Please select a treatment category:", hi: "कृपया एक ट्रीटमेंट कैटेगरी चुनें:", gu: "કૃપા કરીને એક ટ્રીટમેન્ટ કેટેગરી પસંદ કરો:" },
    select_svc: { en: "Here are our {cat} options:", hi: "यहाँ {cat} के विकल्प हैं:", gu: "અહીં {cat} ના વિકલ્પો છે:" },
    book_ask: { en: "Would you like to book a free consultation?", hi: "क्या आप फ्री कंसल्टेशन बुक करना चाहेंगे?", gu: "શું તમે ફ્રી કન્સલ્ટેશન બુક કરવા માંગો છો?" },
    form_start: { en: "Great! Please answer a few quick questions for our specialist. 📋", hi: "बढ़िया! कृपया कुछ सवालों के जवाब दें। 📋", gu: "સરસ! કૃપા કરીને થોડા પ્રશ્નોના જવાબ આપો. 📋" },
    ask_name: { en: "👤 Your *Name*:", hi: "👤 आपका *नाम*:", gu: "👤 તમારું *નામ*:" },
    ask_city: { en: "📍 Your *City / Location*:", hi: "📍 आपका *शहर / लोकेशन*:", gu: "📍 તમારું *શહેર / સ્થાન*:" },
    ask_age: { en: "🎂 Your *Age*:", hi: "🎂 आपकी *उम्र*:", gu: "🎂 તમારી *ઉંમર*:" },
    ask_weight: { en: "⚖️ Your *Approx. Weight* (kg):", hi: "⚖️ आपका *अनुमानित वज़न* (kg):", gu: "⚖️ તમારું *અંદાજિત વજન* (kg):" },
    ask_height: { en: "📏 Your *Height*:", hi: "📏 आपकी *ऊंचाई*:", gu: "📏 તમારી *ઊંચાઈ*:" },
    ask_date: {
        en: "📅 Please type your preferred *date* for consultation.\n\nFormat: *25 June 2026*\n\n(Only future dates accepted)",
        hi: "📅 कृपया कंसल्टेशन के लिए *तारीख* लिखें।\n\nफॉर्मेट: *25 June 2026*\n\n(सिर्फ आने वाली तारीख)",
        gu: "📅 કૃપા કરીને કન્સલ્ટેશન માટે *તારીખ* લખો.\n\nફોર્મેટ: *25 June 2026*\n\n(માત્ર ભવિષ્યની તારીખ)"
    },
    invalid_date: {
        en: "❌ Invalid date! Please enter a *future date*.\n\nFormat: *25 June 2026*",
        hi: "❌ गलत तारीख! कृपया *भविष्य की तारीख* लिखें।\n\nफॉर्मेट: *25 June 2026*",
        gu: "❌ ખોટી તારીખ! કૃપા કરીને *ભવિષ્યની તારીખ* લખો.\n\nફોર્મેટ: *25 June 2026*"
    },
    select_time: {
        en: "🕐 Please select a time slot:",
        hi: "🕐 कृपया एक समय चुनें:",
        gu: "🕐 કૃપા કરીને એક સમય પસંદ કરો:"
    },
    invalid_time: {
        en: "Please select a valid time from the list.",
        hi: "कृपया सूची से सही समय चुनें।",
        gu: "કૃપા કરીને યાદીમાંથી યોગ્ય સમય પસંદ કરો."
    },
    confirmed: {
        en: "✅ *Consultation Booked!*\n\n🏥 Service: *{service}*\n👤 Name: *{name}*\n📍 City: *{city}*\n🎂 Age: *{age}*\n{extra}📅 Date: *{date}*\n🕐 Time: *{time}*\n\nOur specialist will call you at your chosen time.\n\nThank you for choosing *Celebre Aesthetics*! 💜\n\n📍 Surat | Ahmedabad | Rajkot\n🌐 celebre.in",
        hi: "✅ *कंसल्टेशन बुक हो गई!*\n\n🏥 सेवा: *{service}*\n👤 नाम: *{name}*\n📍 शहर: *{city}*\n🎂 उम्र: *{age}*\n{extra}📅 तारीख: *{date}*\n🕐 समय: *{time}*\n\nहमारे विशेषज्ञ आपसे संपर्क करेंगे।\n\n*Celebre Aesthetics* चुनने के लिए धन्यवाद! 💜\n\n📍 सूरत | अहमदाबाद | राजकोट\n🌐 celebre.in",
        gu: "✅ *કન્સલ્ટેશન બુક થઈ ગઈ!*\n\n🏥 સેવા: *{service}*\n👤 નામ: *{name}*\n📍 શહેર: *{city}*\n🎂 ઉંમર: *{age}*\n{extra}📅 તારીખ: *{date}*\n🕐 સમય: *{time}*\n\nઅમારા નિષ્ણાત તમારો સંપર્ક કરશે.\n\n*Celebre Aesthetics* પસંદ કરવા બદલ આભાર! 💜\n\n📍 સુરત | અમદાવાદ | રાજકોટ\n🌐 celebre.in"
    },
    again: { en: "Say *Celebre* to start again!", hi: "*Celebre* भेजें फिर से शुरू करने के लिए!", gu: "*Celebre* મોકલો ફરીથી શરૂ કરવા!" },
    ask_specific: {
        hair_loss_stage: { en: "💇 Your *Hair Loss Stage*:", hi: "💇 आपका *हेयर लॉस स्टेज*:", gu: "💇 તમારો *હેર લોસ સ્ટેજ*:" },
        nose_concern: { en: "🎯 Your *Nose Concern* (Shape, Size, Bump, Breathing, etc.):", hi: "🎯 आपकी *नाक की समस्या* (आकार, साइज़, उभार, सांस आदि):", gu: "🎯 તમારી *નાક સંબંધિત સમસ્યા*:" },
        desired_procedure: { en: "🎯 Your *Desired Procedure*:", hi: "🎯 आपकी *इच्छित प्रक्रिया*:", gu: "🎯 તમારી *ઈચ્છિત પ્રક્રિયા*:" },
        treatment_areas: { en: "📍 *Area(s) to Treat* (Abdomen, Waist, Thighs, Arms, Chin, etc.):", hi: "📍 *इलाज वाले हिस्से* (पेट, कमर, जांघ, बाहें, ठुड्डी आदि):", gu: "📍 *સારવારના ભાગો* (પેટ, કમર, જાંઘ, હાથ, ચિન વગેરે):" },
        skin_concern: { en: "🎯 Your *Skin Concern* (Acne, Scars, Pigmentation, etc.):", hi: "🎯 आपकी *त्वचा की समस्या* (एक्ने, दाग, पिगमेंटेशन आदि):", gu: "🎯 તમારી *ત્વચા સંબંધિત સમસ્યા*:" }
    },
    ask_photos: {
        hair: { en: "📸 Share *2-3 Clear Hair Photos* (Front, Top & Back):", hi: "📸 *2-3 बालों की साफ फोटो* भेजें:", gu: "📸 *2-3 વાળના સ્પષ્ટ ફોટો* મોકલો:" },
        face: { en: "📸 Share *Front & Side Profile Photos*:", hi: "📸 *सामने और साइड फोटो* भेजें:", gu: "📸 *આગળ અને સાઈડ ફોટો* મોકલો:" },
        chest: { en: "📸 Share *2-3 Clear Chest Photos*:", hi: "📸 *2-3 छाती की साफ फोटो* भेजें:", gu: "📸 *2-3 છાતીના સ્પષ્ટ ફોટો* મોકલો:" },
        skin: { en: "📸 Share *2-3 Photos of Concerned Area*:", hi: "📸 *प्रभावित क्षेत्र की 2-3 फोटो* भेजें:", gu: "📸 *અસરગ્રસ્ત વિસ્તારના 2-3 ફોટો* મોકલો:" }
    },
    btn_book: { en: "Yes, Book Now", hi: "हाँ, बुक करें", gu: "હા, બુક કરો" },
    btn_other: { en: "Other Services", hi: "अन्य सेवाएं", gu: "અન્ય સેવાઓ" },
    btn_ask: { en: "Ask Question", hi: "सवाल पूछें", gu: "પ્રશ્ન પૂછો" }
};

// ============ HELPERS ============
function t(key, lang, rep) {
    let s = "";
    if (typeof key === "object") s = key[lang] || key["en"] || "";
    else s = M[key]?.[lang] || M[key]?.["en"] || "";
    if (rep) { for (const k in rep) s = s.replace(new RegExp("\\{" + k + "\\}", "g"), rep[k]); }
    return s;
}

async function getC(phone, name) {
    let c = await Conversation.findOne({ phone });
    if (!c) { c = new Conversation({ phone, name, state: "language_selection" }); await c.save(); }
    return c;
}

async function up(phone, d) { d.updated_at = new Date(); await Conversation.findOneAndUpdate({ phone }, d, { upsert: true }); }

function isGreet(m) { return ["hi", "hello", "hey", "hii", "hiii", "start", "helo", "namaste", "celebre", "celebre aesthetics"].includes(m.toLowerCase()); }

function findCat(m) {
    const l = m.toLowerCase();
    for (const c of Object.keys(CATEGORIES)) { if (l.includes(c.toLowerCase().split(" ")[0])) return c; }
    return null;
}

function findSvc(m) {
    const l = m.toLowerCase();
    for (const c of Object.keys(CATEGORIES)) {
        for (const s of CATEGORIES[c]) {
            if (l.includes(s.title.toLowerCase()) || s.title.toLowerCase().includes(l)) return { category: c, service: s.title };
        }
    }
    return null;
}

function detectL(m) {
    const l = m.toLowerCase();
    if (l.includes("english") || l === "en") return "en";
    if (l.includes("hindi") || l.includes("हिंदी") || l === "hi") return "hi";
    if (l.includes("gujarati") || l.includes("ગુજરાતી") || l === "gu") return "gu";
    return null;
}

function getConf(cat) { return FORM_CONFIG[cat] || FORM_CONFIG["Body Treatment"]; }

function isMedia(body) { return body.content?.contentType === "media" || !!body.content?.media; }

function aLang(l) { return l === "hi" ? "Hindi" : l === "gu" ? "Gujarati" : "English"; }

function isValidDate(s) {
    const p = new Date(s);
    if (isNaN(p.getTime())) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return p >= today;
}

function formatDate(s) {
    const p = new Date(s);
    const d = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const m = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return d[p.getDay()] + ", " + p.getDate() + " " + m[p.getMonth()] + " " + p.getFullYear();
}

function findTime(m) {
    const l = m.toLowerCase().replace(/\s/g, "");
    for (const s of TIME_SLOTS) { if (l.includes(s.toLowerCase().replace(/\s/g, ""))) return s; }
    return null;
}

// Form flow per category
function getFormFlow(cat) {
    const c = getConf(cat);
    const f = ["form_name", "form_city", "form_age"];
    if (c.needsWeight) f.push("form_weight");
    if (c.needsHeight) f.push("form_height");
    if (c.specificField) f.push("form_specific");
    if (c.photoRequest) f.push("form_photos");
    f.push("form_call_time");
    return f;
}

function nextFormState(cur, cat) {
    const f = getFormFlow(cat);
    const i = f.indexOf(cur);
    return (i >= 0 && i + 1 < f.length) ? f[i + 1] : "date_selection";
}

async function sendFormQ(phone, state, cat, lang) {
    const c = getConf(cat);
    switch (state) {
        case "form_name": await sendText(phone, t("ask_name", lang)); break;
        case "form_city": await sendText(phone, t("ask_city", lang)); break;
        case "form_age": await sendText(phone, t("ask_age", lang)); break;
        case "form_weight": await sendText(phone, t("ask_weight", lang)); break;
        case "form_height": await sendText(phone, t("ask_height", lang)); break;
        case "form_specific":
            if (c.specificOptions) await sendButtons(phone, t(M.ask_specific[c.specificField], lang), c.specificOptions, "Celebre Aesthetics");
            else await sendText(phone, t(M.ask_specific[c.specificField], lang));
            break;
        case "form_photos": await sendText(phone, t(M.ask_photos[c.photoType], lang)); break;
        case "form_call_time": await sendText(phone, t("ask_call_time", lang)); break;
    }
}

// ============ MAIN ============
router.post("/", async (req, res) => {
    try {
        const body = req.body;
        const phone = body.from || "";
        const senderName = body.whatsapp?.senderName || "";
        const media = isMedia(body);
        const message = (
            body.content?.text || body.UserResponse || body.whatsapp?.title ||
            body.interactive?.title || body.interactive?.list_reply?.title ||
            body.interactive?.button_reply?.title || body.listReply?.title ||
            body.buttonReply?.title || (media ? "__PHOTO__" : "")
        ).trim();

        console.log("Incoming:", phone, message);

        if (!phone || !message) return res.status(200).json({ success: true });

        const TEST = ["917820870519"];
        if (!TEST.includes(phone)) { console.log("Skip:", phone); return res.status(200).json({ success: true }); }

        const convo = await getC(phone, senderName);
        const lang = convo.language || "en";

        // ===== RESET =====
        if (isGreet(message)) {
            await up(phone, { state: "language_selection", language: "", selected_category: "", selected_service: "", form_name: "", form_city: "", form_age: "", form_weight: "", form_height: "", form_specific: "", form_photos: "", form_call_time: "", booking_date: "", booking_time: "" });
            await sendButtons(phone, "Please select your language / भाषा चुनें / ભાષા પસંદ કરો", ["English", "हिंदी", "ગુજરાતી"], "Celebre Aesthetics");
            return res.status(200).json({ success: true });
        }

        // ===== LANGUAGE =====
        if (convo.state === "language_selection") {
            const dl = detectL(message);
            if (dl) {
                await up(phone, { language: dl, state: "category_selection" });
                await sendText(phone, t("welcome", dl, { name: senderName || "there" }));
                await sendList(phone, t("select_cat", dl), "Our Services",
                    [{ title: "Categories", rows: Object.keys(CATEGORIES).map(c => ({ title: c, description: CATEGORIES[c].length + " procedures" })) }], "Celebre Aesthetics");
                return res.status(200).json({ success: true });
            }
            await sendButtons(phone, "Please select a language", ["English", "हिंदी", "ગુજરાતી"], "Celebre Aesthetics");
            return res.status(200).json({ success: true });
        }

        // ===== CATEGORY =====
        if (convo.state === "category_selection") {
            const cat = findCat(message) || message;
            const svcs = CATEGORIES[cat];
            if (svcs) {
                if (cat === "Gynecomastia") {
                    await up(phone, { selected_category: cat, selected_service: "Gynecomastia Surgery", state: "service_info" });
                    const info = await getAIReply("Tell me about Gynecomastia surgery at Celebre Aesthetics. Reply in " + aLang(lang), "Gynecomastia");
                    await sendText(phone, "ℹ️ *Gynecomastia Surgery*\n\n" + info);
                    await sendButtons(phone, t("book_ask", lang), [t("btn_book", lang), t("btn_other", lang), t("btn_ask", lang)], "Celebre Aesthetics");
                    await up(phone, { state: "booking_ask" });
                } else {
                    await sendList(phone, t("select_svc", lang, { cat }), cat.split(" ")[0], [{ title: cat, rows: svcs }], cat);
                    await up(phone, { state: "service_selection", selected_category: cat });
                }
                return res.status(200).json({ success: true });
            }
            const r = await getAIReply(message + ". Reply in " + aLang(lang), "Category selection");
            await sendText(phone, r);
            return res.status(200).json({ success: true });
        }

        // ===== SERVICE =====
        if (convo.state === "service_selection") {
            const svc = findSvc(message);
            if (svc) {
                await up(phone, { selected_service: svc.service, selected_category: svc.category, state: "service_info" });
                const info = await getAIReply("Tell me about " + svc.service + " at Celebre Aesthetics. Reply in " + aLang(lang), svc.service);
                await sendText(phone, "ℹ️ *" + svc.service + "*\n\n" + info);
                await sendButtons(phone, t("book_ask", lang), [t("btn_book", lang), t("btn_other", lang), t("btn_ask", lang)], "Celebre Aesthetics");
                await up(phone, { state: "booking_ask" });
                return res.status(200).json({ success: true });
            }
            const r = await getAIReply(message + ". Reply in " + aLang(lang), "Service selection");
            await sendText(phone, r);
            return res.status(200).json({ success: true });
        }

        // ===== BOOKING ASK =====
        if (convo.state === "booking_ask") {
            const l = message.toLowerCase();
            if (l.includes("yes") || l.includes("book") || l.includes("हाँ") || l.includes("હા")) {
                await sendText(phone, t("form_start", lang));
                await sendText(phone, t("ask_name", lang));
                await up(phone, { state: "form_name" });
                return res.status(200).json({ success: true });
            }
            if (l.includes("other") || l.includes("service") || l.includes("अन्य") || l.includes("અન્ય")) {
                await sendList(phone, t("select_cat", lang), "Our Services",
                    [{ title: "Categories", rows: Object.keys(CATEGORIES).map(c => ({ title: c, description: CATEGORIES[c].length + " procedures" })) }], "Celebre Aesthetics");
                await up(phone, { state: "category_selection", selected_category: "", selected_service: "" });
                return res.status(200).json({ success: true });
            }
            if (l.includes("ask") || l.includes("question") || l.includes("सवाल") || l.includes("પ્રશ્ન")) {
                await sendText(phone, lang === "hi" ? "ज़रूर! कुछ भी पूछें 😊" : lang === "gu" ? "ચોક્કસ! કંઈપણ પૂછો 😊" : "Sure! Ask anything 😊");
                await up(phone, { state: "asking_question" });
                return res.status(200).json({ success: true });
            }
            const r = await getAIReply(message + ". Reply in " + aLang(lang), "Booking ask for " + convo.selected_service);
            await sendText(phone, r);
            return res.status(200).json({ success: true });
        }

        // ===== ASKING QUESTION =====
        if (convo.state === "asking_question") {
            const r = await getAIReply(message + ". Reply in " + aLang(lang), convo.selected_service || "treatments");
            await sendText(phone, r);
            await sendButtons(phone, lang === "en" ? "Anything else?" : lang === "hi" ? "कुछ और?" : "બીજું કંઈ?",
                [t("btn_book", lang), t("btn_other", lang), t("btn_ask", lang)], "Celebre Aesthetics");
            await up(phone, { state: "booking_ask" });
            return res.status(200).json({ success: true });
        }

        // ===== FORM STATES =====
        const formStates = ["form_name", "form_city", "form_age", "form_weight", "form_height", "form_specific", "form_photos", "form_call_time"];

        if (formStates.includes(convo.state)) {
            // Handle photo
            if (convo.state === "form_photos") {
                if (message === "__PHOTO__" || media) {
                    await up(phone, { form_photos: "received" });
                } else {
                    await up(phone, { form_photos: message });
                }
            } else {
                // Store the value
                const storeMap = {
                    form_name: "form_name", form_city: "form_city", form_age: "form_age",
                    form_weight: "form_weight", form_height: "form_height",
                    form_specific: "form_specific", form_call_time: "form_call_time"
                };
                if (storeMap[convo.state]) {
                    await up(phone, { [storeMap[convo.state]]: message });
                }
            }

            // Get next state
            const flow = getFormFlow(convo.selected_category);
            const curIdx = flow.indexOf(convo.state);

            if (curIdx >= 0 && curIdx + 1 < flow.length) {
                // More form questions
                const ns = flow[curIdx + 1];
                await sendFormQ(phone, ns, convo.selected_category, lang);
                await up(phone, { state: ns });
            } else {
                // Form done → ask date
                await sendText(phone, t("ask_date", lang));
                await up(phone, { state: "date_selection" });
            }
            return res.status(200).json({ success: true });
        }

        // ===== DATE SELECTION =====
        if (convo.state === "date_selection") {
            if (isValidDate(message)) {
                const fd = formatDate(message);
                await up(phone, { booking_date: fd, state: "time_selection" });
                await sendList(phone,
                    t("select_time", lang) + "\n\n📅 " + fd,
                    lang === "en" ? "Select Time" : lang === "hi" ? "समय चुनें" : "સમય પસંદ કરો",
                    [{
                        title: lang === "en" ? "Available Slots" : lang === "hi" ? "उपलब्ध समय" : "ઉપલબ્ધ સમય",
                        rows: TIME_SLOTS.map(s => ({ title: s, description: lang === "en" ? "Available" : lang === "hi" ? "उपलब्ध" : "ઉપલબ્ધ" }))
                    }], "Celebre Aesthetics"
                );
                return res.status(200).json({ success: true });
            }
            await sendText(phone, t("invalid_date", lang));
            return res.status(200).json({ success: true });
        }

        // ===== TIME SELECTION =====
        if (convo.state === "time_selection") {
            const slot = findTime(message);
            if (slot) {
                await up(phone, { booking_time: slot, state: "confirmed" });

                const c = getConf(convo.selected_category);
                let extra = "";
                if (c.needsWeight) extra += "⚖️ " + (lang === "en" ? "Weight" : lang === "hi" ? "वज़न" : "વજન") + ": *" + convo.form_weight + "*\n";
                if (c.needsHeight) extra += "📏 " + (lang === "en" ? "Height" : lang === "hi" ? "ऊंचाई" : "ઊંચાઈ") + ": *" + convo.form_height + "*\n";
                if (c.specificField) extra += "🎯 " + (lang === "en" ? "Details" : lang === "hi" ? "विवरण" : "વિગતો") + ": *" + convo.form_specific + "*\n";
                if (c.photoRequest) extra += "📸 " + (lang === "en" ? "Photos" : lang === "hi" ? "फोटो" : "ફોટો") + ": *" + (lang === "en" ? "Received" : lang === "hi" ? "प्राप्त" : "પ્રાપ્ત") + "*\n";

                // Refresh convo to get latest form data
                const latest = await getC(phone, "");

                await sendText(phone, t("confirmed", lang, {
                    service: latest.selected_service, name: latest.form_name,
                    city: latest.form_city, age: latest.form_age,
                    extra: extra, date: latest.booking_date, time: slot
                }));
                return res.status(200).json({ success: true });
            }
            await sendText(phone, t("invalid_time", lang));
            return res.status(200).json({ success: true });
        }

        // ===== CONFIRMED =====
        if (convo.state === "confirmed") {
            await sendText(phone, t("again", lang));
            return res.status(200).json({ success: true });
        }

        // ===== DEFAULT =====
        const r = await getAIReply(message + ". Reply in " + aLang(lang), "General");
        await sendText(phone, r);
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(200).json({ success: true });
    }
});

module.exports = router;