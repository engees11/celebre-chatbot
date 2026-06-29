// api/webhook.js - v9 Per-Service Forms

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

// ============ PER-SERVICE FORMS ============
// fields: array of field keys in order
// For each field, question text and validation defined in SERVICE_FORMS
const SERVICE_FORMS = {

    // ── HAIR ──
    "Hair Transplant": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: {
            en: "💇 *Hair Loss Stage*:",
            hi: "💇 *हेयर लॉस स्टेज*:",
            gu: "💇 *હેર લોસ સ્ટેજ*:"
        },
        specificOptions: ["Mild", "Moderate", "Severe"],
        photo: {
            en: "📸 Share *2-3 Clear Hair Photos* (Front, Top & Back):",
            hi: "📸 *2-3 बालों की साफ फोटो* भेजें (आगे, ऊपर, पीछे):",
            gu: "📸 *2-3 વાળના સ્પષ્ટ ફોટો* મોકलो (આગળ, ઉपर, पाছળ):"
        }
    },

    "Hair Growth": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: {
            en: "💇 *Hair Loss Stage*:",
            hi: "💇 *हेयर लॉस स्टेज*:",
            gu: "💇 *હેર લોસ સ્ટેજ*:"
        },
        specificOptions: ["Mild", "Moderate", "Severe"],
        photo: {
            en: "📸 Share *2-3 Clear Hair Photos* (Front, Top & Back):",
            hi: "📸 *2-3 बालों की साफ फोटो* भेजें (आगे, ऊपर, पीछे):",
            gu: "📸 *2-3 વाળना સ્પષ્ટ ફोटो* मोकलो (आगળ, ऊपर, पाछळ):"
        }
    },

    "Laser Hair Removal": {
        fields: ["form_name", "form_city", "form_age", "form_specific"],
        specific: {
            en: "📍 *Which area do you want treated?* (Face, Arms, Legs, Underarms, Full Body, etc.):",
            hi: "📍 *किस हिस्से का ट्रीटमेंट चाहते हैं?* (चेहरा, बाहें, पैर, अंडरआर्म्स, फुल बॉडी आदि):",
            gu: "📍 *ક્યા ભાગની ટ્રીટમેન્ट કરાવવી છે?* (ચહેરો, હાથ, પગ, અન્ડरआर्म, ફुल बॉडी વगेरे):"
        },
        specificOptions: null,
        photo: null
    },

    // ── FACE ──
    "Rhinoplasty": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: {
            en: "🎯 *Concern with Your Nose:* (Shape, Size, Bump, Breathing Issue, Tip, etc.):",
            hi: "🎯 *नाक से जुड़ी समस्या:* (आकार, साइज़, उभार, सांस की तकलीफ, टिप आदि):",
            gu: "🎯 *નाकी સমस्या:* (आकार, साइज, उभार, श्वास की तकलीफ, टिप वगेरे):"
        },
        specificOptions: null,
        photo: {
            en: "📸 Share *Front & Side Profile Photos* of your nose:",
            hi: "📸 नाक की *सामने और साइड फोटो* भेजें:",
            gu: "📸 નाकना *આगળ અने साइड फोटो* मोकलो:"
        }
    },

    "Lip Augmentation": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: {
            en: "🎯 *Concern with Your Lips:* (Thin lips, Uneven shape, Need more volume, etc.):",
            hi: "🎯 *होंठों से जुड़ी समस्या:* (पतले होंठ, असमान आकार, ज़्यादा वॉल्यूम चाहिए आदि):",
            gu: "🎯 *હोઠोनी समस्या:* (पातळ होठ, असमान आकार, वधु volume जोईए वगेरे):"
        },
        specificOptions: null,
        photo: {
            en: "📸 Share *Clear Photos* of your lips (Front & Side):",
            hi: "📸 होंठों की *साफ फोटो* भेजें (सामने और साइड):",
            gu: "📸 હोઠोना *स्पष्ट फोटो* मोकलो (आगळ अने साइड):"
        }
    },

    "Lip Reduction": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: {
            en: "🎯 *Concern with Your Lips:* (Too large, Uneven, Asymmetry, etc.):",
            hi: "🎯 *होंठों से जुड़ी समस्या:* (बहुत बड़े, असमान, असंतुलन आदि):",
            gu: "🎯 *હोઠोनी समस्या:* (ઘणा मोटा, असमान, असंतुलन वगेरे):"
        },
        specificOptions: null,
        photo: {
            en: "📸 Share *Clear Photos* of your lips (Front & Side):",
            hi: "📸 होंठों की *साफ फोटो* भेजें (सामने और साइड):",
            gu: "📸 હोઠोना *स्पष्ट फोटो* मोकलो (आगळ अने साइड):"
        }
    },

    "Facial Rejuvenation": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: {
            en: "🎯 *Your Skin Concern:* (Wrinkles, Sagging skin, Dull skin, Fine lines, Anti-aging, etc.):",
            hi: "🎯 *त्वचा की समस्या:* (झुर्रियां, ढीली त्वचा, बेजान त्वचा, फाइन लाइन्स आदि):",
            gu: "🎯 *ত্বকनी समस्या:* (ઝुर्रियां, ढीली त्वचा, बेजान त्वचा, फाइन लाइन्स वगेरे):"
        },
        specificOptions: null,
        photo: {
            en: "📸 Share *Clear Face Photos* (Front & Side):",
            hi: "📸 चेहरे की *साफ फोटो* भेजें (सामने और साइड):",
            gu: "📸 ચेहराना *स्पष्ट फोटो* मोकलो (आगळ अने साइड):"
        }
    },

    "Brow Lift": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null,
        specificOptions: null,
        photo: {
            en: "📸 Share *Clear Face Photos* (Front & Side):",
            hi: "📸 चेहरे की *साफ फोटो* भेजें (सामने और साइड):",
            gu: "📸 ચेहराना *स्पष्ट फोटो* मोकलो (आगळ अने साइड):"
        }
    },

    "Dimple Creation": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null,
        specificOptions: null,
        photo: {
            en: "📸 Share *Clear Face Photos* (Front & Side):",
            hi: "📸 चेहरे की *साफ फोटो* भेजें (सामने और साइड):",
            gu: "📸 ચेहराना *स्पष्ट फोटो* मोकलो (आगळ अने साइड):"
        }
    },

    "Jawline Creation": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null,
        specificOptions: null,
        photo: {
            en: "📸 Share *Clear Face Photos* (Front & Side):",
            hi: "📸 चेहरे की *साफ फोटो* भेजें (सामने और साइड):",
            gu: "📸 ચेहराना *स्पष्ट फोटो* मोकलो (आगळ अने साइड):"
        }
    },

    "Double Chin Reduction": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null,
        specificOptions: null,
        photo: {
            en: "📸 Share *Clear Face & Chin Photos* (Front & Side):",
            hi: "📸 चेहरे और ठुड्डी की *साफ फोटो* भेजें (सामने और साइड):",
            gu: "📸 ચेहरा अने चिनना *स्पष्ट फोटो* मोकलो (आगळ अने साइड):"
        }
    },

    "Otoplasty": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null,
        specificOptions: null,
        photo: {
            en: "📸 Share *Clear Photos* of your ears (Front & Side):",
            hi: "📸 कानों की *साफ फोटो* भेजें (सामने और साइड):",
            gu: "📸 કानोना *स्पष्ट फोटो* मोकलो (आगळ अने साइड):"
        }
    },

    // ── BREAST ──
    "Breast Augmentation": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"],
        specific: null, specificOptions: null, photo: null
    },
    "Breast Reduction": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"],
        specific: null, specificOptions: null, photo: null
    },
    "Breast Lift": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"],
        specific: null, specificOptions: null, photo: null
    },
    "Axillary Breast Removal": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"],
        specific: null, specificOptions: null, photo: null
    },
    "Breast Swelling Excision": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"],
        specific: null, specificOptions: null, photo: null
    },

    // ── BODY ──
    "Mommy Makeover": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"],
        specific: null, specificOptions: null, photo: null
    },
    "Genital Rejuvenation": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"],
        specific: null, specificOptions: null, photo: null
    },
    "Liposuction": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height", "form_specific"],
        specific: {
            en: "📍 *Area(s) You Want Treated:* (Abdomen, Waist, Thighs, Arms, Chin, etc.):",
            hi: "📍 *किन हिस्सों का इलाज चाहते हैं:* (पेट, कमर, जांघ, बाहें, ठुड्डी आदि):",
            gu: "📍 *ક્યા ભागनी सारवार कराववी छे:* (पेट, कमर, जांघ, हाथ, चिन वगेरे):"
        },
        specificOptions: null,
        photo: null
    },
    "Abdominoplasty": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"],
        specific: null, specificOptions: null, photo: null
    },
    "Gender Reassignment M-F": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"],
        specific: null, specificOptions: null, photo: null
    },
    "Gender Reassignment F-M": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height"],
        specific: null, specificOptions: null, photo: null
    },

    // ── GYNECOMASTIA ──
    "Gynecomastia Surgery": {
        fields: ["form_name", "form_city", "form_age", "form_weight", "form_height", "form_photos"],
        specific: null,
        specificOptions: null,
        photo: {
            en: "📸 Share *2-3 Clear Chest Photos*:",
            hi: "📸 *2-3 छाती की साफ फोटो* भेजें:",
            gu: "📸 *2-3 છاتीना स्पष्ट फोटो* मोकलो:"
        }
    },

    // ── SKIN ──
    "Skin Rejuvenation": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: {
            en: "🎯 *Skin Concern:* (Wrinkles, Dull Skin, Anti-Aging, Fine Lines, Glow, etc.):",
            hi: "🎯 *त्वचा की समस्या:* (झुर्रियां, बेजान त्वचा, एंटी-एजिंग, फाइन लाइन्स आदि):",
            gu: "🎯 *ত্বकनी समस्या:* (ઝुर्रियां, बेजान त्वचा, एन्टी-एजिंग, फाइन लाइन्स वगेरे):"
        },
        specificOptions: null,
        photo: {
            en: "📸 Share *2-3 Clear Photos* of the concerned area:",
            hi: "📸 प्रभावित हिस्से की *2-3 साफ फोटो* भेजें:",
            gu: "📸 असरग्रस्त भागना *2-3 स्पष्ट फोटो* मोकलो:"
        }
    },
    "Acne Scar Treatment": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null,
        specificOptions: null,
        photo: {
            en: "📸 Share *2-3 Clear Photos* of the affected area:",
            hi: "📸 प्रभावित हिस्से की *2-3 साफ फोटो* भेजें:",
            gu: "📸 असरग्रस्त भागना *2-3 स्पष्ट फोटो* मोकलो:"
        }
    },
    "Skin Pigmentation": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null,
        specificOptions: null,
        photo: {
            en: "📸 Share *2-3 Clear Photos* of the affected area:",
            hi: "📸 प्रभावित हिस्से की *2-3 साफ फोटो* भेजें:",
            gu: "📸 असरग्रस्त भागना *2-3 स्पष्ट फोटो* मोकलो:"
        }
    },
    "Scar Revision": {
        fields: ["form_name", "form_city", "form_age", "form_specific", "form_photos"],
        specific: {
            en: "🎯 *Scar Details:* (Location on body, Old or New scar, Type, etc.):",
            hi: "🎯 *दाग की जानकारी:* (शरीर पर कहाँ, पुराना या नया दाग, प्रकार आदि):",
            gu: "🎯 *ডाগनी माहिती:* (शरीर पर क्यां, जुनो के नवो डाग, प्रकार वगेरे):"
        },
        specificOptions: null,
        photo: {
            en: "📸 Share *2-3 Clear Photos* of the scar:",
            hi: "📸 दाग की *2-3 साफ फोटो* भेजें:",
            gu: "📸 डागना *2-3 स्पष्ट फोटो* मोकलो:"
        }
    },
    "Vitiligo": {
        fields: ["form_name", "form_city", "form_age", "form_photos"],
        specific: null,
        specificOptions: null,
        photo: {
            en: "📸 Share *2-3 Clear Photos* of the affected area:",
            hi: "📸 प्रभावित हिस्से की *2-3 साफ फोटो* भेजें:",
            gu: "📸 असरग्रस्त भागना *2-3 स्पष्ट फोटो* मोकलो:"
        }
    }
};

function getSF(svc) {
    return SERVICE_FORMS[svc] || {
        fields: ["form_name", "form_city", "form_age"],
        specific: null, specificOptions: null, photo: null
    };
}

const TIME_SLOTS = ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];

// ============ MESSAGES ============
const MSG = {
    welcome: {
        en: "👋 Hi {name}! Welcome to *Celebre Aesthetics* 🌸\n\nGujarat's leading aesthetic clinic — Surat, Ahmedabad & Rajkot.\n\nLet me help you explore treatments and book a free consultation.",
        hi: "👋 नमस्ते {name}! *Celebre Aesthetics* में स्वागत है 🌸\n\nगुजरात की अग्रणी क्लिनिक — सूरत, अहमदाबाद, राजकोट।\n\nट्रीटमेंट जानने और फ्री कंसल्टेशन बुक करने में मदद करता/करती हूँ।",
        gu: "👋 નмसते {name}! *Celebre Aesthetics* मां स्वागत छे 🌸\n\nगुजरातनी अग्रणी क्लिनिक — सुरत, अमदावाद, राजकोट.\n\nटीटमेन्ट जाणवा अने फ्री कन्सल्टेशन बुक करवामां मदद करुं छुं."
    },
    select_cat: {
        en: "Please select a treatment category:",
        hi: "कृपया ट्रीटमेंट कैटेगरी चुनें:",
        gu: "કृपा करीने ट्रीटमेन्ट केटेगरी पसंद करो:"
    },
    select_svc: {
        en: "Here are our {cat} options:",
        hi: "{cat} के विकल्प:",
        gu: "{cat} ना विकल्पो:"
    },
    form_start: {
        en: "To help our specialist prepare, please answer a few quick questions. 📋",
        hi: "कंसल्टेशन के लिए कुछ सवालों के जवाब दें। 📋",
        gu: "કन्सल्टेशन माटे थोडा प्रश्नोना जवाब आपो. 📋"
    },
    ask_name: { en: "👤 Your *Name*:", hi: "👤 आपका *नाम*:", gu: "👤 तमारुं *नाम*:" },
    ask_city: { en: "📍 Your *City / Location*:", hi: "📍 आपका *शहर / लोकेशन*:", gu: "📍 तमारुं *शहेर / स्थान*:" },
    ask_age: { en: "🎂 Your *Age*:", hi: "🎂 आपकी *उम्र*:", gu: "🎂 तमारी *ऊंमर*:" },
    ask_weight: { en: "⚖️ Your *Approx. Weight* (kg):", hi: "⚖️ आपका *अनुमानित वज़न* (kg):", gu: "⚖️ तमारुं *अंदाजित वजन* (kg):" },
    ask_height: { en: "📏 Your *Height*:", hi: "📏 आपकी *ऊंचाई*:", gu: "📏 तमारी *ऊंचाई*:" },
    book_ask: {
        en: "Would you like to book a consultation date?",
        hi: "क्या आप कंसल्टेशन डेट बुक करना चाहेंगे?",
        gu: "शुं तमे कन्सल्टेशन डेट बुक करवा माँगो छो?"
    },
    ask_date: {
        en: "📅 Type your preferred *date*.\nFormat: *25 June 2026*\n(Future dates only)",
        hi: "📅 *तारीख* लिखें।\nफॉर्मेट: *25 June 2026*\n(सिर्फ आने वाली तारीख)",
        gu: "📅 *तारीख* लखो.\nफोर्मेट: *25 June 2026*\n(मात्र भविष्यनी तारीख)"
    },
    bad_date: {
        en: "❌ Enter a valid *future date*.\nFormat: *25 June 2026*",
        hi: "❌ सही *भविष्य की तारीख* लिखें।\nफॉर्मेट: *25 June 2026*",
        gu: "❌ योग्य *भविष्यनी तारीख* लखो.\nफोर्मेट: *25 June 2026*"
    },
    select_time: { en: "🕐 Select a time slot:", hi: "🕐 समय चुनें:", gu: "🕐 समय पसंद करो:" },
    confirmed: {
        en: "✅ *Consultation Booked!*\n\n🏥 Service: *{service}*\n👤 Name: *{name}*\n📍 City: *{city}*\n🎂 Age: *{age}*\n{extra}📅 Date: *{date}*\n🕐 Time: *{time}*\n\nOur specialist will call you soon.\nThank you! 💜\n\n📍 Surat | Ahmedabad | Rajkot\n🌐 celebre.in",
        hi: "✅ *कंसल्टेशन बुक!*\n\n🏥 सेवा: *{service}*\n👤 नाम: *{name}*\n📍 शहर: *{city}*\n🎂 उम्र: *{age}*\n{extra}📅 तारीख: *{date}*\n🕐 समय: *{time}*\n\nविशेषज्ञ जल्द संपर्क करेंगे।\nधन्यवाद! 💜\n\n📍 सूरत | अहमदाबाद | राजकोट\n🌐 celebre.in",
        gu: "✅ *કन्सल्टेशन बुक!*\n\n🏥 सेवा: *{service}*\n👤 नाम: *{name}*\n📍 शहेर: *{city}*\n🎂 ऊंमर: *{age}*\n{extra}📅 तारीख: *{date}*\n🕐 समय: *{time}*\n\nनिष्णात टूंक समयमां संपर्क करशे.\nआभार! 💜\n\n📍 सुरत | अमदावाद | राजकोट\n🌐 celebre.in"
    },
    again: {
        en: "Say *Celebre* to start again!",
        hi: "*Celebre* भेजें फिर से शुरू करने के लिए!",
        gu: "*Celebre* मोकलो फरीथी शरू करवा!"
    },
    btn_book: { en: "Yes, Book Now", hi: "हाँ, बुक करें", gu: "हा, बुक करो" },
    btn_other: { en: "Other Services", hi: "अन्य सेवाएं", gu: "अन्य सेवाओ" },
    v_name: { en: "❌ Enter a valid *name* (letters only):", hi: "❌ सही *नाम* लिखें (सिर्फ अक्षर):", gu: "❌ योग्य *नाम* लखो (मात्र अक्षरो):" },
    v_city: { en: "❌ Enter a valid *city name*:", hi: "❌ सही *शहर का नाम* लिखें:", gu: "❌ योग्य *शहेरनुं नाम* लखो:" },
    v_age: { en: "❌ Enter valid *age* (10-100):", hi: "❌ सही *उम्र* लिखें (10-100):", gu: "❌ योग्य *ऊंमर* लखो (10-100):" },
    v_weight: { en: "❌ Enter valid *weight* in kg (20-300):", hi: "❌ सही *वज़न* kg में लिखें (20-300):", gu: "❌ योग्य *वजन* kg मां लखो (20-300):" },
    v_height: { en: "❌ Enter valid *height* (e.g. 5'6 or 168cm):", hi: "❌ सही *ऊंचाई* लिखें:", gu: "❌ योग्य *ऊंचाई* लखो:" },
    v_specific: { en: "❌ Please describe in at least a few words:", hi: "❌ कम से कम कुछ शब्दों में बताएं:", gu: "❌ ઓछामां ओछा थोडा शब्दोमां जणावो:" },
    v_photo: { en: "❌ Please send a *photo/image*, not text 📸", hi: "❌ *फोटो* भेजें, टेक्स्ट नहीं 📸", gu: "❌ *फोटो* मोकलो, टेक्स्ट नहीं 📸" },
    force_answer: { en: "⚠️ Please answer the current question first.", hi: "⚠️ कृपया पहले मौजूदा सवाल का जवाब दें।", gu: "⚠️ कृपा करीने पहेला हालना प्रश्ननो जवाब आपो." },
    force_select: { en: "⚠️ Please select an option from above.", hi: "⚠️ कृपया ऊपर दिए गए विकल्प में से चुनें।", gu: "⚠️ कृपा करीने उपरना विकल्पमांथी पसंद करो." }
};

// ============ HELPERS ============
function t(k, l, r) {
    let s = typeof k === "object" ? (k[l] || k["en"] || "") : (MSG[k]?.[l] || MSG[k]?.["en"] || "");
    if (r) { for (const x in r) s = s.replace(new RegExp("\\{" + x + "\\}", "g"), r[x]); }
    return s;
}
async function getC(ph, nm) {
    let c = await Conversation.findOne({ phone: ph });
    if (!c) { c = new Conversation({ phone: ph, name: nm, state: "language_selection" }); await c.save(); }
    return c;
}
async function up(ph, d) { d.updated_at = new Date(); await Conversation.findOneAndUpdate({ phone: ph }, d, { upsert: true }); }
function isGreet(m) { return ["hi", "hello", "hey", "hii", "hiii", "start", "helo", "namaste", "celebre", "celebre aesthetics"].includes(m.toLowerCase()); }
function findCat(m) { const l = m.toLowerCase(); for (const c of Object.keys(CATEGORIES)) { if (l.includes(c.toLowerCase().split(" ")[0])) return c; } return null; }
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
    if (l.includes("gujarati") || l.includes("ગуजरাতী") || l === "gu") return "gu";
    return null;
}
function isMedia(b) { return b.content?.contentType === "media" || !!b.content?.media; }
function aL(l) { return l === "hi" ? "Hindi" : l === "gu" ? "Gujarati" : "English"; }
function validDate(s) { const p = new Date(s); if (isNaN(p.getTime())) return false; const d = new Date(); d.setHours(0, 0, 0, 0); return p >= d; }
function fmtDate(s) {
    const p = new Date(s);
    const d = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const m = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return d[p.getDay()] + ", " + p.getDate() + " " + m[p.getMonth()] + " " + p.getFullYear();
}
function findTime(m) { const l = m.toLowerCase().replace(/\s/g, ""); for (const s of TIME_SLOTS) { if (l.includes(s.toLowerCase().replace(/\s/g, ""))) return s; } return null; }
function isValidName(m) { return m.length >= 2 && /^[a-zA-Z\u0900-\u097F\u0A80-\u0AFF\s.]+$/.test(m); }
function isValidCity(m) { return m.length >= 2 && /^[a-zA-Z\u0900-\u097F\u0A80-\u0AFF\s,.-]+$/.test(m); }

function extractMessage(body, media) {
    const waTitle = body.whatsapp?.title || "";
    const postback = body.postback?.data || "";
    const interactiveTitle = body.interactive?.title || body.interactive?.list_reply?.title || body.interactive?.button_reply?.title || "";
    const listReply = body.listReply?.title || body.buttonReply?.title || "";
    const textContent = body.content?.text || body.UserResponse || "";
    const msg = waTitle || postback || interactiveTitle || listReply || textContent || (media ? "__PHOTO__" : "");
    return msg.trim();
}

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

// ============ MAIN ============
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
            await up(phone, {
                state: "language_selection", language: "", selected_category: "", selected_service: "",
                form_name: "", form_city: "", form_age: "", form_weight: "", form_height: "",
                form_specific: "", form_photos: "", booking_date: "", booking_time: ""
            });
            await sendButtons(phone, "Select your language / भाषा चुनें / ભाষા પсंद करो", ["English", "हिंदी", "ગуजраती"], "Celebre Aesthetics");
            return res.status(200).json({ success: true });
        }

        // LANGUAGE
        if (convo.state === "language_selection") {
            const dl = detectL(message);
            if (dl) {
                await up(phone, { language: dl, state: "category_selection" });
                await sendText(phone, t("welcome", dl, { name: senderName || "there" }));
                await sendList(phone, t("select_cat", dl), "Our Services", [{ title: "Categories", rows: Object.keys(CATEGORIES).map(c => ({ title: c, description: CATEGORIES[c].length + " procedures" })) }], "Celebre Aesthetics");
                return res.status(200).json({ success: true });
            }
            await sendText(phone, t("force_select", lang));
            await sendButtons(phone, "Select a language", ["English", "हिंदी", "ગуजраती"], "Celebre Aesthetics");
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
            await sendList(phone, t("select_cat", lang), "Our Services", [{ title: "Categories", rows: Object.keys(CATEGORIES).map(c => ({ title: c, description: CATEGORIES[c].length + " procedures" })) }], "Celebre Aesthetics");
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
            // FORCE — wrong input type
            if (convo.state !== "form_photos" && convo.state !== "form_specific" && (message === "__PHOTO__" || media)) {
                await sendText(phone, t("force_answer", lang));
                await sendFQ(phone, convo.state, convo.selected_service, lang);
                return res.status(200).json({ success: true });
            }

            // VALIDATION
            if (convo.state === "form_name" && !isValidName(message)) {
                await sendText(phone, t("v_name", lang)); return res.status(200).json({ success: true });
            }
            if (convo.state === "form_city" && !isValidCity(message)) {
                await sendText(phone, t("v_city", lang)); return res.status(200).json({ success: true });
            }
            if (convo.state === "form_age") {
                const a = Number(message);
                if (isNaN(a) || a < 10 || a > 100 || !Number.isInteger(a)) {
                    await sendText(phone, t("v_age", lang)); return res.status(200).json({ success: true });
                }
            }
            if (convo.state === "form_weight") {
                const w = Number(message);
                if (isNaN(w) || w < 20 || w > 300) {
                    await sendText(phone, t("v_weight", lang)); return res.status(200).json({ success: true });
                }
            }
            if (convo.state === "form_height" && (message === "__PHOTO__" || media || message.length < 2)) {
                await sendText(phone, t("v_height", lang)); return res.status(200).json({ success: true });
            }
            if (convo.state === "form_specific" && !media && message !== "__PHOTO__" && message.length < 3) {
                await sendText(phone, t("v_specific", lang)); return res.status(200).json({ success: true });
            }
            if (convo.state === "form_photos" && !media && message !== "__PHOTO__") {
                await sendText(phone, t("v_photo", lang)); return res.status(200).json({ success: true });
            }

            // STORE
            if (convo.state === "form_photos") await up(phone, { form_photos: "received" });
            else await up(phone, { [convo.state]: message });

            // NEXT FIELD or DONE
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
            if (l.includes("yes") || l.includes("book") || l.includes("हाँ") || l.includes("हां") || l.includes("बुक") || l.includes("हा") || l.includes("બुक")) {
                await sendText(phone, t("ask_date", lang));
                await up(phone, { state: "date_selection" });
                return res.status(200).json({ success: true });
            }
            if (l.includes("other") || l.includes("service") || l.includes("अन्य") || l.includes("अन्य") || l.includes("सेव")) {
                await sendList(phone, t("select_cat", lang), "Our Services", [{ title: "Categories", rows: Object.keys(CATEGORIES).map(c => ({ title: c, description: CATEGORIES[c].length + " procedures" })) }], "Celebre Aesthetics");
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
                await sendList(phone,
                    t("select_time", lang) + "\n\n📅 " + fd,
                    lang === "en" ? "Select Time" : lang === "hi" ? "समय चुनें" : "समय पसंद करो",
                    [{ title: lang === "en" ? "Available" : lang === "hi" ? "उपलब्ध" : "ઉपलब्ध", rows: TIME_SLOTS.map(s => ({ title: s, description: "Available" })) }],
                    "Celebre Aesthetics"
                );
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
                if (latestFields.includes("form_weight")) extra += "⚖️ " + (lang === "en" ? "Weight" : lang === "hi" ? "वज़न" : "वजन") + ": *" + latest.form_weight + "*\n";
                if (latestFields.includes("form_height")) extra += "📏 " + (lang === "en" ? "Height" : lang === "hi" ? "ऊंचाई" : "ऊंचाई") + ": *" + latest.form_height + "*\n";
                if (latestSF.specific && latest.form_specific) extra += "🎯 " + (lang === "en" ? "Details" : lang === "hi" ? "विवरण" : "विगत") + ": *" + latest.form_specific + "*\n";
                if (latestSF.photo) extra += "📸 " + (lang === "en" ? "Photos" : lang === "hi" ? "फोटो" : "फोटो") + ": *" + (lang === "en" ? "Received" : lang === "hi" ? "प्राप्त" : "प्राप्त") + "*\n";
                await sendText(phone, t("confirmed", lang, { service: latest.selected_service, name: latest.form_name, city: latest.form_city, age: latest.form_age, extra, date: latest.booking_date, time: slot }));
                return res.status(200).json({ success: true });
            }
            await sendText(phone, t("force_select", lang));
            await sendList(phone, t("select_time", lang),
                lang === "en" ? "Select Time" : lang === "hi" ? "समय चुनें" : "समय पसंद करो",
                [{ title: lang === "en" ? "Available" : lang === "hi" ? "उपलब्ध" : "ઉपलब्ध", rows: TIME_SLOTS.map(s => ({ title: s, description: "Available" })) }],
                "Celebre Aesthetics"
            );
            return res.status(200).json({ success: true });
        }

        // CONFIRMED
        if (convo.state === "confirmed") {
            await sendText(phone, t("again", lang));
            return res.status(200).json({ success: true });
        }

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