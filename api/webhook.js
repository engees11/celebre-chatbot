// api/webhook.js - v10 Correct Gujarati

const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation");
const { getAIReply } = require("../services/ai");
const { sendText, sendButtons, sendList } = require("../utils/respond");

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
        { title: "Facial Rejuvenation", description: "Anti-aging" },
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
        { title: "Skin Pigmentation", description: "Dark spots" },
        { title: "Scar Revision", description: "Scar improvement" },
        { title: "Vitiligo", description: "Vitiligo treatment" }
    ]
};

const SERVICE_FORMS = {
    "Hair Transplant": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: { en: "💇 *Hair Loss Stage*:", hi: "💇 *हेयर लॉस स्टेज*:", gu: "💇 તમારો *હેર લોસ સ્ટેજ*:" },
        specificOptions: ["Mild", "Moderate", "Severe"],
        photo: { en: "📸 Share *2-3 Clear Hair Photos* (Front, Top & Back):", hi: "📸 *2-3 बालों की साफ फोटो* भेजें (आगे, ऊपर, पीछे):", gu: "📸 *2-3 વાળના સ્પષ્ટ ફોટો* મોકલો (આગળ, ઉપર, પાછળ):" }
    },
    "Hair Growth": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: { en: "💇 *Hair Loss Stage*:", hi: "💇 *हेयर लॉस स्टेज*:", gu: "💇 તમારો *હેર લોસ સ્ટેજ*:" },
        specificOptions: ["Mild", "Moderate", "Severe"],
        photo: { en: "📸 Share *2-3 Clear Hair Photos* (Front, Top & Back):", hi: "📸 *2-3 बालों की साफ फोटो* भेजें (आगे, ऊपर, पीछे):", gu: "📸 *2-3 વાળના સ્પષ્ટ ફોટો* મોકલો (આગળ, ઉપર, પાછળ):" }
    },
    "Laser Hair Removal": {
        fields: ["form_name", "form_city", "form_age", "form_specific"],
        specific: { en: "📍 *Which area do you want treated?* (Face, Arms, Legs, Underarms, Full Body, etc.):", hi: "📍 *किस हिस्से का ट्रीटमेंट चाहते हैं?* (चेहरा, बाहें, पैर, अंडरआर्म्स, फुल बॉडी आदि):", gu: "📍 *ક્યા ભાગમાંથી વાળ દૂર કરવા છે?* (ચહેરો, હાથ, પગ, અન્ડરઆર્મ, ફુલ બૉડી વગેરે):" },
        specificOptions: null,
        photo: null
    },
    "Rhinoplasty": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: { en: "🎯 *Concern with Your Nose:* (Shape, Size, Bump, Breathing Issue, Tip, etc.):", hi: "🎯 *नाक से जुड़ी समस्या:* (आकार, साइज़, उभार, सांस की तकलीफ, टिप आदि):", gu: "🎯 *નાક સંબંધિત સમસ્યા:* (આકાર, સાઈઝ, બ્રીથિંગ ઈશ્યુ, ટિપ વગેરે):" },
        specificOptions: null,
        photo: { en: "📸 Share *Front & Side Profile Photos* of your nose:", hi: "📸 नाक की *सामने और साइड फोटो* भेजें:", gu: "📸 નાકના *આગળ અને સાઈડ ફોટો* મોકલો:" }
    },
    "Lip Augmentation": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: { en: "🎯 *Concern with Your Lips:* (Thin lips, Uneven shape, Need more volume, etc.):", hi: "🎯 *होंठों से जुड़ी समस्या:* (पतले होंठ, असमान आकार, ज़्यादा वॉल्यूम चाहिए आदि):", gu: "🎯 *હોઠ સંબંધિત સમસ્યા:* (પાતળા હોઠ, અસમાન આકાર, વધુ વોલ્યુમ જોઈએ વગેરે):" },
        specificOptions: null,
        photo: { en: "📸 Share *Clear Photos* of your lips (Front & Side):", hi: "📸 होंठों की *साफ फोटो* भेजें (सामने और साइड):", gu: "📸 હોઠના *સ્પષ્ટ ફોટો* મોકલો (આગળ અને સાઈડ):" }
    },
    "Lip Reduction": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: { en: "🎯 *Concern with Your Lips:* (Too large, Uneven, Asymmetry, etc.):", hi: "🎯 *होंठों से जुड़ी समस्या:* (बहुत बड़े, असमान, असंतुलन आदि):", gu: "🎯 *હોઠ સંબંધિત સમસ્યા:* (ઘણા મોટા, અસમાન, અસંતુલન વગેરે):" },
        specificOptions: null,
        photo: { en: "📸 Share *Clear Photos* of your lips (Front & Side):", hi: "📸 होंठों की *साफ फोटो* भेजें (सामने और साइड):", gu: "📸 હોઠના *સ્પષ્ટ ફોટો* મોકલો (આગળ અને સાઈડ):" }
    },
    "Facial Rejuvenation": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: { en: "🎯 *Your Skin Concern:* (Wrinkles, Sagging skin, Dull skin, Fine lines, Anti-aging, etc.):", hi: "🎯 *त्वचा की समस्या:* (झुर्रियां, ढीली त्वचा, बेजान त्वचा, फाइन लाइन्स आदि):", gu: "🎯 *ત્વચાની સમસ્યા:* (કરચલી, ઢીલી ત્વચા, નિસ્તેજ ત્વચા, ફાઈન લાઈન્સ વગેરે):" },
        specificOptions: null,
        photo: { en: "📸 Share *Clear Face Photos* (Front & Side):", hi: "📸 चेहरे की *साफ फोटो* भेजें (सामने और साइड):", gu: "📸 ચહેરાના *સ્પષ્ટ ફોટો* મોકલો (આગળ અને સાઈડ):" }
    },
    "Brow Lift": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null, specificOptions: null,
        photo: { en: "📸 Share *Clear Face Photos* (Front & Side):", hi: "📸 चेहरे की *साफ फोटो* भेजें (सामने और साइड):", gu: "📸 ચહેરાના *સ્પષ્ટ ફોટો* મોકલો (આગળ અને સાઈડ):" }
    },
    "Dimple Creation": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null, specificOptions: null,
        photo: { en: "📸 Share *Clear Face Photos* (Front & Side):", hi: "📸 चेहरे की *साफ फोटो* भेजें (सामने और साइड):", gu: "📸 ચહેરાના *સ્પષ્ટ ફોટો* મોકલો (આગળ અને સાઈડ):" }
    },
    "Jawline Creation": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null, specificOptions: null,
        photo: { en: "📸 Share *Clear Face Photos* (Front & Side):", hi: "📸 चेहरे की *साफ फोटो* भेजें (सामने और साइड):", gu: "📸 ચહેરાના *સ્પષ્ટ ફોટો* મોકલો (આગળ અને સાઈડ):" }
    },
    "Double Chin Reduction": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null, specificOptions: null,
        photo: { en: "📸 Share *Clear Face & Chin Photos* (Front & Side):", hi: "📸 चेहरे और ठुड्डी की *साफ फोटो* भेजें (सामने और साइड):", gu: "📸 ચહેરા અને ચિનના *સ્પષ્ટ ફોટો* મોકલો (આગળ અને સાઈડ):" }
    },
    "Otoplasty": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null, specificOptions: null,
        photo: { en: "📸 Share *Clear Photos* of your ears (Front & Side):", hi: "📸 कानों की *साफ फोटो* भेजें (सामने और साइड):", gu: "📸 કાનના *સ્પષ્ટ ફોટો* મોકલો (આગળ અને સાઈડ):" }
    },
    "Breast Augmentation": { fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"], specific: null, specificOptions: null, photo: null },
    "Breast Reduction": { fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"], specific: null, specificOptions: null, photo: null },
    "Breast Lift": { fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"], specific: null, specificOptions: null, photo: null },
    "Axillary Breast Removal": { fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"], specific: null, specificOptions: null, photo: null },
    "Breast Swelling Excision": { fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"], specific: null, specificOptions: null, photo: null },
    "Mommy Makeover": { fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"], specific: null, specificOptions: null, photo: null },
    "Genital Rejuvenation": { fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"], specific: null, specificOptions: null, photo: null },
    "Liposuction": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height", "form_specific"],
        specific: { en: "📍 *Area(s) You Want Treated:* (Abdomen, Waist, Thighs, Arms, Chin, etc.):", hi: "📍 *किन हिस्सों का इलाज चाहते हैं:* (पेट, कमर, जांघ, बाहें, ठुड्डी आदि):", gu: "📍 *ક્યા ભાગની સારવાર કરાવવી છે:* (પેટ, કમર, જાંઘ, હાથ, ચિન વગેરે):" },
        specificOptions: null, photo: null
    },
    "Abdominoplasty": { fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"], specific: null, specificOptions: null, photo: null },
    "Gender Reassignment M-F": { fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"], specific: null, specificOptions: null, photo: null },
    "Gender Reassignment F-M": { fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"], specific: null, specificOptions: null, photo: null },
    "Gynecomastia Surgery": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height", "form_photos"],
        specific: null, specificOptions: null,
        photo: { en: "📸 Share *2-3 Clear Chest Photos*:", hi: "📸 *2-3 छाती की साफ फोटो* भेजें:", gu: "📸 *2-3 છાતીના સ્પષ્ટ ફોટો* મોકલો:" }
    },
    "Skin Rejuvenation": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: { en: "🎯 *Skin Concern:* (Wrinkles, Dull Skin, Anti-Aging, Fine Lines, Glow, etc.):", hi: "🎯 *त्वचा की समस्या:* (झुर्रियां, बेजान त्वचा, एंटी-एजिंग, फाइन लाइन्स आदि):", gu: "🎯 *ત્વચાની સમસ્યા:* (કરચલી, નિસ્તેજ ત્વચા, અસમાન રંગ, ફાઈન લાઈન્સ વગેરે):" },
        specificOptions: null,
        photo: { en: "📸 Share *2-3 Clear Photos* of the concerned area:", hi: "📸 प्रभावित हिस्से की *2-3 साफ फोटो* भेजें:", gu: "📸 અસરગ્રસ્ત ભાગના *2-3 સ્પષ્ટ ફોટો* મોકલો:" }
    },
    "Acne Scar Treatment": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null, specificOptions: null,
        photo: { en: "📸 Share *2-3 Clear Photos* of the affected area:", hi: "📸 प्रभावित हिस्से की *2-3 साफ फोटो* भेजें:", gu: "📸 અસરગ્રસ્ત ભાગના *2-3 સ્પષ્ટ ફોટો* મોકલો:" }
    },
    "Skin Pigmentation": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null, specificOptions: null,
        photo: { en: "📸 Share *2-3 Clear Photos* of the affected area:", hi: "📸 प्रभावित हिस्से की *2-3 साफ फोटो* भेजें:", gu: "📸 અસરગ્રસ્ત ભાગના *2-3 સ્પષ્ટ ફોટો* મોકલો:" }
    },
    "Scar Revision": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: { en: "🎯 *Scar Details:* (Location on body, Old or New scar, Type, etc.):", hi: "🎯 *दाग की जानकारी:* (शरीर पर कहाँ, पुराना या नया दाग, प्रकार आदि):", gu: "🎯 *ડાઘની માહિતી:* (શરીર પર ક્યાં, જૂનો કે નવો ડાઘ, પ્રકાર વગેરે):" },
        specificOptions: null,
        photo: { en: "📸 Share *2-3 Clear Photos* of the scar:", hi: "📸 दाग की *2-3 साफ फोटो* भेजें:", gu: "📸 ડાઘના *2-3 સ્પષ્ટ ફોટો* મોકલો:" }
    },
    "Vitiligo": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null, specificOptions: null,
        photo: { en: "📸 Share *2-3 Clear Photos* of the affected area:", hi: "📸 प्रभावित हिस्से की *2-3 साफ फोटो* भेजें:", gu: "📸 અસરગ્રસ્ત ભાગના *2-3 સ્પષ્ટ ફોટો* મોકલો:" }
    }
};

function getSF(svc) { return SERVICE_FORMS[svc] || { fields: ["form_name", "form_city", "form_age"], specific: null, specificOptions: null, photo: null }; }
function proc(l) { return l === "hi" ? " प्रक्रियाएं" : l === "gu" ? " સારવાર" : " procedures"; }
function catRows(l) { return Object.keys(CATEGORIES).map(c => ({ title: c, description: CATEGORIES[c].length + proc(l) })); }

const TIME_SLOTS = ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];

const MSG = {
    welcome: {
        en: "👋 Hi {name}! Welcome to *Celebre Aesthetics* 🌸\n\nGujarat's leading aesthetic clinic — Surat, Ahmedabad & Rajkot.\n\nLet me help you explore treatments and book a free consultation.",
        hi: "👋 नमस्ते {name}! *Celebre Aesthetics* में स्वागत है 🌸\n\nगुजरात की अग्रणी क्लिनिक — सूरत, अहमदाबाद, राजकोट।\n\nट्रीटमेंट जानने और फ्री कंसल्टेशन बुक करने में मदद करता/करती हूँ।",
        gu: "👋 નમસ્તે {name}! *Celebre Aesthetics* માં સ્વાગત છે 🌸\n\nગુજરાતની અગ્રણી ક્લિનિક — સુરત, અમદાવાદ, રાજકોટ.\n\nટ્રીટમેન્ટ જાણવા અને ફ્રી કન્સલ્ટેશન બુક કરવામાં મદદ કરું છું."
    },
    select_cat: { en: "Please select a treatment category:", hi: "कृपया ट्रीटमेंट कैटेगरी चुनें:", gu: "કૃપા કરીને ટ્રીટમેન્ટ કેટેગરી પસંદ કરો:" },
    select_svc: { en: "Here are our {cat} options:", hi: "{cat} के विकल्प:", gu: "{cat} ના વિકલ્પો:" },
    form_start: { en: "To help our specialist prepare, please answer a few quick questions. 📋", hi: "कंसल्टेशन के लिए कुछ सवालों के जवाब दें। 📋", gu: "કન્સલ્ટેશન માટે થોડા પ્રશ્નોના જવાબ આપો. 📋" },
    ask_name: { en: "👤 Your *Name*:", hi: "👤 आपका *नाम*:", gu: "👤 તમારું *નામ*:" },
    ask_city: { en: "📍 Your *City / Location*:", hi: "📍 आपका *शहर / लोकेशन*:", gu: "📍 તમારું *શહેર / સ્થાન*:" },
    ask_age: { en: "🎂 Your *Age*:", hi: "🎂 आपकी *उम्र*:", gu: "🎂 તમારી *ઉંમર*:" },
    ask_weight: { en: "⚖️ Your *Approx. Weight* (kg):", hi: "⚖️ आपका *अनुमानित वज़न* (kg):", gu: "⚖️ તમારું *અંદાજિત વજન* (kg):" },
    ask_height: { en: "📏 Your *Height*:", hi: "📏 आपकी *ऊंचाई*:", gu: "📏 તમારી *ઊંચાઈ*:" },
    book_ask: { en: "Would you like to book a consultation date?", hi: "क्या आप कंसल्टेशन डेट बुक करना चाहेंगे?", gu: "શું તમે કન્સલ્ટેશન ડેટ બુક કરવા માંગો છો?" },
    ask_date: { en: "📅 Type your preferred *date*.\nFormat: *25 June 2026*\n(Future dates only)", hi: "📅 *तारीख* लिखें।\nफॉर्मेट: *25 June 2026*\n(सिर्फ आने वाली तारीख)", gu: "📅 *તારીખ* લખો.\nફોર્મેટ: *25 June 2026*\n(માત્ર ભવિષ્યની તારીખ)" },
    bad_date: { en: "❌ Enter a valid *future date*.\nFormat: *25 June 2026*", hi: "❌ सही *भविष्य की तारीख* लिखें।\nफॉर्मेट: *25 June 2026*", gu: "❌ યોગ્ય *ભવિષ્યની તારીખ* લખો.\nફોર્મેટ: *25 June 2026*" },
    select_time: { en: "🕐 Select a time slot:", hi: "🕐 समय चुनें:", gu: "🕐 સમય પસંદ કરો:" },
    confirmed: {
        en: "✅ *Consultation Booked!*\n\n🏥 Service: *{service}*\n👤 Name: *{name}*\n📍 City: *{city}*\n🎂 Age: *{age}*\n{extra}📅 Date: *{date}*\n🕐 Time: *{time}*\n\nOur specialist will call you soon.\nThank you! 💜\n\n📍 Surat | Ahmedabad | Rajkot\n🌐 celebre.in",
        hi: "✅ *कंसल्टेशन बुक!*\n\n🏥 सेवा: *{service}*\n👤 नाम: *{name}*\n📍 शहर: *{city}*\n🎂 उम्र: *{age}*\n{extra}📅 तारीख: *{date}*\n🕐 समय: *{time}*\n\nविशेषज्ञ जल्द संपर्क करेंगे।\nधन्यवाद! 💜\n\n📍 सूरत | अहमदाबाद | राजकोट\n🌐 celebre.in",
        gu: "✅ *કન્સલ્ટેશન બુક!*\n\n🏥 સેવા: *{service}*\n👤 નામ: *{name}*\n📍 શહેર: *{city}*\n🎂 ઉંમર: *{age}*\n{extra}📅 તારીખ: *{date}*\n🕐 સમય: *{time}*\n\nનિષ્ણાત ટૂંક સમયમાં સંપર્ક કરશે.\nઆભાર! 💜\n\n📍 સુરત | અમદાવાદ | રાજકોટ\n🌐 celebre.in"
    },
    again: { en: "Say *Celebre* to start again!", hi: "*Celebre* भेजें फिर से शुरू करने के लिए!", gu: "*Celebre* મોકલો ફરીથી શરૂ કરવા!" },
    btn_book: { en: "Yes, Book Now", hi: "हाँ, बुक करें", gu: "હા, બુક કરો" },
    btn_other: { en: "Other Services", hi: "अन्य सेवाएं", gu: "અન્ય સેવાઓ" },
    v_name: { en: "❌ Enter a valid *name* (letters only):", hi: "❌ सही *नाम* लिखें (सिर्फ अक्षर):", gu: "❌ યોગ્ય *નામ* લખો (માત્ર અક્ષરો):" },
    v_city: { en: "❌ Enter a valid *city name*:", hi: "❌ सही *शहर का नाम* लिखें:", gu: "❌ યોગ્ય *શહેરનું નામ* લખો:" },
    v_age: { en: "❌ Enter valid *age* (10-100):", hi: "❌ सही *उम्र* लिखें (10-100):", gu: "❌ યોગ્ય *ઉંમર* લખો (10-100):" },
    v_weight: { en: "❌ Enter valid *weight* in kg (20-300):", hi: "❌ सही *वज़न* kg में लिखें (20-300):", gu: "❌ યોગ્ય *વજન* kg માં લખો (20-300):" },
    v_height: { en: "❌ Enter valid *height* (e.g. 5'6 or 168cm):", hi: "❌ सही *ऊंचाई* लिखें:", gu: "❌ યોગ્ય *ઊંચાઈ* લખો:" },
    v_specific: { en: "❌ Please describe in at least a few words:", hi: "❌ कम से कम कुछ शब्दों में बताएं:", gu: "❌ ઓછામાં ઓછા થોડા શબ્દોમાં જણાવો:" },
    v_photo: { en: "❌ Please send a *photo/image*, not text 📸", hi: "❌ *फोटो* भेजें, टेक्स्ट नहीं 📸", gu: "❌ *ફોટો* મોકલો, ટેક્સ્ટ નહીં 📸" },
    force_answer: { en: "⚠️ Please answer the current question first.", hi: "⚠️ कृपया पहले मौजूदा सवाल का जवाब दें।", gu: "⚠️ કૃપા કરીને પહેલા હાલના પ્રશ્નનો જવાબ આપો." },
    force_select: { en: "⚠️ Please select an option from above.", hi: "⚠️ कृपया ऊपर दिए गए विकल्प में से चुनें।", gu: "⚠️ કૃપા કરીને ઉપરના વિકલ્પમાંથી પસંદ કરો." }
};

function t(k, l, r) { let s = typeof k === "object" ? (k[l] || k["en"] || "") : (MSG[k]?.[l] || MSG[k]?.["en"] || ""); if (r) { for (const x in r) s = s.replace(new RegExp("\\{" + x + "\\}", "g"), r[x]); } return s; }
async function getC(ph, nm) { let c = await Conversation.findOne({ phone: ph }); if (!c) { c = new Conversation({ phone: ph, name: nm, state: "language_selection" }); await c.save(); } return c; }
async function up(ph, d) { d.updated_at = new Date(); await Conversation.findOneAndUpdate({ phone: ph }, d, { upsert: true }); }
function isGreet(m) { return ["hi", "hello", "hey", "hii", "hiii", "start", "helo", "namaste", "celebre", "celebre aesthetics"].includes(m.toLowerCase()); }
function findCat(m) { const l = m.toLowerCase(); for (const c of Object.keys(CATEGORIES)) { if (l.includes(c.toLowerCase().split(" ")[0])) return c; } return null; }
function findSvc(m) { const l = m.toLowerCase(); for (const c of Object.keys(CATEGORIES)) { for (const s of CATEGORIES[c]) { if (l.includes(s.title.toLowerCase()) || s.title.toLowerCase().includes(l)) return { category: c, service: s.title }; } } return null; }
function detectL(m) { const l = m.toLowerCase(); if (l.includes("english") || l === "en") return "en"; if (l.includes("hindi") || l.includes("हिंदी") || l === "hi") return "hi"; if (l.includes("gujarati") || m.startsWith("ગ") || l === "gu") return "gu"; return null; }
function isMedia(b) { return b.content?.contentType === "media" || !!b.content?.media; }
function aL(l) { return l === "hi" ? "Hindi" : l === "gu" ? "Gujarati" : "English"; }
function validDate(s) { const p = new Date(s); if (isNaN(p.getTime())) return false; const d = new Date(); d.setHours(0, 0, 0, 0); return p >= d; }
function fmtDate(s) { const p = new Date(s); const d = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; const m = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; return d[p.getDay()] + ", " + p.getDate() + " " + m[p.getMonth()] + " " + p.getFullYear(); }
function findTime(m) { const l = m.toLowerCase().replace(/\s/g, ""); for (const s of TIME_SLOTS) { if (l.includes(s.toLowerCase().replace(/\s/g, ""))) return s; } return null; }
function isValidName(m) { return m.length >= 2 && /^[a-zA-Z\u0900-\u097F\u0A80-\u0AFF\s.]+$/.test(m); }
function isValidCity(m) { return m.length >= 2 && /^[a-zA-Z\u0900-\u097F\u0A80-\u0AFF\s,.-]+$/.test(m); }
function extractMessage(body, media) { const waTitle = body.whatsapp?.title || ""; const postback = body.postback?.data || ""; const interactiveTitle = body.interactive?.title || body.interactive?.list_reply?.title || body.interactive?.button_reply?.title || ""; const listReply = body.listReply?.title || body.buttonReply?.title || ""; const textContent = body.content?.text || body.UserResponse || ""; return (waTitle || postback || interactiveTitle || listReply || textContent || (media ? "__PHOTO__" : "")).trim(); }

async function sendFQ(ph, state, svc, lang) {
    const sf = getSF(svc);
    switch (state) {
        case "form_name": await sendText(ph, t("ask_name", lang)); break;
        case "form_city": await sendText(ph, t("ask_city", lang)); break;
        case "form_age": await sendText(ph, t("ask_age", lang)); break;
        case "form_weight": await sendText(ph, t("ask_weight", lang)); break;
        case "form_height": await sendText(ph, t("ask_height", lang)); break;
        case "form_specific":
            if (sf.specificOptions) await sendButtons(ph, t(sf.specific, lang), sf.specificOptions, "Celebre Aesthetics");
            else await sendText(ph, t(sf.specific, lang));
            break;
        case "form_photos":
            if (sf.photo) await sendText(ph, t(sf.photo, lang));
            break;
    }
}

router.post("/", async (req, res) => {
    try {
        const body = req.body;
        const phone = body.from || "";
        const senderName = body.whatsapp?.senderName || "";
        const media = isMedia(body);
        const message = extractMessage(body, media);

        console.log("Incoming:", phone, "|", message, "| media:", media);
        if (!phone || !message) return res.status(200).json({ success: true });

        const TEST = ["917820870519"];
        if (!TEST.includes(phone)) { console.log("Skip:", phone); return res.status(200).json({ success: true }); }

        const convo = await getC(phone, senderName);
        const lang = convo.language || "en";

        // RESET
        if (isGreet(message)) {
            await up(phone, { state: "language_selection", language: "", selected_category: "", selected_service: "", form_name: "", form_city: "", form_age: "", form_weight: "", form_height: "", form_specific: "", form_photos: "", booking_date: "", booking_time: "" });
            await sendButtons(phone, "Select your language / भाषा चुनें / ભાષા પસંદ કરો", ["English", "हिंदी", "ગુજરાતી"], "Celebre Aesthetics");
            return res.status(200).json({ success: true });
        }

        // LANGUAGE
        if (convo.state === "language_selection") {
            const dl = detectL(message);
            if (dl) {
                await up(phone, { language: dl, state: "category_selection" });
                await sendText(phone, t("welcome", dl, { name: senderName || "there" }));
                await sendList(phone, t("select_cat", dl), "Our Services", [{ title: "Categories", rows: catRows(dl) }], "Celebre Aesthetics");
                return res.status(200).json({ success: true });
            }
            await sendText(phone, t("force_select", lang));
            await sendButtons(phone, "Select a language", ["English", "हिंदी", "ગુજરાતી"], "Celebre Aesthetics");
            return res.status(200).json({ success: true });
        }

        // CATEGORY
        if (convo.state === "category_selection") {
            const cat = findCat(message) || message;
            const svcs = CATEGORIES[cat];
            if (svcs) {
                if (cat === "Gynecomastia") {
                    const svc = "Gynecomastia Surgery";
                    await up(phone, { selected_category: cat, selected_service: svc, state: "service_info" });
                    const info = await getAIReply("About Gynecomastia surgery at Celebre Aesthetics. IMPORTANT: Reply ONLY in " + aL(lang) + ". Keep exactly 3 short lines. No bullet points.", "Celebre Aesthetics clinic info");
                    await sendText(phone, "ℹ️ *Gynecomastia Surgery*\n\n" + info);
                    await sendText(phone, t("form_start", lang));
                    const firstField = getSF(svc).fields[0];
                    await sendFQ(phone, firstField, svc, lang);
                    await up(phone, { state: firstField });
                } else {
                    await sendList(phone, t("select_svc", lang, { cat }), cat.split(" ")[0], [{ title: cat, rows: svcs }], cat);
                    await up(phone, { state: "service_selection", selected_category: cat });
                }
                return res.status(200).json({ success: true });
            }
            await sendText(phone, t("force_select", lang));
            await sendList(phone, t("select_cat", lang), "Our Services", [{ title: "Categories", rows: catRows(lang) }], "Celebre Aesthetics");
            return res.status(200).json({ success: true });
        }

        // SERVICE
        if (convo.state === "service_selection") {
            const svc = findSvc(message);
            if (svc) {
                await up(phone, { selected_service: svc.service, selected_category: svc.category, state: "service_info" });
                const info = await getAIReply("About " + svc.service + " at Celebre Aesthetics. IMPORTANT: Reply ONLY in " + aL(lang) + ". Keep exactly 3 short lines. No bullet points.", "Celebre Aesthetics clinic info");
                await sendText(phone, "ℹ️ *" + svc.service + "*\n\n" + info);
                await sendText(phone, t("form_start", lang));
                const firstField = getSF(svc.service).fields[0];
                await sendFQ(phone, firstField, svc.service, lang);
                await up(phone, { state: firstField });
                return res.status(200).json({ success: true });
            }
            await sendText(phone, t("force_select", lang));
            await sendList(phone, t("select_svc", lang, { cat: convo.selected_category }), convo.selected_category.split(" ")[0], [{ title: convo.selected_category, rows: CATEGORIES[convo.selected_category] || [] }], convo.selected_category);
            return res.status(200).json({ success: true });
        }

        // FORM STATES
        const sf = getSF(convo.selected_service);
        const fields = sf.fields;

        if (fields.includes(convo.state)) {
            if (convo.state !== "form_photos" && convo.state !== "form_specific" && (message === "__PHOTO__" || media)) {
                await sendText(phone, t("force_answer", lang));
                await sendFQ(phone, convo.state, convo.selected_service, lang);
                return res.status(200).json({ success: true });
            }
            if (convo.state === "form_name" && !isValidName(message)) { await sendText(phone, t("v_name", lang)); return res.status(200).json({ success: true }); }
            if (convo.state === "form_city" && !isValidCity(message)) { await sendText(phone, t("v_city", lang)); return res.status(200).json({ success: true }); }
            if (convo.state === "form_age") { const a = Number(message); if (isNaN(a) || a < 10 || a > 100 || !Number.isInteger(a)) { await sendText(phone, t("v_age", lang)); return res.status(200).json({ success: true }); } }
            if (convo.state === "form_weight") { const w = Number(message); if (isNaN(w) || w < 20 || w > 300) { await sendText(phone, t("v_weight", lang)); return res.status(200).json({ success: true }); } }
            if (convo.state === "form_height" && (message === "__PHOTO__" || media || message.length < 2)) { await sendText(phone, t("v_height", lang)); return res.status(200).json({ success: true }); }
            if (convo.state === "form_specific" && !media && message !== "__PHOTO__" && message.length < 3) { await sendText(phone, t("v_specific", lang)); return res.status(200).json({ success: true }); }
            if (convo.state === "form_photos" && !media && message !== "__PHOTO__") { await sendText(phone, t("v_photo", lang)); return res.status(200).json({ success: true }); }

            if (convo.state === "form_photos") await up(phone, { form_photos: "received" });
            else await up(phone, { [convo.state]: message });

            const idx = fields.indexOf(convo.state);
            if (idx >= 0 && idx + 1 < fields.length) {
                const ns = fields[idx + 1];
                await sendFQ(phone, ns, convo.selected_service, lang);
                await up(phone, { state: ns });
            } else {
                await sendButtons(phone, t("book_ask", lang), [t("btn_book", lang), t("btn_other", lang)], "Celebre Aesthetics");
                await up(phone, { state: "booking_ask" });
            }
            return res.status(200).json({ success: true });
        }

        // BOOKING ASK
        if (convo.state === "booking_ask") {
            const l = message.toLowerCase();
            if (l.includes("yes") || l.includes("book") || l.includes("हाँ") || l.includes("हां") || l.includes("बुक") || l.includes("हा") || l.includes("બુક") || l.includes("બુк")) {
                await sendText(phone, t("ask_date", lang));
                await up(phone, { state: "date_selection" });
                return res.status(200).json({ success: true });
            }
            if (l.includes("other") || l.includes("service") || l.includes("अन्य") || l.includes("सेव") || l.includes("અન્ય") || l.includes("સેવ")) {
                await sendList(phone, t("select_cat", lang), "Our Services", [{ title: "Categories", rows: catRows(lang) }], "Celebre Aesthetics");
                await up(phone, { state: "category_selection", selected_category: "", selected_service: "" });
                return res.status(200).json({ success: true });
            }
            await sendText(phone, t("force_select", lang));
            await sendButtons(phone, t("book_ask", lang), [t("btn_book", lang), t("btn_other", lang)], "Celebre Aesthetics");
            return res.status(200).json({ success: true });
        }

        // DATE
        if (convo.state === "date_selection") {
            if (validDate(message)) {
                const fd = fmtDate(message);
                await up(phone, { booking_date: fd, state: "time_selection" });
                await sendList(phone, t("select_time", lang) + "\n\n📅 " + fd,
                    lang === "en" ? "Select Time" : lang === "hi" ? "समय चुनें" : "સમય પસંદ કરો",
                    [{ title: lang === "en" ? "Available" : lang === "hi" ? "उपलब्ध" : "ઉપલબ્ધ", rows: TIME_SLOTS.map(s => ({ title: s, description: "Available" })) }],
                    "Celebre Aesthetics");
                return res.status(200).json({ success: true });
            }
            await sendText(phone, t("bad_date", lang));
            return res.status(200).json({ success: true });
        }

        // TIME
        if (convo.state === "time_selection") {
            const slot = findTime(message);
            if (slot) {
                await up(phone, { booking_time: slot, state: "confirmed" });
                const latest = await Conversation.findOne({ phone });
                const latestSF = getSF(latest.selected_service);
                const latestFields = latestSF.fields;
                let extra = "";
                if (latestFields.includes("form_weight")) extra += "⚖️ " + (lang === "en" ? "Weight" : lang === "hi" ? "वज़न" : "વજન") + ": *" + latest.form_weight + "*\n";
                if (latestFields.includes("form_height")) extra += "📏 " + (lang === "en" ? "Height" : lang === "hi" ? "ऊंचाई" : "ઊંચાઈ") + ": *" + latest.form_height + "*\n";
                if (latestSF.specific && latest.form_specific) extra += "🎯 " + (lang === "en" ? "Details" : lang === "hi" ? "विवरण" : "વિગતો") + ": *" + latest.form_specific + "*\n";
                if (latestSF.photo) extra += "📸 " + (lang === "en" ? "Photos" : lang === "hi" ? "फोटो" : "ફોટો") + ": *" + (lang === "en" ? "Received" : lang === "hi" ? "प्राप्त" : "પ્રાપ્ત") + "*\n";
                await sendText(phone, t("confirmed", lang, { service: latest.selected_service, name: latest.form_name, city: latest.form_city, age: latest.form_age, extra, date: latest.booking_date, time: slot }));
                return res.status(200).json({ success: true });
            }
            await sendText(phone, t("force_select", lang));
            await sendList(phone, t("select_time", lang),
                lang === "en" ? "Select Time" : lang === "hi" ? "समय चुनें" : "સમય પસંદ કરો",
                [{ title: lang === "en" ? "Available" : lang === "hi" ? "उपलब्ध" : "ઉપલબ્ધ", rows: TIME_SLOTS.map(s => ({ title: s, description: "Available" })) }],
                "Celebre Aesthetics");
            return res.status(200).json({ success: true });
        }

        // CONFIRMED
        if (convo.state === "confirmed") { await sendText(phone, t("again", lang)); return res.status(200).json({ success: true }); }

        // DEFAULT
        const r = await getAIReply(message + ". Reply ONLY in " + aL(lang) + ". 3 lines max.", "General");
        await sendText(phone, r);
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(200).json({ success: true });
    }
});

module.exports = router;