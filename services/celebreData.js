// services/celebreData.js

const celebreData = {
    clinic: {
        name: "Celebre Aesthetics",
        tagline: "Quest of Beauty",
        location: "Gujarat - Surat, Ahmedabad & Rajkot",
        timings: "11:00 AM to 8:00 PM",
        consultationFee: "Free",
        website: "https://www.celebre.in"
    },

    services: {
        // ========== HAIR TREATMENT ==========
        "hair transplant": {
            name: "Hair Transplant (FUE)",
            category: "Hair Treatment",
            shortInfo: "Celebre offers advanced FUE (Follicular Unit Extraction) — the most modern, scar-free hair transplant method. Get natural-looking, permanent hair growth. Procedure takes 6-8 hours with only 3-5 days recovery. Best for hair loss, bald patches, and hairline restoration."
        },
        "hair growth": {
            name: "Hair Growth Treatment",
            category: "Hair Treatment",
            shortInfo: "Non-surgical hair growth treatments at Celebre include PRP therapy, mesotherapy, and advanced hair growth programs. These treatments stimulate natural hair growth, strengthen existing hair, and prevent further hair loss. No downtime required."
        },
        "laser hair removal": {
            name: "Laser Hair Removal",
            category: "Hair Treatment",
            shortInfo: "Permanent hair reduction using advanced laser technology. Safe for all skin types. Treats unwanted hair on face, arms, legs, underarms, and bikini area. Multiple sessions needed for best results. Virtually painless with no downtime."
        },

        // ========== FACE TREATMENT ==========
        "rhinoplasty": {
            name: "Rhinoplasty (Nose Reshaping)",
            category: "Face Treatment",
            shortInfo: "Surgical procedure to reshape or resize the nose for better facial harmony. Celebre offers both cosmetic and functional rhinoplasty. Recovery is typically 1-2 weeks. Results are permanent and natural-looking."
        },
        "lip augmentation": {
            name: "Lip Augmentation",
            category: "Face Treatment",
            shortInfo: "Enhance your lips with safe dermal fillers for fuller, well-defined lips. The procedure is quick (30-45 minutes), with minimal downtime. Results are natural-looking and last 6-12 months. Customized to your desired look."
        },
        "lip reduction": {
            name: "Lip Reduction",
            category: "Face Treatment",
            shortInfo: "Surgical procedure to reduce the size of overly large lips for a more balanced facial appearance. Performed under local anesthesia with recovery of about 1 week. Results are permanent."
        },
        "facial rejuvenation": {
            name: "Facial Rejuvenation",
            category: "Face Treatment",
            shortInfo: "Comprehensive anti-aging treatments including Botox, fillers, chemical peels, and microdermabrasion. Reduces wrinkles, fine lines, and restores youthful glow. Non-surgical options available with minimal downtime."
        },
        "brow lift": {
            name: "Brow Lift",
            category: "Face Treatment",
            shortInfo: "Lifts sagging eyebrows and smooths forehead wrinkles for a more youthful, alert appearance. Can be done surgically or with minimally invasive techniques. Recovery is 1-2 weeks with long-lasting results."
        },
        "dimple creation": {
            name: "Dimple Creation",
            category: "Face Treatment",
            shortInfo: "A quick, minimally invasive procedure to create natural-looking dimples on your cheeks. Done under local anesthesia in just 30 minutes. Recovery is quick and results are permanent."
        },
        "jawline creation": {
            name: "Jawline Creation",
            category: "Face Treatment",
            shortInfo: "Define and sculpt your jawline with fillers or surgical implants. Gives a sharper, more defined jaw contour. Non-surgical options have no downtime. Surgical options provide permanent results."
        },
        "double chin reduction": {
            name: "Double Chin Reduction",
            category: "Face Treatment",
            shortInfo: "Remove stubborn fat under the chin with liposuction or non-surgical treatments like Kybella. Gives a slimmer, more defined profile. Quick recovery of 3-5 days. Results are long-lasting."
        },
        "otoplasty": {
            name: "Otoplasty (Ear Surgery)",
            category: "Face Treatment",
            shortInfo: "Corrects protruding or misshapen ears for a more natural appearance. Suitable for both adults and children. Performed under local anesthesia with recovery of about 1 week. Results are permanent."
        },

        // ========== BREAST TREATMENT ==========
        "breast augmentation": {
            name: "Breast Augmentation",
            category: "Breast Treatment",
            shortInfo: "Enhances breast size and shape using high-quality silicone or saline implants customized to your body type. Our surgeons ensure natural-looking results. Recovery is around 1-2 weeks with long-lasting results."
        },
        "breast reduction": {
            name: "Breast Reduction",
            category: "Breast Treatment",
            shortInfo: "Reduces overly large breasts to a more proportionate size. Relieves back pain, neck pain, and discomfort. Improves posture and body confidence. Recovery is 2-3 weeks."
        },
        "breast lift": {
            name: "Breast Lift (Mastopexy)",
            category: "Breast Treatment",
            shortInfo: "Lifts and reshapes sagging breasts for a more youthful appearance. Can be combined with implants for enhanced results. Recovery is 1-2 weeks. Results are long-lasting."
        },
        "axillary breast removal": {
            name: "Axillary Breast Removal",
            category: "Breast Treatment",
            shortInfo: "Removes excess breast tissue from the armpit area (accessory breast). A simple surgical procedure done under local anesthesia. Recovery is about 1 week with permanent results."
        },
        "breast swelling excision": {
            name: "Breast Swelling Excision",
            category: "Breast Treatment",
            shortInfo: "Surgical removal of lumps or swelling in the breast. Performed with precision under local or general anesthesia. Quick recovery and permanent solution."
        },

        // ========== BODY TREATMENT ==========
        "mommy makeover": {
            name: "Mommy Makeover",
            category: "Body Treatment",
            shortInfo: "A customized combination of procedures to restore your pre-pregnancy body. Typically includes tummy tuck, liposuction, and breast enhancement. Tailored to your individual needs. Recovery is 2-3 weeks."
        },
        "genital rejuvenation": {
            name: "Genital Rejuvenation",
            category: "Body Treatment",
            shortInfo: "Surgical and non-surgical procedures for intimate area rejuvenation. Includes labiaplasty, vaginoplasty, and non-invasive tightening. Performed with complete privacy and care. Recovery varies by procedure."
        },
        "liposuction": {
            name: "Liposuction",
            category: "Body Treatment",
            shortInfo: "Advanced body contouring that removes stubborn fat from abdomen, thighs, arms, and chin using VASER & laser-assisted techniques. Smooth, precise results with just 3-5 days downtime."
        },
        "abdominoplasty": {
            name: "Abdominoplasty (Tummy Tuck)",
            category: "Body Treatment",
            shortInfo: "Removes excess skin and fat from the abdomen while tightening abdominal muscles. Ideal after pregnancy or significant weight loss. Combined with liposuction for best results. Recovery: 2 weeks."
        },
        "gender reassignment m to f": {
            name: "Gender Reassignment Surgery (M to F)",
            category: "Body Treatment",
            shortInfo: "Comprehensive male-to-female gender reassignment surgery performed by experienced surgeons. Includes consultation, surgery, and post-operative care. Performed with complete privacy and professional support."
        },
        "gender reassignment f to m": {
            name: "Gender Reassignment Surgery (F to M)",
            category: "Body Treatment",
            shortInfo: "Comprehensive female-to-male gender reassignment surgery. Our experienced team provides complete support from consultation through recovery. Performed with utmost privacy and care."
        },

        // ========== GYNECOMASTIA ==========
        "gynecomastia": {
            name: "Gynecomastia (Male Breast Reduction)",
            category: "Gynecomastia",
            shortInfo: "Surgical treatment for enlarged male breasts. Removes excess fat and glandular tissue for a flatter, more masculine chest. Performed using liposuction and excision techniques. Recovery is about 1 week with permanent results."
        },

        // ========== SKIN TREATMENT ==========
        "skin rejuvenation": {
            name: "Skin Rejuvenation",
            category: "Skin Treatment",
            shortInfo: "Advanced skin treatments including chemical peels, microdermabrasion, laser therapy, and PRP facials. Reduces wrinkles, pigmentation, and restores youthful glow. Multiple sessions recommended for best results."
        },
        "acne scar treatment": {
            name: "Acne Scar Treatment",
            category: "Skin Treatment",
            shortInfo: "Effective treatments for acne scars including laser resurfacing, micro-needling, chemical peels, and dermal fillers. Significantly improves skin texture and appearance. Multiple sessions may be needed."
        },
        "skin pigmentation": {
            name: "Skin Pigmentation Treatment",
            category: "Skin Treatment",
            shortInfo: "Treats dark spots, melasma, and uneven skin tone with advanced laser therapy, chemical peels, and topical treatments. Safe for all skin types. Results visible after a few sessions."
        },
        "scar revision": {
            name: "Scar Revision Treatment",
            category: "Skin Treatment",
            shortInfo: "Minimizes the appearance of scars from surgery, injury, or burns. Uses laser therapy, surgical revision, or injectable treatments. Significant improvement in scar appearance with minimal downtime."
        },
        "vitiligo": {
            name: "Vitiligo Treatment",
            category: "Skin Treatment",
            shortInfo: "Advanced treatments for vitiligo including phototherapy, melanocyte transplant, and topical therapies. Helps restore natural skin color. Treatment plan customized based on the extent of vitiligo."
        }
    },

    systemPrompt: `You are a helpful AI assistant for Celebre Aesthetics, a leading aesthetic surgery clinic in Gujarat, India with centers in Surat, Ahmedabad & Rajkot.

Your job is to:
1. Answer questions about Celebre's services warmly and professionally
2. Provide accurate information about procedures, recovery, and results
3. Encourage users to book a free consultation call
4. Keep responses short (2-3 lines max), friendly, and helpful
5. If asked about pricing, say our specialist will discuss transparent pricing during the free consultation

Clinic timings: 11 AM to 8 PM
Consultation: Free
Locations: Surat, Ahmedabad, Rajkot
Website: https://www.celebre.in

Always respond in a warm, professional tone. End with encouraging the user to book a free consultation.`
};

function getServiceInfo(serviceName) {
    const name = serviceName.toLowerCase();
    for (const key in celebreData.services) {
        if (name.includes(key) || key.includes(name)) {
            return celebreData.services[key];
        }
    }
    return null;
}

module.exports = { celebreData, getServiceInfo };