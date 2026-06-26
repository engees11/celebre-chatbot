// api/webhook.js - v6 Final

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

// ============ SERVICE FORMS ============
const SERVICE_FORMS = {
    "Hair Transplant": { needsWeight: false, needsHeight: false, specific: { en: "💇 Your *Hair Loss Stage*:", hi: "💇 आपका *हेयर लॉस स्टेज*:", gu: "💇 તમારો *હેર લોસ સ્ટેજ*:" }, specificOptions: ["Mild", "Moderate", "Severe"], photo: { en: "📸 Share *2-3 Hair Photos* (Front, Top & Back):", hi: "📸 *2-3 बालों की फोटो* भेजें (आगे, ऊपर, पीछे):", gu: "📸 *2-3 વાળના ફોટો* મોકલો (આગળ, ઉપર, પાછળ):" } },
    "Hair Growth": { needsWeight: false, needsHeight: false, specific: { en: "💇 Describe your *Hair Thinning concern*:", hi: "💇 *बाल पतले होने की समस्या* बताएं:", gu: "💇 *વાળ પાતળા થવાની સમસ્યા* જણાવો:" }, specificOptions: null, photo: { en: "📸 Share *2-3 Hair Photos*:", hi: "📸 *2-3 बालों की फोटो* भेजें:", gu: "📸 *2-3 વાળના ફોટો* મોકલો:" } },
    "Laser Hair Removal": { needsWeight: false, needsHeight: false, specific: { en: "📍 Which *body area(s)* for removal? (Face, Arms, Legs, etc.):", hi: "📍 *किन हिस्सों से बाल हटाने* हैं? (चेहरा, बाहें, टांगें आदि):", gu: "📍 *ક્યા ભાગમાંથી વાળ દૂર* કરવા છે? (ચહેરો, હાથ, પગ વગેરે):" }, specificOptions: null, photo: null },
    "Rhinoplasty": { needsWeight: false, needsHeight: false, specific: { en: "🎯 Your *Nose Concern* (Shape, Size, Bump, Breathing, etc.):", hi: "🎯 *नाक की समस्या* (आकार, साइज़, उभार, सांस आदि):", gu: "🎯 *નાક સંબંધિત સમસ્યા* (આકાર, સાઈઝ, બ્રીથિંગ વગેરે):" }, specificOptions: null, photo: { en: "📸 Share *Front & Side Profile Photos*:", hi: "📸 *सामने और साइड फोटो* भेजें:", gu: "📸 *આગળ અને સાઈડ ફોટો* મોકલો:" } },
    "Lip Augmentation": { needsWeight: false, needsHeight: false, specific: { en: "🎯 What *lip improvement* do you want?:", hi: "🎯 *होंठों में क्या सुधार* चाहते हैं?:", gu: "🎯 *હોઠમાં શું સુધારો* ઈચ્છો છો?:" }, specificOptions: null, photo: { en: "📸 Share *Close-up Lip Photo*:", hi: "📸 *होंठों की क्लोज़-अप फोटो* भेजें:", gu: "📸 *હોઠનો ક્લોઝ-અપ ફોટો* મોકલો:" } },
    "Lip Reduction": { needsWeight: false, needsHeight: false, specific: { en: "🎯 Your *lip concern* (Size, Shape, etc.):", hi: "🎯 *होंठों की समस्या* (साइज़, आकार आदि):", gu: "🎯 *હોઠ સંબંધિત સમસ્યા* (સાઈઝ, આકાર વગેરે):" }, specificOptions: null, photo: { en: "📸 Share *Close-up Lip Photo*:", hi: "📸 *होंठों की क्लोज़-अप फोटो* भेजें:", gu: "📸 *હોઠનો ક્લોઝ-અપ ફોટો* મોકલો:" } },
    "Facial Rejuvenation": { needsWeight: false, needsHeight: false, specific: { en: "🎯 Your *concern*? (Wrinkles, Sagging, Dullness, etc.):", hi: "🎯 *समस्या*? (झुर्रियां, ढीली त्वचा आदि):", gu: "🎯 *સમસ્યા*? (કરચલી, ઢીલી ત્વચા વગેરે):" }, specificOptions: null, photo: { en: "📸 Share *2-3 Face Photos*:", hi: "📸 *2-3 चेहरे की फोटो* भेजें:", gu: "📸 *2-3 ચહેરાના ફોટો* મોકલો:" } },
    "Brow Lift": { needsWeight: false, needsHeight: false, specific: { en: "🎯 Your *concern*? (Sagging brows, Forehead wrinkles, etc.):", hi: "🎯 *समस्या*? (झुकी भौंहें, माथे की झुर्रियां आदि):", gu: "🎯 *સમસ્યા*? (ઝૂકેલી ભમર, કપાળની કરચલી વગેરે):" }, specificOptions: null, photo: { en: "📸 Share *Front Face Photo*:", hi: "📸 *सामने से चेहरे की फोटो* भेजें:", gu: "📸 *આગળથી ચહેરાનો ફોટો* મોકલો:" } },
    "Dimple Creation": { needsWeight: false, needsHeight: false, specific: null, specificOptions: null, photo: { en: "📸 Share a *Smiling Face Photo*:", hi: "📸 *मुस्कुराते चेहरे की फोटो* भेजें:", gu: "📸 *સ્મિત ચહેરાનો ફોટો* મોકલો:" } },
    "Jawline Creation": { needsWeight: false, needsHeight: false, specific: { en: "🎯 What *jawline improvement*? (Sharper, Defined, Slimmer, etc.):", hi: "🎯 *जॉलाइन में क्या सुधार*? (शार्प, स्लिम आदि):", gu: "🎯 *જૉલાઈનમાં શું સુધારો*?:" }, specificOptions: null, photo: { en: "📸 Share *Front & Side Photos*:", hi: "📸 *सामने और साइड फोटो* भेजें:", gu: "📸 *આગળ અને સાઈડ ફોટો* મોકલો:" } },
    "Double Chin Reduction": { needsWeight: false, needsHeight: false, specific: null, specificOptions: null, photo: { en: "📸 Share *Front & Side Photos*:", hi: "📸 *सामने और साइड फोटो* भेजें:", gu: "📸 *આગળ અને સાઈડ ફોટો* મોકલો:" } },
    "Otoplasty": { needsWeight: false, needsHeight: false, specific: { en: "🎯 Your *ear concern*? (Protruding, Asymmetric, etc.):", hi: "🎯 *कान की समस्या*? (बाहर निकले, असमान आदि):", gu: "🎯 *કાનની સમસ્યા*? (બહાર નીકળેલા, અસમાન વગેરે):" }, specificOptions: null, photo: { en: "📸 Share *Ear Photos* (Front & Side):", hi: "📸 *कानों की फोटो* भेजें:", gu: "📸 *કાનના ફોટો* મોકલો:" } },
    "Breast Augmentation": { needsWeight: true, needsHeight: true, specific: null, specificOptions: null, photo: null },
    "Breast Reduction": { needsWeight: true, needsHeight: true, specific: null, specificOptions: null, photo: null },
    "Breast Lift": { needsWeight: true, needsHeight: true, specific: null, specificOptions: null, photo: null },
    "Axillary Breast Removal": { needsWeight: false, needsHeight: false, specific: null, specificOptions: null, photo: { en: "📸 Share *2-3 Photos of the area*:", hi: "📸 *उस हिस्से की 2-3 फोटो* भेजें:", gu: "📸 *એ ભાગના 2-3 ફોટો* મોકલો:" } },
    "Breast Swelling Excision": { needsWeight: false, needsHeight: false, specific: { en: "🎯 Describe your *concern* (location, size, duration):", hi: "🎯 *समस्या* बताएं (जगह, साइज़, कब से):", gu: "🎯 *સમસ્યા* જણાવો (જગ્યા, સાઈઝ, ક્યારથી):" }, specificOptions: null, photo: null },
    "Mommy Makeover": { needsWeight: true, needsHeight: true, specific: { en: "🎯 Which *areas concern* you? (Tummy, Breasts, Waist, etc.):", hi: "🎯 *कौन से हिस्से* परेशान करते हैं? (पेट, छाती, कमर आदि):", gu: "🎯 *કયા ભાગો* ચિંતાજનક છે? (પેટ, છાતી, કમર વગેરે):" }, specificOptions: null, photo: null },
    "Genital Rejuvenation": { needsWeight: false, needsHeight: false, specific: { en: "🎯 Briefly describe your *concern*:", hi: "🎯 *समस्या* संक्षेप में बताएं:", gu: "🎯 *સમસ્યા* ટૂંકમાં જણાવો:" }, specificOptions: null, photo: null },
    "Liposuction": { needsWeight: true, needsHeight: true, specific: { en: "📍 *Area(s) to treat*? (Abdomen, Waist, Thighs, Arms, Chin, etc.):", hi: "📍 *किन हिस्सों का इलाज*? (पेट, कमर, जांघ, बाहें आदि):", gu: "📍 *ક્યા ભાગની સારવાર*? (પેટ, કમર, જાંઘ, હાથ વગેરે):" }, specificOptions: null, photo: null },
    "Abdominoplasty": { needsWeight: true, needsHeight: true, specific: { en: "🎯 Reason? (Post-pregnancy, Weight loss, Loose skin, etc.):", hi: "🎯 कारण? (प्रेगनेंसी के बाद, वज़न घटना, ढीली त्वचा आदि):", gu: "🎯 કારણ? (પ્રેગ્નન્સી પછી, વજન ઘટવું, ઢીલી ત્વચા વગેરે):" }, specificOptions: null, photo: null },
    "Gender Reassignment M-F": { needsWeight: true, needsHeight: true, specific: null, specificOptions: null, photo: null },
    "Gender Reassignment F-M": { needsWeight: true, needsHeight: true, specific: null, specificOptions: null, photo: null },
    "Gynecomastia Surgery": { needsWeight: true, needsHeight: true, specific: null, specificOptions: null, photo: { en: "📸 Share *2-3 Chest Photos*:", hi: "📸 *2-3 छाती की फोटो* भेजें:", gu: "📸 *2-3 છાતીના ફોટો* મોકલો:" } },
    "Skin Rejuvenation": { needsWeight: false, needsHeight: false, specific: { en: "🎯 Your *concern*? (Wrinkles, Dullness, Uneven tone, etc.):", hi: "🎯 *समस्या*? (झुर्रियां, बेजान त्वचा आदि):", gu: "🎯 *સમસ્યા*? (કરચલી, નિસ્તેજ ત્વચા વગેરે):" }, specificOptions: null, photo: { en: "📸 Share *2-3 Photos*:", hi: "📸 *2-3 फोटो* भेजें:", gu: "📸 *2-3 ફોટો* મોકલો:" } },
    "Acne Scar Treatment": { needsWeight: false, needsHeight: false, specific: { en: "🎯 Your *Acne/Scar type* (Deep, Shallow, Rolling, etc.):", hi: "🎯 *एक्ने/दाग का प्रकार* (गहरे, उथले आदि):", gu: "🎯 *એક્ને/ડાઘનો પ્રકાર* (ઊંડા, છીછરા વગેરે):" }, specificOptions: null, photo: { en: "📸 Share *2-3 Scar Photos*:", hi: "📸 *दागों की 2-3 फोटो* भेजें:", gu: "📸 *ડાઘના 2-3 ફોટો* મોકલો:" } },
    "Skin Pigmentation": { needsWeight: false, needsHeight: false, specific: { en: "🎯 Your *Pigmentation concern* (Dark spots, Melasma, etc.):", hi: "🎯 *पिगमेंटेशन* (डार्क स्पॉट्स, मेलास्मा आदि):", gu: "🎯 *પિગમેન્ટેશન* (ડાર્ક સ્પોટ્સ, મેલાસ્મા વગેરે):" }, specificOptions: null, photo: { en: "📸 Share *2-3 Photos*:", hi: "📸 *2-3 फोटो* भेजें:", gu: "📸 *2-3 ફોટો* મોકલો:" } },
    "Scar Revision": { needsWeight: false, needsHeight: false, specific: { en: "🎯 Your *scar* (cause, location, how old):", hi: "🎯 *दाग* (कारण, जगह, कितना पुराना):", gu: "🎯 *ડાઘ* (કારણ, જગ્યા, કેટલો જૂનો):" }, specificOptions: null, photo: { en: "📸 Share *2-3 Scar Photos*:", hi: "📸 *दाग की 2-3 फोटो* भेजें:", gu: "📸 *ડાઘના 2-3 ફોટો* મોકલો:" } },
    "Vitiligo": { needsWeight: false, needsHeight: false, specific: { en: "🎯 Your *Vitiligo* (areas, since when, spreading?):", hi: "🎯 *विटिलिगो* (कहां, कब से, फैल रहा?):", gu: "🎯 *વિટિલિગો* (ક્યાં, ક્યારથી, ફેલાઈ રહ્યો?):" }, specificOptions: null, photo: { en: "📸 Share *2-3 Photos*:", hi: "📸 *2-3 फोटो* भेजें:", gu: "📸 *2-3 ફોટો* મોકલો:" } }
};

function getSF(svc) { return SERVICE_FORMS[svc] || { needsWeight: false, needsHeight: false, specific: { en: "🎯 Describe your *concern*:", hi: "🎯 *समस्या* बताएं:", gu: "🎯 *સમસ્યા* જણાવો:" }, specificOptions: null, photo: null }; }

// ============ TIME SLOTS ============
const TIME_SLOTS = ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];

// ============ MESSAGES ============
const MSG = {
    welcome: { en: "👋 Hi {name}! Welcome to *Celebre Aesthetics* 🌸\n\nGujarat's leading aesthetic clinic — Surat, Ahmedabad & Rajkot.\n\nLet me help you explore treatments and book a free consultation.", hi: "👋 नमस्ते {name}! *Celebre Aesthetics* में स्वागत है 🌸\n\nगुजरात की अग्रणी एस्थेटिक क्लिनिक — सूरत, अहमदाबाद, राजकोट।\n\nट्रीटमेंट जानने और फ्री कंसल्टेशन बुक करने में मदद करता/करती हूँ।", gu: "👋 નમસ્તે {name}! *Celebre Aesthetics* માં સ્વાગત છે 🌸\n\nગુજરાતની અગ્રણી એસ્થેટિક ક્લિનિક — સુરત, અમદાવાદ, રાજકોટ.\n\nટ્રીટમેન્ટ જાણવા અને ફ્રી કન્સલ્ટેશન બુક કરવામાં મદદ કરું છું." },
    select_cat: { en: "Please select a treatment category:", hi: "कृपया ट्रीटमेंट कैटेगरी चुनें:", gu: "કૃપા કરીને ટ્રીટમેન્ટ કેટેગરી પસંદ કરો:" },
    select_svc: { en: "Here are our {cat} options:", hi: "{cat} के विकल्प:", gu: "{cat} ના વિકલ્પો:" },
    form_start: { en: "Great! A few quick questions for our specialist. 📋", hi: "बढ़िया! कुछ सवालों के जवाब दें। 📋", gu: "સરસ! થોડા પ્રશ્નોના જવાબ આપો. 📋" },
    ask_name: { en: "👤 Your *Name*:", hi: "👤 आपका *नाम*:", gu: "👤 તમારું *નામ*:" },
    ask_city: { en: "📍 Your *City / Location*:", hi: "📍 आपका *शहर*:", gu: "📍 તમારું *શહેર*:" },
    ask_age: { en: "🎂 Your *Age*:", hi: "🎂 आपकी *उम्र*:", gu: "🎂 તમારી *ઉંમર*:" },
    ask_weight: { en: "⚖️ Your *Weight* (kg):", hi: "⚖️ आपका *वज़न* (kg):", gu: "⚖️ તમારું *વજન* (kg):" },
    ask_height: { en: "📏 Your *Height* (e.g. 5'6 or 168cm):", hi: "📏 आपकी *ऊंचाई* (जैसे 5'6 या 168cm):", gu: "📏 તમારી *ઊંચાઈ* (જેમ કે 5'6 અથવા 168cm):" },
    book_ask: { en: "Would you like to book a free consultation call?", hi: "क्या आप फ्री कंसल्टेशन कॉल बुक करना चाहेंगे?", gu: "શું તમે ફ્રી કન્સલ્ટેશન કૉલ બુક કરવા માંગો છો?" },
    ask_date: { en: "📅 Type your preferred *date*.\nFormat: *25 June 2026*\n(Future dates only)", hi: "📅 *तारीख* लिखें।\nफॉर्मेट: *25 June 2026*\n(सिर्फ आने वाली तारीख)", gu: "📅 *તારીખ* લખો.\nફોર્મેટ: *25 June 2026*\n(માત્ર ભવિષ્યની તારીખ)" },
    bad_date: { en: "❌ Enter a valid *future date*.\nFormat: *25 June 2026*", hi: "❌ सही *भविष्य की तारीख* लिखें।\nफॉर्मेट: *25 June 2026*", gu: "❌ યોગ્ય *ભવિષ્યની તારીખ* લખો.\nફોર્મેટ: *25 June 2026*" },
    select_time: { en: "🕐 Select a time slot:", hi: "🕐 समय चुनें:", gu: "🕐 સમય પસંદ કરો:" },
    bad_time: { en: "Select a valid time from the list.", hi: "सूची से सही समय चुनें।", gu: "યાદીમાંથી યોગ્ય સમય પસંદ કરો." },
    confirmed: { en: "✅ *Consultation Booked!*\n\n🏥 Service: *{service}*\n👤 Name: *{name}*\n📍 City: *{city}*\n🎂 Age: *{age}*\n{extra}📅 Date: *{date}*\n🕐 Time: *{time}*\n\nOur specialist will call you soon.\nThank you! 💜\n\n📍 Surat | Ahmedabad | Rajkot\n🌐 celebre.in", hi: "✅ *कंसल्टेशन बुक!*\n\n🏥 सेवा: *{service}*\n👤 नाम: *{name}*\n📍 शहर: *{city}*\n🎂 उम्र: *{age}*\n{extra}📅 तारीख: *{date}*\n🕐 समय: *{time}*\n\nविशेषज्ञ जल्द संपर्क करेंगे।\nधन्यवाद! 💜\n\n📍 सूरत | अहमदाबाद | राजकोट\n🌐 celebre.in", gu: "✅ *કન્સલ્ટેશન બુક!*\n\n🏥 સેવા: *{service}*\n👤 નામ: *{name}*\n📍 શહેર: *{city}*\n🎂 ઉંમર: *{age}*\n{extra}📅 તારીખ: *{date}*\n🕐 સમય: *{time}*\n\nનિષ્ણાત ટૂંક સમયમાં સંપર્ક કરશે.\nઆભાર! 💜\n\n📍 સુરત | અમદાવાદ | રાજકોટ\n🌐 celebre.in" },
    again: { en: "Say *Celebre* to start again!", hi: "*Celebre* भेजें फिर से शुरू करने के लिए!", gu: "*Celebre* મોકલો ફરીથી શરૂ કરવા!" },
    btn_book: { en: "Yes, Book Now", hi: "हाँ, बुक करें", gu: "હા, બુક કરો" },
    btn_other: { en: "Other Services", hi: "अन्य सेवाएं", gu: "અન્ય સેવાઓ" },
    // Validation messages
    v_name: { en: "❌ Enter a valid *name* (letters only, min 2 chars):", hi: "❌ सही *नाम* लिखें (सिर्फ अक्षर, कम से कम 2):", gu: "❌ યોગ્ય *નામ* લખો (માત્ર અક્ષરો, ઓછામાં ઓછા 2):" },
    v_city: { en: "❌ Enter a valid *city name* (letters only):", hi: "❌ सही *शहर का नाम* लिखें (सिर्फ अक्षर):", gu: "❌ યોગ્ય *શહેરનું નામ* લખો (માત્ર અક્ષરો):" },
    v_age: { en: "❌ Enter valid *age* (10-100, numbers only):", hi: "❌ सही *उम्र* लिखें (10-100, सिर्फ नंबर):", gu: "❌ યોગ્ય *ઉંમર* લખો (10-100, માત્ર નંબર):" },
    v_weight: { en: "❌ Enter valid *weight* in kg (20-300):", hi: "❌ सही *वज़न* kg में लिखें (20-300):", gu: "❌ યોગ્ય *વજન* kg માં લખો (20-300):" },
    v_height: { en: "❌ Enter valid *height* (e.g. 5'6 or 168cm):", hi: "❌ सही *ऊंचाई* लिखें (जैसे 5'6 या 168cm):", gu: "❌ યોગ્ય *ઊંચાઈ* લખો (જેમ કે 5'6 અથવા 168cm):" },
    v_specific: { en: "❌ Please describe in at least a few words:", hi: "❌ कम से कम कुछ शब्दों में बताएं:", gu: "❌ ઓછામાં ઓછા થોડા શબ્દોમાં જણાવો:" },
    v_photo: { en: "❌ Please send a *photo/image*, not text 📸:", hi: "❌ *फोटो/इमेज* भेजें, टेक्स्ट नहीं 📸:", gu: "❌ *ફોટો/ઈમેજ* મોકલો, ટેક્સ્ટ નહીં 📸:" }
};

// ============ HELPERS ============
function t(k, l, r) { let s = typeof k === "object" ? (k[l] || k["en"] || "") : (MSG[k]?.[l] || MSG[k]?.["en"] || ""); if (r) { for (const x in r) s = s.replace(new RegExp("\\{" + x + "\\}", "g"), r[x]); } return s; }
async function getC(ph, nm) { let c = await Conversation.findOne({ phone: ph }); if (!c) { c = new Conversation({ phone: ph, name: nm, state: "language_selection" }); await c.save(); } return c; }
async function up(ph, d) { d.updated_at = new Date(); await Conversation.findOneAndUpdate({ phone: ph }, d, { upsert: true }); }
function isGreet(m) { return ["hi", "hello", "hey", "hii", "hiii", "start", "helo", "namaste", "celebre", "celebre aesthetics"].includes(m.toLowerCase()); }
function findCat(m) { const l = m.toLowerCase(); for (const c of Object.keys(CATEGORIES)) { if (l.includes(c.toLowerCase().split(" ")[0])) return c; } return null; }
function findSvc(m) { const l = m.toLowerCase(); for (const c of Object.keys(CATEGORIES)) { for (const s of CATEGORIES[c]) { if (l.includes(s.title.toLowerCase()) || s.title.toLowerCase().includes(l)) return { category: c, service: s.title }; } } return null; }
function detectL(m) { const l = m.toLowerCase(); if (l.includes("english") || l === "en") return "en"; if (l.includes("hindi") || l.includes("हिंदी") || l === "hi") return "hi"; if (l.includes("gujarati") || l.includes("ગુજરાતી") || l === "gu") return "gu"; return null; }
function isMedia(b) { return b.content?.contentType === "media" || !!b.content?.media; }
function aL(l) { return l === "hi" ? "Hindi" : l === "gu" ? "Gujarati" : "English"; }
function validDate(s) { const p = new Date(s); if (isNaN(p.getTime())) return false; const t = new Date(); t.setHours(0, 0, 0, 0); return p >= t; }
function fmtDate(s) { const p = new Date(s); const d = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; const m = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; return d[p.getDay()] + ", " + p.getDate() + " " + m[p.getMonth()] + " " + p.getFullYear(); }
function findTime(m) { const l = m.toLowerCase().replace(/\s/g, ""); for (const s of TIME_SLOTS) { if (l.includes(s.toLowerCase().replace(/\s/g, ""))) return s; } return null; }
function isValidName(m) { return m.length >= 2 && /^[a-zA-Z\u0900-\u097F\u0A80-\u0AFF\s.]+$/.test(m); }
function isValidCity(m) { return m.length >= 2 && /^[a-zA-Z\u0900-\u097F\u0A80-\u0AFF\s,.-]+$/.test(m); }

function buildFlow(svc) { const f = getSF(svc); const fl = ["form_name", "form_city", "form_age"]; if (f.needsWeight) fl.push("form_weight"); if (f.needsHeight) fl.push("form_height"); if (f.specific) fl.push("form_specific"); if (f.photo) fl.push("form_photos"); return fl; }

async function sendFQ(ph, st, svc, lang) { const f = getSF(svc); switch (st) { case "form_name": await sendText(ph, t("ask_name", lang)); break; case "form_city": await sendText(ph, t("ask_city", lang)); break; case "form_age": await sendText(ph, t("ask_age", lang)); break; case "form_weight": await sendText(ph, t("ask_weight", lang)); break; case "form_height": await sendText(ph, t("ask_height", lang)); break; case "form_specific": if (f.specificOptions) await sendButtons(ph, t(f.specific, lang), f.specificOptions, "Celebre Aesthetics"); else await sendText(ph, t(f.specific, lang)); break; case "form_photos": await sendText(ph, t(f.photo, lang)); break; } }

// ============ MAIN ============
router.post("/", async (req, res) => {
    try {
        const body = req.body;
        const phone = body.from || "";
        const senderName = body.whatsapp?.senderName || "";
        const media = isMedia(body);
        const message = (body.content?.text || body.UserResponse || body.whatsapp?.title || body.interactive?.title || body.interactive?.list_reply?.title || body.interactive?.button_reply?.title || body.listReply?.title || body.buttonReply?.title || (media ? "__PHOTO__" : "")).trim();

        console.log("Incoming:", phone, message);
        if (!phone || !message) return res.status(200).json({ success: true });

        const TEST = ["917820870519"];
        if (!TEST.includes(phone)) { console.log("Skip:", phone); return res.status(200).json({ success: true }); }

        const convo = await getC(phone, senderName);
        const lang = convo.language || "en";

        // RESET
        if (isGreet(message)) {
            await up(phone, { state: "language_selection", language: "", selected_category: "", selected_service: "", form_name: "", form_city: "", form_age: "", form_weight: "", form_height: "", form_specific: "", form_photos: "", form_call_time: "", booking_date: "", booking_time: "" });
            await sendButtons(phone, "Select your language / भाषा चुनें / ભાષા પસંદ કરો", ["English", "हिंदी", "ગુજરાતી"], "Celebre Aesthetics");
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
            await sendButtons(phone, "Select a language", ["English", "हिंदी", "ગુજરાતી"], "Celebre Aesthetics");
            return res.status(200).json({ success: true });
        }

        // CATEGORY
        if (convo.state === "category_selection") {
            const cat = findCat(message) || message;
            const svcs = CATEGORIES[cat];
            if (svcs) {
                if (cat === "Gynecomastia") {
                    await up(phone, { selected_category: cat, selected_service: "Gynecomastia Surgery", state: "service_info" });
                    const info = await getAIReply("Tell me about Gynecomastia surgery at Celebre Aesthetics. Keep it exactly 3 lines. Reply in " + aL(lang), "Gynecomastia");
                    await sendText(phone, "ℹ️ *Gynecomastia Surgery*\n\n" + info);
                    await sendText(phone, t("form_start", lang));
                    await sendText(phone, t("ask_name", lang));
                    await up(phone, { state: "form_name" });
                } else {
                    await sendList(phone, t("select_svc", lang, { cat }), cat.split(" ")[0], [{ title: cat, rows: svcs }], cat);
                    await up(phone, { state: "service_selection", selected_category: cat });
                }
                return res.status(200).json({ success: true });
            }
            const r = await getAIReply(message + ". 3 lines max. Reply in " + aL(lang), "Category selection");
            await sendText(phone, r);
            return res.status(200).json({ success: true });
        }

        // SERVICE
        if (convo.state === "service_selection") {
            const svc = findSvc(message);
            if (svc) {
                await up(phone, { selected_service: svc.service, selected_category: svc.category, state: "service_info" });
                const info = await getAIReply("Tell me about " + svc.service + " at Celebre Aesthetics. Keep it exactly 3 lines. Reply in " + aL(lang), svc.service);
                await sendText(phone, "ℹ️ *" + svc.service + "*\n\n" + info);
                await sendText(phone, t("form_start", lang));
                await sendText(phone, t("ask_name", lang));
                await up(phone, { state: "form_name" });
                return res.status(200).json({ success: true });
            }
            const r = await getAIReply(message + ". 3 lines max. Reply in " + aL(lang), "Service selection");
            await sendText(phone, r);
            return res.status(200).json({ success: true });
        }

        // FORM STATES
        const formFlow = buildFlow(convo.selected_service);

        if (formFlow.includes(convo.state)) {

            // VALIDATION
            if (convo.state === "form_name") {
                if (message === "__PHOTO__" || media || !isValidName(message)) {
                    await sendText(phone, t("v_name", lang)); return res.status(200).json({ success: true });
                }
            }
            if (convo.state === "form_city") {
                if (message === "__PHOTO__" || media || !isValidCity(message)) {
                    await sendText(phone, t("v_city", lang)); return res.status(200).json({ success: true });
                }
            }
            if (convo.state === "form_age") {
                const age = Number(message);
                if (message === "__PHOTO__" || media || isNaN(age) || age < 10 || age > 100 || !Number.isInteger(age)) {
                    await sendText(phone, t("v_age", lang)); return res.status(200).json({ success: true });
                }
            }
            if (convo.state === "form_weight") {
                const wt = Number(message);
                if (message === "__PHOTO__" || media || isNaN(wt) || wt < 20 || wt > 300) {
                    await sendText(phone, t("v_weight", lang)); return res.status(200).json({ success: true });
                }
            }
            if (convo.state === "form_height") {
                if (message === "__PHOTO__" || media || message.length < 2) {
                    await sendText(phone, t("v_height", lang)); return res.status(200).json({ success: true });
                }
            }
            if (convo.state === "form_specific") {
                if (message === "__PHOTO__" || media || message.length < 3) {
                    await sendText(phone, t("v_specific", lang)); return res.status(200).json({ success: true });
                }
            }
            if (convo.state === "form_photos") {
                if (!media && message !== "__PHOTO__") {
                    await sendText(phone, t("v_photo", lang)); return res.status(200).json({ success: true });
                }
            }

            // STORE
            if (convo.state === "form_photos") {
                await up(phone, { form_photos: "received" });
            } else {
                const map = { form_name: "form_name", form_city: "form_city", form_age: "form_age", form_weight: "form_weight", form_height: "form_height", form_specific: "form_specific" };
                if (map[convo.state]) await up(phone, { [map[convo.state]]: message });
            }

            // NEXT
            const idx = formFlow.indexOf(convo.state);
            if (idx >= 0 && idx + 1 < formFlow.length) {
                const ns = formFlow[idx + 1];
                await sendFQ(phone, ns, convo.selected_service, lang);
                await up(phone, { state: ns });
            } else {
                // Form done → booking ask
                await sendButtons(phone, t("book_ask", lang), [t("btn_book", lang), t("btn_other", lang)], "Celebre Aesthetics");
                await up(phone, { state: "booking_ask" });
            }
            return res.status(200).json({ success: true });
        }

        // BOOKING ASK
        if (convo.state === "booking_ask") {
            const l = message.toLowerCase();
            if (l.includes("yes") || l.includes("book") || l.includes("हाँ") || l.includes("હા")) {
                await sendText(phone, t("ask_date", lang));
                await up(phone, { state: "date_selection" });
                return res.status(200).json({ success: true });
            }
            if (l.includes("other") || l.includes("service") || l.includes("अन्य") || l.includes("અન્ય")) {
                await sendList(phone, t("select_cat", lang), "Our Services", [{ title: "Categories", rows: Object.keys(CATEGORIES).map(c => ({ title: c, description: CATEGORIES[c].length + " procedures" })) }], "Celebre Aesthetics");
                await up(phone, { state: "category_selection", selected_category: "", selected_service: "" });
                return res.status(200).json({ success: true });
            }
            await sendButtons(phone, t("book_ask", lang), [t("btn_book", lang), t("btn_other", lang)], "Celebre Aesthetics");
            return res.status(200).json({ success: true });
        }

        // DATE
        if (convo.state === "date_selection") {
            if (validDate(message)) {
                const fd = fmtDate(message);
                await up(phone, { booking_date: fd, state: "time_selection" });
                await sendList(phone, t("select_time", lang) + "\n\n📅 " + fd, lang === "en" ? "Select Time" : lang === "hi" ? "समय चुनें" : "સમય પસંદ કરો", [{ title: lang === "en" ? "Available" : lang === "hi" ? "उपलब्ध" : "ઉપલબ્ધ", rows: TIME_SLOTS.map(s => ({ title: s, description: lang === "en" ? "Available" : lang === "hi" ? "उपलब्ध" : "ઉપલબ્ધ" })) }], "Celebre Aesthetics");
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
                const f = getSF(latest.selected_service);
                let extra = "";
                if (f.needsWeight) extra += "⚖️ " + (lang === "en" ? "Weight" : lang === "hi" ? "वज़न" : "વજન") + ": *" + latest.form_weight + "*\n";
                if (f.needsHeight) extra += "📏 " + (lang === "en" ? "Height" : lang === "hi" ? "ऊंचाई" : "ઊંચાઈ") + ": *" + latest.form_height + "*\n";
                if (f.specific) extra += "🎯 " + (lang === "en" ? "Details" : lang === "hi" ? "विवरण" : "વિગતો") + ": *" + latest.form_specific + "*\n";
                if (f.photo) extra += "📸 " + (lang === "en" ? "Photos" : lang === "hi" ? "फोटो" : "ફોટો") + ": *" + (lang === "en" ? "Received" : lang === "hi" ? "प्राप्त" : "પ્રાપ્ત") + "*\n";
                await sendText(phone, t("confirmed", lang, { service: latest.selected_service, name: latest.form_name, city: latest.form_city, age: latest.form_age, extra: extra, date: latest.booking_date, time: slot }));
                return res.status(200).json({ success: true });
            }
            await sendText(phone, t("bad_time", lang));
            return res.status(200).json({ success: true });
        }

        // CONFIRMED
        if (convo.state === "confirmed") {
            await sendText(phone, t("again", lang));
            return res.status(200).json({ success: true });
        }

        // DEFAULT
        const r = await getAIReply(message + ". 3 lines max. Reply in " + aL(lang), "General");
        await sendText(phone, r);
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(200).json({ success: true });
    }
});

module.exports = router;