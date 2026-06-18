// services/celebreData.js

const celebreData = {
    clinic: {
        name: "Celebre Aesthetics",
        timings: "11:00 AM to 8:00 PM",
        consultationFee: "Free",
        website: "https://www.celebre.in"
    },

    services: {
        "rhinoplasty": {
            name: "Rhinoplasty (Nose Reshaping)",
            shortInfo: "A surgical procedure to reshape or resize the nose for better facial harmony. We offer both cosmetic and functional rhinoplasty. Recovery is typically 1-2 weeks and results are permanent."
        },
        "liposuction": {
            name: "Liposuction",
            shortInfo: "Advanced body contouring that removes stubborn fat from abdomen, thighs, and arms using VASER & laser-assisted techniques. Downtime is just 3-5 days."
        },
        "breast augmentation": {
            name: "Breast Augmentation",
            shortInfo: "Enhances breast size and shape using high-quality silicone or saline implants customized to your body type. Recovery is around 1-2 weeks."
        },
        "face lift": {
            name: "Face Lift (Rhytidectomy)",
            shortInfo: "Tightens facial skin and muscles to reduce aging signs. We offer mini and full facelift options. Results last 7-10 years."
        },
        "blepharoplasty": {
            name: "Blepharoplasty (Eyelid Surgery)",
            shortInfo: "Corrects drooping eyelids and removes under-eye bags for a refreshed look. Recovery is about 1 week."
        },
        "hair transplant": {
            name: "Hair Transplant (FUE)",
            shortInfo: "Scar-free FUE method for natural-looking permanent hair growth. Procedure takes 6-8 hours with only 3-5 days recovery."
        },
        "tummy tuck": {
            name: "Tummy Tuck (Abdominoplasty)",
            shortInfo: "Removes excess skin and fat from the abdomen while tightening muscles. Ideal after pregnancy or weight loss. Recovery: 2 weeks."
        }
    },

    systemPrompt: `You are a helpful AI assistant for Celebre Aesthetics, a premium aesthetic surgery clinic in India.
  
Your job is to:
1. Answer questions about Celebre's services warmly and professionally
2. Provide accurate information about procedures, recovery, and results
3. Encourage users to book a free consultation call
4. Keep responses short, friendly, and helpful

Clinic timings: 11 AM to 8 PM
Consultation: Free
Website: https://www.celebre.in

Always end with encouraging the user to book a free consultation if they seem interested.`
};

function getServiceInfo(serviceName) {
    const name = serviceName.toLowerCase();
    for (const key in celebreData.services) {
        if (name.includes(key)) {
            return celebreData.services[key];
        }
    }
    return null;
}

module.exports = { celebreData, getServiceInfo };