// api/webhook.js - v13 New Question Flow (Document-based, no name/age/date/time-slot)

const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation");
const { getAIReply } = require("../services/ai");
const { sendText, sendButtons, sendList } = require("../utils/respond");

const CATEGORIES = {
    "Hair Treatment": [
        { title: "Hair Transplant", description: { en: "FUE scar-free method", hi: "FUE स्कार-फ्री तरीका", gu: "FUE સ્કાર-ફ્રી પદ્ધતિ" } },
        { title: "Hair Growth", description: { en: "PRP & mesotherapy", hi: "PRP और मेसोथेरापी", gu: "PRP અને મેસોથેરાપી" } },
        { title: "Laser Hair Removal", description: { en: "Permanent hair reduction", hi: "स्थायी बाल हटाना", gu: "કાયમી વાળ દૂર કરવા" } }
    ],
    "Face Treatment": [
        { title: "Rhinoplasty", description: { en: "Nose reshaping", hi: "नाक का आकार बदलना", gu: "નાકનો આકાર બદલવો" } },
        { title: "Lip Augmentation", description: { en: "Fuller lips", hi: "भरे हुए होंठ", gu: "ભરાવદાર હોઠ" } },
        { title: "Lip Reduction", description: { en: "Lip size reduction", hi: "होंठ का आकार कम करना", gu: "હોઠનું કદ ઘટાડવું" } },
        { title: "Facial Rejuvenation", description: { en: "Anti-aging", hi: "एंटी-एजिंग", gu: "એન્ટી-એજિંગ" } },
        { title: "Brow Lift", description: { en: "Forehead & brow lift", hi: "माथा और भौं लिफ्ट", gu: "કપાળ અને ભ્રમર લિફ્ટ" } },
        { title: "Dimple Creation", description: { en: "Natural dimples", hi: "प्राकृतिक डिम्पल", gu: "કુદરતી ડિમ્પલ" } },
        { title: "Jawline Creation", description: { en: "Defined jawline", hi: "स्पष्ट जॉलाइन", gu: "સ્પષ્ટ જૉલાઈન" } },
        { title: "Double Chin Reduction", description: { en: "Chin fat removal", hi: "ठुड्डी की चर्बी हटाना", gu: "ચિનની ચરબી દૂર કરવી" } },
        { title: "Otoplasty", description: { en: "Ear correction", hi: "कान सुधार", gu: "કાનનું સુધારણ" } }
    ],
    "Breast Treatment": [
        { title: "Breast Augmentation", description: { en: "Size enhancement", hi: "आकार बढ़ाना", gu: "કદ વધારવું" } },
        { title: "Breast Reduction", description: { en: "Size reduction", hi: "आकार कम करना", gu: "કદ ઘટાડવું" } },
        { title: "Breast Lift", description: { en: "Lift & reshape", hi: "लिफ्ट और आकार सुधार", gu: "લિફ્ટ અને આકાર સુધારણા" } },
        { title: "Axillary Breast Removal", description: { en: "Armpit tissue removal", hi: "अंडरआर्म टिशू हटाना", gu: "અન્ડરઆર્મ ટિશ્યુ દૂર કરવું" } },
        { title: "Breast Swelling Excision", description: { en: "Lump removal", hi: "गांठ हटाना", gu: "ગાંઠ દૂર કરવી" } }
    ],
    "Body Treatment": [
        { title: "Mommy Makeover", description: { en: "Post-pregnancy restore", hi: "प्रेगनेंसी के बाद शरीर सुधार", gu: "પ્રેગ્નન્સી પછી શરીર સુધારણા" } },
        { title: "Genital Rejuvenation", description: { en: "Intimate rejuvenation", hi: "इंटिमेट रिजुवेनेशन", gu: "ઈન્ટિમેટ રિજુવેનેશન" } },
        { title: "Liposuction", description: { en: "Fat removal", hi: "चर्बी हटाना", gu: "ચરબી દૂર કરવી" } },
        { title: "Abdominoplasty", description: { en: "Tummy tuck", hi: "टमी टक", gu: "ટમી ટક" } },
        { title: "Gender Reassignment M-F", description: { en: "Male to female", hi: "पुरुष से महिला", gu: "પુરુષથી સ્ત્રી" } },
        { title: "Gender Reassignment F-M", description: { en: "Female to male", hi: "महिला से पुरुष", gu: "સ્ત્રીથી પુરુષ" } }
    ],
    "Gynecomastia": [
        { title: "Gynecomastia Surgery", description: { en: "Male breast reduction", hi: "पुरुष स्तन कम करना", gu: "પુરુષ સ્તન ઘટાડવું" } }
    ],
    "Skin Treatment": [
        { title: "Skin Rejuvenation", description: { en: "Youthful glow", hi: "जवां चमक", gu: "યુવાન ચમક" } },
        { title: "Acne Scar Treatment", description: { en: "Scar removal", hi: "दाग हटाना", gu: "ડાઘ દૂર કરવા" } },
        { title: "Skin Pigmentation", description: { en: "Dark spots", hi: "डार्क स्पॉट्स", gu: "ડાર્ક સ્પોટ્સ" } },
        { title: "Scar Revision", description: { en: "Scar improvement", hi: "दाग सुधार", gu: "ડાઘ સુધારણા" } },
        { title: "Vitiligo", description: { en: "Vitiligo treatment", hi: "विटिलिगो उपचार", gu: "વિટિલિગો સારવાર" } }
    ]
};

function descFor(d, lang) { return typeof d === "object" ? (d[lang] || d.en) : d; }
function proc(l) { return l === "hi" ? " प्रक्रियाएं" : l === "gu" ? " સારવાર" : " procedures"; }
function catRows(l) { return Object.keys(CATEGORIES).map(c => ({ title: c, description: CATEGORIES[c].length + proc(l) })); }

// ============ SERVICE_FORMS — New Document-Based Question Flow ============
// Each question object: { key, text: {en,hi,gu}, type: "text"|"buttons"|"photo", options?:[...], photoCount?:n }
// Last question in every list is always "preferred_time" (text), added automatically.

const Q = {
    since_concern: { key: "q1", text: { en: "📅 Since when have you been experiencing this concern?", hi: "📅 आपको यह समस्या कब से है?", gu: "📅 તમને આ સમસ્યા ક્યારથી છે?" }, type: "text" },
    since_problem: { key: "q1", text: { en: "📅 Since when have you been experiencing this problem?", hi: "📅 आपको यह समस्या कब से है?", gu: "📅 તમને આ સમસ્યા ક્યારથી છે?" }, type: "text" },
    since_hairloss: { key: "q1", text: { en: "📅 Since when have you been experiencing hair loss?", hi: "📅 आपको बाल झड़ने की समस्या कब से है?", gu: "📅 તમને વાળ ખરવાની સમસ્યા ક્યારથી છે?" }, type: "text" },
    since_skin_concern: { key: "q1", text: { en: "📅 Since when have you been experiencing this skin concern?", hi: "📅 आपको यह स्किन समस्या कब से है?", gu: "📅 તમને આ સ્કિન સમસ્યા ક્યારથી છે?" }, type: "text" },
    lipo_since: { key: "q1", text: { en: "📅 Since when have you been concerned about the stubborn fat?", hi: "📅 आपको स्टबर्न फैट की समस्या कब से है?", gu: "📅 તમને સ્ટબર્ન ફેટની સમસ્યા ક્યારથી છે?" }, type: "text" },
    tummy_since: { key: "q1", text: { en: "📅 Since when have you been experiencing loose abdominal skin or excess tummy fat?", hi: "📅 आपको पेट की ढीली त्वचा या एक्सट्रा फैट की समस्या कब से है?", gu: "📅 તમને પેટની ઢીલી ત્વચા અથવા વધારાની ચરબીની સમસ્યા ક્યારથી છે?" }, type: "text" },
    family_history: { key: "q2", text: { en: "👨‍👩‍👦 Is there a family history of hair loss?", hi: "👨‍👩‍👦 क्या परिवार में बालों के झड़ने का इतिहास है?", gu: "👨‍👩‍👦 શું પરિવારમાં વાળ ખરવાનો ઇતિહાસ છે?" }, type: "text" },
    medications: { key: "q3", text: { en: "💊 Are you taking any regular medications or do you have any medical conditions?", hi: "💊 क्या आप कोई नियमित दवा लेते हैं या कोई मेडिकल कंडीशन है?", gu: "💊 શું તમે કોઈ નિયમિત દવા લો છો અથવા કોઈ મેડિકલ કન્ડિશન છે?" }, type: "text" },
    nose_history: { key: "q2", text: { en: "🤕 Have you had any previous nose injury, surgery, or breathing problems?", hi: "🤕 क्या पहले कभी नाक में चोट, सर्जरी, या सांस की समस्या हुई है?", gu: "🤕 શું પહેલા નાકમાં ઈજા, સર્જરી, અથવા શ્વાસની સમસ્યા થઈ છે?" }, type: "text" },
    lip_aug_goal: { key: "q1", text: { en: "💬 What would you like to improve?", hi: "💬 आप क्या सुधार चाहते हैं?", gu: "💬 તમે શું સુધારો ઈચ્છો છો?" }, type: "buttons", options: ["Volume", "Shape", "Symmetry", "Definition"] },
    lip_aug_history: { key: "q2", text: { en: "💉 Have you had any previous lip fillers or lip procedures?", hi: "💉 क्या पहले कभी लिप फिलर्स या लिप प्रोसीजर हुआ है?", gu: "💉 શું પહેલા લિપ ફિલર્સ અથવા લિપ પ્રોસિજર થયું છે?" }, type: "text" },
    lip_red_concern: { key: "q1", text: { en: "💬 What is your main concern?", hi: "💬 आपकी मुख्य समस्या क्या है?", gu: "💬 તમારી મુખ્ય સમસ્યા શું છે?" }, type: "buttons", options: ["Upper Lip", "Lower Lip", "Both", "Asymmetry"] },
    lip_red_history: { key: "q2", text: { en: "💉 Have you had any previous lip surgery or fillers?", hi: "💉 क्या पहले कभी लिप सर्जरी या फिलर्स हुआ है?", gu: "💉 શું પહેલા લિપ સર્જરી અથવા ફિલર્સ થયું છે?" }, type: "text" },
    facial_concern: { key: "q1", text: { en: "💬 What is your main concern?", hi: "💬 आपकी मुख्य समस्या क्या है?", gu: "💬 તમારી મુખ્ય સમસ્યા શું છે?" }, type: "buttons", options: ["Wrinkles", "Sagging Skin", "Pigmentation", "Fine Lines"] },
    facial_history: { key: "q2", text: { en: "💉 Have you had any previous facial treatments or cosmetic procedures?", hi: "💉 क्या पहले कभी फेशियल ट्रीटमेंट या कॉस्मेटिक प्रोसीजर हुआ है?", gu: "💉 શું પહેલા ફેશિયલ ટ્રીટમેન્ટ અથવા કોસ્મેટિક પ્રોસિજર થયું છે?" }, type: "text" },
    brow_goal: { key: "q1", text: { en: "💬 What would you like to improve?", hi: "💬 आप क्या सुधार चाहते हैं?", gu: "💬 તમે શું સુધારો ઈચ્છો છો?" }, type: "buttons", options: ["Droopy Brows", "Forehead Lines", "Tired Appearance"] },
    brow_history: { key: "q2", text: { en: "💉 Have you had any previous forehead or brow procedures?", hi: "💉 क्या पहले कभी फोरहेड या ब्रो प्रोसीजर हुआ है?", gu: "💉 શું પહેલા ફોરહેડ અથવા બ્રો પ્રોસિજર થયું છે?" }, type: "text" },
    jaw_goal: { key: "q1", text: { en: "💬 What is your main goal?", hi: "💬 आपका मुख्य लक्ष्य क्या है?", gu: "💬 તમારો મુખ્ય ધ્યેય શું છે?" }, type: "buttons", options: ["Sharper Jawline", "Better Definition", "Improved Profile"] },
    jaw_history: { key: "q2", text: { en: "💉 Have you had any previous jawline fillers, surgery, or other facial procedures?", hi: "💉 क्या पहले कभी जॉलाइन फिलर्स, सर्जरी या अन्य फेशियल प्रोसीजर हुआ है?", gu: "💉 શું પહેલા જૉલાઈન ફિલર્સ, સર્જરી અથવા અન્ય ફેશિયલ પ્રોસિજર થયું છે?" }, type: "text" },
    height_weight: { key: "q1", text: { en: "⚖️ Please mention your current height and weight.", hi: "⚖️ कृपया अपनी ऊंचाई और वज़न बताएं।", gu: "⚖️ કૃપા કરીને તમારી ઊંચાઈ અને વજન જણાવો." }, type: "text" },
    chin_concern: { key: "q2", text: { en: "💬 Is your concern mainly excess fat, loose skin, or both?", hi: "💬 आपकी समस्या मुख्यतः एक्सट्रा फैट, ढीली त्वचा या दोनों है?", gu: "💬 તમારી સમસ્યા મુખ્યત્વે વધારાની ચરબી, ઢીલી ત્વચા અથવા બંને છે?" }, type: "buttons", options: ["Excess Fat", "Loose Skin", "Both"] },
    ear_concern: { key: "q1", text: { en: "👂 What is your main concern?", hi: "👂 आपकी मुख्य समस्या क्या है?", gu: "👂 તમારી મુખ્ય સમસ્યા શું છે?" }, type: "buttons", options: ["Prominent Ears", "Ear Shape", "Earlobe", "Injury"] },
    ear_history: { key: "q2", text: { en: "🩺 Have you had any previous ear surgery or injury?", hi: "🩺 क्या पहले कभी कान की सर्जरी या चोट हुई है?", gu: "🩺 શું પહેલા કાનની સર્જરી અથવા ઈજા થઈ છે?" }, type: "text" },
    breast_goal: { key: "q2", text: { en: "💬 What is your primary goal?", hi: "💬 आपका मुख्य लक्ष्य क्या है?", gu: "💬 તમારો મુખ્ય ધ્યેય શું છે?" }, type: "buttons", options: ["Breast Augmentation", "Breast Lift", "Breast Reduction"] },
    breast_history: { key: "q3", text: { en: "👶 Have you had any pregnancies, breastfeeding history, or previous breast surgery? (If applicable)", hi: "👶 क्या आपकी कोई प्रेगनेंसी, ब्रेस्टफीडिंग हिस्ट्री या पहले ब्रेस्ट सर्जरी हुई है? (यदि लागू हो)", gu: "👶 શું તમારી કોઈ પ્રેગ્નન્સી, બ્રેસ્ટફીડિંગ હિસ્ટ્રી અથવા પહેલા બ્રેસ્ટ સર્જરી થઈ છે? (જો લાગુ હોય)" }, type: "text" },
    mommy_since: { key: "q1", text: { en: "📅 How long has it been since your last pregnancy or delivery?", hi: "📅 आपकी पिछली प्रेगनेंसी या डिलीवरी को कितना समय हुआ है?", gu: "📅 તમારી છેલ્લી પ્રેગ્નન્સી અથવા ડિલિવરી ને કેટલો સમય થયો છે?" }, type: "text" },
    mommy_breastfeeding: { key: "q2", text: { en: "👶 Are you currently breastfeeding?", hi: "👶 क्या आप अभी ब्रेस्टफीडिंग कर रही हैं?", gu: "👶 શું તમે હાલમાં બ્રેસ્ટફીડિંગ કરી રહ્યા છો?" }, type: "text" },
    mommy_areas: { key: "q4", text: { en: "💬 Which areas would you like to improve?", hi: "💬 आप किन हिस्सों में सुधार चाहती हैं?", gu: "💬 તમે ક્યા ભાગોમાં સુધારો ઈચ્છો છો?" }, type: "buttons", options: ["Breasts", "Abdomen", "Waist", "Thighs"] },
    genital_concern: { key: "q1", text: { en: "💬 What is your primary concern?", hi: "💬 आपकी प्रमुख समस्या क्या है?", gu: "💬 તમારી મુખ્ય સમસ્યા શું છે?" }, type: "buttons", options: ["Appearance", "Laxity", "Function", "Pigmentation"] },
    genital_history: { key: "q2", text: { en: "👶 Have you had any pregnancies, childbirth, or previous procedures in this area? (If applicable)", hi: "👶 क्या इस क्षेत्र में कोई प्रेगनेंसी, डिलीवरी या पहले प्रोसीजर हुआ है? (यदि लागू हो)", gu: "👶 શું આ વિસ્તારમાં કોઈ પ્રેગ્નન્સી, ડિલિવરી અથવા પહેલા પ્રોસિજર થયું છે? (જો લાગુ હોય)" }, type: "text" },
    tummy_history: { key: "q3", text: { en: "👶 If applicable, have you had any pregnancies or previous abdominal surgeries?", hi: "👶 यदि लागू हो, क्या कोई प्रेगनेंसी या पहले पेट की सर्जरी हुई है?", gu: "👶 જો લાગુ હોય, શું કોઈ પ્રેગ્નન્સી અથવા પહેલા પેટની સર્જરી થઈ છે?" }, type: "text" },
    skin_concern: { key: "q2", text: { en: "💬 What is your main concern?", hi: "💬 आपकी मुख्य समस्या क्या है?", gu: "💬 તમારી મુખ્ય સમસ્યા શું છે?" }, type: "list", options: ["Acne", "Acne Scars", "Pigmentation", "Melasma", "Dark Spots", "Wrinkles", "Uneven Skin Tone"] },
    skin_treatment_history: { key: "q4", text: { en: "🧴 Have you taken any previous skin treatments or are you currently using any prescription creams or medications?", hi: "🧴 क्या पहले कोई स्किन ट्रीटमेंट लिया है या कोई प्रिस्क्रिप्शन क्रीम/दवा इस्तेमाल कर रहे हैं?", gu: "🧴 શું પહેલા કોઈ સ્કિન ટ્રીટમેન્ટ લીધી છે અથવા કોઈ પ્રિસ્ક્રિપ્શન ક્રીમ/દવા વાપરી રહ્યા છો?" }, type: "text" }
};

const PT = { key: "preferred_time", text: { en: "⏰ What is your preferred time for a consultation call?", hi: "⏰ कंसल्टेशन कॉल के लिए आपका पसंदीदा समय क्या है?", gu: "⏰ કન્સલ્ટેશન કૉલ માટે તમારો પસંદગીનો સમય શું છે?" }, type: "text" };

function photoQ(count, parts, textOverride) {
    const partsTxt = { en: parts.en, hi: parts.hi, gu: parts.gu };
    return {
        key: "photos", type: "photo", photoCount: count,
        text: textOverride || {
            en: `📸 Please share ${count} clear photo${count > 1 ? "s" : ""} of ${partsTxt.en}.`,
            hi: `📸 कृपया ${partsTxt.hi} की ${count} साफ फोटो भेजें।`,
            gu: `📸 કૃપા કરીને ${partsTxt.gu}ની ${count} સ્પષ્ટ ફોટો મોકલો.`
        }
    };
}

const SERVICE_FORMS = {
    "Hair Transplant": { questions: [Q.since_hairloss, Q.family_history, Q.medications, PT, photoQ(3, { en: "your scalp (Front, Top & Back View)", hi: "स्कैल्प (आगे, ऊपर और पीछे)", gu: "સ્કાલ્પ (આગળ, ઉપર અને પાછળ)" })] },
    "Hair Growth": { questions: [PT] },
    "Laser Hair Removal": { questions: [PT] },
    "Rhinoplasty": { questions: [Q.nose_history, Q.medications, PT, photoQ(3, { en: "your nose (Front, Left & Right Side View)", hi: "नाक (आगे, बाएं और दाएं साइड)", gu: "નાક (આગળ, ડાબી અને જમણી સાઈડ)" })] },
    "Lip Augmentation": { questions: [Q.lip_aug_goal, Q.lip_aug_history, PT, photoQ(2, { en: "your lips (Front & Side View)", hi: "होंठ (आगे और साइड)", gu: "હોઠ (આગળ અને સાઈડ)" })] },
    "Lip Reduction": { questions: [Q.lip_red_concern, Q.lip_red_history, PT, photoQ(2, { en: "your lips (Front & Side View)", hi: "होंठ (आगे और साइड)", gu: "હોઠ (આગળ અને સાઈડ)" })] },
    "Facial Rejuvenation": { questions: [Q.facial_concern, Q.facial_history, PT, photoQ(2, { en: "your face (Front & Side View)", hi: "चेहरा (आगे और साइड)", gu: "ચહેરો (આગળ અને સાઈડ)" })] },
    "Brow Lift": { questions: [Q.brow_goal, Q.brow_history, PT, photoQ(2, { en: "your face (Front & Side View)", hi: "चेहरा (आगे और साइड)", gu: "ચહેરો (આગળ અને સાઈડ)" })] },
    "Dimple Creation": { questions: [PT] },
    "Jawline Creation": { questions: [Q.jaw_goal, Q.jaw_history, PT, photoQ(2, { en: "your face (Front, Side & Profile View)", hi: "चेहरा (आगे, साइड और प्रोफाइल)", gu: "ચહેરો (આગળ, સાઈડ અને પ્રોફાઈલ)" })] },
    "Double Chin Reduction": { questions: [Q.height_weight, Q.chin_concern, PT, photoQ(2, { en: "your face and neck (Front & Side View)", hi: "चेहरा और गला (आगे और साइड)", gu: "ચહેરો અને ગળું (આગળ અને સાઈડ)" })] },
    "Otoplasty": { questions: [Q.ear_concern, Q.ear_history, PT, photoQ(2, { en: "your ears (Front, Left & Right Side View)", hi: "कान (आगे, बाएं और दाएं साइड)", gu: "કાન (આગળ, ડાબી અને જમણી સાઈડ)" })] },
    "Breast Augmentation": { questions: [Q.since_concern, Q.breast_goal, Q.medications, Q.breast_history, PT] },
    "Breast Reduction": { questions: [Q.since_concern, Q.breast_goal, Q.medications, Q.breast_history, PT] },
    "Breast Lift": { questions: [Q.since_concern, Q.breast_goal, Q.medications, Q.breast_history, PT] },
    "Axillary Breast Removal": { questions: [PT] },
    "Breast Swelling Excision": { questions: [PT] },
    "Mommy Makeover": { questions: [Q.mommy_since, Q.mommy_breastfeeding, Q.height_weight, Q.mommy_areas, Q.medications, PT] },
    "Genital Rejuvenation": { questions: [Q.genital_concern, Q.genital_history, PT] },
    "Liposuction": { questions: [Q.lipo_since, Q.height_weight, Q.medications, PT] },
    "Abdominoplasty": { questions: [Q.tummy_since, Q.height_weight, Q.tummy_history, Q.medications, PT] },
    "Gender Reassignment M-F": { questions: [PT] },
    "Gender Reassignment F-M": { questions: [PT] },
    "Gynecomastia Surgery": { questions: [Q.since_problem, Q.medications, PT, photoQ(2, { en: "your chest (Front & Side View)", hi: "छाती (आगे और साइड)", gu: "છાતી (આગળ અને સાઈડ)" }, { en: "📸 Please share 2-3 clear photos of your chest (Front & Side View).", hi: "📸 कृपया छाती की 2-3 साफ फोटो भेजें (आगे और साइड)।", gu: "📸 કૃપા કરીને છાતીના 2-3 સ્પષ્ટ ફોટો મોકલો (આગળ અને સાઈડ)." })] },
    "Skin Rejuvenation": { questions: [Q.since_skin_concern, Q.skin_concern, Q.medications, Q.skin_treatment_history, PT, photoQ(2, { en: "the affected area in good lighting (Front & Close-up View)", hi: "प्रभावित क्षेत्र (अच्छी रोशनी में, आगे और क्लोज़-अप)", gu: "અસરગ્રસ્ત વિસ્તાર (સારા પ્રકાશમાં, આગળ અને ક્લોઝ-અપ)" })] },
    "Acne Scar Treatment": { questions: [Q.since_skin_concern, Q.skin_concern, Q.medications, Q.skin_treatment_history, PT, photoQ(2, { en: "the affected area in good lighting (Front & Close-up View)", hi: "प्रभावित क्षेत्र (अच्छी रोशनी में, आगे और क्लोज़-अप)", gu: "અસરગ્રસ્ત વિસ્તાર (સારા પ્રકાશમાં, આગળ અને ક્લોઝ-અપ)" })] },
    "Skin Pigmentation": { questions: [Q.since_skin_concern, Q.skin_concern, Q.medications, Q.skin_treatment_history, PT, photoQ(2, { en: "the affected area in good lighting (Front & Close-up View)", hi: "प्रभावित क्षेत्र (अच्छी रोशनी में, आगे और क्लोज़-अप)", gu: "અસરગ્રસ્ત વિસ્તાર (સારા પ્રકાશમાં, આગળ અને ક્લોઝ-અપ)" })] },
    "Scar Revision": { questions: [PT] },
    "Vitiligo": { questions: [PT] }
};

function getSF(svc) { return SERVICE_FORMS[svc] || { questions: [PT] }; }

const MSG = {
    welcome: {
        en: "👋 Hi {name}! Welcome to *Celebre Aesthetics* 🌸\n\nGujarat's leading aesthetic clinic — Surat, Ahmedabad & Rajkot.\n\nLet me help you explore treatments and book a free consultation.",
        hi: "👋 नमस्ते {name}! *Celebre Aesthetics* में स्वागत है 🌸\n\nगुजरात की अग्रणी क्लिनिक — सूरत, अहमदाबाद, राजकोट।\n\nट्रीटमेंट जानने और फ्री कंसल्टेशन बुक करने में मदद करता/करती हूँ।",
        gu: "👋 નમસ્તે {name}! *Celebre Aesthetics* માં સ્વાગત છે 🌸\n\nગુજરાતની અગ્રણી ક્લિનિક — સુરત, અમદાવાદ, રાજકોટ.\n\nટ્રીટમેન્ટ જાણવા અને ફ્રી કન્સલ્ટેશન બુક કરવામાં મદદ કરું છું."
    },
    select_cat: { en: "Please select a treatment category:", hi: "कृपया ट्रीटमेंट कैटेगरी चुनें:", gu: "કૃપા કરીને ટ્રીટમેન્ટ કેટેગરી પસંદ કરો:" },
    select_svc: { en: "Here are our {cat} options:", hi: "{cat} के विकल्प:", gu: "{cat} ના વિકલ્પો:" },
    form_start: { en: "To help our specialist prepare, please answer a few quick questions. 📋", hi: "कंसल्टेशन के लिए कुछ सवालों के जवाब दें। 📋", gu: "કન્સલ્ટેશન માટે થોડા પ્રશ્નોના જવાબ આપો. 📋" },
    confirmed: {
        en: "✅ *Consultation Request Received!*\n\n🏥 Service: *{service}*\n\nOur specialist will call you soon at your preferred time.\nThank you! 💜\n\n📍 Surat | Ahmedabad | Rajkot",
        hi: "✅ *कंसल्टेशन रिक्वेस्ट प्राप्त हुई!*\n\n🏥 सेवा: *{service}*\n\nहमारे विशेषज्ञ आपके पसंदीदा समय पर जल्द संपर्क करेंगे।\nधन्यवाद! 💜\n\n📍 सूरत | अहमदाबाद | राजकोट",
        gu: "✅ *કન્સલ્ટેશન રિક્વેસ્ટ મળી!*\n\n🏥 સેવા: *{service}*\n\nઅમારા નિષ્ણાત તમારા પસંદગીના સમયે ટૂંક સમયમાં સંપર્ક કરશે.\nઆભાર! 💜\n\n📍 સુરત | અમદાવાદ | રાજકોટ"
    },
    again: { en: "Say *Celebre* to start again!", hi: "*Celebre* भेजें फिर से शुरू करने के लिए!", gu: "*Celebre* મોકલો ફરીથી શરૂ કરવા!" },
    v_text: { en: "❌ Please type a proper answer (not empty or random text):", hi: "❌ कृपया सही जवाब लिखें (खाली या रैंडम टेक्स्ट नहीं):", gu: "❌ કૃપા કરીને યોગ્ય જવાબ લખો (ખાલી અથવા રેન્ડમ ટેક્સ્ટ નહીં):" },
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
function extractMessage(body, media) { const waTitle = body.whatsapp?.title || ""; const postback = body.postback?.data || ""; const interactiveTitle = body.interactive?.title || body.interactive?.list_reply?.title || body.interactive?.button_reply?.title || ""; const listReply = body.listReply?.title || body.buttonReply?.title || ""; const textContent = body.content?.text || body.UserResponse || ""; return (waTitle || postback || interactiveTitle || listReply || textContent || (media ? "__PHOTO__" : "")).trim(); }

// Validation: meaningful text (not empty, not too short, not just symbols/emoji spam)
function isValidTextAnswer(m) {
    if (!m || m === "__PHOTO__") return false;
    const cleaned = m.trim();
    if (cleaned.length < 1) return false;
    // must contain at least one letter or digit (blocks pure emoji/symbol spam)
    if (!/[a-zA-Z0-9\u0900-\u097F\u0A80-\u0AFF]/.test(cleaned)) return false;
    return true;
}

async function sendQuestion(ph, q, lang) {
    if (q.type === "buttons") {
        await sendButtons(ph, t(q.text, lang), q.options, "Celebre Aesthetics");
    } else if (q.type === "list") {
        await sendList(ph, t(q.text, lang), "Select", [{ title: "Options", rows: q.options.map(o => ({ title: o, description: " " })) }], "Celebre Aesthetics");
    } else if (q.type === "photo") {
        await sendText(ph, t(q.text, lang));
    } else {
        await sendText(ph, t(q.text, lang));
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

        const TEST = ["917820870519", "918758422007"];
        if (!TEST.includes(phone)) { console.log("Skip:", phone); return res.status(200).json({ success: true }); }

        const convo = await getC(phone, senderName);
        const lang = convo.language || "en";

        // RESET
        if (isGreet(message)) {
            await up(phone, { state: "language_selection", language: "", selected_category: "", selected_service: "", q_index: 0, answers: {} });
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
                    const questions = getSF(svc).questions;
                    await sendQuestion(phone, questions[0], lang);
                    await up(phone, { state: "asking_questions", q_index: 0, answers: {} });
                } else {
                    await sendList(phone, t("select_svc", lang, { cat }), cat.split(" ")[0], [{ title: cat, rows: svcs.map(s => ({ title: s.title, description: descFor(s.description, lang) })) }], cat);
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
                const questions = getSF(svc.service).questions;
                await sendQuestion(phone, questions[0], lang);
                await up(phone, { state: "asking_questions", q_index: 0, answers: {} });
                return res.status(200).json({ success: true });
            }
            await sendText(phone, t("force_select", lang));
            await sendList(phone, t("select_svc", lang, { cat: convo.selected_category }), convo.selected_category.split(" ")[0], [{ title: convo.selected_category, rows: (CATEGORIES[convo.selected_category] || []).map(s => ({ title: s.title, description: descFor(s.description, lang) })) }], convo.selected_category);
            return res.status(200).json({ success: true });
        }

        // ASKING QUESTIONS (dynamic, per-service)
        if (convo.state === "asking_questions") {
            const questions = getSF(convo.selected_service).questions;
            const idx = convo.q_index || 0;
            const currentQ = questions[idx];

            if (!currentQ) {
                // safety fallback — shouldn't happen
                await up(phone, { state: "confirmed" });
                await sendText(phone, t("confirmed", lang, { service: convo.selected_service }));
                return res.status(200).json({ success: true });
            }

            // VALIDATION based on question type
            if (currentQ.type === "photo") {
                if (!media && message !== "__PHOTO__") {
                    await sendText(phone, t("v_photo", lang));
                    return res.status(200).json({ success: true });
                }
            } else if (currentQ.type === "buttons" || currentQ.type === "list") {
                if (media || message === "__PHOTO__") {
                    await sendText(phone, t("force_answer", lang));
                    await sendQuestion(phone, currentQ, lang);
                    return res.status(200).json({ success: true });
                }
                const matched = currentQ.options.find(o => o.toLowerCase() === message.toLowerCase());
                if (!matched) {
                    await sendText(phone, t("force_select", lang));
                    await sendQuestion(phone, currentQ, lang);
                    return res.status(200).json({ success: true });
                }
            } else {
                // text type (includes preferred_time)
                if (media || message === "__PHOTO__") {
                    await sendText(phone, t("force_answer", lang));
                    await sendQuestion(phone, currentQ, lang);
                    return res.status(200).json({ success: true });
                }
                if (!isValidTextAnswer(message)) {
                    await sendText(phone, t("v_text", lang));
                    return res.status(200).json({ success: true });
                }
            }

            // STORE answer
            const answers = convo.answers || {};
            answers[currentQ.key] = currentQ.type === "photo" ? "received" : message;
            await up(phone, { answers });

            // NEXT question or DONE
            if (idx + 1 < questions.length) {
                const nextQ = questions[idx + 1];
                await sendQuestion(phone, nextQ, lang);
                await up(phone, { q_index: idx + 1 });
            } else {
                await up(phone, { state: "confirmed" });
                await sendText(phone, t("confirmed", lang, { service: convo.selected_service }));
            }
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